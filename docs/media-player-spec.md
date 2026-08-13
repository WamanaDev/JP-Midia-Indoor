# Player de Mídia Indoor — Especificação de conteúdo, estilos e comportamento

> Documento de referência para reimplementar o player (web, Next.js) em **React Native / Expo**.
> Fonte da verdade: `components/preview/PlayerCore.tsx` e os componentes citados abaixo, no repo `JP-Midia-Indoor`.
> Renomeado de `media-overlay-spec.md` — o catálogo cresceu bem além de overlays (ganhou templates de tela cheia inteiros), então o nome antigo ficou estreito demais.
> Gerado em 2026-08-11. Atualizado em 2026-08-12 com o catálogo de estilos novo (79 estilos aprovados), templates de tela cheia, ícones dinâmicos e QR code em notícias.

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
- Item de dado (`NewsItem`): `{ title, description, link, image?, source }`.
- `config` (`NewsConfig`, ver §10):
  ```json
  {
    "overlay": false,
    "news": {
      "G1": ["https://g1.globo.com/dynamo/brasil/rss2.xml", "..."],
      "Metrópole": ["https://metropoleonline.com.br/rss/latest-posts", "..."]
    },
    "interval": 10,
    "style": "news-ticker-chip",
    "fullscreenStyle": "news-hero-banner"
  }
  ```
  - `news`: mapa `nome_da_fonte -> lista de URLs de feed RSS` selecionadas.
  - `interval`: usado só no modo **overlay** (ver §3.3). Ignorado no modo tela cheia.
  - `style` **(novo)**: um dos 5 estilos de overlay (§4.4). Ausente = visual atual, fixo por fonte (badge vermelho G1 / preto Metrópole) — `NewsOverlay.tsx` cai nesse fallback quando `style` não vem preenchido, então playlists antigas continuam funcionando sem mudança nenhuma.
  - `fullscreenStyle` **(novo)**: um dos 17 templates de tela cheia — 9 de "rodar" + 8 de "todos juntos" (§5.3/§5.4). Ausente = visual atual (uma notícia aleatória, card fixo por fonte).
- **Modo tela cheia sem `fullscreenStyle`** (comportamento original): busca todos os feeds marcados, junta os itens, escolhe **uma notícia aleatória** e mostra em tela cheia: imagem de fundo (`object-fit: cover`), gradiente escuro de baixo pra cima, badge com o nome da fonte, título grande, descrição (até 3 linhas). Troca de notícia a cada vez que o item entra na rotação (não fica trocando sozinho enquanto está em tela — só troca quando a playlist volta pra esse item).
- **Modo tela cheia com `fullscreenStyle` de "rodar"**: mesmo comportamento acima (uma notícia por entrada na rotação), só muda o visual pro template escolhido.
- **Modo tela cheia com `fullscreenStyle` de "todos juntos"**: busca os feeds, **embaralha e pega 3 notícias aleatórias** (em vez de 1) e mostra todas simultaneamente no layout do template. Refaz essa escolha toda vez que `config.news` muda.
- **Modo overlay**: ver §3.3 e §4.4.

### 2.5 Clima (`temperature`)

- Uma ou mais localidades (cidade escolhida por autocomplete de geocoding — nome, país, lat/lon).
- Busca o clima atual via API (endpoint interno hoje: `/api/player/weather?lat=..&lon=..&unit=C|F`), a cada **5 minutos** — ver §11 pro shape completo da resposta (temperatura **e**, desde a atualização, condição/dia-noite reais).
- `config` (`WeatherConfig`, ver §10):
  ```json
  {
    "overlay": true,
    "position": "top-right",
    "style": "card",
    "layout": "vertical",
    "fullscreenStyle": null,
    "locations": [
      { "id": "uuid", "label": "São Paulo", "location": { "name": "São Paulo", "country": "BR", "lat": -23.55, "lon": -46.63 }, "unit": "C" }
    ]
  }
  ```
- **Importante:** se `locations` estiver vazio, **nada é renderizado** (nem erro, nem placeholder) — é um estado de configuração incompleta, não um bug. Vale replicar esse comportamento (ou, melhor, mostrar um aviso na UI de edição pro usuário não esquecer de adicionar uma cidade).
- Múltiplas localidades:
  - No modo **overlay**, revezam entre si a cada 6s (uma de cada vez, no mesmo lugar da tela) — ver §3.2.
  - No modo **tela cheia**, o padrão é mostrar **todas ao mesmo tempo**, lado a lado (`layout: "horizontal"`) ou empilhadas (`layout: "vertical"`). Desde a atualização, existe uma terceira opção, `layout: "rotate"` — **revezar uma localidade por vez em tela cheia**, igual o overlay já fazia (mesma cadência de 6s, com pontinhos indicando a posição na rotação). Ver §3.4.
