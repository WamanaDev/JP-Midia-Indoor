--
-- PostgreSQL database dump
--

\restrict VMbsgwBCmCfK5ZUJkpCuhabJLZIKRDWzSZevTxgZRM0Pk0ee9o79EOdCySnSi0w

-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: pg_database_owner
--

CREATE SCHEMA public;


ALTER SCHEMA public OWNER TO pg_database_owner;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: pg_database_owner
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- Name: type_playlist_item; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.type_playlist_item AS ENUM (
    'video',
    'image',
    'temperature',
    'news',
    'stock',
    'hours'
);


ALTER TYPE public.type_playlist_item OWNER TO postgres;

--
-- Name: check_screen_limit(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.check_screen_limit(p_user_id uuid) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  v_current_screens integer;
  v_max_screens integer;
BEGIN
  -- Buscar limite de telas do plano do usuário
  SELECT pl.max_screens
  INTO v_max_screens
  FROM profiles p
  JOIN plans pl ON p.plan_id = pl.id
  WHERE p.id = p_user_id;

  -- Se max_screens é NULL, é ilimitado
  IF v_max_screens IS NULL THEN
    RETURN true;
  END IF;

  -- Contar telas atuais do usuário
  SELECT COUNT(*)
  INTO v_current_screens
  FROM screens
  WHERE user_id = p_user_id;

  -- Retornar true se ainda pode criar, false se atingiu o limite
  RETURN v_current_screens < v_max_screens;
END;
$$;


ALTER FUNCTION public.check_screen_limit(p_user_id uuid) OWNER TO postgres;

--
-- Name: check_storage_limit(bigint); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.check_storage_limit(new_size bigint) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
declare
  v_usage numeric;
  v_limit numeric;
begin
  -- Busca o plano e bytes usados
  select 
      coalesce(pl.storage_gb, null) * 1024 * 1024 * 1024,
      coalesce(p.bytes_usage, 0)
  into v_limit, v_usage
  from profiles p
  join plans pl on pl.id = p.plan_id
  where p.id = auth.uid();

  -- Se o plano não tem limite (null), libera
  if v_limit is null then
      return true;
  end if;

  -- Se extrapolar, dispara erro
  if v_usage + new_size > v_limit then
      raise exception 'Você atingiu o limite de armazenamento do seu plano.';
  end if;

  return true;
end;
$$;


ALTER FUNCTION public.check_storage_limit(new_size bigint) OWNER TO postgres;

--
-- Name: check_storage_limit(uuid, bigint); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.check_storage_limit(p_user_id uuid, p_file_size bigint) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  v_current_bytes bigint;
  v_max_bytes bigint;
BEGIN
  -- Buscar uso atual e limite do plano
  SELECT 
    p.bytes_usage,
    (pl.storage_gb::numeric * 1073741824)::bigint  -- GB para bytes
  INTO v_current_bytes, v_max_bytes
  FROM profiles p
  JOIN plans pl ON p.plan_id = pl.id
  WHERE p.id = p_user_id;

  -- Se storage_gb é NULL, é ilimitado
  IF v_max_bytes IS NULL THEN
    RETURN true;
  END IF;

  -- Verificar se o novo arquivo cabe no limite
  RETURN (v_current_bytes + p_file_size) <= v_max_bytes;
END;
$$;


ALTER FUNCTION public.check_storage_limit(p_user_id uuid, p_file_size bigint) OWNER TO postgres;

--
-- Name: count_user_screens(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.count_user_screens(p_user_id uuid) RETURNS integer
    LANGUAGE sql STABLE
    AS $$
  SELECT COUNT(*)::integer
  FROM public.screens
  WHERE user_id = p_user_id AND is_active = true;
$$;


ALTER FUNCTION public.count_user_screens(p_user_id uuid) OWNER TO postgres;

--
-- Name: get_my_client_ids(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_my_client_ids() RETURNS SETOF uuid
    LANGUAGE sql STABLE SECURITY DEFINER
    AS $$
  -- Superadmins/admins veem tudo
  select id from clients
  where exists (
    select 1 from users where id = auth.uid() 
    and role in ('superadmin', 'admin', 'support')
  )
  union
  -- Dono do cliente vê o seu
  select id from clients where owner_user_id = auth.uid();
$$;


ALTER FUNCTION public.get_my_client_ids() OWNER TO postgres;

--
-- Name: get_user_usage(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_user_usage(p_user_id uuid) RETURNS json
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  v_current_screens integer;
  v_max_screens integer;
  v_current_bytes bigint;
  v_max_storage_gb numeric;
  v_current_gb numeric;
  v_screen_percentage numeric;
  v_storage_percentage numeric;
  v_result json;
BEGIN
  -- Buscar dados do perfil e plano
  SELECT 
    p.bytes_usage,
    pl.max_screens,
    pl.storage_gb
  INTO v_current_bytes, v_max_screens, v_max_storage_gb
  FROM profiles p
  JOIN plans pl ON p.plan_id = pl.id
  WHERE p.id = p_user_id;

  -- Contar telas
  SELECT COUNT(*)
  INTO v_current_screens
  FROM screens
  WHERE user_id = p_user_id;

  -- Calcular GB usado
  v_current_gb := v_current_bytes / 1073741824.0;

  -- Calcular percentuais
  IF v_max_screens IS NULL THEN
    v_screen_percentage := 0;
  ELSE
    v_screen_percentage := (v_current_screens::numeric / v_max_screens::numeric) * 100;
  END IF;

  IF v_max_storage_gb IS NULL THEN
    v_storage_percentage := 0;
  ELSE
    v_storage_percentage := (v_current_gb / v_max_storage_gb) * 100;
  END IF;

  -- Construir JSON de retorno
  v_result := json_build_object(
    'screens', json_build_object(
      'current', v_current_screens,
      'max', v_max_screens,
      'unlimited', v_max_screens IS NULL,
      'percentage', COALESCE(v_screen_percentage, 0)
    ),
    'storage', json_build_object(
      'current_gb', ROUND(v_current_gb::numeric, 2),
      'max_gb', v_max_storage_gb,
      'unlimited', v_max_storage_gb IS NULL,
      'percentage', COALESCE(v_storage_percentage, 0)
    )
  );

  RETURN v_result;
END;
$$;


ALTER FUNCTION public.get_user_usage(p_user_id uuid) OWNER TO postgres;

--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;


ALTER FUNCTION public.handle_new_user() OWNER TO postgres;

--
-- Name: jwt_sign(jsonb, text, text, bigint); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.jwt_sign(payload jsonb, key text, alg text, exp bigint) RETURNS text
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
begin
  return extensions.pgsodium.jwt_sign(payload => payload, key => key, alg => alg, exp => exp);
end;
$$;


ALTER FUNCTION public.jwt_sign(payload jsonb, key text, alg text, exp bigint) OWNER TO postgres;

--
-- Name: move_playlist_item_down(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.move_playlist_item_down(p_item_id uuid) RETURNS void
    LANGUAGE plpgsql
    AS $$
declare
  v_playlist_id uuid;
  v_order int;
  v_max int;
begin
  select playlist_id, order_index
  into v_playlist_id, v_order
  from playlist_items
  where id = p_item_id;

  select max(order_index)
  into v_max
  from playlist_items
  where playlist_id = v_playlist_id;

  if v_order >= v_max then
    return;
  end if;

  update playlist_items
  set order_index = order_index - 1
  where playlist_id = v_playlist_id
    and order_index = v_order + 1;

  update playlist_items
  set order_index = order_index + 1
  where id = p_item_id;

  perform reorder_playlist_items(v_playlist_id);
end;
$$;


ALTER FUNCTION public.move_playlist_item_down(p_item_id uuid) OWNER TO postgres;

--
-- Name: move_playlist_item_up(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.move_playlist_item_up(p_item_id uuid) RETURNS void
    LANGUAGE plpgsql
    AS $$
declare
  v_playlist_id uuid;
  v_order int;
begin
  select playlist_id, order_index
  into v_playlist_id, v_order
  from playlist_items
  where id = p_item_id;

  if v_order = 0 then
    return;
  end if;

  update playlist_items
  set order_index = order_index + 1
  where playlist_id = v_playlist_id
    and order_index = v_order - 1;

  update playlist_items
  set order_index = order_index - 1
  where id = p_item_id;

  perform reorder_playlist_items(v_playlist_id);
end;
$$;


ALTER FUNCTION public.move_playlist_item_up(p_item_id uuid) OWNER TO postgres;

--
-- Name: playlist_items_after_delete(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.playlist_items_after_delete() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
  perform reorder_playlist_items(old.playlist_id);
  return null;
end;
$$;


ALTER FUNCTION public.playlist_items_after_delete() OWNER TO postgres;

--
-- Name: playlist_items_before_insert(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.playlist_items_before_insert() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
  new.order_index := (
    select coalesce(max(order_index), -1) + 1
    from playlist_items
    where playlist_id = new.playlist_id
  );
  return new;
end;
$$;


ALTER FUNCTION public.playlist_items_before_insert() OWNER TO postgres;

--
-- Name: playlist_items_delete_trigger(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.playlist_items_delete_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Decrementa os itens que vinham depois do removido
    UPDATE playlist_items
    SET order_index = order_index - 1
    WHERE playlist_id = OLD.playlist_id
      AND order_index > OLD.order_index;

    RETURN OLD;
END;
$$;


ALTER FUNCTION public.playlist_items_delete_trigger() OWNER TO postgres;

--
-- Name: playlist_items_insert_trigger(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.playlist_items_insert_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Se order_index não for definido, coloca no final da playlist
    IF NEW.order_index IS NULL THEN
        SELECT COALESCE(MAX(order_index), 0) + 1
        INTO NEW.order_index
        FROM playlist_items
        WHERE playlist_id = NEW.playlist_id;
    ELSE
        -- Se um order_index específico for definido, incrementa os seguintes
        UPDATE playlist_items
        SET order_index = order_index + 1
        WHERE playlist_id = NEW.playlist_id
          AND order_index >= NEW.order_index;
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION public.playlist_items_insert_trigger() OWNER TO postgres;

--
-- Name: reorder_playlist_items(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.reorder_playlist_items(p_playlist_id uuid) RETURNS void
    LANGUAGE plpgsql
    AS $$
begin
  update playlist_items pi
  set order_index = sub.rn - 1
  from (
    select id,
           row_number() over (order by order_index) as rn
    from playlist_items
    where playlist_id = p_playlist_id
  ) sub
  where pi.id = sub.id;
end;
$$;


ALTER FUNCTION public.reorder_playlist_items(p_playlist_id uuid) OWNER TO postgres;

--
-- Name: update_storage_on_delete(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_storage_on_delete() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  UPDATE profiles
  SET bytes_usage = bytes_usage - OLD.size_bytes
  WHERE id = OLD.user_id;

  RETURN OLD;
END;
$$;


ALTER FUNCTION public.update_storage_on_delete() OWNER TO postgres;

--
-- Name: update_storage_on_insert(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_storage_on_insert() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  UPDATE profiles
  SET bytes_usage = bytes_usage + NEW.size_bytes
  WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_storage_on_insert() OWNER TO postgres;

--
-- Name: update_storage_on_update(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_storage_on_update() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  UPDATE profiles
  SET bytes_usage = bytes_usage - OLD.size_bytes + NEW.size_bytes
  WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_storage_on_update() OWNER TO postgres;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: activity_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.activity_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    screen_id uuid,
    action text NOT NULL,
    details jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.activity_logs OWNER TO postgres;

--
-- Name: clients; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clients (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    company_name character varying(255),
    cnpj character varying(18),
    is_active boolean DEFAULT true,
    updated_at timestamp without time zone
);


ALTER TABLE public.clients OWNER TO postgres;

--
-- Name: media_files; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.media_files (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    filename text NOT NULL,
    original_name text,
    mime_type text NOT NULL,
    size_bytes bigint NOT NULL,
    storage_path text NOT NULL,
    thumbnail_path text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone
);


ALTER TABLE public.media_files OWNER TO postgres;

--
-- Name: new_device; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.new_device (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    device_code character varying(6) NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.new_device OWNER TO postgres;

--
-- Name: plans; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.plans (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    price numeric,
    price_text text,
    max_screens integer,
    storage_gb numeric,
    support_level text,
    schedule_level text,
    reports_level text,
    api_integration boolean DEFAULT true,
    white_label boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    highlighted boolean DEFAULT false,
    description text,
    features jsonb,
    "idStripe" text
);


ALTER TABLE public.plans OWNER TO postgres;

--
-- Name: playlist_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.playlist_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    playlist_id uuid NOT NULL,
    media_file_id uuid,
    order_index integer NOT NULL,
    duration_override integer,
    created_at timestamp with time zone DEFAULT now(),
    start_view timestamp with time zone,
    end_view timestamp with time zone,
    updated_at timestamp with time zone,
    type public.type_playlist_item NOT NULL,
    config jsonb
);


ALTER TABLE public.playlist_items OWNER TO postgres;

--
-- Name: playlists; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.playlists (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    client_id uuid NOT NULL,
    name text NOT NULL,
    description text,
    is_default boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone,
    is_active boolean
);


ALTER TABLE public.playlists OWNER TO postgres;

--
-- Name: profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    full_name text,
    created_at timestamp with time zone DEFAULT now(),
    plan_id uuid DEFAULT '328b6137-fbc4-449d-b6ce-e969026d8643'::uuid,
    bytes_usage bigint DEFAULT 0 NOT NULL,
    stripe_customer_id text,
    subscription_status text,
    current_period_end timestamp with time zone
);


ALTER TABLE public.profiles OWNER TO postgres;

--
-- Name: screens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.screens (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    client_id uuid NOT NULL,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    location text,
    is_online boolean DEFAULT false,
    playlist_id uuid,
    is_active boolean DEFAULT true,
    updated_at timestamp without time zone,
    user_id uuid DEFAULT auth.uid()
);


ALTER TABLE public.screens OWNER TO postgres;

--
-- Name: storage_usage; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.storage_usage WITH (security_invoker='true') AS
 SELECT user_id,
    COALESCE(sum(size_bytes), (0)::numeric) AS total_bytes
   FROM public.media_files
  GROUP BY user_id;


ALTER VIEW public.storage_usage OWNER TO postgres;

--
-- Name: subscriptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subscriptions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    stripe_customer_id text,
    stripe_subscription_id text,
    plan text,
    status text,
    current_period_end timestamp without time zone,
    max_screens integer,
    max_storage_gb integer,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone,
    stripe_price_id text,
    cancel_at_period_end boolean DEFAULT false,
    trial_end timestamp with time zone,
    canceled_at timestamp with time zone,
    CONSTRAINT subscriptions_plan_check CHECK ((plan = ANY (ARRAY['starter'::text, 'pro'::text, 'enterprise'::text])))
);


ALTER TABLE public.subscriptions OWNER TO postgres;

--
-- Data for Name: activity_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.activity_logs (id, user_id, screen_id, action, details, created_at) FROM stdin;
8884b694-a326-4565-833d-b8d72870347a	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Playlist "PlaylistTest" criada	\N	2025-11-20 23:18:20.149891+00
840fd290-4155-4952-b085-1a53bbc45aa4	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Playlist "teste" criada	\N	2025-11-20 23:18:56.800977+00
265e190f-362e-4386-84d9-ff8feeaddb5e	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Client "Pedro" criada	\N	2025-11-20 23:51:03.221389+00
6db1021c-c1bd-4b58-aeb2-a5365d6eaf8a	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Client "Pedro" criada	\N	2025-11-20 23:53:51.745869+00
36d591a1-b09b-4cc4-9b51-20b250f24c48	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Client "Lorem" criada	\N	2025-11-20 23:56:50.404746+00
d2083484-87f5-40bd-96d9-d169e180d93a	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Client "Lorem" atualizada	\N	2025-11-20 23:57:06.805184+00
89802970-55b1-4ae7-b351-8df62cfd413f	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Client "Lorem" excluída	\N	2025-11-20 23:57:29.47837+00
5e3d662a-fe1a-49b2-a309-c7ab744a36ba	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Playlist "Mercado" criada	\N	2025-11-20 23:58:28.542463+00
1f1ababd-86d2-4970-9057-f66d7b47b601	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Playlist "Parceiros" criada	\N	2025-11-21 01:44:28.105023+00
8a087416-59be-41fe-aef5-bf7b04ede40b	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Playlist "Recepção" criada	\N	2025-11-21 01:53:20.631401+00
c3e27608-9369-419a-9e47-ba78f2735730	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Playlist "Recepção" atualizada	\N	2025-11-21 01:54:34.17251+00
a48e6063-45f6-4e3c-82f8-45e3bbf94ce7	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "temperature" criado	\N	2025-11-21 18:23:05.012002+00
851d6a0e-509f-46ef-9877-3113afc3e5e9	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "temperature" criado	\N	2025-11-21 18:25:12.715452+00
7c27b42a-4998-45bf-85f3-66e08d5652da	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "temperature" criado	\N	2025-11-21 18:25:39.709673+00
32475f09-c37f-4de6-a908-e31c8e0fd57e	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "temperature" atualizado	\N	2025-11-21 18:48:40.726374+00
177a6adb-5687-43e9-96b3-1260c253e831	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "temperature" criado	\N	2025-11-21 18:50:36.581165+00
cafa5202-ce5f-42e9-ba43-dcf35b082d40	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "temperature" excluído	\N	2025-11-21 19:39:26.780828+00
2a723231-cc38-440c-b132-0077b5793bc3	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "temperature" excluído	\N	2025-11-21 19:39:49.944114+00
381549d6-b175-4ce0-af6c-9684a5ae604b	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "temperature" criado	\N	2025-11-21 19:39:56.908546+00
5b5518dc-ff57-4da0-a290-caa873770c87	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Mídia "Captura de tela 2025-11-19 182925.png" enviada para Cloudflare R2	\N	2025-11-21 21:07:30.147295+00
45133c1d-5ea7-457e-9f95-ac13721a419b	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Mídia "Captura de tela 2025-10-16 215753.png" enviada	\N	2025-11-21 21:17:26.702092+00
a6bc453a-5b14-4929-84af-578dd44058e2	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Mídia "Captura de tela 2025-10-16 215753.png" enviada	\N	2025-11-21 21:22:16.739666+00
d7efd709-82f4-4fd6-9e5c-2543eb50e2a3	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Mídia "Captura de tela 2025-10-29 095327.png" enviada	\N	2025-11-21 21:27:35.853378+00
0a3cea1e-3ee9-4658-95e0-b147420e42a4	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Mídia "Captura de tela 2025-11-09 235840.png" enviada	\N	2025-11-21 21:29:22.863074+00
2dc202ad-c5b0-4e97-8cf2-34a05fe66514	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Mídia "Captura de tela 2025-11-10 114950.png" enviada	\N	2025-11-21 21:32:45.248472+00
6b18552e-3d84-46b3-8cb9-dd19f7457f2d	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Mídia "3470309b-ffc0-4b9f-b1b6-7cf5b34d157c/1fd91941-5e4b-47c8-a837-52be6e015a30-Captura de tela 2025-11-09 235840.png" excluída do Cloudflare R2	\N	2025-11-21 21:33:09.513422+00
465ba60e-0202-4c0f-9704-add1ad542358	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Mídia "Captura de tela 2025-10-29 095327.png" excluída	\N	2025-11-21 21:37:32.873469+00
5132f207-dbc4-4ed2-952f-ed19ad4cc1cf	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Mídia "Captura de tela 2025-10-16 215753.png" excluída	\N	2025-11-21 21:37:35.23697+00
085921c0-e8c0-42dc-a4ff-b2da0f9399d6	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Mídia "Captura de tela 2025-11-10 114950.png" excluída	\N	2025-11-21 21:37:54.89764+00
57e7fe5a-731d-42e2-9e00-f78f170f9095	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Mídia "Captura de tela 2025-11-10 122248.png" enviada	\N	2025-11-21 21:39:04.817541+00
9d7e32d5-1b04-4cf3-afe2-c1a962f1de2e	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Mídia "Captura de tela 2025-11-17 234220.png" enviada	\N	2025-11-21 21:39:20.739242+00
db6f4061-e915-4751-ae14-b27cb132e287	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Mídia "Among Us 2025-11-12 23-23-32.mp4" enviada	\N	2025-11-21 21:48:37.768387+00
c8ea019e-b4c8-4521-ac87-6330cc50d70d	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "temperature" excluído	\N	2025-11-21 22:01:36.667581+00
136facaa-7a74-4a54-91f7-6ed90c342502	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "temperature" criado	\N	2025-11-21 22:01:54.527097+00
1b20b43d-a3d0-4c8b-94e2-16991eb6e11f	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "temperature" excluído	\N	2025-11-22 06:05:22.316608+00
9d4b94a4-0aa3-45c3-bdf6-f0285543e319	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "temperature" criado	\N	2025-11-22 06:05:52.342001+00
66ccc126-d6f7-4c3d-9c62-46454e8cef88	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "video" criado	\N	2025-11-22 06:06:57.759973+00
383ef747-7809-41e9-b163-ce7ac8a18865	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "video" atualizado	\N	2025-11-22 06:10:18.475559+00
1ae0e232-d28a-42b5-90b6-eeca50716c0e	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "video" atualizado	\N	2025-11-22 06:14:25.397492+00
c38abb30-d79b-456a-9ede-2faa2ebd12d0	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "video" atualizado	\N	2025-11-22 06:14:38.454597+00
73984da6-e519-4834-9117-e0f875e1d129	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "video" atualizado	\N	2025-11-22 06:16:15.929079+00
38054264-e0ff-496d-912b-8e346f407fe8	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "image" criado	\N	2025-11-22 06:22:01.056186+00
d78e5060-765c-46ba-9269-38ce585caa59	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "image" atualizado	\N	2025-11-22 06:25:53.635868+00
1cab266f-f086-488f-b71e-4cd4c885d9b4	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "news" criado	\N	2025-11-22 11:00:37.025843+00
9431fce6-3af6-4bd8-b7a0-acc41e951adf	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "news" criado	\N	2025-11-22 11:02:16.867261+00
939fbbce-059d-45f9-8228-ffeb242802f3	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "news" criado	\N	2025-11-22 11:03:14.16732+00
57c9f073-dc1f-4622-96fc-745ce333f2ef	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "news" criado	\N	2025-11-22 11:03:35.444904+00
048e535c-9a47-439b-98b3-7559171ce22b	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "news" criado	\N	2025-11-22 11:07:14.944514+00
cf26da3a-d6f4-4276-9847-119e6dee8cc3	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "news" criado	\N	2025-11-22 11:07:36.67867+00
4bfdcc70-4f12-4da4-bfb5-26c620a0dda6	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "news" criado	\N	2025-11-22 11:08:37.721197+00
a7d9cd32-d1da-49e7-84bf-96d737326b11	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "news" criado	\N	2025-11-22 11:08:50.407567+00
fd2a1b41-41ac-4152-bb5c-2182a17b6211	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "news" criado	\N	2025-11-22 11:09:23.228881+00
8b66e721-0d7d-4354-ba7e-c543d2e658e0	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "news" criado	\N	2025-11-22 11:10:41.112569+00
d5e3273b-f241-43db-ab7c-73dd3d1c618a	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "news" atualizado	\N	2025-11-22 11:10:51.550888+00
ea1a380d-f7ce-4f2c-8f23-07d2d3ec06a6	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "news" atualizado	\N	2025-11-22 11:28:49.221257+00
06c4ad06-cd40-45de-89d0-0f7169cf5a0d	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "image" criado	\N	2025-11-22 14:42:21.432568+00
c5869427-2a1f-4d32-b059-6aba000389d8	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "image" criado	\N	2025-11-22 14:47:54.917937+00
580b8a9f-0f8e-40e7-8a84-9aae716ac7ab	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "temperature" criado	\N	2025-11-22 14:48:12.572524+00
4231bfb2-4758-49e2-bcb4-eb0928d8f3ad	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Playlist "Casa" criada	\N	2025-11-22 14:48:47.258895+00
ddab03a8-0e8c-40a0-876f-741e40cea8f2	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "temperature" criado	\N	2025-11-22 14:48:52.941096+00
b221d303-0ed6-4097-a398-50dcb6af0388	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "news" criado	\N	2025-11-22 14:49:16.954235+00
d1e689c8-cc32-46c4-ba3c-5d1485cf20f9	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "image" criado	\N	2025-11-22 14:49:21.970681+00
d5fe4438-aa9b-431d-b6f0-8ac0c701b66a	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "news" excluído	\N	2025-11-22 14:50:08.868031+00
1fe8c12b-1e57-4800-b16d-4bc414f79d3e	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "video" criado	\N	2025-11-23 06:09:58.191948+00
47dab178-cc46-4e58-b679-0537e990c7d8	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "teste" vinculada	\N	2025-11-26 18:45:14.909146+00
c212e84e-7629-417c-b738-e3f227a33f04	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "Casa Wictor" vinculada	\N	2025-11-26 19:12:28.454307+00
7252c86b-03c9-4830-a7b9-4e3dbf2a4428	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "Casa Wictor" vinculada	\N	2025-11-26 19:13:33.702817+00
d025d5e3-1310-4ba0-a9ba-61f8e2378178	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "Casa Wictor" vinculada	\N	2025-11-26 19:16:05.83591+00
dd34ccc5-b51d-4faf-970d-ae476a0d30a2	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "Casa Wictor" vinculada	\N	2025-11-26 19:19:11.795071+00
1babcd82-3413-4e77-a7d9-497f4124f457	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "Casa Wictor" vinculada	\N	2025-11-26 19:20:04.203628+00
27bbf75a-4f0d-47d8-b406-409c17bb3cf8	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "Casa Wictor" vinculada	\N	2025-11-26 20:19:49.766298+00
d03a0528-2976-4e73-b7c4-7873e97b6bf6	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "Quarto" vinculada	\N	2025-11-26 21:23:40.866733+00
182c4310-e463-460f-ab3b-a496bc45af3e	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "video" criado	\N	2025-11-26 21:41:40.89298+00
6076c9b8-ac9d-4f39-bfdb-ee8f53f79c17	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "Teste" vinculada	\N	2025-11-26 22:11:03.163799+00
1f7bb369-b71a-4e21-8796-d2746caa1b46	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "Teste" vinculada	\N	2025-11-26 22:13:05.053341+00
7e07d066-f13e-4b52-a305-2817e0485383	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "Teste" vinculada	\N	2025-11-26 22:13:35.714002+00
ae13f3be-ce02-43f0-8f9e-35d7d9609956	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "Teste" vinculada	\N	2025-11-26 22:14:30.786085+00
b9c85b20-27a6-49b7-ad37-6a628e7b0103	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "Teste" vinculada	\N	2025-11-26 22:15:01.878614+00
98b51333-889a-41df-afa2-dd0c56adee95	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "Teste" vinculada	\N	2025-11-26 22:16:00.155935+00
4bd60441-815b-447a-88b7-7acb5e4ef500	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "Teste" vinculada	\N	2025-11-26 22:17:33.787559+00
f39c2d40-b009-4cef-9c8c-02ad4d01e7e6	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "Teste" vinculada	\N	2025-11-26 22:18:08.835925+00
4fa56a54-aaaa-4daa-a9dc-ae7e470f7c66	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "Teste" vinculada	\N	2025-11-26 22:18:43.89895+00
d7fbd2d6-d87c-4a54-af4a-f9cebe2fa8be	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "Teste" vinculada	\N	2025-11-26 22:19:00.544155+00
99a39412-f68d-4636-928a-c97f56e09726	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "Teste" vinculada	\N	2025-11-26 22:22:15.190206+00
b22cd6a9-732b-43e9-8ec0-4397b9ea16a7	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "Teste" vinculada	\N	2025-11-26 22:23:04.528607+00
3fccf884-fe3c-4f77-9363-a43e5a1d62c6	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "Teste" vinculada	\N	2025-11-26 22:25:10.585083+00
81071074-8b79-4eec-82db-e1e558e211e8	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "Teste" vinculada	\N	2025-11-26 22:32:02.35175+00
523c4dbb-125a-4700-82ed-3eaff908c1c5	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "Teste" vinculada	\N	2025-11-26 22:34:01.519834+00
0b5b0fbc-0a4d-4061-ab9b-5e9b267f5621	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "Teste" vinculada	\N	2025-11-26 22:35:37.596396+00
18b5f849-4d4b-420e-90d7-beafaca7324d	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "Teste" vinculada	\N	2025-11-26 22:36:18.334475+00
f7b8dd84-bea0-4728-9180-375d688340b1	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "Teste" vinculada	\N	2025-11-26 22:37:18.632509+00
127496ca-2126-4667-a926-7a5fa4b3f955	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "Teste" vinculada	\N	2025-11-26 22:38:04.429406+00
baf4a44d-2b3b-48fe-8901-933fb246695b	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "Teste" vinculada	\N	2025-11-26 22:38:26.353498+00
c17127a4-17c6-44d3-8037-b66f7fb64cdc	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "Teste" vinculada	\N	2025-11-26 22:39:08.819189+00
9c07f0dd-7106-4e37-ae4c-df61619116c8	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "Teste" vinculada	\N	2025-11-26 22:42:18.310508+00
49ed9fee-f09e-4928-b767-6fd3975bb796	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "Teste" vinculada	\N	2025-11-26 22:43:38.350159+00
4e4de8bf-10b0-4cab-951b-4280978ee79c	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "Teste" vinculada	\N	2025-11-26 22:44:37.035988+00
90adcf36-3e3d-4b6c-9117-126eb0cc955f	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "Teste" vinculada	\N	2025-11-26 22:46:08.250204+00
008570bc-ef28-45de-a503-ae692fa90bf3	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "Teste" vinculada	\N	2025-11-26 22:47:51.000433+00
bfcabc87-e653-4a38-9148-7d8df1221734	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "Teste" vinculada	\N	2025-11-26 22:50:56.819194+00
2db7ddad-7ef1-4863-9491-81f1ec20c937	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "Teste" vinculada	\N	2025-11-26 22:51:53.324587+00
908cfc36-3e70-4980-ae90-9a4ce24e1abd	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "Teste" vinculada	\N	2025-11-26 22:53:50.166214+00
332e1600-ce84-4fbb-8b93-c4c7833a7220	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "Teste" vinculada	\N	2025-11-26 22:55:06.570804+00
6b633f47-31e7-4c7f-a061-0a9e6a81f336	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "Teste" vinculada	\N	2025-11-26 22:56:35.538397+00
2e383392-464e-4455-bcc8-00589c38a2e6	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "Teste" vinculada	\N	2025-11-26 23:09:13.132283+00
5c502dde-9974-4851-9729-244679c0f9a5	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "Teste" vinculada	\N	2025-11-26 23:09:52.484572+00
e356255a-75d4-49c7-9796-983567f1b969	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "Teste" vinculada	\N	2025-11-26 23:12:09.858386+00
6a4abc93-cb68-4722-b872-794693a9520b	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "Teste" vinculada	\N	2025-11-26 23:14:18.339945+00
2261584c-2ed7-4bcd-bc99-5eff80ec9467	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "Teste" vinculada	\N	2025-11-26 23:14:52.029581+00
0168f22a-dcd2-49ac-8b71-74e7668ba32f	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "Teste" vinculada	\N	2025-11-26 23:17:06.403382+00
12f8340a-f7f0-4f09-8f50-953d746e7327	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "Teste" vinculada	\N	2025-11-26 23:18:19.046388+00
29038ad5-5982-4f4c-bc1c-04191d503f3d	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "Teste" vinculada	\N	2025-11-26 23:19:35.450603+00
98666aba-80a3-4136-bd14-c401cf8be1ae	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "Teste" vinculada	\N	2025-11-26 23:23:19.278532+00
41331bb4-379e-4346-b5c4-730062f9e5e7	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "Teste" vinculada	\N	2025-11-26 23:54:52.603565+00
64ff91f8-c985-40c9-9754-6372c94c59ef	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "Teste" vinculada	\N	2025-11-26 23:55:47.540231+00
a4749bed-230d-4ab8-87f4-e55cbe38eecf	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "Casa Wictor" vinculada	\N	2025-11-26 23:56:41.145524+00
47d6e8f4-13ae-4ad8-930d-a5f0ff4f0cb9	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "Casa Wictor" vinculada	\N	2025-11-26 23:57:52.640432+00
8ba47802-8595-4bbf-9bae-6bfb1686c609	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "Casa Wictor" vinculada	\N	2025-11-27 00:02:09.005911+00
c0513045-80cb-4f58-bb9e-6fc96707eee0	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "Casa Wictor" vinculada	\N	2025-11-27 00:10:04.840714+00
9c94eed5-f057-4aab-bc1a-28661d49d3d2	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "Quarto" vinculada	\N	2025-11-27 00:25:12.403446+00
121f89d3-381c-4fc0-9016-24d1a57a72b7	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "Quarto" vinculada	\N	2025-11-27 00:41:06.905406+00
c5cf2354-3ea7-4fa8-a46c-4d7103f17bd6	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "Teste" vinculada	\N	2025-11-27 01:39:28.986676+00
2828448f-591c-426c-a80c-b9d7e5151ddf	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "Mercado São José" vinculada	\N	2025-11-27 02:04:26.419602+00
882c89ff-6ada-4780-a991-59a7f2f61592	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "temperature" atualizado	\N	2025-11-27 07:48:21.492685+00
d0416499-8396-4096-829e-1ee3e51cdaad	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "temperature" atualizado	\N	2025-11-27 07:57:41.148185+00
fe6da84a-ff09-497c-ae4a-dfe8ee737df6	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "temperature" atualizado	\N	2025-11-27 07:58:13.97388+00
2f940b3f-2100-4f4e-98b3-1589d72d36d4	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "temperature" atualizado	\N	2025-11-27 07:59:01.779902+00
af3fac9e-4740-4ebd-9145-cd5fec4be14d	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "temperature" atualizado	\N	2025-11-27 07:59:09.646975+00
821519bf-4220-42a1-9fdf-179f38bc253a	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "temperature" atualizado	\N	2025-11-27 07:59:14.76+00
cf269c50-3bb3-4c12-855b-bdf08420968d	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "temperature" atualizado	\N	2025-11-27 07:59:34.204335+00
e3dbddf0-baf9-45b8-a4a5-2f75007f3ced	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "temperature" atualizado	\N	2025-11-27 08:11:15.733574+00
c90630eb-3dc2-4705-81cb-c7273fd60665	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "temperature" atualizado	\N	2025-11-27 08:16:05.79505+00
90b0dc3d-ef0a-4d78-96de-9e3db7c16979	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "temperature" atualizado	\N	2025-11-27 08:16:10.506165+00
038a25cf-c930-4f63-8c30-3eb266622898	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "temperature" atualizado	\N	2025-11-27 08:16:15.046763+00
f685869c-7e98-4b9a-9df1-685b982ab47c	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "temperature" atualizado	\N	2025-11-27 08:16:35.501558+00
3354d72a-d2eb-4ba4-a2b6-b4009d0d318e	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "temperature" atualizado	\N	2025-11-27 08:17:56.623413+00
c37500dc-61a5-4c33-9ffc-da5c320f4651	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "temperature" atualizado	\N	2025-11-27 08:18:49.127857+00
ddc9af99-3816-4fe2-94a3-105757d93e14	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "temperature" atualizado	\N	2025-11-27 08:18:53.958745+00
e32a7a6e-f928-4a27-bab7-f6ef0423d233	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "temperature" atualizado	\N	2025-11-27 08:18:58.211756+00
23219309-876e-4ac2-9833-7d1432ae8da4	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "temperature" atualizado	\N	2025-11-27 08:20:24.271872+00
083c959a-e071-43d7-a810-dec29f75249c	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "video" excluído	\N	2025-11-27 08:37:53.086564+00
29db3940-f999-4947-bf5d-57d8eb6220cd	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "image" atualizado	\N	2025-11-27 09:20:45.543771+00
31693305-80e4-480a-93bb-18edf42af437	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "image" atualizado	\N	2025-11-27 09:21:43.89145+00
0d122000-555a-4be7-aa28-8822fa22685b	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "temperature" atualizado	\N	2025-11-27 09:31:29.756117+00
9379a3f1-1e93-4a26-88f5-782b17d43a61	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "image" excluído	\N	2025-11-27 09:31:48.907086+00
74c2040f-269c-4aba-8728-fe90c4e27dc7	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "video" excluído	\N	2025-11-27 09:31:55.837764+00
e05572f9-0754-420a-89d6-e511d5649982	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "video" criado	\N	2025-11-27 09:35:11.177509+00
535f6ea4-0977-442d-8d97-ecd82fcc4cef	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "image" criado	\N	2025-11-27 09:35:32.079435+00
a950fff6-fbd6-402f-9411-6f2874820f71	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "video" criado	\N	2025-11-27 09:35:46.309354+00
ed706aad-2aa0-40bb-b7b7-3b0f77758731	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "temperature" atualizado	\N	2025-11-27 09:37:09.686927+00
e893a4be-4be8-4767-b2b2-856e23351440	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "video" excluído	\N	2025-11-27 09:37:29.234622+00
b0d7c98a-9292-41c3-b81d-3372e6100fcc	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "video" criado	\N	2025-11-27 09:38:24.254299+00
212c3c80-08e5-49e6-a571-9f84c1c76e51	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "temperature" atualizado	\N	2025-11-27 09:46:52.118539+00
1df6f655-c1a5-4c5c-a6db-6078d1f82550	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "temperature" atualizado	\N	2025-11-27 09:48:51.375744+00
a80b8a07-31d7-4e3e-aff5-08df69f1fddf	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "temperature" atualizado	\N	2025-11-27 09:51:40.283822+00
58e4b798-3515-48b9-8661-13857938a66c	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "temperature" atualizado	\N	2025-11-27 10:02:23.152119+00
adb8f414-6d70-4c45-9be8-a2279570eca1	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "temperature" atualizado	\N	2025-11-27 10:09:08.272724+00
21491b28-fdf5-49a3-ac41-59976c67f60b	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "temperature" atualizado	\N	2025-11-27 10:09:16.32878+00
e718f63b-0d05-4e48-a07c-59bb658cb721	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "temperature" atualizado	\N	2025-11-27 10:13:57.244003+00
d999afed-def4-42d3-9ca8-977ceb3d775b	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "video" excluído	\N	2025-11-27 10:18:26.777705+00
7bb2d387-d211-44f4-9c0b-02bcb28b2a19	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "video" criado	\N	2025-11-27 10:18:36.278426+00
05162edc-1255-4ac4-b9aa-8a05c7207303	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "temperature" atualizado	\N	2025-11-27 10:21:01.617699+00
9ae1e39d-2bee-4652-a6af-acc7babf4c7a	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "temperature" atualizado	\N	2025-11-27 10:30:21.614046+00
d032253d-d7b3-489d-ad53-3bfc1f8c1fc0	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "temperature" atualizado	\N	2025-11-27 10:30:40.557275+00
08c4c0a7-6242-4cb5-828f-f8a2340a5025	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "temperature" atualizado	\N	2025-11-27 10:31:23.592781+00
b1d89fa3-2abf-4418-a4b4-2727f5115160	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "news" criado	\N	2025-11-27 10:32:42.378308+00
fb280d36-be59-46dd-8560-b51a8c43db6f	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "news" excluído	\N	2025-11-27 10:34:49.448444+00
6e10917f-61a8-46b8-990e-b819b7541569	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "image" excluído	\N	2025-11-28 02:01:59.462234+00
d47e4c1a-9b09-4d53-ab80-d6cf02534a7c	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "temperature" atualizado	\N	2025-11-28 02:02:12.326739+00
533fa2ff-1ae7-410e-b713-65082c8ecc4a	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "temperature" atualizado	\N	2025-11-28 02:02:56.521375+00
97983a32-471a-491b-a3e8-ace85ef143b4	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "temperature" atualizado	\N	2025-11-28 02:03:03.709566+00
1ce3fab8-409e-46a0-ad72-9b950c4d8102	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "video" criado	\N	2025-11-28 02:03:46.752445+00
59760654-1b30-4049-8879-421c840c4ae9	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "news" criado	\N	2025-11-28 02:05:53.962706+00
9bcf4949-ef59-4854-80d0-d6389940f33d	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "video" excluído	\N	2025-11-28 02:08:46.498512+00
6c156d9e-0195-4fa7-8d32-441d4e138842	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "news" criado	\N	2025-11-28 02:54:58.816234+00
fa27461d-4b2d-4cc8-979e-bb684dceb729	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "news" criado	\N	2025-11-28 06:45:58.225328+00
1fd94af3-9d04-4a8d-adae-d38780a55687	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "news" atualizado	\N	2025-11-28 06:47:49.825965+00
df1a7490-28f2-4e9f-bc21-bf9d9a371bbf	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "temperature" atualizado	\N	2025-11-28 06:53:42.426733+00
02f045ff-9b5a-47ed-ad5c-3a093d1d5415	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "temperature" atualizado	\N	2025-11-28 06:57:11.596067+00
ffd5919a-835b-4614-8c61-911909638352	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "news" atualizado	\N	2025-11-28 06:57:24.675235+00
bd1fac59-b2a7-487d-8581-71377c3eec4a	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "news" atualizado	\N	2025-11-28 06:59:19.245355+00
283c6efa-7758-49d4-9f75-556543185106	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "news" atualizado	\N	2025-11-28 07:01:14.895035+00
0c70cf11-8d44-4891-bc66-c718c76b00f6	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "video" excluído	\N	2025-11-28 07:25:58.13415+00
51e70b8b-75d1-4274-ab2b-4be718189686	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "news" atualizado	\N	2025-12-03 19:07:00.098243+00
7b8e096e-db64-4359-96e9-43f0cae588cd	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "news" atualizado	\N	2025-12-03 19:15:57.514079+00
cd60e84e-94e4-4dc9-b540-49e4fcaabd8f	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "news" atualizado	\N	2025-12-03 19:20:16.026529+00
47cafb55-b9b1-487c-ba7a-d110cf99335b	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "news" atualizado	\N	2025-12-03 19:24:10.275123+00
0ea6e00b-fbf8-421b-b55e-ca4a0c4f84dd	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "video" criado	\N	2025-12-05 03:38:17.485026+00
4432c84e-4650-4f02-98c1-1c7fa1aa6ddd	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "news" atualizado	\N	2025-12-05 03:39:01.890877+00
95d02311-5fa0-4d9a-9bbf-97b3a0688a7f	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "Mercado São José" atualizada	\N	2025-12-05 04:10:16.647833+00
c2951f03-c656-467d-aac9-0d854a186f93	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "temperature" excluído	\N	2025-12-06 21:23:07.039934+00
faeca55a-323c-41ef-8c6d-265e59b7a512	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "news" excluído	\N	2025-12-06 21:23:17.881545+00
172c6094-5bcd-41a5-a305-5e0cd9f5a245	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "video" excluído	\N	2025-12-06 21:23:24.651974+00
5fa0d66b-c53e-4b8f-b873-723ed558eba2	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "news" criado	\N	2025-12-06 21:24:06.99614+00
a17dd19a-5779-447f-b0e2-fe73c8fb0e78	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "news" atualizado	\N	2025-12-06 21:24:45.833458+00
7cb62fb7-bb5a-4cf2-8039-1e4fe24d3131	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "news" atualizado	\N	2025-12-06 21:33:51.647979+00
bf96171f-98ea-488a-adf8-c929d43acd4d	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "news" atualizado	\N	2025-12-06 21:34:50.568572+00
0e4e1b34-bf62-4116-af81-47710ad942ba	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "news" atualizado	\N	2025-12-06 21:37:28.439496+00
c72e6d06-9502-4347-b818-16fce8c0819b	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "news" atualizado	\N	2025-12-06 21:37:46.271157+00
2aedb734-4b62-4136-b422-0deb89e22b3d	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "news" atualizado	\N	2025-12-06 21:49:06.031337+00
7d593871-181a-4d55-b94b-4d3425dbdf8f	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "news" atualizado	\N	2025-12-06 21:50:30.709682+00
87617ca0-c58b-4c52-b5b1-c9ac1b65e165	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "image" criado	\N	2025-12-06 21:51:01.183616+00
ea04e97d-f0bf-462e-8297-663cddbdf0c3	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "temperature" criado	\N	2025-12-06 21:54:25.825431+00
6ae0b8b8-ee28-4671-bfbb-edb9bc1428b2	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "news" atualizado	\N	2025-12-06 22:03:38.487058+00
cf9fb545-7717-4b3d-9d5a-f9d016cd531f	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "news" atualizado	\N	2025-12-06 22:04:02.38982+00
ea54d37f-552e-42d2-aab3-a51cfdfe38ba	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "news" excluído	\N	2025-12-06 22:30:33.213587+00
100affb1-2e0e-4787-b074-062512ff3bb3	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "news" criado	\N	2025-12-06 22:30:52.608495+00
6bea2dd0-f2b6-47c0-9445-fc62f5874204	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	screen "Mercado São José" excluída	\N	2025-12-06 22:31:38.919097+00
8452449d-664c-4359-8bc4-7d8f3786a7fc	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "Quarteto Fantastico" vinculada	\N	2025-12-06 22:35:53.01272+00
7224f393-97e7-4340-9770-b103018e9a06	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "news" atualizado	\N	2025-12-06 22:36:21.450436+00
a7c41add-508e-43d3-9530-22559546acff	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "Teste Sala" vinculada	\N	2025-12-08 19:28:42.673861+00
f7c7a0d0-07bc-4583-bd90-b77db796a3dd	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "video" criado	\N	2025-12-08 19:31:17.007132+00
0827d593-702a-4a60-b11d-289d2dfafe30	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "news" atualizado	\N	2025-12-08 19:31:21.580488+00
10f528d1-475b-4cc6-982d-232c9c0d4c8f	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "temperature" atualizado	\N	2025-12-08 19:31:28.049589+00
40328b10-5024-4eed-8e45-f0eccb9d0303	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "TV Sala" vinculada	\N	2025-12-09 17:11:20.224598+00
183e4dc8-7bda-4b96-9991-db8d57931030	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "news" excluído	\N	2025-12-09 17:11:38.500553+00
96b588aa-e8df-4410-ae81-288a3132b6cb	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "temperature" atualizado	\N	2025-12-09 17:21:41.755322+00
50c8a5e9-9cf2-47d7-976a-711f440533e9	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "news" criado	\N	2025-12-09 17:22:13.263969+00
33d03aa8-81a8-4551-8b7d-a55ef9e244c7	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "temperature" atualizado	\N	2025-12-09 17:22:27.830802+00
4f354d18-f700-4a78-a062-e8782d4e501b	e7de4b53-6895-4ae9-a60a-257ab36bb316	\N	Client "Teste" criada	\N	2025-12-10 01:20:27.707119+00
1613c271-3c55-435f-b1da-9f285595ef2f	e7de4b53-6895-4ae9-a60a-257ab36bb316	\N	Playlist "teste" criada	\N	2025-12-10 01:20:33.265794+00
7002b919-c2e5-4e3b-b757-e64f1bec4c74	e7de4b53-6895-4ae9-a60a-257ab36bb316	\N	Screen "celular" vinculada	\N	2025-12-10 01:20:55.470244+00
48d57948-ba6b-46b7-9974-932e8ce0b50a	e7de4b53-6895-4ae9-a60a-257ab36bb316	\N	PlaylistItem "temperature" criado	\N	2025-12-10 01:21:50.413528+00
c2e69461-ceb6-4c26-b86c-4484dbd98470	e7de4b53-6895-4ae9-a60a-257ab36bb316	\N	PlaylistItem "video" criado	\N	2025-12-10 01:22:08.711379+00
d7f697e4-8165-4928-95ad-7304e09ae34a	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "Teste" vinculada	\N	2025-12-10 02:47:20.288194+00
2423d147-d93e-46a8-a551-4584a42782dc	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	screen "TV Sala" excluída	\N	2025-12-10 13:06:38.346553+00
881ec42b-8425-48f8-b976-89989428a46d	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	screen "Teste" excluída	\N	2025-12-10 13:06:40.800546+00
4b2de994-a727-407c-94e9-33fbe08f905c	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	screen "Quarteto Fantastico" excluída	\N	2025-12-10 13:06:43.340679+00
81d1fa73-214b-4602-afe5-58d355549747	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	screen "Teste" excluída	\N	2025-12-10 13:07:00.928609+00
53e4fbdb-1a9f-4568-8538-31ba343e9100	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "TV Sala" vinculada	\N	2025-12-10 13:07:36.24524+00
370a591a-e236-4ef9-b930-aca0bce99a0e	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "TV Quarto" vinculada	\N	2025-12-10 13:08:16.925775+00
8cc72773-9232-4045-85cd-6d43787b1ee3	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	screen "TV Sala" excluída	\N	2025-12-10 13:49:14.022861+00
a6f41d3c-5c67-4412-a0b0-52af57c4a2e0	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "Sala" vinculada	\N	2025-12-10 13:49:31.748202+00
cff882dc-8242-42d8-9c96-03d2d292f0e0	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	screen "TV Quarto" excluída	\N	2025-12-10 13:54:29.511623+00
f1f0874c-2774-4b7e-b144-508d1cfeeb5a	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "Quarto" vinculada	\N	2025-12-10 13:54:44.361609+00
eb1921c2-c465-4ba9-997d-9f60bd74420f	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "quarto2" vinculada	\N	2025-12-10 14:12:29.518504+00
6c96b595-58b4-434b-bb6f-f23526bb90f4	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	screen "Sala" excluída	\N	2025-12-10 14:13:14.736003+00
ef8645e4-2a9c-4fc4-96d7-ec38ef2120f6	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	screen "quarto2" excluída	\N	2025-12-10 14:14:45.416474+00
6662adce-20a0-4102-a1b7-f4ff38cfedb7	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	screen "Quarto" excluída	\N	2025-12-10 14:14:47.962033+00
670fbf8e-85d3-4cf8-a23f-0610a69f8511	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "sala" vinculada	\N	2025-12-10 14:15:10.012916+00
fe10b425-0241-443b-a0eb-fb2c3c955bae	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "quarto" vinculada	\N	2025-12-10 14:16:18.484396+00
0c9b7359-d837-40cb-acbb-a153b2083c20	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "Celular" vinculada	\N	2025-12-11 18:26:48.861276+00
7ed98897-9ba7-446c-8f07-4630a6fd98d7	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	screen "quarto" excluída	\N	2025-12-11 18:27:29.087812+00
ecc0a352-fb48-4a33-ab45-e629d373f9e2	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "pedro" vinculada	\N	2025-12-11 18:27:30.235779+00
4dce2e0d-eff3-4cb9-b9ee-76c924bdddb8	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	screen "Celular" excluída	\N	2025-12-11 18:28:49.33003+00
bb267cd1-d1e1-43ce-87c7-0e928e6b7a81	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "celular" vinculada	\N	2025-12-11 18:29:00.530614+00
6d1872ee-af2b-472b-ab71-a47eb1891011	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	screen "pedro" excluída	\N	2025-12-11 18:29:23.35873+00
07621e03-4595-4f11-a1c6-67c16e4fb015	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "pedro" vinculada	\N	2025-12-11 18:30:00.12858+00
0a392cae-d3b5-4fc3-a2f8-13e2ddeff842	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "video" criado	\N	2025-12-11 18:30:55.245036+00
8afc4f76-2f4d-4670-b9bb-13623350a341	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "video" atualizado	\N	2025-12-11 18:34:50.664348+00
41bf66a3-9f54-4293-ad80-5f5fb94a2711	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "temperature" atualizado	\N	2025-12-11 18:35:38.073751+00
71f34cbc-aefe-4849-b375-91de76ca7c02	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	screen "sala" excluída	\N	2025-12-11 18:40:24.543938+00
d12efdd0-ebe9-4a9f-8bfa-4ba748f47403	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "Casa Pedro" vinculada	\N	2025-12-11 18:41:26.234057+00
1391ac9b-b051-44b8-a1e6-377622f0d04b	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "Quarto" vinculada	\N	2025-12-11 18:53:47.955739+00
fa30065a-bca3-4a02-92f4-48b8b12b6028	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "luis" vinculada	\N	2025-12-11 23:43:21.571254+00
868dfacf-0a64-4448-9865-ca2e17e662e0	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "video" excluído	\N	2025-12-11 23:43:33.926629+00
e015ef9a-6038-4ec5-8cc1-d77e018e67a5	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "video" excluído	\N	2025-12-11 23:43:39.090177+00
9ce71621-a1d9-405b-ae81-3bbe2fb9bbc0	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "image" excluído	\N	2025-12-11 23:43:44.237468+00
c961249e-2f21-4fd0-bf39-c7e8cf95a5c4	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "news" excluído	\N	2025-12-11 23:43:47.452362+00
591d795b-de8d-4610-af37-bfdda7e809b5	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "video" criado	\N	2025-12-11 23:43:55.897137+00
0b5f8e87-d4f1-4eca-9529-f260410ca5e7	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "wictor" vinculada	\N	2025-12-11 23:44:17.532538+00
630f20d8-7170-4332-9c40-1deda024502a	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "temperature" excluído	\N	2025-12-11 23:44:51.817202+00
c3a7a37f-0398-47bc-a184-5d4925b41127	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "image" criado	\N	2025-12-11 23:45:09.604996+00
c6476b82-a74c-4042-b346-cfc6c134c22f	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "video" criado	\N	2025-12-11 23:47:22.320743+00
e1529792-62b8-4db0-b0f0-6178b4cea723	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "news" criado	\N	2025-12-11 23:49:01.34427+00
d73d15a2-b7a7-4efa-b491-5e0b34ccc524	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "news" atualizado	\N	2025-12-11 23:49:24.918237+00
5bc2402d-65be-494d-9775-cafac5157656	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "temperature" criado	\N	2025-12-11 23:49:35.343988+00
e8716ade-8b58-47c1-b321-464789e485e3	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "image" excluído	\N	2025-12-11 23:49:38.390087+00
7e677851-cf69-4ee7-bd80-91d8e37415a1	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "video" excluído	\N	2025-12-12 11:36:09.13217+00
a336cb33-ed87-4b01-adc5-12534eed358b	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "video" excluído	\N	2025-12-12 11:36:12.23591+00
7d9aba8b-fc5c-44d1-b8c1-1e0c7c3eda9a	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "temperature" excluído	\N	2025-12-12 11:36:15.447626+00
0fd189ee-a3d4-49d0-8e56-a27b14b10869	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "video" criado	\N	2025-12-12 11:36:28.774582+00
ae28c1d4-0443-4ab5-8082-39fe2eb4090a	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "quarto 2" vinculada	\N	2025-12-12 11:40:02.126231+00
a574705d-95f9-415d-8f8c-6df0835703e0	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "video" criado	\N	2025-12-12 11:40:54.474227+00
92b8dae9-b577-474a-82eb-bcf2bdf0b6d9	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "Celular" vinculada	\N	2025-12-14 01:00:45.406346+00
672d4b21-c9e5-420e-bb2c-495c80fa944e	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "celular" vinculada	\N	2025-12-14 01:03:36.129101+00
3171cae0-6556-4d1d-8d33-c168fc340309	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "celular" vinculada	\N	2025-12-14 01:07:03.97967+00
b2b82b49-917f-4e22-85a4-ff2cef3e5731	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "Quarto" vinculada	\N	2025-12-14 02:41:57.039771+00
f8a6a695-912e-41ef-8ca9-84d0be7612f4	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "teste" vinculada	\N	2025-12-14 02:43:28.916289+00
343fb232-edd6-4258-83b8-2e7549eb12cd	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "asdsa" vinculada	\N	2025-12-14 02:46:26.850121+00
11ab2f24-2e82-4e2d-9aa1-42018ef02b70	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "asdasd" vinculada	\N	2025-12-14 02:48:00.009487+00
a0de8430-ce79-45c7-871e-1c027bb85bd4	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "Celular" vinculada	\N	2025-12-14 02:55:02.501455+00
6fa8f780-6f46-4b45-8956-0f101f43a42f	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "quarto" vinculada	\N	2025-12-14 02:55:22.946376+00
9b2aba0a-e2bf-4422-a78d-070346aa9408	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "asdsad" vinculada	\N	2025-12-14 02:57:34.97613+00
b9572fe4-b38f-4b07-b770-86e5e8fd1755	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "asdasd" vinculada	\N	2025-12-14 03:01:17.081199+00
068f34a7-bf55-49ec-add7-72fb00ac0ea7	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "asdasd" vinculada	\N	2025-12-14 03:02:13.813032+00
2d10c0ca-290f-44fd-b73e-4caf1dae26fe	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "asdasd" vinculada	\N	2025-12-14 03:04:11.60296+00
c390b93c-9c72-4217-b6a8-befd534f64ff	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "ce" vinculada	\N	2025-12-14 03:05:24.406761+00
5e092dc7-3c55-4e2f-802d-09b703e95de6	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "image" criado	\N	2025-12-14 19:08:27.181154+00
4f793c49-39a8-48ef-8846-cb15bb58fb14	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "asdasd" atualizada	\N	2025-12-15 16:00:15.997307+00
dea8bb73-1f40-4af2-8f0e-baadafe1d0af	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "ce" atualizada	\N	2025-12-15 16:00:26.763593+00
a3300977-6ff3-4ec9-bb48-7f044c037da0	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "Celular Jess" vinculada	\N	2025-12-15 22:56:24.045032+00
56e2b46f-f255-44cb-a84c-395b11ce88e4	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "celular thaina" vinculada	\N	2025-12-15 23:03:23.246813+00
d5728f31-41fc-4e6f-97a2-02ef8f03d869	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "pedro" vinculada	\N	2025-12-24 14:38:51.35848+00
6cdbf39a-967d-45a4-b52f-3b54258119ce	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "image" atualizado	\N	2025-12-24 14:39:15.404971+00
0f7886f1-bbd5-4ac7-8f5f-1c75daa0b3b4	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "video" excluído	\N	2025-12-24 14:39:24.968764+00
b958c556-e6ad-40df-b13c-f5f9b348f955	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "news" excluído	\N	2025-12-24 14:39:48.640376+00
8e10fa8e-9a36-466d-9409-458c587184d9	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "news" criado	\N	2025-12-24 14:41:46.416048+00
168ee266-58d5-46b9-a283-e590783f357b	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	PlaylistItem "news" atualizado	\N	2025-12-24 14:41:50.908542+00
dbe76e19-c8fa-4886-8a77-36c62dfb4758	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "ce" atualizada	\N	2025-12-24 14:46:00.482392+00
1933d918-e9af-4bed-a07c-8c8a463e16a6	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "Quarto" vinculada	\N	2025-12-26 14:16:02.522986+00
a7c9974d-425d-47ec-8b2b-934c5dcc589b	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	Screen "Pedro" vinculada	\N	2025-12-29 14:35:11.185406+00
\.


--
-- Data for Name: clients; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.clients (id, user_id, name, created_at, company_name, cnpj, is_active, updated_at) FROM stdin;
04496f64-d45e-4e06-af05-6ac5555c4add	e7de4b53-6895-4ae9-a60a-257ab36bb316	Teste	2025-12-10 01:20:27.647882+00	Teste	000000	t	\N
8a6bcb2e-f58e-4344-97b3-a2f8c5e4c9d6	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	Pedro 2	2025-11-20 23:53:51.691609+00	JP Serviços	123456	t	\N
d3f535f5-66cb-427a-be58-b1c54dfcbaa8	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	Gordo	2025-12-13 17:39:20.089464+00	Gordices	000000	t	\N
90f89552-2268-49fb-bcb2-adb922bc5d73	943692cd-369b-436d-841d-691d67e95cb6	Cliente Teste	2026-01-03 14:55:03.526269+00	Empresa Teste LTDA	\N	t	\N
\.


--
-- Data for Name: media_files; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.media_files (id, user_id, filename, original_name, mime_type, size_bytes, storage_path, thumbnail_path, created_at, updated_at) FROM stdin;
4c39c6e4-4c7a-4f66-9216-37175b82afbd	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c/58b0f95b-e4a3-4202-b518-227688ceb022-Design sem nome (1).mp4	Design sem nome (1).mp4	video/mp4	7762558	https://pub-f6892dd3cc3f47208a370003fd62223f.r2.dev/3470309b-ffc0-4b9f-b1b6-7cf5b34d157c/58b0f95b-e4a3-4202-b518-227688ceb022-Design sem nome (1).mp4	https://pub-f6892dd3cc3f47208a370003fd62223f.r2.dev/thumbs/3470309b-ffc0-4b9f-b1b6-7cf5b34d157c/58b0f95b-e4a3-4202-b518-227688ceb022-Design sem nome (1).mp4.jpg	2025-12-25 21:03:16.124124	\N
6ec199ab-d32f-4d93-954f-4c95bad83fb0	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c/1acbd289-9004-4ef8-8a95-addf8205da31-Design sem nome.png	Design sem nome.png	image/png	960384	https://pub-f6892dd3cc3f47208a370003fd62223f.r2.dev/3470309b-ffc0-4b9f-b1b6-7cf5b34d157c/1acbd289-9004-4ef8-8a95-addf8205da31-Design sem nome.png	\N	2025-12-25 21:03:36.127846	\N
ba088078-44b3-4244-b106-c66f61117985	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c/ce7ea85a-8c14-403d-be8b-54a128bcf9fc-2.mp4	2.mp4	video/mp4	778129	https://pub-f6892dd3cc3f47208a370003fd62223f.r2.dev/3470309b-ffc0-4b9f-b1b6-7cf5b34d157c/ce7ea85a-8c14-403d-be8b-54a128bcf9fc-2.mp4	https://pub-f6892dd3cc3f47208a370003fd62223f.r2.dev/thumbs/3470309b-ffc0-4b9f-b1b6-7cf5b34d157c/ce7ea85a-8c14-403d-be8b-54a128bcf9fc-2.mp4.jpg	2025-12-26 14:19:22.336801	\N
66462cd1-ee91-4722-b138-382176bb6f3a	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c/1fbde7a0-a8d8-4f17-bbf7-c700fe4d7ff8-1.mp4	1.mp4	video/mp4	8575754	https://pub-f6892dd3cc3f47208a370003fd62223f.r2.dev/3470309b-ffc0-4b9f-b1b6-7cf5b34d157c/1fbde7a0-a8d8-4f17-bbf7-c700fe4d7ff8-1.mp4	https://pub-f6892dd3cc3f47208a370003fd62223f.r2.dev/thumbs/3470309b-ffc0-4b9f-b1b6-7cf5b34d157c/1fbde7a0-a8d8-4f17-bbf7-c700fe4d7ff8-1.mp4.jpg	2025-12-26 14:19:40.514734	\N
\.


--
-- Data for Name: new_device; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.new_device (id, device_code, created_at) FROM stdin;
\.


--
-- Data for Name: plans; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.plans (id, name, price, price_text, max_screens, storage_gb, support_level, schedule_level, reports_level, api_integration, white_label, created_at, highlighted, description, features, "idStripe") FROM stdin;
90f9e03a-58bd-41e3-aded-d1f89daff0b0	Starter	149	R$ 149	3	10	E-mail	Básico	\N	f	f	2025-12-08 19:07:07.596668	f	Perfeito para pequenos negócios	[{"text": "Até 3 telas", "included": true}, {"text": "10 GB de armazenamento", "included": true}, {"text": "Suporte por e-mail", "included": true}, {"text": "Playlists ilimitadas", "included": true}, {"text": "Agendamento básico", "included": true}, {"text": "API de integração", "included": false}, {"text": "Relatórios detalhados", "included": false}]	price_1SbYgXCqW9fz58nsUIA8zA7p
476a87b7-9bc6-4af0-8ae4-9a36cd48cf8b	Enterprise	\N	Personalizado	\N	\N	Dedicado 24/7	Avançado	Customizados	t	t	2025-12-08 19:07:07.596668	f	Solução completa para grandes empresas	[{"text": "Telas ilimitadas", "included": true}, {"text": "Armazenamento ilimitado", "included": true}, {"text": "Suporte dedicado 24/7", "included": true}, {"text": "Playlists ilimitadas", "included": true}, {"text": "Agendamento avançado", "included": true}, {"text": "API de integração", "included": true}, {"text": "Relatórios customizados", "included": true}, {"text": "White label", "included": true}]	\N
328b6137-fbc4-449d-b6ce-e969026d8643	Freemium	0	R$ 0	1	1	E-mail	Básico	\N	f	f	2025-12-08 19:09:51.388613	f	Ideal para testar a plataforma	[{"text": "1 tela", "included": true}, {"text": "1 GB de armazenamento", "included": true}, {"text": "Suporte por e-mail", "included": true}, {"text": "Playlists ilimitadas", "included": true}, {"text": "Agendamento básico", "included": true}, {"text": "API de integração", "included": false}, {"text": "Relatórios", "included": false}]	\N
1d3faa57-5727-490f-a928-fe80cf6d5f01	Professional	349	R$ 349	15	10	Prioritário	Avançado	Detalhados	t	f	2025-12-08 19:07:07.596668	t	Para empresas em crescimento	[{"text": "15 telas", "included": true}, {"text": "50 GB de armazenamento", "included": true}, {"text": "Suporte prioritário", "included": true}, {"text": "Playlists ilimitadas", "included": true}, {"text": "Agendamento avançado", "included": true}, {"text": "API de integração", "included": true}, {"text": "Relatórios detalhados", "included": true}, {"text": "White label", "included": false}]	price_1SbYh5CqW9fz58nsDiaiwWfM
e9df75e8-a39f-435e-b92c-237bb3b27b99	Free	\N	\N	1	1	Básico	Básico	Básicos	f	f	2026-01-03 13:43:29.50996	f	Plano gratuito para começar	[{"text": "1 tela", "included": true}, {"text": "1 GB de armazenamento", "included": true}, {"text": "Suporte por e-mail", "included": true}, {"text": "Playlists ilimitadas", "included": true}, {"text": "Agendamento básico", "included": true}, {"text": "API de integração", "included": false}, {"text": "Relatórios detalhados", "included": false}, {"text": "White label", "included": false}]	\N
\.


--
-- Data for Name: playlist_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.playlist_items (id, playlist_id, media_file_id, order_index, duration_override, created_at, start_view, end_view, updated_at, type, config) FROM stdin;
3068475d-86fa-4995-841c-c9849e2fd7dd	d623871a-236a-4eee-9425-6c8f4f636c15	66462cd1-ee91-4722-b138-382176bb6f3a	3	\N	2026-01-03 20:31:56.691229+00	\N	\N	\N	video	{}
1a689948-8563-4222-b2db-35add92831f4	d623871a-236a-4eee-9425-6c8f4f636c15	\N	0	\N	2025-12-26 17:51:16.923507+00	\N	\N	\N	hours	{"style": "digital", "clocks": [{"id": "aab0f79e-7514-4012-9fb1-abdd8b3baa8c", "label": "Cancún", "format": "24h", "location": {"lat": 21.17429, "lon": -86.84656, "name": "Cancún", "country": "MX"}}], "layout": "vertical", "overlay": true, "position": "bottom-right"}
d3ae3eda-26da-4ae1-b73e-38a7d7ad4500	d623871a-236a-4eee-9425-6c8f4f636c15	\N	2	\N	2025-12-29 04:07:15.15061+00	\N	\N	\N	news	{"news": {"G1": ["https://g1.globo.com/dynamo/educacao/rss2.xml"], "Metrópole": ["https://metropoleonline.com.br/rss/category/politica"]}, "overlay": false}
962f7c71-0026-4bb6-afd3-9b166a12098f	d623871a-236a-4eee-9425-6c8f4f636c15	4c39c6e4-4c7a-4f66-9216-37175b82afbd	1	\N	2025-12-29 04:05:44.195155+00	\N	\N	\N	video	{}
8e074722-958d-4a27-872f-f941e6f95079	d623871a-236a-4eee-9425-6c8f4f636c15	\N	1	\N	2025-12-29 03:50:13.606861+00	\N	\N	\N	temperature	{"style": "tech", "layout": "vertical", "overlay": true, "position": "top-left", "locations": [{"id": "05ed4982-9e8d-4b37-9e9f-e78a27b6f8f3", "city": "Sydney, AU", "label": "Papua Nova", "location": {"lat": -6, "lon": 147, "name": "Papua-Nova Guiné", "country": "PG"}}, {"id": "81088549-a2d4-4d43-a44a-421842edf820", "city": "Tokyo, JP", "label": "Barueri", "location": {"lat": -23.51056, "lon": -46.87611, "name": "Tamboré", "country": "BR"}}]}
\.


--
-- Data for Name: playlists; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.playlists (id, user_id, client_id, name, description, is_default, created_at, updated_at, is_active) FROM stdin;
e6c8ac99-9956-4e78-8903-e680b088ae80	e7de4b53-6895-4ae9-a60a-257ab36bb316	04496f64-d45e-4e06-af05-6ac5555c4add	teste	teste	f	2025-12-10 01:20:33.229152	\N	t
d623871a-236a-4eee-9425-6c8f4f636c15	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	8a6bcb2e-f58e-4344-97b3-a2f8c5e4c9d6	Leandro	Teste Leandro	f	2025-12-26 14:15:21.094579	\N	t
\.


--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.profiles (id, full_name, created_at, plan_id, bytes_usage, stripe_customer_id, subscription_status, current_period_end) FROM stdin;
943692cd-369b-436d-841d-691d67e95cb6	João Debussy	2025-12-31 17:27:07.350399+00	328b6137-fbc4-449d-b6ce-e969026d8643	1020054732	cus_TizGeMARWCvcBK	\N	\N
ee51c3d8-6604-4a04-b650-e1f40d2c4b19	JP Mídia	2026-07-07 10:56:53.602101+00	328b6137-fbc4-449d-b6ce-e969026d8643	0	\N	\N	\N
e7de4b53-6895-4ae9-a60a-257ab36bb316	\N	2025-12-09 21:29:31.513956+00	328b6137-fbc4-449d-b6ce-e969026d8643	0	\N	\N	\N
ed5f6dfe-a7f8-417e-b0af-fafae70ff3ea	\N	2025-12-29 18:33:24.278117+00	328b6137-fbc4-449d-b6ce-e969026d8643	0	\N	\N	\N
1188ce35-cacc-414a-abe0-e86227b79435	Yota Jota	2025-12-29 19:13:10.837702+00	328b6137-fbc4-449d-b6ce-e969026d8643	0	\N	\N	\N
e0457177-b360-45f9-a3b1-3ee5f7621243	\N	2025-12-29 19:42:34.230163+00	328b6137-fbc4-449d-b6ce-e969026d8643	0	\N	\N	\N
54210757-8cfe-4dd1-bfb6-f60f4d08c50d	\N	2025-12-29 21:09:00.760217+00	328b6137-fbc4-449d-b6ce-e969026d8643	0	\N	\N	\N
c9cfe7d0-14c4-4565-8499-9bd5a5d48bb2	\N	2025-12-12 02:19:02.325638+00	328b6137-fbc4-449d-b6ce-e969026d8643	0	\N	\N	\N
3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	2025-11-20 17:15:42.147789+00	90f9e03a-58bd-41e3-aded-d1f89daff0b0	0	\N	\N	\N
\.


--
-- Data for Name: screens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.screens (id, client_id, name, created_at, location, is_online, playlist_id, is_active, updated_at, user_id) FROM stdin;
23ad648a-4429-47b6-b37b-7621f33978da	d3f535f5-66cb-427a-be58-b1c54dfcbaa8	Pedro	2025-12-29 14:35:11.120181+00	Pedro	f	d623871a-236a-4eee-9425-6c8f4f636c15	t	2025-12-29 14:32:55.724	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c
c6128f69-8ecf-404b-a5c8-c6f73df4d765	90f89552-2268-49fb-bcb2-adb922bc5d73	Tela Teste 1	2026-01-03 15:03:51.973814+00	Localização Teste	f	\N	t	\N	943692cd-369b-436d-841d-691d67e95cb6
3af0264d-f928-44df-9433-299c42a71d76	04496f64-d45e-4e06-af05-6ac5555c4add	celular	2025-12-10 01:20:55.422435+00	celular	t	e6c8ac99-9956-4e78-8903-e680b088ae80	t	\N	e7de4b53-6895-4ae9-a60a-257ab36bb316
6bcdf07c-3902-4739-85d8-a3c6c917d0dd	8a6bcb2e-f58e-4344-97b3-a2f8c5e4c9d6	Quarto	2025-12-26 14:16:02.42151+00	Leandro	f	d623871a-236a-4eee-9425-6c8f4f636c15	t	2025-12-26 18:03:17.725631	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c
\.


--
-- Data for Name: subscriptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subscriptions (id, user_id, stripe_customer_id, stripe_subscription_id, plan, status, current_period_end, max_screens, max_storage_gb, created_at, updated_at, stripe_price_id, cancel_at_period_end, trial_end, canceled_at) FROM stdin;
e336b078-3f2b-4f64-b344-5b89008e29d7	3470309b-ffc0-4b9f-b1b6-7cf5b34d157c	\N	sub_1ScYK0CqW9fz58ns2MCALOdW	\N	active	2026-01-08 21:19:45	\N	\N	2025-12-09 21:19:50.686732	\N	\N	f	\N	\N
1fb89064-52f0-41fc-b847-d379997a97c7	e7de4b53-6895-4ae9-a60a-257ab36bb316	\N	sub_1ScYg2CqW9fz58nsaQtrmioG	\N	active	2026-01-08 21:42:32	\N	\N	2025-12-09 21:42:37.364732	\N	\N	f	\N	\N
ad8fa7ad-f0b0-4888-8d3d-9ca7c8b43970	943692cd-369b-436d-841d-691d67e95cb6	cus_TizGeMARWCvcBK	sub_1SlXISFahyW6AuqRcGKZ86Am	\N	active	\N	\N	\N	2026-01-03 16:03:23.983952	\N	price_1SkTqLFahyW6AuqRCVinagDW	f	\N	\N
\.


--
-- Name: activity_logs activity_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_pkey PRIMARY KEY (id);


--
-- Name: clients clients_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_pkey PRIMARY KEY (id);


--
-- Name: media_files media_files_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media_files
    ADD CONSTRAINT media_files_pkey PRIMARY KEY (id);


--
-- Name: new_device new_device_device_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.new_device
    ADD CONSTRAINT new_device_device_code_key UNIQUE (device_code);


--
-- Name: new_device new_device_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.new_device
    ADD CONSTRAINT new_device_pkey PRIMARY KEY (id);


--
-- Name: plans plans_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.plans
    ADD CONSTRAINT plans_name_key UNIQUE (name);


--
-- Name: plans plans_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.plans
    ADD CONSTRAINT plans_pkey PRIMARY KEY (id);


--
-- Name: playlist_items playlist_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.playlist_items
    ADD CONSTRAINT playlist_items_pkey PRIMARY KEY (id);


--
-- Name: playlists playlists_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.playlists
    ADD CONSTRAINT playlists_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: screens screens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.screens
    ADD CONSTRAINT screens_pkey PRIMARY KEY (id);


--
-- Name: subscriptions subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (id);


--
-- Name: subscriptions subscriptions_stripe_subscription_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_stripe_subscription_id_unique UNIQUE (stripe_subscription_id);


--
-- Name: idx_profiles_stripe_customer_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_profiles_stripe_customer_id ON public.profiles USING btree (stripe_customer_id);


--
-- Name: idx_subscriptions_stripe_customer_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_subscriptions_stripe_customer_id ON public.subscriptions USING btree (stripe_customer_id);


--
-- Name: idx_subscriptions_stripe_subscription_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_subscriptions_stripe_subscription_id ON public.subscriptions USING btree (stripe_subscription_id);


--
-- Name: idx_subscriptions_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_subscriptions_user_id ON public.subscriptions USING btree (user_id);


--
-- Name: media_files media_files_storage_delete; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER media_files_storage_delete AFTER DELETE ON public.media_files FOR EACH ROW EXECUTE FUNCTION public.update_storage_on_delete();


--
-- Name: media_files media_files_storage_insert; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER media_files_storage_insert AFTER INSERT ON public.media_files FOR EACH ROW EXECUTE FUNCTION public.update_storage_on_insert();


--
-- Name: media_files media_files_storage_update; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER media_files_storage_update AFTER UPDATE OF size_bytes ON public.media_files FOR EACH ROW EXECUTE FUNCTION public.update_storage_on_update();


--
-- Name: playlist_items playlist_items_after_delete; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER playlist_items_after_delete AFTER DELETE ON public.playlist_items FOR EACH ROW EXECUTE FUNCTION public.playlist_items_after_delete();


--
-- Name: playlist_items playlist_items_before_insert; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER playlist_items_before_insert BEFORE INSERT ON public.playlist_items FOR EACH ROW EXECUTE FUNCTION public.playlist_items_before_insert();


--
-- Name: playlist_items trg_playlist_items_delete; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_playlist_items_delete AFTER DELETE ON public.playlist_items FOR EACH ROW EXECUTE FUNCTION public.playlist_items_delete_trigger();


--
-- Name: playlist_items trg_playlist_items_insert; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_playlist_items_insert BEFORE INSERT ON public.playlist_items FOR EACH ROW EXECUTE FUNCTION public.playlist_items_insert_trigger();


--
-- Name: screens update_updated_at_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_updated_at_trigger BEFORE UPDATE ON public.screens FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: activity_logs activity_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: clients clients_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: media_files media_files_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media_files
    ADD CONSTRAINT media_files_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: playlist_items playlist_items_media_file_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.playlist_items
    ADD CONSTRAINT playlist_items_media_file_id_fkey FOREIGN KEY (media_file_id) REFERENCES public.media_files(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: playlist_items playlist_items_playlist_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.playlist_items
    ADD CONSTRAINT playlist_items_playlist_id_fkey FOREIGN KEY (playlist_id) REFERENCES public.playlists(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: playlists playlists_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.playlists
    ADD CONSTRAINT playlists_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: playlists playlists_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.playlists
    ADD CONSTRAINT playlists_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.plans(id);


--
-- Name: screens screens_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.screens
    ADD CONSTRAINT screens_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: screens screens_playlist_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.screens
    ADD CONSTRAINT screens_playlist_id_fkey FOREIGN KEY (playlist_id) REFERENCES public.playlists(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: screens screens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.screens
    ADD CONSTRAINT screens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: subscriptions subscriptions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: playlist_items Allow delete for playlist owner; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow delete for playlist owner" ON public.playlist_items FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.playlists
  WHERE ((playlists.id = playlist_items.playlist_id) AND (playlists.user_id = auth.uid())))));


--
-- Name: playlist_items Allow insert for playlist owner; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow insert for playlist owner" ON public.playlist_items FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM public.playlists
  WHERE ((playlists.id = playlist_items.playlist_id) AND (playlists.user_id = auth.uid())))));


--
-- Name: playlist_items Allow update for playlist owner; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow update for playlist owner" ON public.playlist_items FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.playlists
  WHERE ((playlists.id = playlist_items.playlist_id) AND (playlists.user_id = auth.uid()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.playlists
  WHERE ((playlists.id = playlist_items.playlist_id) AND (playlists.user_id = auth.uid())))));


--
-- Name: clients Clients: user can delete own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Clients: user can delete own" ON public.clients FOR DELETE USING ((user_id = auth.uid()));


--
-- Name: clients Clients: user can insert own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Clients: user can insert own" ON public.clients FOR INSERT WITH CHECK ((user_id = auth.uid()));


--
-- Name: clients Clients: user can select own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Clients: user can select own" ON public.clients FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: clients Clients: user can update own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Clients: user can update own" ON public.clients FOR UPDATE USING ((user_id = auth.uid()));


--
-- Name: profiles Enable all for service_role; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable all for service_role" ON public.profiles TO service_role USING (true) WITH CHECK (true);


--
-- Name: playlists Select Playlists para usuário ou anônimo; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Select Playlists para usuário ou anônimo" ON public.playlists FOR SELECT USING ((((auth.uid() IS NOT NULL) AND (user_id = auth.uid())) OR (auth.uid() IS NULL)));


--
-- Name: media_files Select media_files para usuário ou anônimo; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Select media_files para usuário ou anônimo" ON public.media_files FOR SELECT USING ((((auth.uid() IS NOT NULL) AND (user_id = auth.uid())) OR ((auth.uid() IS NULL) AND (id IS NOT NULL))));


--
-- Name: playlist_items Select playlist_items logado ou filtro obrigatório; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Select playlist_items logado ou filtro obrigatório" ON public.playlist_items FOR SELECT USING ((((auth.uid() IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM public.playlists
  WHERE ((playlists.id = playlist_items.playlist_id) AND (playlists.user_id = auth.uid()))))) OR ((auth.uid() IS NULL) AND (playlist_id IS NOT NULL))));


--
-- Name: profiles User can update own profile; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "User can update own profile" ON public.profiles FOR UPDATE USING ((id = auth.uid()));


--
-- Name: profiles User can view own profile; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "User can view own profile" ON public.profiles FOR SELECT USING ((id = auth.uid()));


--
-- Name: screens Users can delete their own screens; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can delete their own screens" ON public.screens FOR DELETE USING ((user_id = auth.uid()));


--
-- Name: activity_logs Users can insert own logs; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can insert own logs" ON public.activity_logs FOR INSERT TO authenticated WITH CHECK ((user_id = auth.uid()));


--
-- Name: new_device Users can read new_device; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can read new_device" ON public.new_device FOR SELECT USING ((auth.uid() IS NOT NULL));


--
-- Name: screens Users can update their own screens; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can update their own screens" ON public.screens FOR UPDATE USING ((user_id = auth.uid()));


--
-- Name: activity_logs Users can view own logs; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view own logs" ON public.activity_logs FOR SELECT TO authenticated USING ((user_id = auth.uid()));


--
-- Name: activity_logs; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: new_device allow_insert_anon; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY allow_insert_anon ON public.new_device FOR INSERT TO anon WITH CHECK (true);


--
-- Name: clients; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

--
-- Name: playlists delete own playlists; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "delete own playlists" ON public.playlists FOR DELETE TO authenticated USING ((auth.uid() = user_id));


--
-- Name: new_device device can insert code; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "device can insert code" ON public.new_device FOR INSERT TO anon WITH CHECK (true);


--
-- Name: playlists insert own playlists; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "insert own playlists" ON public.playlists FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: screens insert screens with plan limit; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "insert screens with plan limit" ON public.screens FOR INSERT TO authenticated WITH CHECK (((user_id = auth.uid()) AND (EXISTS ( SELECT 1
   FROM (public.profiles p
     JOIN public.plans pl ON ((pl.id = p.plan_id)))
  WHERE ((p.id = auth.uid()) AND ((pl.max_screens IS NULL) OR (( SELECT count(*) AS count
           FROM public.screens screens_1
          WHERE (screens_1.user_id = auth.uid())) < pl.max_screens)))))));


--
-- Name: media_files; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.media_files ENABLE ROW LEVEL SECURITY;

--
-- Name: media_files media_files_delete_proprio; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY media_files_delete_proprio ON public.media_files FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: media_files media_files_insert_storage_limit; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY media_files_insert_storage_limit ON public.media_files FOR INSERT TO authenticated WITH CHECK (public.check_storage_limit(size_bytes));


--
-- Name: media_files media_files_select_by_playlist_items; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY media_files_select_by_playlist_items ON public.media_files FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ((public.playlist_items pi
     JOIN public.playlists p ON ((p.id = pi.playlist_id)))
     JOIN public.screens s ON ((s.playlist_id = p.id)))
  WHERE ((pi.media_file_id = media_files.id) AND (s.id = (current_setting('request.jwt.claim.device_id'::text, true))::uuid) AND (s.user_id = (current_setting('request.jwt.claim.user_id'::text, true))::uuid)))));


