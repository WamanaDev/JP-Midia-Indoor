# Player de Mídia Indoor — Especificação de conteúdo, estilos e overlays

> Documento de referência para reimplementar o player (web, Next.js) em **React Native / Expo**.
> Fonte da verdade: `components/preview/PlayerCore.tsx` e os componentes citados abaixo, no repo `JP-Midia-Indoor`.
> Gerado em 2026-08-11.

---

## 1. Conceitos gerais

Uma **playlist** tem uma lista ordenada de **itens** (`playlist_items`). Cada item tem um `type`, uma posição de ordenação (`order_index`), uma duração opcional (`duration_override`, em segundos) e um `config` (JSON livre, formato depende do `type`).

Existem dois grupos de item, definidos por `config.overlay`:

- **Rotativos (slides)** — ocupam a tela inteira, um de cada vez, avançando em sequência (como um carrossel). É o conteúdo "principal".
- **Overlays** — renderizam por cima dos slides, continuamente, em um dos 4 cantos da tela (ou fixo embaixo, no caso de notícias). Não entram na sequência de rotação.

Um mesmo `type` pode ser rotativo OU overlay dependendo de `config.overlay`:
- `type: "news"`, `"temperature"` (clima) e `"hours"` (relógio) podem ser overlay (`config.overlay: true`) ou tela cheia (`config.overlay: false`).
- `type: "image"`, `"video"`, `"document"` são **sempre** rotativos (tela cheia).

### 1.1 Ordem de empilhamento (z-order)

Do fundo para a frente:
1. Slide ativo (tela cheia)
2. Overlay de notícias (se houver)
3. Overlay de temperatura (se houver)
4. Overlay de horas (se houver)

Múltiplos overlays do mesmo tipo podem coexistir (ex: 2 relógios em cantos diferentes) — cada `playlist_item` overlay gera sua própria instância na tela.

**Nota de portabilidade:** na versão web, os overlays usam `position: absolute` dentro do container do player (nunca `fixed` — isso escaparia do container e brigaria com a UI do app em volta). No RN, o equivalente é posicionar as views de overlay como filhas absolutas do container de tela cheia do player, por cima do slide atual.

### 1.2 Transição entre slides

- Fade cruzado: fade-out do slide atual (~400ms) → troca de item → fade-in (~400ms).
- O tempo configurado (`duration_override`, padrão **8s** se não definido) já desconta esses 400ms de fade-out, para o tempo total "na tela" bater com o configurado.
- `type: "video"` ignora `duration_override` — avança sozinho quando o vídeo termina (evento `onEnded`).
- `type: "document"` (PDF) pagina **dentro do próprio item** a cada `duration_override` segundos (fallback 8s) sem fazer fade a cada página — só faz fade ao trocar para o **próximo item** da playlist, depois da última página.

---

## 2. Tipos de mídia/conteúdo

| `type` (banco) | Nome no dashboard | Sempre tela cheia? | Pode ser overlay? | Status |
|---|---|---|---|---|
| `image` | Imagem | Sim | Não | ✅ Implementado |
| `video` | Vídeo | Sim | Não | ✅ Implementado |
| `document` | Documento (PDF) | Sim | Não | ✅ Implementado |
| `news` | Notícias | Não | Sim | ✅ Implementado |
| `temperature` | Clima | Não | Sim | ✅ Implementado |
| `hours` | Hora | Não | Sim | ✅ Implementado |
| `stock` | — | — | — | ⚠️ Existe no enum do banco, mas **sem formulário, sem ícone, sem renderização**. Não implementado de fato — ignorar por enquanto. |
| `google-sheets` | Google Planilhas | — | — | ⚠️ Aparece como opção no seletor do dashboard, mas **não está no enum do banco** (`type_playlist_item`) — selecionar essa opção quebra ao salvar. Não reimplementar até isso ser corrigido no backend. |

### 2.1 Imagem (`image`)

- Upload: JPEG, PNG, WEBP, GIF. Máx. 50MB.
- Campo: `duration_override` (segundos na tela; input numérico livre, sem mínimo/máximo aplicado na UI).
- Renderização: imagem cobrindo a tela inteira, mantendo proporção e cortando o excesso (equivalente a `object-fit: cover`).
- `config`: `{}` (vazio — imagem não tem configuração própria).

### 2.2 Vídeo (`video`)

