(function () {
  var S = window.SITE || {};
  /* Contatos só viram link quando são dados reais (campos demonstrativos ficam como texto) */
  var onlyDigits = function (v) { return String(v || "").replace(/\D/g, ""); };
  var validWa = function (v) { return onlyDigits(v).length >= 12; };
  var validPhone = function (v) { return onlyDigits(v).length >= 10; };
  var validEmail = function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v || "").trim()); };
  var realAddress = function (v) { return !!v && !/^seu\b/i.test(String(v).trim()); };
  function disableLink(a) { a.removeAttribute("href"); a.removeAttribute("target"); a.setAttribute("aria-disabled", "true"); a.classList.add("is-disabled"); a.title = "WhatsApp indisponível no momento"; }
  var get = function (p) { return p.split(".").reduce(function (o, k) { return o && o[k]; }, S); };

  /* Preenche textos a partir de site.config.js */
  document.querySelectorAll("[data-bind]").forEach(function (el) {
    var v = get(el.dataset.bind); if (v) el.textContent = v;
  });
  /* Campos vazios não aparecem */
  document.querySelectorAll(".team__note,.pro__spec,.pro__oab").forEach(function (el) {
    if (!el.textContent.replace(/Registro/, "").trim()) el.hidden = true;
  });
  if (S.brand) document.title = S.brand.name + " " + (S.brand.suffix || "");

  /* Revelação suave ao entrar na tela */
  var rv = [].slice.call(document.querySelectorAll(".reveal,.rule"));
  if ("IntersectionObserver" in window) {
    var ro = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); ro.unobserve(e.target); } });
    }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
    rv.forEach(function (el) { ro.observe(el); });
  } else { rv.forEach(function (el) { el.classList.add("is-in"); }); }

  var list = document.getElementById("navList");
  (S.nav || []).forEach(function (i) {
    var li = document.createElement("li"), a = document.createElement("a");
    a.href = i.href; a.textContent = i.label; li.appendChild(a); list.appendChild(li);
  });
  function link(id, o) { var a = document.getElementById(id); if (a && o) { a.textContent = o.label; a.href = o.href; } }
  link("heroPrimary", S.hero && S.hero.primary);
  link("heroSecondary", S.hero && S.hero.secondary);
  link("areasCta", S.areas && S.areas.cta);
  link("faqCta", S.faq && S.faq.cta);

  /* Cartões (áreas e advogados): brilho que acompanha o cursor */
  document.querySelectorAll(".card,.pro").forEach(function (c) {
    c.addEventListener("pointermove", function (e) {
      var r = c.getBoundingClientRect();
      c.style.setProperty("--mx", (e.clientX - r.left) + "px");
      c.style.setProperty("--my", (e.clientY - r.top) + "px");
    });
  });

  /* Atendimento interativo: conversa local, nada é enviado */
  (function () {
    var C = S.chat, body = document.getElementById("chatBody"), box = document.getElementById("chatChoices");
    if (!C || !body || !box) return;
    var reduce = window.matchMedia("(prefers-reduced-motion:reduce)").matches;
    var wait = function (ms) { return reduce ? 40 : ms; };
    var token = 0, started = false, busy = false;

    var steps = document.getElementById("chatSteps");
    (C.steps || []).forEach(function (t) { var li = document.createElement("li"); li.textContent = t; steps.appendChild(li); });

    function el(tag, cls, txt) { var n = document.createElement(tag); if (cls) n.className = cls; if (txt) n.textContent = txt; return n; }
    function toEnd() { requestAnimationFrame(function () { body.scrollTo({ top: body.scrollHeight, behavior: reduce ? "auto" : "smooth" }); }); }
    function add(node) { body.appendChild(node); toEnd(); return node; }
    function typing() { var t = el("div", "msg msg--bot msg--typing"); t.setAttribute("aria-hidden", "true"); for (var i = 0; i < 3; i++) t.appendChild(el("i")); return add(t); }
    function bot(build, t) {
      var my = token, ty = typing();
      return new Promise(function (res) {
        setTimeout(function () {
          if (my !== token) return;
          ty.remove();
          var m = el("div", "msg msg--bot"); build(m); add(m); res();
        }, wait(t || 900));
      });
    }
    function text(s) { return function (m) { m.appendChild(el("p", "", s)); }; }
    function choices(list, ghost) {
      box.innerHTML = "";
      list.forEach(function (o, i) {
        var b = el("button", "chip" + (ghost ? " chip--ghost" : ""), o.label);
        b.type = "button"; b.style.animationDelay = (i * 60) + "ms";
        b.addEventListener("click", o.fn); box.appendChild(b);
      });
      toEnd();
    }
    function menu() {
      choices(C.topics.map(function (tp) { return { label: tp.label, fn: function () { pick(tp); } }; }));
    }
    function pick(tp) {
      if (busy) return; busy = true; box.innerHTML = "";
      var u = el("div", "msg msg--user", tp.label); add(u);
      var my = token;
      bot(text(tp.reply), 1000).then(function () {
        return bot(function (m) {
          m.appendChild(el("h4", "", C.docsLabel));
          var ul = el("ul"); tp.docs.forEach(function (d) { ul.appendChild(el("li", "", d)); }); m.appendChild(ul);
        }, 800);
      }).then(function () {
        if (my !== token) return;
        var m = el("div", "msg msg--bot msg--cta");
        m.appendChild(el("p", "", C.nextLabel).cloneNode(true));
        var num = (S.contact && S.contact.whatsapp) || "";
        var a = el("a", "btn btn--wa"); a.target = "_blank"; a.rel = "noopener noreferrer";
        if (validWa(num)) a.href = waUrl(tp.wa); else disableLink(a);
        a.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 1.8a8.2 8.2 0 1 1-4.2 15.3l-.3-.2-2.9.8.8-2.8-.2-.3A8.2 8.2 0 0 1 12 3.8zM8.6 7.4c-.2 0-.5.1-.7.4-.2.3-.9.9-.9 2.2s.9 2.5 1.1 2.7c.1.2 1.8 2.9 4.5 4 2.2.9 2.7.7 3.2.7.5-.1 1.6-.7 1.8-1.3.2-.6.2-1.2.2-1.3-.1-.1-.2-.2-.5-.3l-1.7-.8c-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1-.3-.1-1.1-.4-2-1.3-.8-.7-1.3-1.5-1.4-1.8-.1-.3 0-.4.1-.5l.4-.5c.1-.1.2-.3.2-.4.1-.2 0-.3 0-.5l-.8-1.9c-.2-.5-.4-.4-.6-.4z"/></svg>';
        a.appendChild(document.createTextNode(C.whatsappLabel));
        m.appendChild(a);
        m.appendChild(el("small", "", C.whatsappNote));
        add(m); busy = false;
        choices([{ label: C.restartLabel, fn: restart }], true);
      });
    }
    function restart() {
      token++; busy = false; body.innerHTML = ""; box.innerHTML = ""; start();
    }
    function start() {
      var my = token, p = Promise.resolve();
      C.greeting.forEach(function (g, i) { p = p.then(function () { return my === token ? bot(text(g), i ? 800 : 700) : null; }); });
      p.then(function () { if (my === token) menu(); });
    }
    var win = document.querySelector(".chat__window");
    function go() { if (!started) { started = true; start(); } }
    if ("IntersectionObserver" in window) {
      var so = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { go(); so.disconnect(); } }, { threshold: 0.35 });
      so.observe(win);
    } else go();
  })();

  /* FAQ: acordeão acessível, gerado a partir de site.config.js (faq.items) */
  (function () {
    var F = S.faq, host = document.getElementById("faqList");
    if (!F || !host || !F.items) return;
    var items = [];

    function mk(tag, cls, txt) { var n = document.createElement(tag); if (cls) n.className = cls; if (txt) n.textContent = txt; return n; }

    function setOpen(it, open) {
      it.open = open;
      it.root.classList.toggle("is-open", open);
      it.btn.setAttribute("aria-expanded", open ? "true" : "false");
    }
    function toggle(it) {
      var next = !it.open;
      if (next && F.singleOpen !== false) items.forEach(function (o) { if (o !== it && o.open) setOpen(o, false); });
      setOpen(it, next);
    }

    F.items.forEach(function (d, i) {
      var id = "faq-" + i;
      var root = mk("div", "faq__item");
      var h = mk("h3", "faq__q");
      var btn = mk("button", "faq__btn");
      btn.type = "button"; btn.id = id + "-q";
      btn.setAttribute("aria-controls", id + "-a");
      btn.setAttribute("aria-expanded", "false");
      btn.appendChild(mk("span", "faq__num", (i < 9 ? "0" : "") + (i + 1)));
      btn.appendChild(mk("span", "faq__text", d.q));
      var ico = mk("span", "faq__icon"); ico.setAttribute("aria-hidden", "true");
      btn.appendChild(ico);
      h.appendChild(btn);

      var panel = mk("div", "faq__panel");
      panel.id = id + "-a"; panel.setAttribute("role", "region"); panel.setAttribute("aria-labelledby", btn.id);
      var clip = mk("div", "faq__clip"), body = mk("div", "faq__body");
      (Array.isArray(d.a) ? d.a : [d.a]).forEach(function (p) { body.appendChild(mk("p", "", p)); });
      clip.appendChild(body); panel.appendChild(clip);

      root.appendChild(h); root.appendChild(panel); host.appendChild(root);
      var it = { root: root, btn: btn, open: false };
      items.push(it);
      btn.addEventListener("click", function () { toggle(it); });
    });

    /* Teclado: setas, Home e End navegam entre as perguntas */
    host.addEventListener("keydown", function (e) {
      var k = e.key; if (["ArrowDown", "ArrowUp", "Home", "End"].indexOf(k) < 0) return;
      var cur = items.map(function (o) { return o.btn; }).indexOf(document.activeElement);
      if (cur < 0) return;
      e.preventDefault();
      var n = k === "Home" ? 0 : k === "End" ? items.length - 1 : (cur + (k === "ArrowDown" ? 1 : -1) + items.length) % items.length;
      items[n].btn.focus();
    });

    var d0 = typeof F.defaultOpen === "number" ? F.defaultOpen : 0;
    if (items[d0]) setOpen(items[d0], true);
  })();

  /* Canais de contato (WhatsApp e Instagram): fonte única em "contact" no site.config.js.
     Cabeçalho, atendimento e rodapé usam os mesmos dados. Campos vazios ou demonstrativos não viram link. */
  var K0 = S.contact || {};
  function waUrl(text) { return "https://wa.me/" + onlyDigits(K0.whatsapp) + (text ? "?text=" + encodeURIComponent(text) : ""); }
  function igUrl() {
    var v = String(K0.instagram || "").trim();
    if (!v) return "";
    if (/^https?:\/\//i.test(v)) return v;
    var u = v.replace(/^@/, "").replace(/^(www\.)?instagram\.com\//i, "").replace(/\/+$/, "");
    return /^[A-Za-z0-9._]{1,30}$/.test(u) ? "https://www.instagram.com/" + u : "";
  }
  var WA_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 1.8a8.2 8.2 0 1 1-4.2 15.3l-.3-.2-2.9.8.8-2.8-.2-.3A8.2 8.2 0 0 1 12 3.8zM8.6 7.4c-.2 0-.5.1-.7.4-.2.3-.9.9-.9 2.2s.9 2.5 1.1 2.7c.1.2 1.8 2.9 4.5 4 2.2.9 2.7.7 3.2.7.5-.1 1.6-.7 1.8-1.3.2-.6.2-1.2.2-1.3-.1-.1-.2-.2-.5-.3l-1.7-.8c-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1-.3-.1-1.1-.4-2-1.3-.8-.7-1.3-1.5-1.4-1.8-.1-.3 0-.4.1-.5l.4-.5c.1-.1.2-.3.2-.4.1-.2 0-.3 0-.5l-.8-1.9c-.2-.5-.4-.4-.6-.4z"/></svg>';
  var IG_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r=".7" fill="currentColor"/></svg>';

  /* Botão do cabeçalho: abre o WhatsApp; sem número configurado, leva ao atendimento interativo */
  (function () {
    var b = document.getElementById("navCta"), N = S.navCta || {};
    if (!b) return;
    if (N.label) { var sp = b.querySelector("span"); if (sp) sp.textContent = N.label; }
    if (validWa(K0.whatsapp)) { b.href = waUrl(N.message || ""); }
    else { b.href = "#atendimento"; b.removeAttribute("target"); b.removeAttribute("rel"); }
  })();

  /* Atendimento: canais diretos (aparecem só quando configurados) */
  (function () {
    var box = document.getElementById("chatDirect"), C = S.chat || {};
    if (!box) return;
    function add(href, icon, label) {
      var a = document.createElement("a"); a.href = href; a.target = "_blank"; a.rel = "noopener noreferrer";
      a.innerHTML = icon; a.appendChild(document.createTextNode(label)); box.appendChild(a);
    }
    if (validWa(K0.whatsapp)) add(waUrl(C.directMessage || ""), WA_ICON, "WhatsApp");
    if (igUrl()) add(igUrl(), IG_ICON, "Instagram");
    if (box.children.length) {
      var p = document.createElement("p"); p.textContent = C.directLabel || "Prefere falar direto?"; box.insertBefore(p, box.firstChild);
      box.hidden = false;
    }
  })();


  /* Rodapé: montado a partir de "footer", "nav", "areas" e "contact" */
  (function () {
    var Fo = S.footer, K = S.contact || {}, root = document.getElementById("footerNav");
    if (!Fo || !root) return;
    function mk(tag, cls, txt) { var n = document.createElement(tag); if (cls) n.className = cls; if (txt) n.textContent = txt; return n; }
    function li(parent, a) { var l = mk("li"); l.appendChild(a); parent.appendChild(l); }
    function lnk(txt, href, ext) { var a = mk("a", "", txt); a.href = href; if (ext) { a.target = "_blank"; a.rel = "noopener noreferrer"; } return a; }
    var digits = function (v) { return String(v || "").replace(/\D/g, ""); };

    (S.nav || []).forEach(function (i) { li(root, lnk(i.label, i.href)); });
    var ar = document.getElementById("footerAreas");
    ((S.areas && S.areas.items) || []).forEach(function (i) { li(ar, lnk(i.title, "#atuacao")); });

    var ct = document.getElementById("footerContact");
    function plain(t) { li(ct, mk("span", "footer__plain", t)); }
    if (K.phone) { if (validPhone(K.phone)) li(ct, lnk(K.phone, "tel:+55" + digits(K.phone).replace(/^55/, ""))); else plain(K.phone); }
    if (validWa(K.whatsapp)) li(ct, lnk("WhatsApp", waUrl(K.whatsappMessage || ""), true));
    if (K.email) { if (validEmail(K.email)) li(ct, lnk(K.email, "mailto:" + K.email)); else plain(K.email); }
    if (K.address) { if (realAddress(K.address)) li(ct, lnk(K.address, "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(K.address), true)); else plain(K.address); }
    if (K.hours) { var h = mk("li", "footer__plain", K.hours); ct.appendChild(h); }
    if (!ct.children.length) li(ct, lnk("Fale com o escritório", "#atendimento"));

    var icons = {
      instagram: '<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r=".7" fill="currentColor"/>',
      linkedin: '<rect x="3.5" y="9" width="3.5" height="11.5"/><circle cx="5.25" cy="5.3" r="1.7"/><path d="M10.5 20.5V9h3.4v1.8c.7-1.2 2-2 3.6-2 3 0 3.5 2 3.5 4.5v7.2h-3.5v-6.5c0-1.3-.3-2.2-1.6-2.2s-1.9.9-1.9 2.2v6.5z"/>',
      facebook: '<path d="M14 21v-8h2.7l.5-3.2H14V7.8c0-.9.4-1.6 1.7-1.6h1.6V3.3c-.3 0-1.3-.2-2.4-.2-2.5 0-4 1.5-4 4.2v2.5H8v3.2h2.9v8z"/>',
      youtube: '<rect x="2.5" y="6" width="19" height="12" rx="3.5"/><path d="m10 9.5 5 2.5-5 2.5z"/>'
    };
    var so = document.getElementById("footerSocial");
    var nets = (Fo.social || []).slice();
    if (igUrl() && !nets.some(function (n) { return n.icon === "instagram" && n.href; })) nets.unshift({ label: "Instagram", icon: "instagram", href: igUrl() });
    nets.forEach(function (s) {
      if (!s.href) return;
      var a = lnk("", s.href, true); a.setAttribute("aria-label", s.label + " (abre em nova aba)"); a.title = s.label;
      a.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" aria-hidden="true">' + (icons[s.icon] || icons.instagram) + "</svg>";
      so.appendChild(a);
    });

    var inst = document.getElementById("footerInst");
    (Fo.institutional || []).forEach(function (i) {
      if (!i.value) return;
      var d = mk("div"); d.appendChild(mk("small", "", i.label)); d.appendChild(mk("span", "", i.value)); inst.appendChild(d);
    });
    if (!inst.children.length) inst.hidden = true;

    var brand = (S.brand && (S.brand.name + " " + (S.brand.suffix || "")).trim()) || "";
    document.getElementById("footerCopy").textContent = "© " + new Date().getFullYear() + " " + brand + ". " + (Fo.rights || "");
    var lg = document.getElementById("footerLegal");
    (Fo.legal || []).forEach(function (i) { li(lg, lnk(i.label, i.href)); });
    if (!lg.children.length) lg.hidden = true;
    if (Fo.backToTop) document.getElementById("footerTopLabel").textContent = Fo.backToTop;
  })();

  /* Header: fundo ao rolar */
  var header = document.getElementById("header");
  var onScroll = function () { header.classList.toggle("is-scrolled", window.scrollY > 40); };
  onScroll(); window.addEventListener("scroll", onScroll, { passive: true });

  /* Menu mobile */
  var burger = document.getElementById("burger"), nav = document.getElementById("nav"), scrim = document.getElementById("scrim");
  function toggle(open) {
    nav.classList.toggle("is-open", open);
    header.classList.toggle("menu-open", open);
    document.body.classList.toggle("menu-open", open);
    scrim.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", open);
    burger.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
  }
  burger.addEventListener("click", function () { toggle(!nav.classList.contains("is-open")); });
  nav.addEventListener("click", function (e) { if (e.target.closest("a")) toggle(false); });
  scrim.addEventListener("click", function () { toggle(false); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && nav.classList.contains("is-open")) { toggle(false); burger.focus(); }
  });
  window.matchMedia("(min-width:961px)").addEventListener("change", function () { toggle(false); });

  /* Link ativo conforme a seção visível */
  var links = [].slice.call(list.querySelectorAll("a"));
  var map = {};
  links.forEach(function (a) { var t = document.querySelector(a.getAttribute("href")); if (t) map[t.id] = a; });
  function setActive(id) { links.forEach(function (a) { a === map[id] ? a.setAttribute("aria-current", "true") : a.removeAttribute("aria-current"); }); }
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) setActive(e.target.id); });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(map).forEach(function (id) { io.observe(document.getElementById(id)); });
  }

  /* Garante autoplay silencioso em navegadores restritivos */
  var v = document.querySelector(".hero__video");
  if (v) { v.muted = true; var p = v.play(); if (p && p.catch) p.catch(function () {}); }
})();