--
-- Name: media_files media_files_update_proprio; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY media_files_update_proprio ON public.media_files FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: new_device; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.new_device ENABLE ROW LEVEL SECURITY;

--
-- Name: new_device no select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "no select" ON public.new_device FOR SELECT USING (false);


--
-- Name: plans only service role can modify plans; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "only service role can modify plans" ON public.plans USING (false) WITH CHECK (false);


--
-- Name: playlist_items; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.playlist_items ENABLE ROW LEVEL SECURITY;

--
-- Name: playlists; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: plans public can read plans; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "public can read plans" ON public.plans FOR SELECT USING (true);


--
-- Name: screens; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.screens ENABLE ROW LEVEL SECURITY;

--
-- Name: screens select screens; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "select screens" ON public.screens FOR SELECT USING (((user_id = auth.uid()) OR (auth.uid() IS NULL)));


--
-- Name: playlists update own playlists; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "update own playlists" ON public.playlists FOR UPDATE TO authenticated USING ((auth.uid() = user_id));


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT USAGE ON SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;


--
-- Name: FUNCTION check_screen_limit(p_user_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.check_screen_limit(p_user_id uuid) TO anon;
GRANT ALL ON FUNCTION public.check_screen_limit(p_user_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.check_screen_limit(p_user_id uuid) TO service_role;


--
-- Name: FUNCTION check_storage_limit(new_size bigint); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.check_storage_limit(new_size bigint) TO anon;
GRANT ALL ON FUNCTION public.check_storage_limit(new_size bigint) TO authenticated;
GRANT ALL ON FUNCTION public.check_storage_limit(new_size bigint) TO service_role;


--
-- Name: FUNCTION check_storage_limit(p_user_id uuid, p_file_size bigint); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.check_storage_limit(p_user_id uuid, p_file_size bigint) TO anon;
GRANT ALL ON FUNCTION public.check_storage_limit(p_user_id uuid, p_file_size bigint) TO authenticated;
GRANT ALL ON FUNCTION public.check_storage_limit(p_user_id uuid, p_file_size bigint) TO service_role;


--
-- Name: FUNCTION count_user_screens(p_user_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.count_user_screens(p_user_id uuid) TO anon;
GRANT ALL ON FUNCTION public.count_user_screens(p_user_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.count_user_screens(p_user_id uuid) TO service_role;


--
-- Name: FUNCTION get_my_client_ids(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_my_client_ids() TO anon;
GRANT ALL ON FUNCTION public.get_my_client_ids() TO authenticated;
GRANT ALL ON FUNCTION public.get_my_client_ids() TO service_role;


--
-- Name: FUNCTION get_user_usage(p_user_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_user_usage(p_user_id uuid) TO anon;
GRANT ALL ON FUNCTION public.get_user_usage(p_user_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.get_user_usage(p_user_id uuid) TO service_role;


--
-- Name: FUNCTION handle_new_user(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.handle_new_user() TO anon;
GRANT ALL ON FUNCTION public.handle_new_user() TO authenticated;
GRANT ALL ON FUNCTION public.handle_new_user() TO service_role;


--
-- Name: FUNCTION jwt_sign(payload jsonb, key text, alg text, exp bigint); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.jwt_sign(payload jsonb, key text, alg text, exp bigint) TO anon;
GRANT ALL ON FUNCTION public.jwt_sign(payload jsonb, key text, alg text, exp bigint) TO authenticated;
GRANT ALL ON FUNCTION public.jwt_sign(payload jsonb, key text, alg text, exp bigint) TO service_role;


--
-- Name: FUNCTION move_playlist_item_down(p_item_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.move_playlist_item_down(p_item_id uuid) TO anon;
GRANT ALL ON FUNCTION public.move_playlist_item_down(p_item_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.move_playlist_item_down(p_item_id uuid) TO service_role;


--
-- Name: FUNCTION move_playlist_item_up(p_item_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.move_playlist_item_up(p_item_id uuid) TO anon;
GRANT ALL ON FUNCTION public.move_playlist_item_up(p_item_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.move_playlist_item_up(p_item_id uuid) TO service_role;


--
-- Name: FUNCTION playlist_items_after_delete(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.playlist_items_after_delete() TO anon;
GRANT ALL ON FUNCTION public.playlist_items_after_delete() TO authenticated;
GRANT ALL ON FUNCTION public.playlist_items_after_delete() TO service_role;


--
-- Name: FUNCTION playlist_items_before_insert(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.playlist_items_before_insert() TO anon;
GRANT ALL ON FUNCTION public.playlist_items_before_insert() TO authenticated;
GRANT ALL ON FUNCTION public.playlist_items_before_insert() TO service_role;


--
-- Name: FUNCTION playlist_items_delete_trigger(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.playlist_items_delete_trigger() TO anon;
GRANT ALL ON FUNCTION public.playlist_items_delete_trigger() TO authenticated;
GRANT ALL ON FUNCTION public.playlist_items_delete_trigger() TO service_role;


--
-- Name: FUNCTION playlist_items_insert_trigger(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.playlist_items_insert_trigger() TO anon;
GRANT ALL ON FUNCTION public.playlist_items_insert_trigger() TO authenticated;
GRANT ALL ON FUNCTION public.playlist_items_insert_trigger() TO service_role;


--
-- Name: FUNCTION reorder_playlist_items(p_playlist_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.reorder_playlist_items(p_playlist_id uuid) TO anon;
GRANT ALL ON FUNCTION public.reorder_playlist_items(p_playlist_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.reorder_playlist_items(p_playlist_id uuid) TO service_role;


--
-- Name: FUNCTION update_storage_on_delete(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.update_storage_on_delete() TO anon;
GRANT ALL ON FUNCTION public.update_storage_on_delete() TO authenticated;
GRANT ALL ON FUNCTION public.update_storage_on_delete() TO service_role;


--
-- Name: FUNCTION update_storage_on_insert(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.update_storage_on_insert() TO anon;
GRANT ALL ON FUNCTION public.update_storage_on_insert() TO authenticated;
GRANT ALL ON FUNCTION public.update_storage_on_insert() TO service_role;


--
-- Name: FUNCTION update_storage_on_update(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.update_storage_on_update() TO anon;
GRANT ALL ON FUNCTION public.update_storage_on_update() TO authenticated;
GRANT ALL ON FUNCTION public.update_storage_on_update() TO service_role;


--
-- Name: FUNCTION update_updated_at_column(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.update_updated_at_column() TO anon;
GRANT ALL ON FUNCTION public.update_updated_at_column() TO authenticated;
GRANT ALL ON FUNCTION public.update_updated_at_column() TO service_role;


--
-- Name: TABLE activity_logs; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.activity_logs TO anon;
GRANT ALL ON TABLE public.activity_logs TO authenticated;
GRANT ALL ON TABLE public.activity_logs TO service_role;


--
-- Name: TABLE clients; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.clients TO anon;
GRANT ALL ON TABLE public.clients TO authenticated;
GRANT ALL ON TABLE public.clients TO service_role;


--
-- Name: TABLE media_files; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.media_files TO anon;
GRANT ALL ON TABLE public.media_files TO authenticated;
GRANT ALL ON TABLE public.media_files TO service_role;


--
-- Name: TABLE new_device; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.new_device TO anon;
GRANT ALL ON TABLE public.new_device TO authenticated;
GRANT ALL ON TABLE public.new_device TO service_role;


--
-- Name: TABLE plans; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.plans TO anon;
GRANT ALL ON TABLE public.plans TO authenticated;
GRANT ALL ON TABLE public.plans TO service_role;


--
-- Name: TABLE playlist_items; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.playlist_items TO anon;
GRANT ALL ON TABLE public.playlist_items TO authenticated;
GRANT ALL ON TABLE public.playlist_items TO service_role;


--
-- Name: TABLE playlists; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.playlists TO anon;
GRANT ALL ON TABLE public.playlists TO authenticated;
GRANT ALL ON TABLE public.playlists TO service_role;


--
-- Name: TABLE profiles; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.profiles TO anon;
GRANT ALL ON TABLE public.profiles TO authenticated;
GRANT ALL ON TABLE public.profiles TO service_role;


--
-- Name: TABLE screens; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.screens TO anon;
GRANT ALL ON TABLE public.screens TO authenticated;
GRANT ALL ON TABLE public.screens TO service_role;


--
-- Name: TABLE storage_usage; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.storage_usage TO anon;
GRANT ALL ON TABLE public.storage_usage TO authenticated;
GRANT ALL ON TABLE public.storage_usage TO service_role;


--
-- Name: TABLE subscriptions; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.subscriptions TO anon;
GRANT ALL ON TABLE public.subscriptions TO authenticated;
GRANT ALL ON TABLE public.subscriptions TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- PostgreSQL database dump complete
--

\unrestrict VMbsgwBCmCfK5ZUJkpCuhabJLZIKRDWzSZevTxgZRM0Pk0ee9o79EOdCySnSi0w