- O ícone que acompanha o valor agora é **dinâmico de verdade** (sol/lua/nuvem/chuva/tempestade, calculado do clima real) — ver §6.

### 2.6 Hora (`hours`)

- Um ou mais relógios, cada um com fuso horário (herdado da localização escolhida, igual clima) e formato 12h/24h.
- `config` (`TimeConfig`, ver §10):
  ```json
  {
    "overlay": true,
    "position": "bottom-right",
    "style": "badge",
    "layout": "vertical",
    "fullscreenStyle": null,
    "clocks": [
      { "id": "uuid", "label": "São Paulo", "format": "24h", "location": { "name": "São Paulo", "country": "BR", "lat": -23.55, "lon": -46.63, "timezone": "America/Sao_Paulo" } }
    ]
  }
  ```
- Mesmas regras de `locations` vazio, revezamento (overlay) vs. exibição simultânea (tela cheia), `layout` (incluindo o novo `"rotate"`) e `fullscreenStyle`, que o clima (§2.5).
- Relógio atualiza a cada segundo (`setInterval` de 1000ms). Nos estilos analógicos, ponteiros são recalculados a cada tick a partir da hora real (componente único `AnalogClock`, ver §9).
- Estilos com ícone (`card`, `icon-tight`) mostram um sol ou lua ao lado da hora, calculado a partir da hora local **daquele relógio especificamente** (do fuso configurado, não do fuso do navegador/dispositivo) — ver §6.

---

## 3. Sistema de overlay e revezamento

### 3.1 Posição (clima e hora)

4 cantos fixos, escolhidos no formulário:

| id | Descrição | Offset da borda (web) |
|---|---|---|
| `top-left` | Superior esquerdo | 24px do topo, 24px da esquerda |
| `top-right` | Superior direito | 24px do topo, 24px da direita |
| `bottom-left` | Inferior esquerdo | 24px de baixo, 24px da esquerda |
| `bottom-right` | Inferior direito | 24px de baixo, 24px da direita |

Notícias **não têm seletor de posição** — sempre fixo embaixo, centralizado horizontalmente, ~24px da borda inferior.

### 3.2 Revezamento de múltiplas entradas — overlay (clima/hora)

Se há mais de uma localidade/relógio configurado no mesmo item overlay, eles revezam **no mesmo canto**, um de cada vez, a cada **6000ms**, com fade de entrada de 600ms (`overlay-fade`: opacity 0→1 + leve translateY(6px→0), ease-out).

### 3.3 Notícias em modo overlay

- `SHOW_MS = interval × 2000` (o campo `interval` do form está em "unidades" que a UI chama de segundos, mas o cálculo real dobra o valor em ms — ex: `interval: 10` → notícia fica visível **20 segundos**. Documentando o comportamento real, não o que o label sugere.)
- Loop exato, por notícia: `visível por SHOW_MS` → `anima saída (translateY + fade, 500ms)` → `troca pro próximo índice da lista (ainda invisível)` → `espera mais 3000ms invisível (GAP_MS)` → `anima entrada e volta a ficar visível`. Ou seja, entre uma notícia sumir e a próxima aparecer, o overlay fica **3500ms** sem nada visível (500 + 3000), e a troca de conteúdo acontece logo no início desse intervalo, não no fim.
- O visual do overlay é escolhido por `config.style` (§4.4) — sem `style`, cai no card compacto fixo por fonte (sem imagem de fundo, fundo preto semitransparente, só badge da fonte + título, sem descrição) que já existia.

### 3.4 Revezamento em tela cheia — `layout: "rotate"` (novo)

Comportamento novo, só pra clima e hora, só quando `overlay: false`. Mesma cadência do overlay (§3.2): revezam **uma entrada por vez, a cada 6000ms**, com fade de entrada (`time-fade`, 500ms). A diferença pra tela cheia "normal" é puramente de apresentação:

- Mostra **pontinhos** (`RotateDots`, componente compartilhado) indicando quantas entradas existem e qual está na tela — só aparecem se houver mais de uma entrada.
- Se `fullscreenStyle` estiver preenchido com um template de "rodar" (§5.3), o template assume a tela inteira e os pontinhos ficam sobrepostos por cima, ancorados embaixo ao centro. Sem `fullscreenStyle`, usa o mesmo chip do modo tela cheia simples (§4.1), só que trocando de entrada em vez de mostrar todas juntas.

---

## 4. Catálogo de estilos — overlay e tela cheia simples

Esses estilos valem tanto pro overlay (canto da tela) quanto pro modo tela cheia **sem** `fullscreenStyle` — nesse segundo caso, o mesmo visual só fica maior (`size="lg"` em vez de `"sm"`) e se repete uma vez por entrada, empilhado ou lado a lado.

### 4.1 Catálogo compartilhado (`ChipStyleId`) — relógio e clima

17 estilos, implementados uma única vez (`components/preview/shared/chipStyles.tsx`) e reusados pelos dois tipos — quem chama decide o ícone (glifo de relógio/dia-noite, ou condição do tempo real) e o valor.

| id | Descrição visual |
|---|---|
| `minimal` | Só o valor, branco, grande, sem fundo. |
| `badge` | Pílula branca, texto cinza-escuro. |
| `card` | Cartão branco com ícone (dinâmico — sol/lua ou condição do tempo) + valor. |
| `digital` | Estilo "display LED": fundo preto, texto verde, fonte monoespaçada, letras espaçadas. |
| `glass` | Vidro fosco (`backdrop-blur`), borda clara translúcida. |
| `pulse` | Sem fundo; pulsa (leve scale) ao entrar. |
| `sphere` | Badge 3D (Three.js) girando continuamente atrás do valor — icosaedro azul/amarelo pro relógio, toro azul/ciano pro clima. |
| `chip-outline` | Só contorno branco, sem preenchimento — pensado pra fundos já carregados. |
| `tag-ticket` | Formato de etiqueta de bagagem: papel bege, "furo" circular do lado esquerdo, monoespaçado. |
| `mono-console` | Terminal âmbar sobre preto, com scanline sutil. |
| `neon-breathe` | Contorno roxo neon cujo brilho sobe e desce continuamente. |
| `brand-strip` | Barra sólida verde-esmeralda, cantos retos. |
| `paper-tag` | Papel off-white, sombra suave, canto dobrado. |
| `led-strip` | Preto/âmbar, letras bem espaçadas, sublinhado tracejado. |
| `ribbon-corner` | Faixa inclinada (skew), texto endireitado por dentro. |
| `viewfinder-corners` | Sem fundo — só cantos duplos estilo mira de câmera ao redor do texto. |
| `icon-tight` | Chip bem compacto: ícone + valor, fundo preto translúcido. |

### 4.2 Extras do relógio (`TimeStyleId`)

Além do catálogo acima, o relógio tem 5 estilos próprios (não fazem sentido pro clima):

| id | Descrição visual |
|---|---|
| `flip` | Fundo preto, texto branco monoespaçado; anima entrada com `rotateX` via keyframe CSS (`time-flip`, 0.6s). |
| `flip3d` | Cartão preto; toda vez que o texto da hora muda, faz um flip 3D real em `rotateX` (GSAP, `back.out(1.7)`, ~0.45s — dá uma sensação de "batida"). |
| `analog-minimal` | Mostrador clássico: círculo com borda branca, ponteiros brancos, ponto central. |
| `analog-neon` | Mostrador escuro com contorno neon ciano e ponteiros brilhantes. |
| `analog-corporate` | Mostrador branco, marcações nas 12 horas, ponteiros cinza-escuro, sombra sutil. |

Os 3 analógicos compartilham um único componente (`components/preview/time/styles/AnalogClock.tsx`), usado tanto no overlay quanto na tela cheia — os ponteiros são recalculados a cada segundo a partir da hora real do fuso do relógio.

### 4.3 Extras do clima (`WeatherStyleId`)

5 estilos próprios do clima:

| id | Descrição visual |
|---|---|
| `neon` | Texto ciano com glow, sem fundo. |
| `corporate` | Fundo branco, borda cinza clara. |
| `tech` | Fundo grafite (`slate-900`), texto ciano monoespaçado. |
| `dark` | Gradiente preto→cinza-escuro. |
| `gauge` | Medidor circular (arco SVG): preenche proporcionalmente à temperatura (-10°C a 45°C → 0–100% do arco), anima suavemente (GSAP, ~0.8s) toda vez que a temperatura muda. |

