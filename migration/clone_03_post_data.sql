--
-- Bloco extraido de clone_completo.sql (schema public + cron.job)
-- Gerado para restaurar em um projeto Supabase novo/vazio.
--

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: activity_logs activity_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_pkey PRIMARY KEY (id);


--
-- Name: clients clients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_pkey PRIMARY KEY (id);


--
-- Name: media_files media_files_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.media_files
    ADD CONSTRAINT media_files_pkey PRIMARY KEY (id);


--
-- Name: new_device new_device_device_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.new_device
    ADD CONSTRAINT new_device_device_code_key UNIQUE (device_code);


--
-- Name: new_device new_device_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.new_device
    ADD CONSTRAINT new_device_pkey PRIMARY KEY (id);


--
-- Name: plans plans_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plans
    ADD CONSTRAINT plans_name_key UNIQUE (name);


--
-- Name: plans plans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plans
    ADD CONSTRAINT plans_pkey PRIMARY KEY (id);


--
-- Name: playlist_items playlist_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.playlist_items
    ADD CONSTRAINT playlist_items_pkey PRIMARY KEY (id);


--
-- Name: playlists playlists_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.playlists
    ADD CONSTRAINT playlists_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: screens screens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.screens
    ADD CONSTRAINT screens_pkey PRIMARY KEY (id);


--
-- Name: subscriptions subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (id);


--
-- Name: subscriptions subscriptions_stripe_subscription_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_stripe_subscription_id_unique UNIQUE (stripe_subscription_id);


--
-- Name: idx_profiles_stripe_customer_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_profiles_stripe_customer_id ON public.profiles USING btree (stripe_customer_id);


--
-- Name: idx_subscriptions_stripe_customer_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_subscriptions_stripe_customer_id ON public.subscriptions USING btree (stripe_customer_id);


--
-- Name: idx_subscriptions_stripe_subscription_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_subscriptions_stripe_subscription_id ON public.subscriptions USING btree (stripe_subscription_id);


--
-- Name: idx_subscriptions_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_subscriptions_user_id ON public.subscriptions USING btree (user_id);


--
-- Name: media_files media_files_storage_delete; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER media_files_storage_delete AFTER DELETE ON public.media_files FOR EACH ROW EXECUTE FUNCTION public.update_storage_on_delete();


--
-- Name: media_files media_files_storage_insert; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER media_files_storage_insert AFTER INSERT ON public.media_files FOR EACH ROW EXECUTE FUNCTION public.update_storage_on_insert();


--
-- Name: media_files media_files_storage_update; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER media_files_storage_update AFTER UPDATE OF size_bytes ON public.media_files FOR EACH ROW EXECUTE FUNCTION public.update_storage_on_update();


--
-- Name: playlist_items playlist_items_after_delete; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER playlist_items_after_delete AFTER DELETE ON public.playlist_items FOR EACH ROW EXECUTE FUNCTION public.playlist_items_after_delete();


--
-- Name: playlist_items playlist_items_before_insert; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER playlist_items_before_insert BEFORE INSERT ON public.playlist_items FOR EACH ROW EXECUTE FUNCTION public.playlist_items_before_insert();


--
-- Name: playlist_items trg_playlist_items_delete; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_playlist_items_delete AFTER DELETE ON public.playlist_items FOR EACH ROW EXECUTE FUNCTION public.playlist_items_delete_trigger();


--
-- Name: playlist_items trg_playlist_items_insert; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_playlist_items_insert BEFORE INSERT ON public.playlist_items FOR EACH ROW EXECUTE FUNCTION public.playlist_items_insert_trigger();


--
-- Name: screens update_updated_at_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_updated_at_trigger BEFORE UPDATE ON public.screens FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: activity_logs activity_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) NOT VALID;

--
-- Name: clients clients_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE NOT VALID;

--
-- Name: media_files media_files_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.media_files
    ADD CONSTRAINT media_files_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL NOT VALID;