- Upload: MP4, WEBM, MOV (`video/quicktime`). Máx. 50MB.
- Thumbnail gerada automaticamente no upload (frame do vídeo).
- Reprodução: autoplay, mudo (`muted`), inline, `object-fit: cover`. **Sem controles visíveis** (tela de assinatura digital).
- Avança para o próximo item quando o vídeo termina — **não** usa `duration_override`.
- `config`: `{}`.

### 2.3 Documento / PDF (`document`)

- Upload: `application/pdf`. Máx. 50MB.
- Thumbnail: primeira página do PDF, renderizada no cliente no momento do upload (miniatura JPEG).
- Campo: `duration_override` = **segundos por página** (não segundos totais do documento).
- Reprodução: renderiza cada página do PDF como imagem, centralizada, fundo branco, mantendo proporção (`object-fit: contain`, nunca corta a página). Passa para a próxima página automaticamente após o tempo configurado; ao acabar as páginas, segue para o próximo item da playlist.
- `config`: `{}`.
- **Nota de portabilidade:** a web usa `pdfjs-dist` (WebAssembly/canvas) para rasterizar as páginas. No Expo, o equivalente é algo como `react-native-pdf` ou renderizar via um WebView — **não** dá pra reusar `pdfjs-dist` diretamente (depende de APIs de browser tipo `DOMMatrix`, que não existem em React Native puro).

### 2.4 Notícias (`news`)

- Fonte: RSS. Duas fontes hoje: **G1** (dezenas de categorias/editorias + estados) e **Metrópole** (categorias regionais de Cajamar/Grande SP). Usuário marca quais categorias/feeds quer, por fonte.
- `config`:
  ```json
  {
    "overlay": false,
    "news": {
      "G1": ["https://g1.globo.com/dynamo/brasil/rss2.xml", "..."],
      "Metrópole": ["https://metropoleonline.com.br/rss/latest-posts", "..."]
    },
    "interval": 10
  }
  ```
  - `news`: mapa `nome_da_fonte -> lista de URLs de feed RSS` selecionadas.
  - `interval`: usado só no modo **overlay** (ver §3.3). Ignorado no modo tela cheia.
- **Modo tela cheia** (`overlay: false`): busca todos os feeds marcados, junta os itens, escolhe **uma notícia aleatória** e mostra em tela cheia: imagem de fundo (`object-fit: cover`), gradiente escuro de baixo pra cima, badge com o nome da fonte, título grande, descrição (até 3 linhas). Troca de notícia a cada vez que o item entra na rotação (não fica trocando sozinho enquanto está em tela — só troca quando a playlist volta pra esse item).
- **Modo overlay**: ver §3.3.
- Item de dado (`NewsItem`): `{ title, description, link, image?, source }`.

### 2.5 Clima (`temperature`)

- Uma ou mais localidades (cidade escolhida por autocomplete de geocoding — nome, país, lat/lon).
- Busca a temperatura atual via API (endpoint interno hoje: `/api/player/weather?lat=..&lon=..&unit=C|F`), a cada **5 minutos**.
- `config`:
  ```json
  {
    "overlay": true,
    "position": "top-right",
    "style": "corporate",
    "layout": "vertical",
    "locations": [
      { "id": "uuid", "label": "São Paulo", "location": { "name": "São Paulo", "country": "BR", "lat": -23.55, "lon": -46.63 }, "unit": "C" }
    ]
  }
  ```
- **Importante:** se `locations` estiver vazio, **nada é renderizado** (nem erro, nem placeholder) — é um estado de configuração incompleta, não um bug. Vale replicar esse comportamento (ou, melhor, mostrar um aviso na UI de edição pro usuário não esquecer de adicionar uma cidade).
- Múltiplas localidades: no modo **overlay**, revezam entre si a cada 6s (uma de cada vez, no mesmo lugar da tela). No modo **tela cheia**, todas aparecem **ao mesmo tempo**, lado a lado (`layout: horizontal`) ou empilhadas (`layout: vertical`).
- Ver §4 pra estilos e §3 pra overlay.

### 2.6 Hora (`hours`)

- Um ou mais relógios, cada um com fuso horário (herdado da localização escolhida, igual clima) e formato 12h/24h.
- `config`:
  ```json
  {
    "overlay": true,
    "position": "bottom-right",
    "style": "badge",
    "layout": "vertical",
    "clocks": [
      { "id": "uuid", "label": "São Paulo", "format": "24h", "location": { "name": "São Paulo", "country": "BR", "lat": -23.55, "lon": -46.63, "timezone": "America/Sao_Paulo" } }
    ]
  }
  ```