### 4.4 Overlay de notícia (`NewsOverlayStyleId`)

5 estilos, só fazem sentido em `config.overlay: true` (notícia não tem versão "tela cheia simples" — a tela cheia sempre usa um template dedicado, §5).

| id | Descrição visual |
|---|---|
| `news-ticker-chip` | Chip compacto: ponto vermelho da fonte + manchete truncada numa linha. |
| `news-marquee` | Igual ao chip, mas a manchete **rola horizontalmente** quando não cabe no espaço (`chip-marquee`, 9s linear). |
| `news-mini-card` | Cartão branco: miniatura (imagem da notícia, ou gradiente se não tiver) + manchete em até 2 linhas. |
| `news-alert-strip` | Borda vermelha de urgência à esquerda + selo "ÚLTIMA HORA". |
| `news-qr-corner` | Chip com um QR code de verdade (link da notícia) ao lado da manchete truncada. |

---

## 5. Templates de tela cheia (`fullscreenStyle`)

Só existem quando `overlay: false`. Diferente do catálogo de chip (§4), que é um valor pequeno repetido, esses templates tomam a tela inteira com um layout dedicado — 46 no total: 15 pro relógio, 14 pro clima, 17 pra notícia.

Cada template só faz sentido num dos dois comportamentos, e o id já deixa isso implícito (o formulário só oferece o conjunto certo dependendo do `layout` escolhido, no caso de relógio/clima):

- **"Rodar" (`TimeRotateTemplateId` / `WeatherRotateTemplateId` / `NewsRotateTemplateId`)** — usado com `layout: "rotate"` (relógio/clima) ou automaticamente pra notícia (que já troca de item a cada entrada na rotação, ver §2.4). Mostra **uma entrada por vez**, tela inteira.
- **"Todos juntos" (`TimeTogetherTemplateId` / `WeatherTogetherTemplateId` / `NewsTogetherTemplateId`)** — usado com `layout: "vertical"` ou `"horizontal"` (relógio/clima), ou pra notícia quando o item busca **3 notícias aleatórias** em vez de 1 (§2.4). Mostra **todas as entradas ao mesmo tempo**.

### 5.1 Relógio — rodar (`TimeRotateTemplateId`, 8)

| id | Descrição |
|---|---|
| `airport-split` | Tela dividida: painel escuro com a hora à esquerda, painel em gradiente azul com o nome do local à direita. |
| `transit-board` | Matriz tipo LED âmbar sobre preto, tremeluz sutil ao trocar. |
| `boarding-pass` | Cartão bege com divisória tracejada — "Hora" de um lado, "Local" do outro. |
| `stadium-scoreboard` | Dígitos enormes e blocados, frisos âmbar acima e abaixo. |
| `subway-panel` | Verde fosforescente sobre preto, estética retrô de estação. |
| `neon-marquee` | Moldura neon âmbar ao redor da hora, tremeluzindo como um letreiro. |
| `terminal-readout` | Verde sobre preto, cursor piscando, scanlines. |
| `data-wall` | Grade tipo videowall, célula central em destaque com a hora. |

### 5.2 Relógio — todos juntos (`TimeTogetherTemplateId`, 7)

| id | Descrição |
|---|---|
| `departure-table` | Lista estilo painel de partidas de aeroporto — local à esquerda, hora à direita, monoespaçado. |
| `ribbon-stack` | Faixas coloridas empilhadas, uma cor de destaque por relógio. |
| `clock-wall` | Mural de mostradores analógicos lado a lado, um por relógio configurado. |
| `glass-panels` | Painéis verticais em vidro fosco, separados por linhas finas de luz. |
| `timeline-row` | Relógios conectados ao longo de uma linha horizontal, com marcadores. |
| `corporate-lobby` | Horas lado a lado, cada uma com sublinhado azul formal. |
| `transit-multiboard` | Lista âmbar estilo painel de embarque, empilhada. |

### 5.3 Clima — rodar (`WeatherRotateTemplateId`, 7)

