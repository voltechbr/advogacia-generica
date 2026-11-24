# Template — Landing page de escritório de advocacia

## Como usar
Abra `index.html` no navegador (ou sirva a pasta com `npx serve .`).

## Personalizar
- **Nome, textos, menu, contatos:** `site.config.js`
- **Logomarca:** troque o `<svg class="brand__mark">` em `index.html` por `<img src="assets/img/logo.svg">`
- **Cores e fontes:** variáveis em `:root` no topo de `css/style.css`
- **Vídeo do hero:** `assets/video/hero.mp4` (H.264) e `hero.webm`; poster em `assets/img/hero-poster.jpg`

## Estrutura
index.html · site.config.js · css/style.css · js/main.js · assets/{video,img}

## Fotos
A seção “O Escritório” tem 2 espaços prontos (`.slot`): troque o conteúdo de `.slot__frame` por `<img src="assets/img/...">`. Textos gerais: `about` em `site.config.js`; revise-os para refletir o escritório.

## Áreas de atuação
Textos em `areas` (`site.config.js`). Para adicionar/remover uma área, duplique/apague um `<li class="areas__item ...">` em `index.html` (ajuste os índices `areas.items.N` e o ícone no `<symbol>`). Imagens: coloque `<img src="assets/img/area-civil.jpg" alt="">` dentro de `.card__media` (o motivo gráfico some sozinho; o véu de legibilidade se adapta ao tema do cartão — claro, grafite ou marinho — e a foto ganha zoom suave no hover). Use fotos em proporção ~4:3, de preferência neutras; elas são exibidas em tons de cinza.

## Equipe (Advogados)
Dados em `team` (`site.config.js`): `name`, `role` (cargo), `specialty` e `oab` de cada profissional. Os nomes vêm como campos curtos a personalizar; substitua por dados reais (nome, cargo e número de inscrição na OAB) antes de publicar. Campos vazios (`specialty`, `oab`, `team.note`) não aparecem no site. Os dois primeiros itens são exibidos em destaque (sócios); os demais em cards menores. Para adicionar/remover um profissional, duplique/apague um `<li class="team__item">` em `index.html` e ajuste os índices `team.items.N`.
Fotos: coloque `<img src="assets/img/adv-1.jpg" alt="Nome">` dentro de `.pro__photo` (proporção 4:5); o espaço reservado some sozinho. As fotos aparecem em tons de cinza e ganham cor no hover.

## Atendimento interativo (simulação)
Seção `#atendimento`: conversa simulada em que o visitante escolhe um assunto e recebe uma orientação inicial. **Nada é enviado** — é apenas um guia de orientação inicial (aviso visível na seção). Textos, assuntos, documentos sugeridos e mensagem pré-preenchida de cada assunto: bloco `chat` em `site.config.js`. O botão final abre o WhatsApp real usando `contact.whatsapp` (formato `55DDDNÚMERO`, só dígitos) — **informe o número real antes de publicar**; enquanto estiver vazio, o botão fica inativo. Para adicionar um assunto, inclua um item em `chat.topics`.

## Perguntas frequentes (FAQ)
Seção `#duvidas`: acordeão acessível (botões com `aria-expanded`, navegação por setas/Home/End, animação suave de altura, opacidade e ícone; respeita `prefers-reduced-motion`). Todo o conteúdo fica no bloco `faq` de `site.config.js`:
- `items`: lista de `{ q, a }` — `q` é a pergunta; `a` é um texto ou uma lista de textos (um parágrafo por item). Para adicionar/remover/reordenar, edite essa lista; a numeração é automática.
- `singleOpen`: `true` abre uma resposta por vez; `false` permite várias abertas.
- `defaultOpen`: índice da pergunta aberta ao carregar (`-1` = todas fechadas).
- `eyebrow`, `heading`, `intro`, `note` e `cta` (título, texto, botão e link) controlam os demais textos da seção.
**As perguntas e respostas são demonstrativas.** Revise-as conforme a rotina real do escritório e as regras de publicidade da OAB (evite promessas de resultado, prazos ou valores que o escritório não possa sustentar). Para tirar a seção do menu, remova o item "Dúvidas" em `nav`.

