/* Tela de carregamento — progresso REAL, igual em desktop, tablet e celular.
   Aguarda o que o primeiro contato com o site realmente precisa:
     estrutura da página, fontes, imagem de capa, o vídeo do hero (até poder tocar) e o "load" da página.
   O progresso exibido é a soma do que de fato já chegou, limitado por um tempo mínimo de exibição (MIN_SHOW)
   que vale para TODOS os dispositivos: em computadores com rede rápida o carregamento real termina em
   milissegundos e, sem esse mínimo, a tela piscaria e ninguém a veria.
   Salvaguarda: some sozinha após MAX_WAIT, mesmo que algum recurso nunca responda.
   Pré-visualização do design (opcional): abra o site com  ?loader=preview  para segurar a tela por mais
   tempo e revisar a animação. */
(function () {
  var MAX_WAIT = 8000;          /* limite de segurança (ms) */
  var MIN_SHOW = 3000;          /* tempo mínimo de exibição em qualquer tela (ms) */
  var PREVIEW_HOLD = 3500;      /* só usado com ?loader=preview */
  var root = document.documentElement, L = document.getElementById("loader");
  function release() { root.classList.remove("is-loading"); }
  if (!L) { release(); return; }

  var bar = L.querySelector(".loader__bar i"), pct = L.querySelector(".loader__pct");
  var preview = /[?&]loader=preview\b/.test(location.search);
  var started = Date.now();
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion:reduce)").matches;
  if (reduce) MIN_SHOW = 700;   /* quem prefere menos movimento vê uma exibição mais curta */

  /* pesos (somam 100) e pontuação atual de cada etapa, de 0 a 1 */
  var W = { dom: 8, fonts: 17, poster: 10, video: 50, load: 15 };
  var S = { dom: 0, fonts: 0, poster: 0, video: 0, load: 0 };
  var finished = false, shown = 0;

  function total() { var t = 0; for (var k in W) t += W[k] * S[k]; return t; }
  function elapsed() { return Date.now() - started; }
  /* progresso mostrado = o que já carregou, sem passar do ritmo do tempo mínimo (sobe de forma contínua) */
  function shownTarget() { return Math.min(total(), Math.min(100, elapsed() / MIN_SHOW * 100)); }
  function tick() {
    if (finished) return;
    paint(shownTarget());
    if (total() >= 99.9 && elapsed() >= MIN_SHOW) finish();
    else requestAnimationFrame(tick);
  }
  function paint(p) {
    p = Math.max(shown, Math.min(100, p)); shown = p;       /* nunca anda para trás */
    if (bar) bar.style.transform = "scaleX(" + p / 100 + ")";
    if (pct) pct.textContent = Math.round(p);
    L.setAttribute("aria-valuenow", Math.round(p));
  }
  function remove() { if (L.parentNode) L.parentNode.removeChild(L); }
  var forced = false;
  function finish() {
    if (finished) return;
    var minimum = preview ? PREVIEW_HOLD : MIN_SHOW;       /* nunca some antes do tempo mínimo */
    var left = minimum - elapsed();
    if (left > 0 && !forced) { setTimeout(finish, left); return; }
    finished = true;
    paint(100);
    release();                       /* libera a rolagem e inicia a entrada do hero junto da transição */
    L.classList.add("is-done");
    L.setAttribute("aria-hidden", "true");
    setTimeout(remove, 1000);
  }
  function set(k, v) {
    if (finished || v <= S[k]) return;
    S[k] = Math.min(1, v);
  }

  /* 1) estrutura da página */
  if (document.readyState !== "loading") set("dom", 1);
  else document.addEventListener("DOMContentLoaded", function () { set("dom", 1); });

  /* 2) fontes do site (se falharem ou a rede estiver off, segue sem travar) */
  try {
    if (document.fonts && document.fonts.load) {
      var fl = ['500 1em "Cormorant Garamond"', '600 1em "Cormorant Garamond"', '400 1em "Manrope"', '600 1em "Manrope"'], n = 0;
      var ok = function () { n++; set("fonts", n / fl.length); };
      fl.forEach(function (f) { document.fonts.load(f).then(ok, ok); });
    } else set("fonts", 1);
  } catch (e) { set("fonts", 1); }

  /* 3) imagem de capa do hero */
  var src = L.getAttribute("data-poster");
  if (src) {
    var im = new Image();
    im.onload = im.onerror = function () { set("poster", 1); };
    im.src = src;
    if (im.complete) set("poster", 1);
  } else set("poster", 1);

  /* 4) vídeo do hero: acompanha o que já foi baixado e conclui quando pode tocar sem travar */
  function watchVideo() {
    var v = document.querySelector(".hero__video");
    if (!v || reduce || getComputedStyle(v).display === "none") { set("video", 1); return; }
    function upd() {
      if (v.readyState >= 3) { set("video", 1); return; }       /* HAVE_FUTURE_DATA: já pode tocar */
      var d = v.duration, b = 0;
      try { if (v.buffered.length) b = v.buffered.end(v.buffered.length - 1); } catch (e) {}
      if (v.readyState >= 1 && d > 0) {
        var need = Math.min(d, 3);                              /* segundos mínimos para iniciar */
        set("video", 0.15 + 0.8 * Math.min(1, b / need));
      } else if (v.readyState >= 1) set("video", 0.15);
    }
    ["loadedmetadata", "loadeddata", "progress", "canplay", "canplaythrough", "timeupdate"].forEach(function (ev) { v.addEventListener(ev, upd); });
    v.addEventListener("error", function () { set("video", 1); }, true);   /* formato sem suporte: não trava */
    var srcs = v.querySelectorAll("source");
    if (srcs.length) srcs[srcs.length - 1].addEventListener("error", function () { set("video", 1); });
    upd();
  }
  if (document.readyState !== "loading") watchVideo();
  else document.addEventListener("DOMContentLoaded", watchVideo);

  /* 5) página completa (scripts, estilos e imagens restantes) */
  if (document.readyState === "complete") set("load", 1);
  else window.addEventListener("load", function () { set("load", 1); });

  requestAnimationFrame(tick);
  setTimeout(function () { if (total() >= 99.9) finish(); }, MIN_SHOW + 80);   /* aba em segundo plano: rAF pausa */

  /* salvaguardas: nunca prende o visitante */
  setTimeout(function () { forced = true; finish(); }, MAX_WAIT);
  window.addEventListener("pageshow", function (e) { if (e.persisted) { forced = true; finish(); } });
})();