| id | Descrição |
|---|---|
| `billboard-spot` | Spot de luz radial cinematográfico atrás do valor gigante centralizado. |
| `control-room` | HUD escuro com grade fina e cantos técnicos, estilo sala de controle. |
| `retail-promo` | Bloco de cor vibrante com cartão branco arredondado grande. |
| `weather-station-hero` | Gradiente de céu, ícone de condição grande no topo. |
| `corporate-brief` | Fundo branco, valor grande à esquerda, barras decorativas de gráfico à direita. |
| `sunrise-gradient` | Gradiente lento mudando de tom (`sunrise-shift`, 10s), cartão translúcido central. |
| `horizon-line` | Divisão em duas cores por uma linha de horizonte. |

### 5.4 Clima — todos juntos (`WeatherTogetherTemplateId`, 7)

| id | Descrição |
|---|---|
| `grid-mosaic` | Grade uniforme, uma célula por localidade. |
| `dashboard-tiles` | Cartões elevados brancos, estilo painel corporativo. |
| `honeycomb` | Painéis hexagonais (`clip-path`), visual moderno e técnico. |
| `weather-strip-multi` | Ícones e temperaturas numa faixa sob um gradiente de céu. |
| `split-duo` | Divisão vertical dramática ao meio — pensado pra duas localidades (usa só as 2 primeiras se houver mais). |
| `badge-cloud` | Selos soltos, leve desalinhamento vertical alternado. |
| `globe-row` | Selos esféricos em gradiente por cidade, alinhados em fileira. |

### 5.5 Notícia — rodar (`NewsRotateTemplateId`, 9)

A maioria mostra **descrição + QR code de verdade** (link da matéria); alguns ficam só com a manchete de propósito, pra continuar rápido de ler.

| id | Descrição | Tem descrição? | Tem QR? |
|---|---|---|---|
| `broadcast-lower-third` | Barra inferior âmbar estilo telejornal, desliza da esquerda ao entrar. | Não (de propósito) | Não |
| `magazine-cover` | Tipografia editorial serifada, linhas finas, respiro generoso. | Sim | Sim |
| `news-hero-banner` | Imagem de fundo em tela cheia, gradiente escuro, manchete embaixo. | Sim | Sim |
| `gallery-frame` | Moldura fina tipo museu, canvas neutro. | Sim | Sim |
| `polaroid-frame` | Conteúdo emoldurado como polaroid, levemente inclinado. | Sim | Sim (colado no canto) |
| `news-split-qr` | Metade imagem, metade texto — QR grande em destaque. | Sim | Sim |
| `news-caption-card` | Manchete como citação centralizada. | Sim | Sim |
| `news-dossier` | Estética de pasta/arquivo, descrição como corpo de texto. | Sim | Sim |
| `news-anchor-desk` | Barra inferior com a descrição correndo em marquee embaixo da manchete. | Sim (em marquee) | Não |

### 5.6 Notícia — todos juntos (`NewsTogetherTemplateId`, 8)

Busca e mostra **3 notícias aleatórias** ao mesmo tempo (em vez de 1) — ver §2.4.

| id | Descrição |
|---|---|
| `filmstrip-row` | Notícias lado a lado, divisória pontilhada, manchete + descrição. |
| `ledger-rows` | Linhas separadas por regra fina, sem caixas — estilo jornal impresso (só manchete). |
| `carousel-fan` | Cartões sobrepostos em leque. |
| `info-strip-bottom` | Faixa inferior dividida em segmentos, uma por notícia (só manchete). |
| `newsroom-grid` | Blocos com friso colorido por notícia, manchete grande. |
| `archive-cards` | Fichas empilhadas com leve desalinhamento, estilo catálogo. |
| `news-wall-qr` | Grade com manchete + descrição + QR code em cada notícia. |
| `news-digest-list` | Lista vertical tipo newsletter — manchete + descrição por item. |

---

## 6. Ícones dinâmicos (novo)

Antes, clima usava sempre um ícone de termômetro fixo e relógio não tinha indicação de dia/noite. Agora os dois reagem a dado real:

### 6.1 Condição do tempo (clima)

`/api/player/weather` passou a repassar `weathercode` e `isDay`, que a Open-Meteo já devolvia mas o endpoint descartava (ver §11). `lib/weather-condition.ts` mapeia:

```ts
conditionFromCode(weathercode) // WMO code -> "clear" | "partly" | "cloudy" | "fog" | "rain" | "storm" | "snow"
weatherIcon(condition, isDay)  // -> ícone lucide-react (Sun/Moon/CloudSun/CloudMoon/Cloud/CloudFog/CloudRain/CloudLightning/CloudSnow)
```

