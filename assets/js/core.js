/* Expediția memoriei — motorul comun: texte, stare, nivel adaptiv, jurnal, voce, ecrane */
(function () {
  'use strict';
  const EM = (window.EM = window.EM || {});
  const KEY = 'expeditia-memoriei-v1';

  /* ---------- limbă ---------- */
  EM.lang = 'ro';
  EM.t = function (k, vars) {
    const L = window.I18N[EM.lang] || {};
    let s = L[k] !== undefined ? L[k] : (window.I18N.ro[k] !== undefined ? window.I18N.ro[k] : k);
    if (vars) for (const x in vars) s = s.split('{' + x + '}').join(vars[x]);
    return s;
  };
  EM.nm = (it) => (it ? it[EM.lang] || it.ro : '');

  /* ---------- utilitare ---------- */
  EM.rand = (n) => Math.floor(Math.random() * n);
  EM.pick = (a) => a[EM.rand(a.length)];
  EM.shuffle = (a) => {
    a = a.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = EM.rand(i + 1); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  };
  EM.sample = (a, n) => EM.shuffle(a).slice(0, n);
  EM.h = function (tag, attrs) {
    const el = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      const v = attrs[k];
      if (v === undefined || v === null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'html') el.innerHTML = v;
      else if (k === 'text') el.textContent = v;
      else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
      else el.setAttribute(k, v === true ? '' : v);
    }
    for (let i = 2; i < arguments.length; i++) add(el, arguments[i]);
    return el;
  };
  function add(el, c) {
    if (c === null || c === undefined || c === false) return;
    if (Array.isArray(c)) c.forEach((x) => add(el, x));
    else el.appendChild(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  EM.clear = (el) => { while (el.firstChild) el.removeChild(el.firstChild); return el; };

  /* rulări anulabile: când ieși dintr-un joc, animațiile vechi se opresc singure */
  EM.runId = 0;
  EM.newRun = () => ++EM.runId;
  EM.stale = (tok) => tok !== EM.runId;
  EM.wait = (ms) => new Promise((r) => setTimeout(r, ms));

  /* ---------- salvare ---------- */
  EM.store = {
    data: { student: 'Eva', lang: 'ro', voice: true, sessions: [], levels: {} },
    load() {
      try {
        const s = localStorage.getItem(KEY);
        if (s) Object.assign(this.data, JSON.parse(s));
      } catch (e) { /* fără localStorage: merge în memorie */ }
      if (!Array.isArray(this.data.sessions)) this.data.sessions = [];
      if (!this.data.levels) this.data.levels = {};
    },
    save() { try { localStorage.setItem(KEY, JSON.stringify(this.data)); } catch (e) { /* ignorat */ } }
  };

  const today = () => new Date().toISOString().slice(0, 10);
  EM.session = null;
  EM.findOpenSession = function () {
    const ss = EM.store.data.sessions;
    const last = ss[ss.length - 1];
    if (last && !last.end) {
      if (last.date === today()) return last;
      last.end = last.last || last.start; // o oră uitată deschisă din altă zi se închide singură
      EM.store.save();
    }
    return null;
  };
  EM.startSession = function () {
    const s = { id: Date.now(), date: today(), start: Date.now(), last: Date.now(), end: null,
      games: {}, kimFirst: null, delayed: null, strategies: [], other: '', note: '', plan: {} };
    EM.store.data.sessions.push(s);
    EM.session = s;
    EM.store.save();
    return s;
  };
  EM.ensureSession = () => EM.session || EM.findOpenSession() || EM.startSession();
  EM.prevSession = function () {
    const ss = EM.store.data.sessions;
    const i = ss.indexOf(EM.session);
    for (let k = (i < 0 ? ss.length : i) - 1; k >= 0; k--) if (Object.keys(ss[k].games || {}).length) return ss[k];
    return null;
  };

  /* ---------- nivel adaptiv ----------
     Regula: urci un nivel după 2 reușite la rând, cobori după 2 greșeli la rând.
     Ținta: 70–80% reușite. Ora următoare pornește cu un nivel sub cel atins. */
  EM.CFG = {
    warm: { min: 1, max: 1, def: 1 },
    kim: { min: 1, max: 9, def: 1 },
    spanF: { min: 2, max: 9, def: 3 },
    spanB: { min: 2, max: 8, def: 2 },
    map: { min: 2, max: 9, def: 3 },
    boat: { min: 2, max: 10, def: 3 },
    sw: { min: 1, max: 4, def: 1 },
    k1: { min: 1, max: 3, def: 1 }, k2: { min: 1, max: 3, def: 1 }, k3: { min: 1, max: 3, def: 1 },
    k4: { min: 1, max: 3, def: 1 }, k5: { min: 1, max: 3, def: 1 }
  };
  EM.adapt = {
    rec(g) {
      const s = EM.ensureSession();
      if (!s.games[g]) {
        const c = EM.CFG[g];
        const last = EM.store.data.levels[g];
        let lv = c.def;
        if (last) lv = Math.max(c.min, Math.min(c.max, last - 1));
        s.games[g] = { start: lv, level: lv, max: lv, trials: 0, ok: 0, sOK: 0, sBad: 0, best: 0, hints: 0, hist: [] };
      }
      return s.games[g];
    },
    level(g) { return this.rec(g).level; },
    preview(g) {
      const r = this.peek(g); if (r) return r.level;
      const c = EM.CFG[g], last = EM.store.data.levels[g];
      return last ? Math.max(c.min, Math.min(c.max, last - 1)) : c.def;
    },
    peek(g) { return EM.session && EM.session.games[g] ? EM.session.games[g] : null; },
    record(g, success, val, extra) {
      const r = this.rec(g), c = EM.CFG[g];
      r.trials++;
      r.hist.push(Object.assign({ lv: r.level, ok: !!success, t: Date.now(), v: val }, extra || {}));
      let ev = null;
      if (success) {
        r.ok++; r.sOK++; r.sBad = 0;
        if (val !== undefined && val > r.best) r.best = val;
        if (r.sOK >= 2 && r.level < c.max) { r.level++; r.sOK = 0; ev = 'up'; }
      } else {
        r.sBad++; r.sOK = 0;
        if (r.sBad >= 2 && r.level > c.min) { r.level--; r.sBad = 0; ev = 'down'; }
      }
      r.max = Math.max(r.max, r.level);
      EM.store.data.levels[g] = r.level;
      EM.session.last = Date.now();
      EM.store.save();
      EM.emit('record', g);
      return ev;
    },
    set(g, lv) {
      const r = this.rec(g), c = EM.CFG[g];
      r.level = Math.max(c.min, Math.min(c.max, lv)); r.sOK = 0; r.sBad = 0;
      r.max = Math.max(r.max, r.level);
      EM.store.data.levels[g] = r.level; EM.store.save(); EM.emit('record', g);
    }
  };
  EM.band = function (rate, trials) {
    if (!trials || trials < 3) return { cls: 'b-none', msg: EM.t('band.few') };
    if (rate < 0.6) return { cls: 'b-red', msg: EM.t('band.hard') };
    if (rate < 0.7) return { cls: 'b-yellow', msg: EM.t('band.almost') };
    if (rate <= 0.8) return { cls: 'b-green', msg: EM.t('band.good') };
    if (rate <= 0.9) return { cls: 'b-yellow', msg: EM.t('band.easyish') };
    return { cls: 'b-blue', msg: EM.t('band.easy') };
  };

  /* ---------- evenimente mici ---------- */
  const subs = {};
  EM.on = (ev, fn) => (subs[ev] = subs[ev] || []).push(fn);
  EM.emit = (ev, a) => (subs[ev] || []).forEach((f) => { try { f(a); } catch (e) { console.error(e); } });

  /* ---------- voce ---------- */
  EM.say = function (text, force) {
    if (!(EM.store.data.voice || force) || !('speechSynthesis' in window)) return;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      const want = EM.lang === 'ro' ? 'ro' : 'en';
      u.lang = EM.lang === 'ro' ? 'ro-RO' : 'en-GB';
      const v = speechSynthesis.getVoices().find((x) => x.lang && x.lang.toLowerCase().startsWith(want));
      if (v) u.voice = v;
      u.rate = 0.95;
      speechSynthesis.speak(u);
    } catch (e) { /* ignorat */ }
  };
  EM.readBtn = (getText) => EM.h('button', { class: 'read', title: EM.t('ui.readme'), onclick: (e) => { e.stopPropagation(); EM.say(typeof getText === 'function' ? getText() : getText, true); } }, '🔊');

  /* ---------- mesaje pe ecran ---------- */
  EM.toast = function (msg, kind) {
    const el = EM.h('div', { class: 'toast ' + (kind || '') }, msg);
    document.body.appendChild(el);
    setTimeout(() => el.classList.add('out'), 1900);
    setTimeout(() => el.remove(), 2500);
  };
  EM.burst = function (emoji) {
    const n = 14;
    for (let i = 0; i < n; i++) {
      const el = EM.h('div', { class: 'burst' }, emoji || EM.pick(['⭐', '🍃', '🌸', '🦜', '✨']));
      el.style.left = 50 + (Math.random() * 40 - 20) + 'vw';
      el.style.setProperty('--dx', (Math.random() * 60 - 30) + 'vw');
      el.style.setProperty('--dy', (-30 - Math.random() * 40) + 'vh');
      el.style.animationDelay = Math.random() * 0.2 + 's';
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 1700);
    }
  };
  EM.levelEvent = function (ev, g) {
    if (ev === 'up') { EM.burst(); EM.toast(EM.t('lv.up', { n: EM.adapt.level(g) }), 'good'); EM.say(EM.t('lv.upSay')); }
    if (ev === 'down') EM.toast(EM.t('lv.down', { n: EM.adapt.level(g) }), 'soft');
  };

  /* ---------- bara de stare a jocului (nivel, serie, rată față de ținta 70–80%) ---------- */
  EM.hud = function (g, labelFn) {
    const lvEl = EM.h('b', { class: 'lv' });
    const dots = EM.h('span', { class: 'dots' });
    const rateEl = EM.h('span', { class: 'rate' });
    const marker = EM.h('i', { class: 'mk' });
    const bar = EM.h('span', { class: 'bandbar', title: EM.t('hud.target') }, EM.h('i', { class: 'zone' }), marker);
    const msg = EM.h('small', { class: 'bandmsg' });
    const minus = EM.h('button', { class: 'tbtn', title: EM.t('hud.manual'), onclick: () => { EM.adapt.set(g, EM.adapt.level(g) - 1); } }, '−');
    const plus = EM.h('button', { class: 'tbtn', title: EM.t('hud.manual'), onclick: () => { EM.adapt.set(g, EM.adapt.level(g) + 1); } }, '+');
    const root = EM.h('div', { class: 'hud' },
      EM.h('span', { class: 'hud-lv' }, minus, EM.h('span', null, EM.t('hud.level'), ' ', lvEl, labelFn ? EM.h('small', { class: 'lvlabel' }) : null), plus),
      EM.h('span', { class: 'hud-streak', title: EM.t('hud.streakTip') }, dots),
      EM.h('span', { class: 'hud-rate' }, rateEl, bar, msg));
    function upd() {
      const r = EM.adapt.rec(g);
      lvEl.textContent = r.level;
      if (labelFn) root.querySelector('.lvlabel').textContent = ' · ' + labelFn(r.level);
      dots.innerHTML = '';
      dots.appendChild(EM.h('span', { class: 'dlab' }, EM.t('hud.streak')));
      for (let i = 0; i < 2; i++) dots.appendChild(EM.h('i', { class: 'dot' + (i < r.sOK ? ' on' : '') + (i < r.sBad ? ' bad' : '') }));
      const rate = r.trials ? r.ok / r.trials : 0;
      rateEl.textContent = r.trials ? EM.t('hud.rate', { p: Math.round(rate * 100), ok: r.ok, n: r.trials }) : EM.t('hud.norate');
      marker.style.left = Math.round(rate * 100) + '%';
      marker.style.display = r.trials ? '' : 'none';
      const b = EM.band(rate, r.trials);
      root.className = 'hud ' + b.cls;
      msg.textContent = b.msg;
    }
    EM.on('record', (x) => { if (x === g && root.isConnected) upd(); });
    upd();
    root.update = upd;
    return root;
  };

  /* ---------- cadrul unui joc ---------- */
  EM.frame = function (opts) {
    const app = document.getElementById('app');
    EM.clear(app);
    EM.newRun();
    if ('speechSynthesis' in window) try { speechSynthesis.cancel(); } catch (e) { /* */ }
    const stage = EM.h('div', { class: 'stage' });
    const controls = EM.h('div', { class: 'controls' });
    const tipText = () => EM.t(opts.tip);
    const tip = opts.tip ? EM.h('div', { class: 'tip' }, EM.h('span', { class: 'tipicon' }, '🧭'),
      EM.h('div', null, EM.h('b', null, EM.t('ui.trick')), ' ', EM.h('span', null, tipText())), EM.readBtn(tipText)) : null;
    const hud = opts.g ? EM.hud(opts.g, opts.levelLabel) : null;
    const root = EM.h('section', { class: 'screen game ' + (opts.cls || '') },
      EM.h('header', { class: 'ghead' },
        EM.h('button', { class: 'back', onclick: () => (opts.onBack || EM.home)() }, EM.t('ui.back')),
        EM.h('h2', null, opts.icon || '', ' ', EM.t(opts.title)),
        opts.story ? EM.readBtn(() => EM.t(opts.title) + '. ' + EM.t(opts.story)) : null),
      opts.story ? EM.h('p', { class: 'story' }, EM.t(opts.story)) : null,
      hud, tip, stage, controls);
    app.appendChild(root);
    window.scrollTo(0, 0);
    return { root, stage, controls, hud };
  };
  EM.btn = (label, fn, cls) => EM.h('button', { class: 'big ' + (cls || ''), onclick: fn }, label);

  /* bara de timp (pentru „memorează!") — se termină singură sau cu butonul „Gata" */
  EM.countdown = function (parent, secs, tok) {
    return new Promise((resolve) => {
      const fill = EM.h('i');
      const bar = EM.h('div', { class: 'cd' }, fill);
      let done = false;
      const fin = () => { if (done) return; done = true; bar.remove(); btn.remove(); resolve(!EM.stale(tok)); };
      const btn = EM.btn(EM.t('ui.ready'), fin, 'alt small');
      parent.appendChild(bar); parent.appendChild(btn);
      fill.style.transition = 'none'; fill.style.width = '100%';
      requestAnimationFrame(() => requestAnimationFrame(() => { fill.style.transition = 'width ' + secs + 's linear'; fill.style.width = '0%'; }));
      setTimeout(fin, secs * 1000);
      const iv = setInterval(() => { if (EM.stale(tok)) { clearInterval(iv); fin(); } else if (done) clearInterval(iv); }, 200);
    });
  };

  EM.fmtTime = (ms) => new Date(ms).toLocaleTimeString(EM.lang === 'ro' ? 'ro-RO' : 'en-GB', { hour: '2-digit', minute: '2-digit' });
  EM.fmtDate = (d) => { const [y, m, dd] = d.split('-'); return dd + '.' + m + '.' + y; };
})();