## Atendimento e contato (unificados)
Não há mais seção de contato nem formulário: o **atendimento interativo** (`#atendimento`) é o ponto principal de contato. O visitante escolhe o assunto e segue para o WhatsApp com a mensagem já preenchida.
Todos os canais ficam em um só bloco, `contact` em `site.config.js`, e são reaproveitados automaticamente:
- `whatsapp` (só dígitos com DDI+DDD, ex.: `5511999999999`) e `whatsappMessage`: botão **“Fale pelo WhatsApp”** do cabeçalho (rótulo/mensagem em `navCta`), botão final do atendimento, atalho “Prefere falar direto?” e link no rodapé. **Sem número, o botão do cabeçalho leva ao atendimento e os demais ficam inativos/ocultos.**
- `instagram` (`"@seuperfil"` ou link completo): ícone no rodapé e atalho no atendimento. Vazio = oculto.
- `phone`, `email`, `address`, `hours`: exibidos no rodapé (viram `tel:`, `mailto:` e link de mapa quando forem dados reais; vazio = não aparece).
Textos do atalho: `chat.directLabel` e `chat.directMessage`. Os botões “Entrar em contato”, “Falar com o escritório” e “Falar sobre este tema” levam ao `#atendimento`.

## Rodapé
Montado automaticamente a partir de `site.config.js`: o menu vem de `nav`, as áreas de `areas.items` e os contatos de `contact`. O bloco `footer` controla o restante:
- `about` (apresentação), títulos das colunas e `backToTop`.
- `social`: redes adicionais (`label`, `icon` — linkedin, facebook, youtube — e `href`; vazio oculta). O Instagram vem de `contact.instagram`.
- `institutional`: razão social, CNPJ, registro na OAB e responsável técnico (**dados demonstrativos**; itens vazios não aparecem).
- `legal`: links opcionais (ex.: política de privacidade). Vazio por padrão.
- `notice` (aviso informativo — revise conforme as normas de publicidade da OAB) e `rights`. O ano do © é atualizado sozinho.
Imagem de fundo: `assets/img/footer-bg.jpg` (desktop, 2000 px) e `assets/img/footer-bg-sm.jpg` (celular, 1000 px), com véu marinho sobre a foto para manter a legibilidade. Para trocar, substitua os dois arquivos (mesmo nome) ou ajuste o enquadramento (`background-position`) e a opacidade do véu em `.footer` no `css/style.css`.
Logomarca: troque o `<svg class="brand__mark">` dentro de `<footer>` em `index.html` (igual à do cabeçalho).

## Cursor personalizado (martelo jurídico)
Arquivos próprios: `css/cursor.css` e `js/cursor.js` (não alteram o resto do site). O martelo acompanha o mouse com suavidade, levanta e fica dourado sobre links e botões e, ao clicar, "bate" com uma pequena onda de impacto.
- **Só em mouse/trackpad:** em celulares e tablets (toque) o cursor nativo é mantido e o martelo nem aparece. Em campos de texto o cursor nativo (I-beam) volta, e `prefers-reduced-motion` remove o golpe e a onda.
- **Tamanho:** variável `--gavel-size` no topo de `css/cursor.css`. **Cores:** classes `.g-head`, `.g-band` e `.g-handle` no mesmo arquivo.
- **Desativar:** remova as linhas `css/cursor.css` e `js/cursor.js` em `index.html`.