Esse ícone substitui o termômetro fixo em todo lugar que mostra ícone de clima — overlay, tela cheia simples e todos os templates de §5.3/§5.4.

### 6.2 Dia/noite (relógio)

Não depende de nenhuma API nova — é calculado localmente a partir da **hora do próprio fuso do relógio** (`hours >= 6 && hours < 18` → dia, senão noite), então cada relógio mostra sol/lua corretos pro fuso dele, não pro fuso de quem está vendo a tela. Aparece nos estilos com ícone (`card`, `icon-tight`).

---

## 7. QR code em notícias (novo)

`components/preview/shared/QrCode.tsx` gera um QR code **real e escaneável** no cliente (lib `qrcode`, adicionada ao projeto), a partir de `item.link` — não é decorativo. Usado nos templates listados em §5.5/§5.6 com "Tem QR? Sim".

**Nota de portabilidade:** no Expo, `qrcode` (Node/browser) não roda igual — usar uma lib RN-friendly tipo `react-native-qrcode-svg`, gerando o mesmo conteúdo (`item.link`).

---

## 8. Especificação técnica das animações GSAP

Os estilos abaixo foram construídos com uma regra deliberada: **o GSAP nunca manipula o DOM diretamente**. Em vez disso, ele anima um objeto JS com números puros, e cada frame (`onUpdate`) escreve esse número no `state` do React, que vira estilo inline. Essa é a mesma receita que dá pra usar com `Animated`/Reanimated no React Native — só troca "pra onde o número vai" no final.

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
| `flip3d` | `flip` (graus, rotateX) | `-90 → 0` | 0.45s | `back.out(1.7)` | dispara de novo toda vez que o texto da hora muda |
| `gauge` | `progress` (0–1) | valor anterior → `(tempC - (-10)) / 55`, clamp 0–1 | 0.8s | `power2.out` | dispara de novo a cada mudança de temperatura |
| `sphere` (ambos) | `mesh.rotation.y` (rad), `mesh.rotation.x` (rad) | `+= 2π`, `+= 0.6π` | 12s | `none` (linear) | infinita (`repeat: -1`) |

`sphere` é o único que usa Three.js de verdade — é uma cena mínima (`components/preview/shared/ThreeBadge.tsx`): 1 câmera perspectiva, 1 mesh (icosaedro ou toro, geometria/cor configurável via prop) com `MeshStandardMaterial`, 1 luz ambiente + 1 direcional, sem texturas geradas via canvas 2D (evitamos `document.createElement('canvas')` de propósito — só APIs "núcleo" do Three: `Scene`, `PerspectiveCamera`, `Mesh`, `Material`, `Light`). O único trecho não-portável é a criação do `<canvas>`/`WebGLRenderer` — no Expo isso vira `expo-gl` (`<GLView onContextCreate>`) + `expo-three` (`Renderer`); o resto (geometria, material, luzes, `mesh.rotation` animado por GSAP) é o mesmo código.

**Respeito a "reduzir movimento":** todas as animações checam `prefers-reduced-motion` (na web, via `window.matchMedia`) e pulam o loop contínuo se o usuário pediu menos movimento — no RN, o equivalente é `AccessibilityInfo.isReduceMotionEnabled()`.

---

## 9. Arquitetura de renderização

Cada estilo é um componente próprio, guardado num **registro** (`Record<Id, ComponentType<Props>>`) — quem renderiza só faz `REGISTRO[config.style]` em vez de um `switch` gigante repetido entre a versão overlay e a versão tela cheia. Vale replicar esse padrão no port pra RN.

