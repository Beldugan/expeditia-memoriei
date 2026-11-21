/* Expediția memoriei — harta expediției (meniul) și pornirea aplicației */
(function () {
  'use strict';
  const EM = window.EM;
  const h = EM.h, t = EM.t;
  const G = EM.games, K = EM.kangaroo;

  EM.STEPS = [
    { id: 'warm', e: '🔥', title: 'warm.title', skill: 'sk.warm', min: 5, g: ['warm'], go: () => G.warm() },
    { id: 'kim', e: '🔍', title: 'kim.title', skill: 'sk.kim', min: 8, g: ['kim'], go: () => G.kim() },
    { id: 'span', e: '🔐', title: 'span.title', skill: 'sk.span', min: 7, g: ['spanF', 'spanB'], go: () => G.span('F') },
    { id: 'map', e: '🗺️', title: 'map.title', skill: 'sk.map', min: 8, g: ['map'], go: () => G.map() },
    { id: 'boat', e: '🛶', title: 'boat.title', skill: 'sk.boat', min: 8, g: ['boat'], go: () => G.boat() },
    { id: 'sw', e: '🔀', title: 'sw.title', skill: 'sk.sw', min: 7, g: ['sw'], go: () => G.sw() },
    { id: 'kg', e: '🦘', title: 'kg.title', skill: 'sk.kg', min: 5, g: ['k1', 'k2', 'k3', 'k4', 'k5'], go: () => K.menu(), opt: true },
    { id: 'final', e: '🏁', title: 'fin.title', skill: 'sk.fin', min: 5, g: [], go: () => G.final() }
  ];

  EM.home = function () {
    const app = document.getElementById('app');
    EM.clear(app);
    EM.newRun();
    const s = EM.session || EM.findOpenSession();
    if (s) EM.session = s;
    const name = EM.store.data.student;
    const status = s
      ? h('p', { class: 'status' }, '🟢 ', t('home.running', { at: EM.fmtTime(s.start), m: Math.round((Date.now() - s.start) / 60000) }))
      : h('div', { class: 'startbox' }, EM.btn('🌅 ' + t('home.start'), () => { EM.startSession(); EM.say(t('home.hello', { name })); EM.home(); }, 'pulse huge'),
        h('p', { class: 'hint small' }, t('home.startNote')));
    const grid = h('div', { class: 'steps' });
    EM.STEPS.forEach((st, i) => {
      const played = s && st.g.some((g) => s.games[g] && s.games[g].trials);
      const lvTxt = st.g.length && st.id !== 'kg' ? st.g.map((g) => (st.g.length > 1 ? t('gs.' + g) + ' ' : '') + EM.adapt.preview(g)).join(' · ') : '';
      grid.appendChild(h('button', { class: 'step' + (played ? ' done' : '') + (st.opt ? ' optional' : ''), onclick: () => { EM.ensureSession(); st.go(); } },
        h('span', { class: 'n' }, played ? '✓' : i + 1),
        h('span', { class: 'em' }, st.e),
        h('b', null, t(st.title)),
        h('small', null, t(st.skill)),
        h('span', { class: 'meta' }, '⏱ ' + st.min + ' min', lvTxt ? ' · ' + t('hud.level') + ' ' + lvTxt : '', st.opt ? ' · ' + t('home.optional') : '')));
    });
    app.appendChild(h('section', { class: 'screen home' },
      h('div', { class: 'hero' },
        h('div', { class: 'leafs' }, '🌿🦜🛶🐆🌿'),
        h('h1', null, t('app.title')),
        h('p', { class: 'sub' }, t('home.sub', { name })),
        EM.readBtn(() => t('app.title') + '. ' + t('home.sub', { name }) + ' ' + t('home.intro'))),
      h('p', { class: 'intro' }, t('home.intro')),
      status, grid));
  };

  function topbar() {
    const bar = document.getElementById('top');
    EM.clear(bar);
    const clock = h('span', { class: 'clock' });
    const tick = () => { const s = EM.session; clock.textContent = s && !s.end ? '⏱ ' + Math.round((Date.now() - s.start) / 60000) + ' min' : ''; };
    tick(); clearInterval(EM._clk); EM._clk = setInterval(tick, 20000);
    bar.appendChild(h('button', { class: 'brand', onclick: EM.home }, '🌿 ', t('app.short')));
    bar.appendChild(h('span', { class: 'sp' }));
    bar.appendChild(clock);
    bar.appendChild(h('button', { title: t('ui.voice'), onclick: () => { EM.store.data.voice = !EM.store.data.voice; EM.store.save(); if (!EM.store.data.voice && 'speechSynthesis' in window) speechSynthesis.cancel(); topbar(); } }, EM.store.data.voice ? '🔊' : '🔇'));
    bar.appendChild(h('button', { class: 'lang', onclick: () => { EM.lang = EM.lang === 'ro' ? 'en' : 'ro'; EM.store.data.lang = EM.lang; EM.store.save(); document.documentElement.lang = EM.lang; document.title = t('app.title'); topbar(); EM.home(); } }, EM.lang === 'ro' ? 'EN' : 'RO'));
    bar.appendChild(h('button', { class: 'teach', onclick: () => EM.openPanel() }, '👩‍🏫 ', t('tp.short')));
  }

  EM.on('rerender', () => { topbar(); });
  EM.on('record', () => { const c = document.querySelector('#top .clock'); if (c && EM.session) c.textContent = '⏱ ' + Math.round((Date.now() - EM.session.start) / 60000) + ' min'; });

  window.addEventListener('DOMContentLoaded', () => {
    EM.store.load();
    EM.lang = EM.store.data.lang === 'en' ? 'en' : 'ro';
    const q = new URLSearchParams(location.search);
    if (q.get('lang') === 'en' || q.get('lang') === 'ro') EM.lang = q.get('lang');
    document.documentElement.lang = EM.lang;
    document.title = t('app.title');
    EM.session = EM.findOpenSession();
    if ('speechSynthesis' in window) try { speechSynthesis.getVoices(); } catch (e) { /* */ }
    topbar();
    EM.home();
  });
})();
