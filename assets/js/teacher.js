/* Expediția memoriei — panoul profesorului: planul orei, scoruri, jurnal, export */
(function () {
  'use strict';
  const EM = window.EM;
  const h = EM.h, t = EM.t;

  EM.GAME_ORDER = ['warm', 'kim', 'spanF', 'spanB', 'map', 'boat', 'sw', 'k1', 'k2', 'k3', 'k4', 'k5'];
  EM.gameName = (g) => t('gn.' + g);
  EM.bestText = (g, v) => (v ? t('best.' + (g.startsWith('k') && g !== 'kim' ? 'k' : g), { n: v }) : '—');

  const pct = (r) => (r.trials ? Math.round((r.ok / r.trials) * 100) : 0);
  const arrow = (a, b) => (b === undefined || b === null || a === undefined ? '' : a > b ? ' ⬆️' : a < b ? ' ⬇️' : ' ＝');

  /* tabelul „cum a mers azi" (folosit și la finalul orei) */
  EM.summaryTable = function (s, prev) {
    const tb = h('tbody');
    let any = false;
    EM.GAME_ORDER.forEach((g) => {
      const r = s.games[g];
      if (!r || !r.trials) return;
      any = true;
      const p = prev && prev.games[g];
      const b = EM.band(r.ok / r.trials, r.trials);
      const nextLv = Math.max(EM.CFG[g].min, r.level - 1);
      tb.appendChild(h('tr', null,
        h('td', null, EM.gameName(g)),
        h('td', null, r.start, ' → ', h('b', null, r.level), r.max > r.level ? h('small', null, ' (max ' + r.max + ')') : null),
        h('td', { class: 'cell ' + b.cls }, r.ok + '/' + r.trials + ' · ' + pct(r) + '%', h('small', null, ' ' + b.msg)),
        h('td', null, EM.bestText(g, r.best), p ? h('small', null, arrow(r.best, p.best)) : null),
        h('td', null, g === 'warm' ? '—' : nextLv)));
    });
    if (s.delayed) {
      any = true;
      tb.appendChild(h('tr', { class: 'sep' }, h('td', null, t('gn.delayed')), h('td', null, '—'),
        h('td', null, t('fin.dShort', { k: s.delayed.hits, n: s.delayed.total, f: s.delayed.fa })), h('td', null, '—'), h('td', null, '—')));
    }
    if (!any) return h('p', { class: 'hint' }, t('tp.nothing'));
    return h('div', { class: 'tablewrap' }, h('table', { class: 'sum' },
      h('thead', null, h('tr', null, h('th', null, t('tp.game')), h('th', null, t('tp.level')), h('th', null, t('tp.success')), h('th', null, t('tp.best')), h('th', null, t('tp.next')))), tb));
  };

  /* ---------- rândul de jurnal pentru o oră ---------- */
  function row(s) {
    const g = s.games || {};
    const b = (k) => (g[k] && g[k].best) || '';
    let ok = 0, n = 0, kOk = 0, kN = 0;
    for (const k in g) { ok += g[k].ok; n += g[k].trials; if (/^k\d$/.test(k)) { kOk += g[k].ok; kN += g[k].trials; } }
    const dur = s.end ? Math.round((s.end - s.start) / 60000) : Math.round(((s.last || s.start) - s.start) / 60000);
    return {
      date: s.date, dur, kim: b('kim'), spanF: b('spanF'), spanB: b('spanB'), map: b('map'), boat: b('boat'), sw: b('sw'),
      kg: kN ? kOk + '/' + kN : '', delayed: s.delayed ? s.delayed.hits + '/' + s.delayed.total + (s.delayed.fa ? ' (−' + s.delayed.fa + ')' : '') : '',
      total: n ? Math.round((ok / n) * 100) : '', strategies: (s.strategies || []).map((x) => t('st.' + x)).concat(s.other ? [s.other] : []).join(', '),
      hard: s.hard || '', note: s.note || ''
    };
  }
  const COLS = ['date', 'dur', 'kim', 'spanF', 'spanB', 'map', 'boat', 'sw', 'kg', 'delayed', 'total', 'strategies', 'hard', 'note'];

  function download(name, text, type) {
    const blob = new Blob([text], { type });
    const a = h('a', { href: URL.createObjectURL(blob), download: name });
    document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  EM.exportCSV = function () {
    const rows = EM.store.data.sessions.filter((s) => Object.keys(s.games || {}).length).map(row);
    const esc = (v) => { const s = String(v === undefined ? '' : v); return /[;"\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
    const head = COLS.map((c) => t('jc.' + c)).join(';');
    const body = rows.map((r) => COLS.map((c) => esc(r[c])).join(';')).join('\n');
    download('jurnal-' + EM.store.data.student.toLowerCase().replace(/\s+/g, '-') + '-' + new Date().toISOString().slice(0, 10) + '.csv', '﻿' + head + '\n' + body, 'text/csv;charset=utf-8');
  };
  EM.exportJSON = function () {
    download('expeditia-memoriei-backup-' + new Date().toISOString().slice(0, 10) + '.json', JSON.stringify(EM.store.data, null, 1), 'application/json');
  };
  EM.importJSON = function (file, done) {
    const fr = new FileReader();
    fr.onload = () => {
      try {
        const d = JSON.parse(fr.result);
        if (!Array.isArray(d.sessions)) throw new Error('bad');
        const ids = new Set(EM.store.data.sessions.map((s) => s.id));
        d.sessions.forEach((s) => { if (!ids.has(s.id)) EM.store.data.sessions.push(s); });
        EM.store.data.sessions.sort((a, b) => a.start - b.start);
        if (d.levels) EM.store.data.levels = Object.assign({}, d.levels, EM.store.data.levels);
        EM.store.save();
        EM.toast(t('tp.imported', { n: d.sessions.length }), 'good');
      } catch (e) { EM.toast(t('tp.importBad'), 'soft'); }
      done && done();
    };
    fr.readAsText(file);
  };

  /* ---------- panoul ---------- */
  let tab = 'plan';
  EM.openPanel = function (which) {
    if (which) tab = which;
    let ov = document.getElementById('tpanel');
    if (ov) ov.remove();
    const body = h('div', { class: 'tbody' });
    const tabs = h('nav', { class: 'ttabs' });
    [['plan', '🗓️'], ['today', '📊'], ['journal', '📒'], ['rules', '📐']].forEach(([k, e]) =>
      tabs.appendChild(h('button', { class: tab === k ? 'on' : '', onclick: () => EM.openPanel(k) }, e, ' ', t('tp.tab.' + k))));
    ov = h('div', { id: 'tpanel', class: 'overlay', onclick: (e) => { if (e.target === ov) close(); } },
      h('aside', { class: 'drawer' },
        h('header', null, h('h2', null, '👩‍🏫 ', t('tp.title')), h('button', { class: 'x', onclick: close }, '✕')),
        tabs, body));
    document.body.appendChild(ov);
    ({ plan, today, journal, rules })[tab](body);
    function close() { ov.remove(); EM.emit('panelClosed'); }
  };

  function plan(body) {
    const s = EM.session || EM.findOpenSession();
    if (s) {
      const mins = Math.round((Date.now() - s.start) / 60000);
      body.appendChild(h('p', { class: 'status' }, '⏱ ', t('tp.started', { at: EM.fmtTime(s.start), m: mins })));
    } else body.appendChild(h('p', { class: 'status' }, t('tp.noSession')));
    const ul = h('ol', { class: 'plan' });
    let acc = 0;
    EM.STEPS.forEach((st) => {
      const from = acc; acc += st.min;
      const played = s && st.g.some((g) => s.games[g] && s.games[g].trials);
      const done = s && (s.plan[st.id] || played);
      const cb = h('input', { type: 'checkbox' });
      cb.checked = !!done;
      cb.addEventListener('change', () => { const ss = EM.ensureSession(); ss.plan[st.id] = cb.checked; EM.store.save(); });
      ul.appendChild(h('li', { class: done ? 'done' : '' },
        h('label', null, cb, ' ', h('span', { class: 'when' }, from + '–' + acc + ' min'), ' ', st.e, ' ', h('b', null, t(st.title)), h('small', null, ' · ', t(st.skill))),
        h('button', { class: 'go', onclick: () => { document.getElementById('tpanel').remove(); st.go(); } }, t('tp.open'))));
    });
    body.appendChild(ul);
    body.appendChild(h('p', { class: 'hint small' }, t('tp.planNote')));
  }

  function today(body) {
    const s = EM.session || EM.findOpenSession();
    if (!s) { body.appendChild(h('p', null, t('tp.noSession'))); return; }
    body.appendChild(EM.summaryTable(s, EM.prevSession()));
    body.appendChild(legend());
    if (s.strategies && s.strategies.length) body.appendChild(h('p', null, '💭 ', h('b', null, t('fin.helped')), ' ', s.strategies.map((x) => t('st.' + x)).join(', ')));
  }
  function legend() {
    return h('div', { class: 'legend' },
      h('span', { class: 'cell b-red' }, '< 60% ', t('band.hard')),
      h('span', { class: 'cell b-yellow' }, '60–70% / 80–90%'),
      h('span', { class: 'cell b-green' }, '70–80% ', t('band.good')),
      h('span', { class: 'cell b-blue' }, '> 90% ', t('band.easy')));
  }

  function journal(body) {
    const ss = EM.store.data.sessions.filter((s) => Object.keys(s.games || {}).length);
    const bar = h('div', { class: 'tools' },
      EM.btn('⬇️ ' + t('tp.csv'), EM.exportCSV, 'small'),
      EM.btn('💾 ' + t('tp.backup'), EM.exportJSON, 'alt small'),
      h('label', { class: 'big alt small filebtn' }, '📂 ', t('tp.import'), h('input', { type: 'file', accept: '.json,application/json', onchange: (e) => { if (e.target.files[0]) EM.importJSON(e.target.files[0], () => EM.openPanel('journal')); } })));
    body.appendChild(bar);
    if (!ss.length) { body.appendChild(h('p', { class: 'hint' }, t('tp.emptyJournal'))); return; }
    const rows = ss.map(row);
    const tb = h('tbody');
    for (let i = rows.length - 1; i >= 0; i--) {
      const r = rows[i], p = rows[i - 1];
      const num = (k) => h('td', null, r[k] || '—', p && r[k] && p[k] ? h('small', null, arrow(r[k], p[k])) : null);
      const del = h('button', { class: 'tbtn', title: t('tp.del'), onclick: () => {
        if (del.dataset.armed) { const k = EM.store.data.sessions.indexOf(ss[i]); if (k >= 0) EM.store.data.sessions.splice(k, 1); if (EM.session === ss[i]) EM.session = null; EM.store.save(); EM.openPanel('journal'); }
        else { del.dataset.armed = '1'; del.textContent = t('tp.sure'); }
      } }, '🗑');
      tb.appendChild(h('tr', null, h('td', null, EM.fmtDate(r.date), h('br'), h('small', null, r.dur + ' min')),
        num('kim'), num('spanF'), num('spanB'), num('map'), num('boat'), num('sw'),
        h('td', null, r.kg || '—'), h('td', null, r.delayed || '—'), h('td', null, r.total !== '' ? r.total + '%' : '—'),
        h('td', { class: 'wrap' }, r.strategies || '—', r.hard ? h('div', null, h('small', null, '😅 ' + r.hard)) : null, r.note ? h('div', null, h('small', null, '📝 ' + r.note)) : null), h('td', null, del)));
    }
    body.appendChild(h('div', { class: 'tablewrap' }, h('table', { class: 'sum jr' },
      h('thead', null, h('tr', null, ['date', 'kim', 'spanF', 'spanB', 'map', 'boat', 'sw', 'kg', 'delayed', 'total', 'strategies'].map((c) => h('th', null, t('jc.' + c))), h('th'))), tb)));
    body.appendChild(h('p', { class: 'hint small' }, t('tp.journalNote')));
  }

  function rules(body) {
    body.appendChild(h('div', { class: 'rulebox' },
      h('h3', null, '📐 ', t('tp.rulesTitle')),
      h('ol', null,
        h('li', null, h('b', null, t('rule1.t')), ' ', t('rule1.d')),
        h('li', null, h('b', null, t('rule2.t')), ' ', t('rule2.d')),
        h('li', null, h('b', null, t('rule3.t')), ' ', t('rule3.d'))),
      legend(),
      h('p', { class: 'hint small' }, t('tp.science'))));
    const name = h('input', { class: 'txt', value: EM.store.data.student });
    name.addEventListener('change', () => { EM.store.data.student = name.value.trim() || 'Eva'; EM.store.save(); EM.emit('rerender'); });
    const reset = h('button', { class: 'big alt small', onclick: () => {
      if (reset.dataset.armed) { EM.store.data.levels = {}; EM.store.save(); EM.toast(t('tp.resetDone'), 'good'); EM.openPanel('rules'); }
      else { reset.dataset.armed = '1'; reset.textContent = t('tp.sure'); }
    } }, t('tp.reset'));
    body.appendChild(h('div', { class: 'settings' }, h('h3', null, '⚙️ ', t('tp.settings')),
      h('label', null, t('tp.name'), ' ', name), h('p', { class: 'hint small' }, t('tp.levelsNow') + ' ' +
        EM.GAME_ORDER.filter((g) => g !== 'warm' && EM.store.data.levels[g]).map((g) => EM.gameName(g) + ' ' + EM.store.data.levels[g]).join(' · ') || '—'), reset));
  }
})();