| Arquivo | Registro exportado | Conteúdo |
|---|---|---|
| `components/preview/shared/chipStyles.tsx` | `CHIP_STYLES` | Os 17 estilos de §4.1, cada componente aceita `size: "sm" \| "lg"`. |
| `components/preview/time/styles/{AnalogClock,FlipDigitClock,registry}.tsx` | `TIME_ONLY_STYLES` | Os 5 extras do relógio (§4.2). |
| `components/preview/weather/styles/{GaugeWeather,registry}.tsx` | `WEATHER_ONLY_STYLES` | Os 5 extras do clima (§4.3). |
| `components/preview/news/styles/registry.tsx` | `NEWS_OVERLAY_STYLES` | Os 5 estilos de overlay de notícia (§4.4). |
| `components/preview/time/fullscreen/registry.tsx` | `TIME_ROTATE_TEMPLATES` | Os 8 templates "rodar" do relógio (§5.1). |
| `components/preview/time/fullscreen/together.tsx` | `TIME_TOGETHER_TEMPLATES` | Os 7 templates "juntos" do relógio (§5.2). |
| `components/preview/weather/fullscreen/registry.tsx` | `WEATHER_ROTATE_TEMPLATES` | Os 7 templates "rodar" do clima (§5.3). |
| `components/preview/weather/fullscreen/together.tsx` | `WEATHER_TOGETHER_TEMPLATES` | Os 7 templates "juntos" do clima (§5.4). |
| `components/preview/news/fullscreen/registry.tsx` | `NEWS_ROTATE_TEMPLATES` | Os 9 templates "rodar" de notícia (§5.5). |
| `components/preview/news/fullscreen/together.tsx` | `NEWS_TOGETHER_TEMPLATES` | Os 8 templates "juntos" de notícia (§5.6). |
| `components/preview/shared/{QrCode,RotateDots}.tsx` | — | QR code real (§7) e os pontinhos de posição na rotação (§3.4). |
| `lib/weather-condition.ts` | — | Mapeamento WMO code → condição/ícone (§6.1). |

Os componentes de renderização (`TimeOverlay`, `TimeNotOverlay`, `WeatherOverlay`, `WeatherNotOverlay`, `NewsOverlay`, `news.tsx`/`News`) fazem o lookup no registro certo a partir de `config.style`/`config.fullscreenStyle`, com fallback pro estilo `minimal`/comportamento antigo quando o id não bate com nada (playlist antiga, campo ausente).

No dashboard (`components/dashboard/playlists/[id]/forms/{FormHours,FormWheater,FormNews}.tsx`), cada formulário mantém arrays locais `STYLES` / `FULLSCREEN_TEMPLATES` / `TOGETHER_TEMPLATES` de `{ id, label, preview }`, alimentando o componente compartilhado `<StylePicker>`. `layout` (vertical/horizontal/rotate) tem seu próprio seletor, `<LayoutPicker>` — antes esse campo existia no config mas não tinha UI nenhuma.

---

## 10. Referência rápida de `config` por tipo

```ts
// image, video, document → config: {}
// duration_override: number | null (segundos; document = segundos por página)

type Position = "top-left" | "top-right" | "bottom-left" | "bottom-right" | "";

// Catálogo de chip — compartilhado entre relógio e clima (overlay + tela cheia simples)
type ChipStyleId =
  | "minimal" | "badge" | "card" | "digital" | "glass" | "pulse" | "sphere"
  | "chip-outline" | "tag-ticket" | "mono-console" | "neon-breathe"
  | "brand-strip" | "paper-tag" | "led-strip" | "ribbon-corner"
  | "viewfinder-corners" | "icon-tight";

type TimeStyleId = ChipStyleId | "flip" | "flip3d" | "analog-minimal" | "analog-neon" | "analog-corporate";
type WeatherStyleId = ChipStyleId | "neon" | "corporate" | "tech" | "dark" | "gauge";

type TimeRotateTemplateId =
  | "airport-split" | "transit-board" | "boarding-pass" | "stadium-scoreboard"
  | "subway-panel" | "neon-marquee" | "terminal-readout" | "data-wall";
type TimeTogetherTemplateId =
  | "departure-table" | "ribbon-stack" | "clock-wall" | "glass-panels"
  | "timeline-row" | "corporate-lobby" | "transit-multiboard";
type TimeFullscreenTemplateId = TimeRotateTemplateId | TimeTogetherTemplateId;

type WeatherRotateTemplateId =
  | "billboard-spot" | "control-room" | "retail-promo" | "weather-station-hero"
  | "corporate-brief" | "sunrise-gradient" | "horizon-line";
type WeatherTogetherTemplateId =
  | "grid-mosaic" | "dashboard-tiles" | "honeycomb" | "weather-strip-multi"
  | "split-duo" | "badge-cloud" | "globe-row";
type WeatherFullscreenTemplateId = WeatherRotateTemplateId | WeatherTogetherTemplateId;

type NewsItem = { title: string; description: string; link: string; image?: string; source: string };

type NewsOverlayStyleId =
  | "news-ticker-chip" | "news-marquee" | "news-mini-card" | "news-alert-strip" | "news-qr-corner";
type NewsRotateTemplateId =
  | "broadcast-lower-third" | "magazine-cover" | "news-hero-banner" | "gallery-frame"
  | "polaroid-frame" | "news-split-qr" | "news-caption-card" | "news-dossier" | "news-anchor-desk";
type NewsTogetherTemplateId =
  | "filmstrip-row" | "ledger-rows" | "carousel-fan" | "info-strip-bottom"
  | "newsroom-grid" | "archive-cards" | "news-wall-qr" | "news-digest-list";
type NewsFullscreenTemplateId = NewsRotateTemplateId | NewsTogetherTemplateId;

type TimeConfig = {
  overlay: boolean;
  position: Position;
  style: TimeStyleId;
  layout: "vertical" | "horizontal" | "rotate";
  fullscreenStyle?: TimeFullscreenTemplateId; // ausente = chip repetido (comportamento antigo)
  clocks: {
    id: string;
    label: string;
    format: "12h" | "24h";
    location?: { name: string; country: string; lat: number; lon: number; timezone?: string };
  }[];
};

type WeatherConfig = {
  overlay: boolean;
  position: Position;
  style: WeatherStyleId;
  layout: "vertical" | "horizontal" | "rotate";
  fullscreenStyle?: WeatherFullscreenTemplateId;
  locations: {
    id: string;
    label: string;
    location?: { name: string; country: string; lat: number; lon: number };
    unit?: "C" | "F"; // padrão "C"
  }[];
};

type NewsConfig = {
  overlay: boolean;
  style?: NewsOverlayStyleId;             // só overlay; ausente = visual fixo por fonte
  fullscreenStyle?: NewsFullscreenTemplateId; // só tela cheia; ausente = visual fixo por fonte
  interval?: number;                       // só overlay; SHOW_MS real = interval * 2000
  news: Record<string, string[]>;          // nome da fonte -> URLs de feed RSS
};
```