- Mesmas regras de `locations` vazio, revezamento (overlay) vs. exibição simultânea (tela cheia), e `layout`, que o clima (§2.5).
- Relógio atualiza a cada segundo (`setInterval` de 1000ms). Nos estilos analógicos, ponteiros são recalculados a cada tick.

---

## 3. Sistema de overlay

### 3.1 Posição (clima e hora)

4 cantos fixos, escolhidos no formulário:

| id | Descrição | Offset da borda (web) |
|---|---|---|
| `top-left` | Superior esquerdo | 24px do topo, 24px da esquerda |
| `top-right` | Superior direito | 24px do topo, 24px da direita |
| `bottom-left` | Inferior esquerdo | 24px de baixo, 24px da esquerda |
| `bottom-right` | Inferior direito | 24px de baixo, 24px da direita |

Notícias **não têm seletor de posição** — sempre fixo embaixo, centralizado horizontalmente, ~24px da borda inferior.

### 3.2 Revezamento de múltiplas entradas (clima/hora, modo overlay)

Se há mais de uma localidade/relógio configurado no mesmo item, eles revezam **no mesmo canto**, um de cada vez, a cada **6000ms**, com fade de entrada de 600ms (`overlay-fade`: opacity 0→1 + leve translateY(6px→0), ease-out).

### 3.3 Notícias em modo overlay

- `SHOW_MS = interval × 2000` (o campo `interval` do form está em "unidades" que a UI chama de segundos, mas o cálculo real dobra o valor em ms — ex: `interval: 10` → notícia fica visível **20 segundos**. Documentando o comportamento real, não o que o label sugere.)
- Loop exato, por notícia: `visível por SHOW_MS` → `anima saída (translateY + fade, 500ms)` → `troca pro próximo índice da lista (ainda invisível)` → `espera mais 3000ms invisível (GAP_MS)` → `anima entrada e volta a ficar visível`. Ou seja, entre uma notícia sumir e a próxima aparecer, o overlay fica **3500ms** sem nada visível (500 + 3000), e a troca de conteúdo acontece logo no início desse intervalo, não no fim.
- Item de notícia em modo overlay é visualmente mais compacto que em tela cheia: sem imagem de fundo, fundo preto semitransparente, só badge da fonte + título (sem descrição).

---

## 4. Catálogo de estilos

Cada estilo é puramente visual — a lógica de dados (buscar clima, formatar hora, revezar) é a mesma pra todos os estilos do mesmo tipo.

### 4.1 Relógio — `config.style`

| id | Descrição visual |
|---|---|
| `minimal` | Só o texto da hora, branco, grande, sem fundo. |
| `badge` | Texto em pílula (fully rounded) branca, texto cinza-escuro. |
| `card` | Cartão branco com cantos arredondados, ícone de relógio + hora, texto cinza-escuro. |
| `digital` | Estilo "display LED": fundo preto, texto verde (`#4ade80`), fonte monoespaçada, letras espaçadas, cantos levemente arredondados, sombra interna. |
| `glass` | Efeito vidro fosco (`backdrop-blur`), fundo branco 20% opaco, borda branca 30% opaca, texto branco. |
| `flip` | Fundo preto, texto branco monoespaçado; ao trocar de item entra com `rotateX(90deg)→rotateX(0deg)` + fade-in simultâneo, via keyframe CSS `time-flip` (0.6s, ease-out — não é o mesmo mecanismo do `flip3d` novo, que usa GSAP animando um valor). |
| `pulse` | Sem fundo, texto branco; pulsa (leve scale up/down) ao entrar via keyframe `time-pulse` (0.8s). |
| `analog-minimal` | Relógio analógico: círculo com borda branca de 2px, ponteiros brancos (hora e minuto), ponto central. |
| `analog-neon` | Analógico: fundo preto, borda ciano (`#22d3ee`) com glow, ponteiros ciano com sombra neon. |
| `analog-corporate` | Analógico: fundo branco, borda cinza clara, ponteiros cinza-escuro, sombra sutil. |
| `analog-tech` | Analógico: fundo `slate-900` (quase preto azulado), marcações de minuto tipo "grade" ao redor do mostrador (60 traços, destacando os múltiplos de 5), ponteiros ciano com glow. |
| `analog-dark` | Analógico: gradiente preto→cinza-escuro, marcações nas 12 horas, ponteiros brancos. |
| `orbit` 🆕 | Anel fino (borda branca 25% opaca) com um ponto ciano brilhante (glow) orbitando continuamente ao redor (uma volta completa a cada **8s**, sentido horário, velocidade constante — decorativo, não representa o segundo real), hora digital no centro. |
| `flip3d` 🆕 | Cartão preto/texto branco monoespaçado; toda vez que o texto da hora muda, faz um flip 3D real em `rotateX` (de -90° a 0°, ~0.45s, easing "back out" — passa levemente do ponto final e volta, dá uma sensação de "batida"). |
| `sphere` 🆕 | Badge 3D (WebGL/Three.js): icosaedro facetado azul (`#3b82f6`) com emissivo amarelo (`#facc15`), luz ambiente + direcional, gira continuamente nos eixos X e Y (~1 volta em Y a cada 12s), hora digital sobreposta por cima, com sombra pra legibilidade. |