## Tela de carregamento
Arquivos: `css/loader.css`, `js/loader.js` e o bloco `<div class="loader">` no início do `<body>` de `index.html`. É uma tela independente (sobreposição em tela cheia), não uma animação dentro da página.
- **Progresso real, sem atraso artificial:** soma o que de fato já chegou — estrutura da página (8%), fontes (17%), imagem de capa (10%), **vídeo do hero até poder tocar (50%, acompanha o que já foi baixado)** e carregamento completo da página (15%). Ao completar, a tela some na hora (transição suave de ~0,7 s) e a entrada do hero começa junto. Não há tempo mínimo de exibição: em conexão rápida ou com o site em cache ela dura pouco; em conexão mais lenta, dura o tempo que o vídeo precisar.
- **Nunca fica presa:** some sozinha em no máximo 8 s (`MAX_WAIT` em `js/loader.js`), com redes de segurança extras em `index.html` (10 s) e `css/loader.css` (11 s). Sem JavaScript ela não é exibida. Com `prefers-reduced-motion` o vídeo não é aguardado e o logotipo não se desenha.
- **Revisar o design:** abra o site com `?loader=preview` no endereço (ex.: `index.html?loader=preview`) para segurar a tela por ~3,5 s. Só funciona com esse parâmetro; visitantes normais nunca veem espera extra.
- **Personalizar:** nome e monograma vêm de `brand` em `site.config.js`; para usar sua logomarca, troque o `<svg class="loader__mark">`. Cores e tempos: `css/loader.css`. Para remover: apague o bloco `.loader`, o `<script src="js/loader.js">`, o `<link>` do `loader.css` e o script de `is-loading` em `index.html`.

## Campos de personalização (checklist antes de publicar)
Nomes, credenciais e contatos são campos curtos em `site.config.js`; campos vazios não aparecem no site:

- `brand`: "Nome do Escritório", sufixo e monograma ("NE") — troque pelo nome real.
- `team.items`: nome, cargo, área (`specialty`) e registro (`oab`) de cada profissional.
- `contact`: WhatsApp e Instagram, telefone, e-mail, endereço e horário (vazios por padrão). Sem WhatsApp, o botão do cabeçalho leva ao atendimento e o botão final do guia fica inativo.
- `footer.institutional`: razão social, CNPJ, OAB e responsável técnico. `footer.social`: informe `href` para exibir cada rede (vazio = oculta).
- `hero.identity`: acrescente a cidade/UF, se desejar. Revise também `<title>` em `index.html` e as respostas do FAQ conforme a rotina do escritório e as regras de publicidade da OAB.

## Rodapé compacto e versão mobile
- O rodapé foi compactado (cerca de 500 px de altura no desktop) mantendo a imagem de fundo; a imagem e o véu continuam editáveis em `.footer` no `css/style.css`.
- Os ajustes para celular ficam no fim de `css/style.css`, no bloco “Refinos mobile” (pontos de quebra: 960, 640 e 380 px). Testado em 360, 390, 768, 1024 e 1440 px, sem rolagem horizontal.

## Mobile e favicon
- **Mobile (até 640 px):** os ajustes ficam no final de `css/style.css` (blocos "AJUSTES MOBILE"); não afetam o desktop. Fotos em faixas largas, cards de áreas e equipe compactos (equipe em linhas), etapas do atendimento em 3 colunas e espaçamentos reduzidos. Testado em 320, 360, 390 e 414 px, sem rolagem horizontal.
- **Favicon:** símbolo "§" dourado sobre azul-marinho, independente do nome do escritório. Arquivos na raiz: `favicon.svg` (principal), `favicon.ico`, `favicon-16x16.png`, `favicon-32x32.png`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png` e `site.webmanifest`. Para trocar, substitua esses arquivos (mesmos nomes); os `<link>` estão no `<head>` do `index.html`.

## Tela de carregamento em todos os dispositivos
`js/loader.js` agora tem tempo mínimo de exibição (`MIN_SHOW`, 3 s) igual para desktop, tablet e celular. Antes, em computadores com rede rápida ou cache, o carregamento real terminava em milissegundos e a tela sumia antes de ser vista. O progresso continua refletindo o que realmente carregou, mas sobe de forma contínua; o limite de segurança (`MAX_WAIT`, 8 s) continua valendo. Quem usa "reduzir movimento" vê uma exibição mais curta (0,7 s). Para revisar o design por mais tempo, abra o site com `?loader=preview`.