---

## 11. Endpoints usados (pra saber o que o app RN precisa chamar)

| Endpoint | Uso |
|---|---|
| `GET /api/player/weather?lat=&lon=&unit=C\|F` | Retorna `{ temperature: number \| null, unit: "C" \| "F", weathercode: number \| null, isDay: boolean }` pra uma coordenada. `weathercode` e `isDay` são novos — usados pra escolher o ícone dinâmico (§6.1). |
| `GET /api/player/geocoding?q=<texto>` | Autocomplete de cidade (usado só no dashboard/formulário, não no player em si) — retorna `{ results: [{ name, country, lat, lon }] }`. |
| `POST /api/rss` (modo overlay, via `NewsOverlay`) / `GET /api/rss?url=&source=` (modo tela cheia, via `News`) | Busca e normaliza itens de um feed RSS pra `{ title, description, link, image?, source }`. |

O app RN pode reusar esses mesmos endpoints (se tiver acesso à mesma API Next.js) em vez de reimplementar geocoding/RSS/clima do zero.

---

## 12. Decisões de design e inconsistências conhecidas

- `interfaces/Medias.ts` define `MediaType` com `"weather"`, mas o valor real salvo no banco e usado em todo o resto do código é `"temperature"`. Use `"temperature"`.
- `"google-sheets"` aparece na UI de seleção de tipo mas não existe no enum do Postgres (`type_playlist_item`) — **não é uma feature funcional hoje**.
- `"stock"` existe no enum do banco mas não tem nenhuma UI, formulário ou renderização — reservado/não implementado.
- O rótulo do campo "Notícias → intervalo" na UI não deixa claro que o valor é multiplicado por 2000 (não 1000) pra virar milissegundos — ao portar, decida se replica esse comportamento (compatibilidade com playlists já configuradas) ou corrige o cálculo (ver `NewsOverlay.tsx`, constante `SHOW_MS`).
- **Estilos avaliados e recusados** na revisão de design (não implementar sem alinhar de novo): `orbit`, `analog-tech`, `analog-dark` (relógio), `wave` (clima), `sticker-round`, `underline-only`, `split-icon-value` (chip genérico), `news-badge-duo` (overlay de notícia). Os componentes desses (`OrbitClock.tsx`, `WaveWeather.tsx`) foram removidos do código — não ficaram como dead code.
- **Bug corrigido de brinde:** a versão antiga de `TimeNotOverlay.tsx` tinha um `case "analog-neon"` duplicado (dois blocos idênticos no mesmo switch — só o primeiro nunca era alcançado). Não existe mais porque o switch inteiro foi substituído pelo registro de componentes (§9).
