/* salon-ui.js — contacto del salón en TODAS las páginas: mapa en pantalla, WhatsApp, compartir dirección y pie.
   Los datos (nombre, WhatsApp, dirección, link de Maps) salen del panel (Ajustes) a través de tema.js → TEMA.salonDatos(). */
(function () {
  var T = window.TEMA || {}, D = function () { return T.salonDatos ? T.salonDatos() : { nombre: 'Planeta Niños', wa: '', tel: '', dir: '', maps: '', embed: '' }; };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var RE_MAPS = /^https?:\/\/((www\.)?google\.[a-z.]+\/maps|maps\.google\.[a-z.]+|maps\.app\.goo\.gl|goo\.gl\/maps)/i;
  var pagina = (location.pathname.split('/').pop() || 'index').replace(/\.html$/, '') || 'index';
  var sub = /^(planes|galeria)$/.test(pagina);

  var css = document.createElement('style');
  css.textContent = [
    '.pn-bar{position:fixed;left:50%;bottom:calc(14px + env(safe-area-inset-bottom));transform:translateX(-50%);z-index:60;display:flex;gap:4px;padding:5px;border-radius:999px;background:rgba(18,14,28,.82);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);box-shadow:0 14px 34px -14px rgba(0,0,0,.7)}',
    '.pn-bar a,.pn-bar button{all:unset;box-sizing:border-box;cursor:pointer;display:flex;align-items:center;gap:8px;padding:11px 18px;border-radius:999px;color:#fff;font:700 .86rem/1 Montserrat,system-ui,sans-serif;white-space:nowrap;-webkit-tap-highlight-color:transparent}',
    '.pn-bar a:hover,.pn-bar button:hover{background:rgba(255,255,255,.12)}.pn-bar svg{width:20px;height:20px;flex:none}',
    '.pn-bar :focus-visible,.pn-mp :focus-visible{outline:3px solid #ffd23f;outline-offset:2px}',
    'body.pn-conbar{padding-bottom:calc(84px + env(safe-area-inset-bottom))}',
    '.pn-mp{position:fixed;inset:0;z-index:2147483100;display:flex;align-items:flex-end;justify-content:center;background:rgba(8,10,8,.62);opacity:0;transition:opacity .25s;font-family:Montserrat,system-ui,sans-serif}',
    '.pn-mp.on{opacity:1}',
    '.pn-mp .hoja{width:min(100%,720px);height:min(88vh,680px);display:flex;flex-direction:column;border-radius:26px 26px 0 0;background:rgba(22,16,34,.96);color:#fff;box-shadow:0 -20px 60px -20px rgba(0,0,0,.7);transform:translateY(40px);transition:transform .3s cubic-bezier(.2,.8,.2,1);overflow:hidden}',
    '.pn-mp.on .hoja{transform:none}',
    '@media(min-width:760px){.pn-mp{align-items:center}.pn-mp .hoja{height:min(80vh,640px);border-radius:26px}}',
    '.pn-mp header{display:flex;align-items:center;gap:12px;padding:16px 18px 12px}',
    '.pn-mp header div{flex:1;min-width:0}.pn-mp h2{margin:0;font:800 1.05rem/1.2 Montserrat,system-ui,sans-serif}',
    '.pn-mp header p{margin:3px 0 0;font-size:.82rem;font-weight:400;opacity:.8;line-height:1.35}',
    '.pn-mp .x{all:unset;cursor:pointer;flex:none;width:42px;height:42px;border-radius:50%;display:grid;place-items:center;background:rgba(255,255,255,.12);font-size:1.5rem;line-height:1}',
    '.pn-mp .x:hover{background:rgba(255,255,255,.2)}',
    '.pn-mp iframe{flex:1;width:100%;border:0;background:#2a2538;min-height:0}',
    '.pn-mp .acc{display:flex;gap:10px;padding:14px 18px calc(16px + env(safe-area-inset-bottom))}',
    '.pn-mp .acc a,.pn-mp .acc button{all:unset;box-sizing:border-box;cursor:pointer;flex:1;text-align:center;padding:14px 10px;border-radius:999px;font:800 .86rem/1.1 Montserrat,system-ui,sans-serif;background:rgba(255,255,255,.14);color:#fff}',
    '.pn-mp .acc a.pr{background:var(--pn-col,#5db046);color:#0d1f0a}',
    '.pn-mp .acc a:hover,.pn-mp .acc button:hover{filter:brightness(1.12)}',
    '.pn-toast{position:fixed;left:50%;bottom:calc(96px + env(safe-area-inset-bottom));transform:translateX(-50%);z-index:2147483200;padding:11px 18px;border-radius:999px;background:rgba(18,14,28,.94);color:#fff;font:700 .84rem/1.2 Montserrat,system-ui,sans-serif;box-shadow:0 12px 30px -12px rgba(0,0,0,.7)}',
    '.pn-pie{padding:30px 20px calc(30px + env(safe-area-inset-bottom));text-align:center;font:400 .85rem/1.6 Montserrat,system-ui,sans-serif;opacity:.9}',
    '.pn-pie b{font-weight:800}.pn-pie a,.pn-pie button{all:unset;cursor:pointer;text-decoration:underline;text-underline-offset:3px}',
    '.pn-pie .sep{opacity:.5;margin:0 .35em}',
    '@media(prefers-reduced-motion:reduce){.pn-mp,.pn-mp .hoja{transition:none}}'
  ].join('');
  document.head.appendChild(css);

  function toast(t) {
    var e = document.querySelector('.pn-toast'); if (e) e.remove();
    e = document.createElement('div'); e.className = 'pn-toast'; e.setAttribute('role', 'status'); e.textContent = t; document.body.appendChild(e);
    setTimeout(function () { if (e.parentNode) e.remove(); }, 2600);
  }
  function compartir() {
    var d = D(), texto = d.nombre + '\n' + d.dir + '\n' + d.maps;
    if (navigator.share) { navigator.share({ title: d.nombre, text: d.nombre + ' · ' + d.dir, url: d.maps }).catch(function () {}); return; }
    var ok = function () { toast('Dirección copiada'); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(texto).then(ok, function () { window.open('https://wa.me/?text=' + encodeURIComponent(texto), '_blank', 'noopener'); });
    else window.open('https://wa.me/?text=' + encodeURIComponent(texto), '_blank', 'noopener');
  }

  var mp = null, volvio = false, prevFoco = null;
  function cerrarMapa(porHistoria) {
    if (!mp) return;
    var m = mp; mp = null; m.classList.remove('on'); document.documentElement.style.overflow = m._ov || '';
    setTimeout(function () { if (m.parentNode) m.remove(); }, 260);
    if (!porHistoria && history.state && history.state.pnmapa) { volvio = true; history.back(); }
    if (prevFoco && prevFoco.focus) try { prevFoco.focus(); } catch (e) {}
  }
  function abrirMapa() {
    var d = D(); if (mp) return;
    if (!d.dir && !d.maps) { toast('Todavía no cargamos la dirección'); return; }
    prevFoco = document.activeElement;
    mp = document.createElement('div'); mp.className = 'pn-mp'; mp.setAttribute('role', 'dialog'); mp.setAttribute('aria-modal', 'true'); mp.setAttribute('aria-label', 'Mapa de ' + d.nombre);
    if (T.color) mp.style.setProperty('--pn-col', '#' + String(T.color).replace(/^#/, ''));
    mp.innerHTML = '<div class="hoja"><header><div><h2>' + esc(d.nombre) + '</h2><p>' + esc(d.dir) + '</p></div><button type="button" class="x" aria-label="Cerrar el mapa">×</button></header>' +
      '<iframe title="Mapa: ' + esc(d.dir) + '" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="' + esc(d.embed) + '"></iframe>' +
      '<div class="acc"><a class="pr" href="' + esc(d.maps) + '" target="_blank" rel="noopener" data-pn-fuera="1">Ver en Google Maps</a><button type="button" class="comp">Compartir dirección</button></div></div>';
    document.body.appendChild(mp); mp._ov = document.documentElement.style.overflow; document.documentElement.style.overflow = 'hidden';
    requestAnimationFrame(function () { mp && mp.classList.add('on'); });
    mp.querySelector('.x').onclick = function () { cerrarMapa(); };
    mp.querySelector('.comp').onclick = compartir;
    mp.addEventListener('click', function (e) { if (e.target === mp) cerrarMapa(); });
    try { history.pushState({ pnmapa: 1 }, '', location.href); } catch (e) {}
    setTimeout(function () { var x = mp && mp.querySelector('.x'); if (x) x.focus(); }, 60);
  }
  window.addEventListener('popstate', function () { if (mp) cerrarMapa(true); volvio = false; });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && mp) { e.preventDefault(); cerrarMapa(); } });
  T.abrirMapa = abrirMapa; T.compartirDireccion = compartir;

  /* cualquier enlace o botón del sitio que iba a Google Maps abre el mapa acá mismo */
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]'); if (!a || a.getAttribute('data-pn-fuera')) return;
    if (RE_MAPS.test(a.href) || a.getAttribute('href') === '#mapa') { e.preventDefault(); e.stopImmediatePropagation(); abrirMapa(); }
  }, true);
  var abrirOrig = window.open;
  window.open = function (u) { if (typeof u === 'string' && RE_MAPS.test(u)) { abrirMapa(); return null; } return abrirOrig.apply(window, arguments); };

  /* barra de contacto + pie en las páginas internas */
  var ICO_WA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#25d366" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2z"/><path fill="#fff" d="M16.6 14.2c-.2-.1-1.4-.7-1.600-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1-.8-.4-1.700-.9-2.600-2-.3-.4-.5-.7-.7-1.200-.1-.2 0-.3.1-.4l.4-.5c.1-.1.100-.3.200-.4 0-.1 0-.3 0-.4l-.8-1.800c-.2-.5-.4-.4-.6-.4h-.4c-.2 0-.4.1-.6.3-.7.700-1 1.500-.9 2.400.2 1 .7 2 1.700 3.200 1.300 1.500 2.800 2.400 4.300 2.800.9.2 1.500.2 2 0 .5-.2 1.200-.7 1.300-1.300.1-.5.1-1 0-1.100z"/></svg>';
  var ICO_PIN = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#ff6b5e" d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.800 7-13a7 7 0 0 0-7-7z"/><circle cx="12" cy="9" r="2.600" fill="#fff"/></svg>';
  function waLink(txt) { var d = D(); return d.wa ? 'https://wa.me/' + d.wa + '?text=' + encodeURIComponent(txt || ('¡Hola! Quiero consultar por un festejo en ' + d.nombre + '.')) : ''; }
  function barra() {
    var d = D(), b = document.querySelector('.pn-bar'); if (b) b.remove();
    var w = waLink(); if (!w && !(d.dir || d.maps)) return;
    b = document.createElement('nav'); b.className = 'pn-bar'; b.setAttribute('aria-label', 'Contacto');
    b.innerHTML = (w ? '<a href="' + esc(w) + '" target="_blank" rel="noopener">' + ICO_WA + 'WhatsApp</a>' : '') + (d.dir || d.maps ? '<button type="button" class="mp">' + ICO_PIN + 'Cómo llegar</button>' : '');
    var m = b.querySelector('.mp'); if (m) m.onclick = abrirMapa;
    document.body.appendChild(b); document.body.classList.add('pn-conbar');
  }
  function pie() {
    var d = D(), f = document.querySelector('footer'); if (!f) { f = document.createElement('footer'); document.body.appendChild(f); }
    f.className = (f.className ? f.className + ' ' : '') + 'pn-pie';
    f.innerHTML = '<b>' + esc(d.nombre) + '</b>' + (d.dir ? '<span class="sep">·</span><button type="button" class="dir">' + esc(d.dir) + '</button>' : '') +
      (d.wa ? '<span class="sep">·</span><a href="' + esc(waLink()) + '" target="_blank" rel="noopener">WhatsApp ' + esc(d.tel) + '</a>' : '') +
      (d.dir ? '<br><button type="button" class="comp">Compartir dirección</button>' : '');
    var a = f.querySelector('.dir'); if (a) a.onclick = abrirMapa; var c = f.querySelector('.comp'); if (c) c.onclick = compartir;
  }
  function armar() {
    if (/\/panel\//.test(location.pathname)) return;
    if (sub) { barra(); pie(); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', armar); else armar();
  document.addEventListener('salon', armar);
})();