--
-- Name: playlist_items playlist_items_media_file_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.playlist_items
    ADD CONSTRAINT playlist_items_media_file_id_fkey FOREIGN KEY (media_file_id) REFERENCES public.media_files(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: playlist_items playlist_items_playlist_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.playlist_items
    ADD CONSTRAINT playlist_items_playlist_id_fkey FOREIGN KEY (playlist_id) REFERENCES public.playlists(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: playlists playlists_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.playlists
    ADD CONSTRAINT playlists_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: playlists playlists_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.playlists
    ADD CONSTRAINT playlists_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE NOT VALID;

--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE NOT VALID;

--
-- Name: profiles profiles_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.plans(id);


--
-- Name: screens screens_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.screens
    ADD CONSTRAINT screens_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: screens screens_playlist_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.screens
    ADD CONSTRAINT screens_playlist_id_fkey FOREIGN KEY (playlist_id) REFERENCES public.playlists(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: screens screens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.screens
    ADD CONSTRAINT screens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) NOT VALID;

--
-- Name: subscriptions subscriptions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE NOT VALID;

--
-- Name: playlist_items Allow delete for playlist owner; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow delete for playlist owner" ON public.playlist_items FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.playlists
  WHERE ((playlists.id = playlist_items.playlist_id) AND (playlists.user_id = auth.uid())))));


--
-- Name: playlist_items Allow insert for playlist owner; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow insert for playlist owner" ON public.playlist_items FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM public.playlists
  WHERE ((playlists.id = playlist_items.playlist_id) AND (playlists.user_id = auth.uid())))));


--
-- Name: playlist_items Allow update for playlist owner; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow update for playlist owner" ON public.playlist_items FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.playlists
  WHERE ((playlists.id = playlist_items.playlist_id) AND (playlists.user_id = auth.uid()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.playlists
  WHERE ((playlists.id = playlist_items.playlist_id) AND (playlists.user_id = auth.uid())))));


--
-- Name: clients Clients: user can delete own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Clients: user can delete own" ON public.clients FOR DELETE USING ((user_id = auth.uid()));


--
-- Name: clients Clients: user can insert own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Clients: user can insert own" ON public.clients FOR INSERT WITH CHECK ((user_id = auth.uid()));


--
-- Name: clients Clients: user can select own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Clients: user can select own" ON public.clients FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: clients Clients: user can update own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Clients: user can update own" ON public.clients FOR UPDATE USING ((user_id = auth.uid()));


--
-- Name: profiles Enable all for service_role; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable all for service_role" ON public.profiles TO service_role USING (true) WITH CHECK (true);


--
-- Name: playlists Select Playlists para usuário ou anônimo; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Select Playlists para usuário ou anônimo" ON public.playlists FOR SELECT USING ((((auth.uid() IS NOT NULL) AND (user_id = auth.uid())) OR (auth.uid() IS NULL)));


--
-- Name: media_files Select media_files para usuário ou anônimo; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Select media_files para usuário ou anônimo" ON public.media_files FOR SELECT USING ((((auth.uid() IS NOT NULL) AND (user_id = auth.uid())) OR ((auth.uid() IS NULL) AND (id IS NOT NULL))));


--
-- Name: playlist_items Select playlist_items logado ou filtro obrigatório; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Select playlist_items logado ou filtro obrigatório" ON public.playlist_items FOR SELECT USING ((((auth.uid() IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM public.playlists
  WHERE ((playlists.id = playlist_items.playlist_id) AND (playlists.user_id = auth.uid()))))) OR ((auth.uid() IS NULL) AND (playlist_id IS NOT NULL))));


--
-- Name: profiles User can update own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "User can update own profile" ON public.profiles FOR UPDATE USING ((id = auth.uid()));


--
-- Name: profiles User can view own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "User can view own profile" ON public.profiles FOR SELECT USING ((id = auth.uid()));


--
-- Name: screens Users can delete their own screens; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own screens" ON public.screens FOR DELETE USING ((user_id = auth.uid()));


--
-- Name: activity_logs Users can insert own logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own logs" ON public.activity_logs FOR INSERT TO authenticated WITH CHECK ((user_id = auth.uid()));


--
-- Name: new_device Users can read new_device; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can read new_device" ON public.new_device FOR SELECT USING ((auth.uid() IS NOT NULL));


--
-- Name: screens Users can update their own screens; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own screens" ON public.screens FOR UPDATE USING ((user_id = auth.uid()));


