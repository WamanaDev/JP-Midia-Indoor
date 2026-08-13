# Alerta de Emergência — Integração com o app player (RN/Expo)

> Documento de referência pra atualizar o app RN/Expo que roda nas telas físicas.
> Lado dashboard (web) já implementado neste repo: `app/dashboard/alerts/`, `components/dashboard/alerts/`.
> Gerado em 2026-08-12.

---

## 1. O que é

O usuário do dashboard escreve uma mensagem, escolhe pra quais telas ela vai e por quanto tempo fica visível. A tela física precisa mostrar essa mensagem **em tela cheia, por cima de qualquer conteúdo que estiver tocando** (imagem, vídeo, PDF, notícia, etc.), até o tempo acabar ou alguém encerrar manualmente pelo dashboard.

Isso é entregue via **Supabase Realtime** — o mesmo mecanismo que o app já usa hoje pra outras coisas (ex: `screens`). Não tem endpoint HTTP novo pra chamar; é escutar mudanças numa tabela.

---

## 2. Tabela `emergency_alerts`

```sql
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
```

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | uuid | id da linha (uma linha = um alerta endereçado a uma tela). |
| `batch_id` | uuid | Quando o mesmo alerta vai pra várias telas de uma vez, todas as linhas compartilham esse id. Não precisa disso no app — é só pra o dashboard conseguir "encerrar todas de uma vez". |
| `user_id` | uuid | Dono da conta. Confere com o claim `user_id` do JWT do dispositivo. |
| `screen_id` | uuid | Pra qual tela esse alerta é. Confere com o claim `device_id` do JWT do dispositivo (é o mesmo id que já vem em `screens.id`). |
| `message` | text | O texto a mostrar. |
| `created_at` | timestamptz | Quando foi criado. |
| `expires_at` | timestamptz | Quando o alerta deve sumir sozinho. |
| `dismissed_at` | timestamptz \| null | Preenchido quando alguém encerra manualmente pelo dashboard antes do tempo. **Enquanto `null`, o alerta está ativo** (respeitando `expires_at`). |

Um alerta está **ativo** quando: `dismissed_at IS NULL AND expires_at > now()`.

---

## 3. RLS (já configurado, só documentando)

O dispositivo só enxerga (`SELECT`) as linhas onde `screen_id` bate com o claim `device_id` do próprio JWT, e `user_id` bate com o claim `user_id` — exatamente o mesmo padrão que já protege a leitura de `media_files` hoje. Não precisa de nenhuma mudança de autenticação no app: é o mesmo client Supabase, com o mesmo JWT de dispositivo que ele já usa.

---

## 4. O que o app precisa fazer

### 4.1 Ao iniciar / reconectar (fetch inicial)

Antes de confiar só em eventos futuros de realtime, busque se já existe um alerta ativo pra essa tela — cobre o caso de o alerta ter sido enviado enquanto o app estava fechado/offline:

```ts
const { data } = await supabase
  .from("emergency_alerts")
  .select("*")
  .eq("screen_id", MY_SCREEN_ID)
  .is("dismissed_at", null)
  .gt("expires_at", new Date().toISOString())
  .order("created_at", { ascending: false })
  .limit(1)
  .maybeSingle();

if (data) showAlert(data);
```

### 4.2 Assinar mudanças em tempo real

```ts
const channel = supabase
  .channel("emergency-alerts")
  .on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "emergency_alerts",
      filter: `screen_id=eq.${MY_SCREEN_ID}`,
    },
    (payload) => {
      // novo alerta pra essa tela — mostrar na hora
      showAlert(payload.new);
    }
  )
  .on(
    "postgres_changes",
    {
      event: "UPDATE",
      schema: "public",
      table: "emergency_alerts",
      filter: `screen_id=eq.${MY_SCREEN_ID}`,
    },
    (payload) => {
      // encerrado manualmente pelo dashboard antes do tempo
      if (payload.new.dismissed_at) {
        hideAlertIfMatches(payload.new.id);
      }
    }
  )
  .subscribe();
```

Se já existe um canal/subscription equivalente pra `screens`, dá pra registrar esse `.on(...)` extra no mesmo canal em vez de abrir um novo — não precisa ser um `channel()` isolado.

### 4.3 Mostrar o alerta

- Cobre a tela inteira, por cima de **tudo** (imagem, vídeo, PDF, overlays de clima/relógio/notícia) — inclusive pausando vídeo se estiver tocando, já que a mensagem precisa ser lida sem concorrência visual.
- Sugestão de estilo (pra ficar consistente com o resto do player): fundo vermelho/alto contraste, ícone de alerta, texto grande e centralizado. Não precisa ser bonito — precisa ser **impossível de não ver**.
- Guarde um timer local baseado em `expires_at` pra esconder sozinho quando o tempo acabar (não dependa só do evento de `UPDATE` chegar, porque se a rede cair no fim da janela o app não vai saber que expirou).

### 4.4 Esconder o alerta

Duas formas, as duas precisam estar cobertas:
1. **Timer local bateu `expires_at`.**
2. **Evento `UPDATE` chegou com `dismissed_at` preenchido** (encerrado manual pelo dashboard, antes do tempo).

### 4.5 Múltiplos alertas ao mesmo tempo

Não deveria acontecer no uso normal, mas se por algum motivo houver mais de um alerta ativo pra mesma tela, mostre o de `created_at` mais recente. Não precisa de fila/histórico.

---

## 5. Coisas que o app **não** precisa fazer

- Não precisa confirmar leitura/entrega de volta pro banco — é fire-and-forget, o dashboard só sabe que a linha foi inserida, não se a tela realmente mostrou.
- Não precisa paginar nem escutar alertas de outras telas — o filtro `screen_id=eq.<própria tela>` já cuida disso, e a RLS bloqueia ver o resto mesmo se tentasse.
- Não precisa lidar com `DELETE` — o dashboard nunca apaga linha, só marca `dismissed_at`.
