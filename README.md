# 📺 JP Mídia Indoor — Dashboard Administrativo

Sistema **Full Stack** de gerenciamento e exibição de conteúdo para **Digital Signage** (mídia indoor em TVs comerciais, monitores e displays).

> Projeto idealizado e desenvolvido sozinho, do zero ao deploy em produção. Nasceu como produto de uma empresa própria que não avançou comercialmente — hoje é meu principal case técnico Full Stack.

---

## 🎯 Problema que resolve

Negócios com múltiplas telas de propaganda (lojas, restaurantes, clínicas) precisam gerenciar conteúdo de forma centralizada, sem depender de atualização manual tela por tela.

- ✅ Upload e organização de mídias (imagens/vídeos) em um painel único
- ✅ Atualização automática e instantânea em todas as telas conectadas
- ✅ Controle de acesso por autenticação
- ✅ Armazenamento de arquivos escalável e de baixo custo

---

## 🏗️ Arquitetura

```
Frontend (Next.js + React + TypeScript)
  └─ Dashboard administrativo, upload de mídias, autenticação JWT

API (NestJS)
  └─ Regras de negócio, endpoints REST, integração com banco e storage

Banco de Dados (PostgreSQL via Supabase)
  └─ Usuários, mídias, playlists e dispositivos
  └─ Supabase Realtime: listeners que notificam mudanças instantaneamente

Storage (Cloudflare R2)
  └─ Armazenamento de imagens e vídeos

Players (Android TV, Web)
  └─ Escutam mudanças via Supabase Realtime e atualizam a exibição sem polling
```

---

## 🔄 Sincronização em tempo real (Supabase Realtime)

Ao invés de implementar um servidor WebSocket próprio, o projeto usa o **Supabase Realtime**, que expõe os eventos de mudança do PostgreSQL diretamente para os clientes:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// Player escuta mudanças na tabela de mídias do seu dispositivo
supabase
  .channel('public:medias')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'medias', filter: `device_id=eq.${deviceId}` },
    (payload) => updatePlaylist(payload.new)
  )
  .subscribe()
```

**Fluxo:** Admin atualiza mídia → API salva no Postgres → Supabase Realtime detecta a mudança → todos os players conectados recebem a atualização e trocam o conteúdo, sem refresh manual.

**Por que essa escolha:** menos infraestrutura para manter, escalabilidade gerenciada pelo Supabase, e foco no que importa — a lógica de negócio — em vez de reimplementar um servidor de WebSockets do zero.

---

## ✨ Funcionalidades

- 🔐 Autenticação JWT e controle de acesso
- 📤 Upload de imagens e vídeos, organizados em playlists
- 🖥️ Cadastro e gerenciamento de dispositivos/telas
- ⚡ Sincronização em tempo real (Supabase Realtime)
- 📱 Interface responsiva para uso em desktop e tablet

---

## 🛠️ Tecnologias

**Frontend:** Next.js, React, TypeScript, Tailwind CSS
**Backend:** NestJS, Node.js, APIs REST, JWT
**Dados:** PostgreSQL, Supabase (Database + Realtime)
**Infra:** Vercel (deploy), Cloudflare R2 (storage)

---

## 🚀 Como executar localmente

### Pré-requisitos
```
Node.js 18+
npm ou yarn
Conta Supabase (banco + realtime)
```

### Passos
```bash
git clone https://github.com/WamanaDev/JP-Midia-Indoor.git
cd JP-Midia-Indoor
npm install
```

Crie um `.env.local`:
```env
DATABASE_URL="sua-connection-string-supabase"
JWT_SECRET="sua-chave-secreta"
NEXT_PUBLIC_SUPABASE_URL="sua-url-supabase"
NEXT_PUBLIC_SUPABASE_ANON_KEY="sua-anon-key"
R2_ACCOUNT_ID="..."
R2_ACCESS_KEY="..."
R2_SECRET_KEY="..."
R2_BUCKET_NAME="..."
```

```bash
npm run dev
```

Acesse: **http://localhost:3000**

---

## 🌐 Projetos relacionados

| Link | Descrição |
| --- | --- |
| 🌐 [Demo ao vivo](https://jpdash20.vercel.app/) | Dashboard em produção |
| 📱 [Player Android TV](https://github.com/WamanaDev/Midia-Indoor-APP) | App que exibe as mídias sincronizadas |

---

## 👨‍💻 Autor

**Wictor Pamplona** — Desenvolvedor Full Stack Júnior (Node.js/React)

- GitHub: [github.com/WamanaDev](https://github.com/WamanaDev)
- LinkedIn: [linkedin.com/in/wictor-pamplona](https://www.linkedin.com/in/wictor-pamplona)
- E-mail: wictorpamp@gmail.com
- 