--
-- Name: activity_logs Users can view own logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own logs" ON public.activity_logs FOR SELECT TO authenticated USING ((user_id = auth.uid()));


--
-- Name: activity_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: new_device allow_insert_anon; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY allow_insert_anon ON public.new_device FOR INSERT TO anon WITH CHECK (true);


--
-- Name: clients; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

--
-- Name: playlists delete own playlists; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "delete own playlists" ON public.playlists FOR DELETE TO authenticated USING ((auth.uid() = user_id));


--
-- Name: new_device device can insert code; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "device can insert code" ON public.new_device FOR INSERT TO anon WITH CHECK (true);


--
-- Name: playlists insert own playlists; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "insert own playlists" ON public.playlists FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: screens insert screens with plan limit; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "insert screens with plan limit" ON public.screens FOR INSERT TO authenticated WITH CHECK (((user_id = auth.uid()) AND (EXISTS ( SELECT 1
   FROM (public.profiles p
     JOIN public.plans pl ON ((pl.id = p.plan_id)))
  WHERE ((p.id = auth.uid()) AND ((pl.max_screens IS NULL) OR (( SELECT count(*) AS count
           FROM public.screens screens_1
          WHERE (screens_1.user_id = auth.uid())) < pl.max_screens)))))));


--
-- Name: media_files; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.media_files ENABLE ROW LEVEL SECURITY;

--
-- Name: media_files media_files_delete_proprio; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY media_files_delete_proprio ON public.media_files FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: media_files media_files_insert_storage_limit; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY media_files_insert_storage_limit ON public.media_files FOR INSERT TO authenticated WITH CHECK (public.check_storage_limit(size_bytes));


--
-- Name: media_files media_files_select_by_playlist_items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY media_files_select_by_playlist_items ON public.media_files FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ((public.playlist_items pi
     JOIN public.playlists p ON ((p.id = pi.playlist_id)))
     JOIN public.screens s ON ((s.playlist_id = p.id)))
  WHERE ((pi.media_file_id = media_files.id) AND (s.id = (current_setting('request.jwt.claim.device_id'::text, true))::uuid) AND (s.user_id = (current_setting('request.jwt.claim.user_id'::text, true))::uuid)))));


--
-- Name: media_files media_files_update_proprio; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY media_files_update_proprio ON public.media_files FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: new_device; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.new_device ENABLE ROW LEVEL SECURITY;

--
-- Name: new_device no select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "no select" ON public.new_device FOR SELECT USING (false);


--
-- Name: plans only service role can modify plans; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "only service role can modify plans" ON public.plans USING (false) WITH CHECK (false);


--
-- Name: playlist_items; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.playlist_items ENABLE ROW LEVEL SECURITY;

--
-- Name: playlists; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: plans public can read plans; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "public can read plans" ON public.plans FOR SELECT USING (true);


--
-- Name: screens; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.screens ENABLE ROW LEVEL SECURITY;

--
-- Name: screens select screens; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "select screens" ON public.screens FOR SELECT USING (((user_id = auth.uid()) OR (auth.uid() IS NULL)));


--
-- Name: playlists update own playlists; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "update own playlists" ON public.playlists FOR UPDATE TO authenticated USING ((auth.uid() = user_id));


--
-- Name: subscriptions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

--
-- Name: subscriptions Users can view own subscription; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own subscription" ON public.subscriptions FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: subscriptions Users can update own subscription; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own subscription" ON public.subscriptions FOR UPDATE USING ((user_id = auth.uid()));


--
-- Name: supabase_realtime media_files; Type: PUBLICATION TABLE; Schema: public; Owner: -
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.media_files;


--
-- Name: supabase_realtime new_device; Type: PUBLICATION TABLE; Schema: public; Owner: -
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.new_device;


--
-- Name: supabase_realtime playlist_items; Type: PUBLICATION TABLE; Schema: public; Owner: -
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.playlist_items;


--
-- Name: supabase_realtime playlists; Type: PUBLICATION TABLE; Schema: public; Owner: -
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.playlists;


--
-- Name: supabase_realtime screens; Type: PUBLICATION TABLE; Schema: public; Owner: -
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.screens;


