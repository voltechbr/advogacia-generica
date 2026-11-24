/* Cursor personalizado — martelo jurídico.
   Só ativa em dispositivos com mouse/trackpad. Em toque, o site mantém o comportamento nativo. */
(function () {
  var fine = window.matchMedia("(hover:hover) and (pointer:fine)");
  var reduce = window.matchMedia("(prefers-reduced-motion:reduce)");
  var root = document.documentElement;
  var HX = 6, HY = 8.5;               /* ponto de contato do martelo (em px do desenho) */
  var LINKS = 'a[href],button,[role="button"],summary,label,select,input[type="checkbox"],input[type="radio"],input[type="submit"],input[type="button"]';
  var TEXT = 'input:not([type="checkbox"]):not([type="radio"]):not([type="submit"]):not([type="button"]),textarea';

  var el, body, on = false, shown = false;
  var x = -100, y = -100, cx = -100, cy = -100, raf = 0, last = 0;

  var SVG = '<svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">' +
    '<rect class="g-handle" x="14" y="12" width="4" height="17" rx="2"/>' +
    '<rect class="g-head" x="6" y="4" width="20" height="9" rx="2"/>' +
    '<rect class="g-band" x="9.2" y="4" width="1.8" height="9"/>' +
    '<rect class="g-band" x="21" y="4" width="1.8" height="9"/></svg>';

  function build() {
    el = document.createElement("div");
    el.className = "gavel"; el.setAttribute("aria-hidden", "true");
    el.innerHTML = '<div class="gavel__body">' + SVG + "</div>";
    body = el.firstChild;
    document.body.appendChild(el);
  }

  function place() { el.style.transform = "translate3d(" + (cx - HX) + "px," + (cy - HY) + "px,0)"; }

  function loop(t) {
    var dt = Math.min(48, t - (last || t)); last = t;
    var k = reduce.matches ? 1 : 1 - Math.exp(-dt / 22);   /* acompanha rápido, com suavidade leve */
    cx += (x - cx) * k; cy += (y - cy) * k;
    if (Math.abs(x - cx) < 0.1 && Math.abs(y - cy) < 0.1) { cx = x; cy = y; place(); raf = 0; last = 0; return; }
    place(); raf = requestAnimationFrame(loop);
  }
  function kick() { if (!raf) raf = requestAnimationFrame(loop); }

  function show(v) { shown = v; el.classList.toggle("is-visible", v); }

  function onMove(e) {
    if (e.pointerType === "touch") return;
    x = e.clientX; y = e.clientY;
    if (!shown) { cx = x; cy = y; place(); show(true); }
    kick();
  }
  function onOver(e) {
    if (e.pointerType === "touch") return;
    var t = e.target.closest ? e.target : e.target.parentElement;
    if (!t) return;
    var isText = !!t.closest(TEXT);
    var link = !isText && t.closest(LINKS);
    if (link && link.disabled) link = null;
    el.classList.toggle("is-text", isText);
    el.classList.toggle("is-link", !!link);
  }
  function onDown(e) {
    if (e.pointerType === "touch" || e.button > 0) return;
    if (e.target.closest && e.target.closest(TEXT)) return;
    if (!reduce.matches) {
      body.classList.remove("is-strike"); void body.offsetWidth; body.classList.add("is-strike");
      var r = document.createElement("div");
      r.className = "gavel-ring";
      r.style.setProperty("--pos", "translate3d(" + e.clientX + "px," + e.clientY + "px,0)");
      r.addEventListener("animationend", function () { r.remove(); });
      document.body.appendChild(r);
    }
  }
  function onLeave() { if (el) show(false); }
  function onEnter() { if (el && x > -100) show(true); }

  function enable() {
    if (on) return; on = true;
    if (!el) build();
    root.classList.add("has-gavel");
    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    document.addEventListener("pointerdown", onDown, { passive: true });
    root.addEventListener("mouseleave", onLeave);
    root.addEventListener("mouseenter", onEnter);
  }
  function disable() {
    if (!on) return; on = false;
    root.classList.remove("has-gavel");
    document.removeEventListener("pointermove", onMove);
    document.removeEventListener("pointerover", onOver);
    document.removeEventListener("pointerdown", onDown);
    root.removeEventListener("mouseleave", onLeave);
    root.removeEventListener("mouseenter", onEnter);
    if (raf) { cancelAnimationFrame(raf); raf = 0; }
    if (el) { show(false); }
  }
  function sync() { fine.matches ? enable() : disable(); }

  function init() { sync(); (fine.addEventListener ? fine.addEventListener("change", sync) : fine.addListener(sync)); }
  if (document.body) init(); else document.addEventListener("DOMContentLoaded", init);
})();