### 4.2 Clima — `config.style`

| id | Descrição visual |
|---|---|
| `minimal` | Só o valor (`26°C`), branco, sem fundo. |
| `badge` | Pílula branca, texto cinza-escuro. |
| `card` | Cartão branco, ícone de termômetro + valor. |
| `digital` | Display LED: fundo preto, texto verde monoespaçado. |
| `glass` | Vidro fosco, texto branco. |
| `pulse` | Sem fundo, texto branco, pulsa ao entrar. |
| `neon` | Texto ciano (`#22d3ee`) com glow, sem fundo. |
| `corporate` | Fundo branco, borda cinza clara, texto cinza-escuro. |
| `tech` | Fundo `slate-900`, borda `slate-700`, texto ciano monoespaçado. |
| `dark` | Gradiente preto→cinza-escuro, texto branco. |
| `gauge` 🆕 | Medidor circular (arco SVG): anel de fundo cinza translúcido + arco amarelo (`#facc15`) preenchendo proporcionalmente à temperatura (mapeada de -10°C a 45°C → 0–100% do arco), ponta arredondada, gira a partir do topo (12h). Valor numérico centralizado. Animação: o preenchimento anima suavemente (~0.8s, ease-out) toda vez que a temperatura muda. |
| `wave` 🆕 | Blob circular azul-céu (`#38bdf8`) atrás do valor, "respirando": alterna continuamente entre escala 1×/opacidade 35% e escala 1.25×/opacidade 15% (ciclo de ida-e-volta, 1.8s cada direção, easing suave senoidal). Valor numérico num cartão semitransparente por cima. |
| `sphere` 🆕 | Mesmo badge 3D do relógio (Three.js), mas geometria de **toro** (donut) em azul (`#0ea5e9`) em vez de icosaedro, mesma animação de rotação contínua. Valor da temperatura sobreposto. |

### 4.3 Layout (só no modo tela cheia, `hours`/`temperature`)

- `vertical` (padrão): entradas empilhadas verticalmente, centralizadas.
- `horizontal`: entradas lado a lado.

---

## 5. Especificação técnica das animações novas (relógio/clima)

Os 6 estilos novos (`orbit`, `flip3d`, `sphere` × 2, `gauge`, `wave`) foram construídos com uma regra deliberada: **o GSAP nunca manipula o DOM diretamente** (nada de `ScrollTrigger`, `SplitText`, seletor de classe). Em vez disso, ele anima um objeto JS com números puros, e cada frame (`onUpdate`) escreve esse número no `state` do React, que vira estilo inline. Essa é a mesma receita que dá pra usar com `Animated`/Reanimated no React Native — só troca "pra onde o número vai" no final.

Hook usado (web): `components/preview/shared/useAnimatedValue.ts`
```ts
function useAnimatedValue(initial, gsapVars, deps = []) {
  // gsap.to(objetoPuro, { ...gsapVars, onUpdate: () => setState({...objetoPuro}) })
  // cleanup: tween.kill()
}
```

Receitas exatas (pra reproduzir com Reanimated/`gsap` puro no RN):

| Estilo | Valor(es) animado(s) | De → Para | Duração | Ease | Repetição |
|---|---|---|---|---|---|
| `orbit` | `angle` (graus) | `0 → 360` | 8s | `none` (linear) | infinita (`repeat: -1`) |
| `flip3d` | `flip` (graus, rotateX) | `-90 → 0` | 0.45s | `back.out(1.7)` | dispara de novo toda vez que o texto da hora muda |
| `gauge` | `progress` (0–1) | valor anterior → `(tempC - (-10)) / 55`, clamp 0–1 | 0.8s | `power2.out` | dispara de novo a cada mudança de temperatura |
| `wave` | `scale`, `opacity` | `1 / 0.35 → 1.25 / 0.15` | 1.8s (cada perna) | `sine.inOut` | infinita, `yoyo: true` (vai e volta) |
| `sphere` (ambos) | `mesh.rotation.y` (rad), `mesh.rotation.x` (rad) | `+= 2π`, `+= 0.6π` | 12s | `none` (linear) | infinita (`repeat: -1`) |

