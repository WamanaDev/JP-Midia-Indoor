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

CREATE SCHEMA IF NOT EXISTS public;


ALTER SCHEMA public OWNER TO pg_database_owner;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: pg_database_owner
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- Name: type_playlist_item; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE IF NOT EXISTS public.type_playlist_item AS ENUM (
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

CREATE OR REPLACE FUNCTION public.check_screen_limit(p_user_id uuid) RETURNS boolean
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

CREATE OR REPLACE FUNCTION public.check_storage_limit(new_size bigint) RETURNS boolean
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

CREATE OR REPLACE FUNCTION public.check_storage_limit(p_user_id uuid, p_file_size bigint) RETURNS boolean
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

CREATE OR REPLACE FUNCTION public.count_user_screens(p_user_id uuid) RETURNS integer
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

CREATE OR REPLACE FUNCTION public.get_my_client_ids() RETURNS SETOF uuid
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

CREATE OR REPLACE FUNCTION public.get_user_usage(p_user_id uuid) RETURNS json
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

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger
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

CREATE OR REPLACE FUNCTION public.jwt_sign(payload jsonb, key text, alg text, exp bigint) RETURNS text
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

CREATE OR REPLACE FUNCTION public.move_playlist_item_down(p_item_id uuid) RETURNS void
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

CREATE OR REPLACE FUNCTION public.move_playlist_item_up(p_item_id uuid) RETURNS void
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

CREATE OR REPLACE FUNCTION public.playlist_items_after_delete() RETURNS trigger
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

CREATE OR REPLACE FUNCTION public.playlist_items_before_insert() RETURNS trigger
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

CREATE OR REPLACE FUNCTION public.playlist_items_delete_trigger() RETURNS trigger
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

CREATE OR REPLACE FUNCTION public.playlist_items_insert_trigger() RETURNS trigger
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

CREATE OR REPLACE FUNCTION public.reorder_playlist_items(p_playlist_id uuid) RETURNS void
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

CREATE OR REPLACE FUNCTION public.update_storage_on_delete() RETURNS trigger
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

CREATE OR REPLACE FUNCTION public.update_storage_on_insert() RETURNS trigger
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

CREATE OR REPLACE FUNCTION public.update_storage_on_update() RETURNS trigger
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

CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS trigger
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

CREATE TABLE IF NOT EXISTS public.activity_logs (
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

CREATE TABLE IF NOT EXISTS public.clients (
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

CREATE TABLE IF NOT EXISTS public.media_files (
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

CREATE TABLE IF NOT EXISTS public.new_device (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    device_code character varying(6) NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.new_device OWNER TO postgres;

--
-- Name: plans; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS public.plans (
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

CREATE TABLE IF NOT EXISTS public.playlist_items (
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

CREATE TABLE IF NOT EXISTS public.playlists (
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

CREATE TABLE IF NOT EXISTS public.profiles (
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

CREATE TABLE IF NOT EXISTS public.screens (
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

CREATE OR REPLACE VIEW public.storage_usage WITH (security_invoker='true') AS
 SELECT user_id,
    COALESCE(sum(size_bytes), (0)::numeric) AS total_bytes
   FROM public.media_files
  GROUP BY user_id;


ALTER VIEW public.storage_usage OWNER TO postgres;

--
-- Name: subscriptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS public.subscriptions (
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

