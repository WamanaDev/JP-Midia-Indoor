--
-- Name: emergency_alerts; Type: TABLE; Schema: public
--
-- Alerta de emergência: mensagem que a tela (app RN) deve mostrar em tela
-- cheia, por cima de qualquer conteúdo, até ser encerrada ou expirar.
--
-- Uma linha = um alerta endereçado a UMA tela. Quando o dashboard dispara um
-- alerta pra várias telas de uma vez, insere uma linha por tela, todas
-- compartilhando o mesmo `batch_id` — assim "encerrar" atualiza todas de uma
-- vez, e cada dispositivo recebe só o payload que já precisa (sem precisar
-- fazer join na hora de reagir ao evento de realtime).
--

CREATE TABLE public.emergency_alerts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    batch_id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid DEFAULT auth.uid() NOT NULL,
    screen_id uuid NOT NULL,
    message text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    dismissed_at timestamp with time zone
);

ALTER TABLE ONLY public.emergency_alerts
    ADD CONSTRAINT emergency_alerts_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.emergency_alerts
    ADD CONSTRAINT emergency_alerts_screen_id_fkey FOREIGN KEY (screen_id) REFERENCES public.screens(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.emergency_alerts
    ADD CONSTRAINT emergency_alerts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX emergency_alerts_screen_id_idx ON public.emergency_alerts USING btree (screen_id);
CREATE INDEX emergency_alerts_batch_id_idx ON public.emergency_alerts USING btree (batch_id);

-- Índice pra achar rápido "alertas ativos de uma tela" (dismissed_at nulo).
CREATE INDEX emergency_alerts_active_idx ON public.emergency_alerts USING btree (screen_id, expires_at) WHERE (dismissed_at IS NULL);

--
-- Row level security
--

ALTER TABLE public.emergency_alerts ENABLE ROW LEVEL SECURITY;

-- Dashboard (usuário logado, sessão normal do Supabase Auth): gerencia só
-- os próprios alertas — mesmo padrão de "screens".
CREATE POLICY "Users can view their own alerts" ON public.emergency_alerts FOR SELECT USING ((user_id = auth.uid()));
CREATE POLICY "Users can insert their own alerts" ON public.emergency_alerts FOR INSERT TO authenticated WITH CHECK ((user_id = auth.uid()));
CREATE POLICY "Users can update their own alerts" ON public.emergency_alerts FOR UPDATE USING ((user_id = auth.uid()));
CREATE POLICY "Users can delete their own alerts" ON public.emergency_alerts FOR DELETE USING ((user_id = auth.uid()));

-- Dispositivo (app RN autenticado com o JWT de tela, claims device_id/user_id
-- — ver supabase/functions/generate-device-jwt): só lê os alertas endereçados
-- à própria tela. Mesmo padrão usado em
-- "media_files_select_by_playlist_items" pra media_files.
CREATE POLICY "Devices can view their own screen alerts" ON public.emergency_alerts FOR SELECT USING (((screen_id = (current_setting('request.jwt.claim.device_id'::text, true))::uuid) AND (user_id = (current_setting('request.jwt.claim.user_id'::text, true))::uuid)));

--
-- Realtime: a tela escuta INSERT/UPDATE nesta tabela pra saber quando
-- mostrar/encerrar um alerta (mesmo mecanismo já usado por "screens").
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.emergency_alerts;