`sphere` é o único que usa Three.js de verdade — é uma cena mínima (`components/preview/shared/ThreeBadge.tsx`): 1 câmera perspectiva, 1 mesh (icosaedro ou toro) com `MeshStandardMaterial`, 1 luz ambiente + 1 direcional, sem texturas geradas via canvas 2D (evitamos `document.createElement('canvas')` de propósito — só APIs "núcleo" do Three: `Scene`, `PerspectiveCamera`, `Mesh`, `Material`, `Light`). O único trecho não-portável é a criação do `<canvas>`/`WebGLRenderer` — no Expo isso vira `expo-gl` (`<GLView onContextCreate>`) + `expo-three` (`Renderer`); o resto (geometria, material, luzes, `mesh.rotation` animado por GSAP) é o mesmo código.

**Respeito a "reduzir movimento":** todas as animações checam `prefers-reduced-motion` (na web, via `window.matchMedia`) e pulam o loop contínuo se o usuário pediu menos movimento — no RN, o equivalente é `AccessibilityInfo.isReduceMotionEnabled()`.

---

## 6. Referência rápida de `config` por tipo

```ts
// image, video, document → config: {}
// duration_override: number | null (segundos; document = segundos por página)

type NewsConfig = {
  overlay: boolean;
  news: Record<string, string[]>; // nome da fonte -> URLs de feed RSS
  interval?: number; // só overlay; SHOW_MS real = interval * 2000
};

type WeatherConfig = {
  overlay: boolean;
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "";
  style: "minimal" | "badge" | "card" | "digital" | "glass" | "pulse"
       | "neon" | "corporate" | "tech" | "dark" | "gauge" | "wave" | "sphere";
  layout: "vertical" | "horizontal"; // só tela cheia
  locations: {
    id: string;
    label: string;
    location?: { name: string; country: string; lat: number; lon: number };
    unit?: "C" | "F"; // padrão "C"
  }[];
};

type TimeConfig = {
  overlay: boolean;
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "";
  style: "minimal" | "badge" | "card" | "digital" | "glass" | "flip" | "pulse"
       | "analog-minimal" | "analog-neon" | "analog-corporate" | "analog-tech" | "analog-dark"
       | "orbit" | "flip3d" | "sphere";
  layout: "vertical" | "horizontal"; // só tela cheia
  clocks: {
    id: string;
    label: string;
    format: "12h" | "24h";
    location?: { name: string; country: string; lat: number; lon: number; timezone?: string };
  }[];
};
```

---

## 7. Endpoints usados (pra saber o que o app RN precisa chamar)

| Endpoint | Uso |
|---|---|
| `GET /api/player/weather?lat=&lon=&unit=C\|F` | Retorna `{ temperature: number \| null, unit: "C" \| "F" }` pra uma coordenada. |
| `GET /api/player/geocoding?q=<texto>` | Autocomplete de cidade (usado só no dashboard/formulário, não no player em si) — retorna `{ results: [{ name, country, lat, lon }] }`. |
| `POST /api/rss` (modo overlay, via `NewsOverlay`) / `GET /api/rss?url=&source=` (modo tela cheia, via `News`) | Busca e normaliza itens de um feed RSS pra `{ title, description, link, image?, source }`. |

O app RN pode reusar esses mesmos endpoints (se tiver acesso à mesma API Next.js) em vez de reimplementar geocoding/RSS/clima do zero.

---

## 8. Inconsistências conhecidas (não reproduzir sem querer)

- `interfaces/Medias.ts` define `MediaType` com `"weather"`, mas o valor real salvo no banco e usado em todo o resto do código é `"temperature"`. Use `"temperature"`.
- `"google-sheets"` aparece na UI de seleção de tipo mas não existe no enum do Postgres (`type_playlist_item`) — **não é uma feature funcional hoje**.
- `"stock"` existe no enum do banco mas não tem nenhuma UI, formulário ou renderização — reservado/não implementado.
- O rótulo do campo "Notícias → intervalo" na UI não deixa claro que o valor é multiplicado por 2000 (não 1000) pra virar milissegundos — ao portar, decida se replica esse comportamento (compatibilidade com playlists já configuradas) ou corrige o cálculo (ver `NewsOverlay.tsx`, constante `SHOW_MS`).
