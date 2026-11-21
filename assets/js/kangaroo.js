/* Expediția memoriei — 🦘 Provocarea Kangaroo
   Probleme ORIGINALE, generate aleator, în stilul Primary Kangaroo (UKMT), cu tema Amazonului.
   5 tipuri × 3 niveluri. Nivelul 2 adaugă de obicei memorie (indiciile/cheia dispar). */
(function () {
  'use strict';
  const EM = window.EM;
  const h = EM.h, t = EM.t;
  const K = (EM.kangaroo = {});
  const LET = ['A', 'B', 'C', 'D', 'E'];

  K.TYPES = [
    { id: 'k1', e: '🕵️', title: 'k1.title', skill: 'k1.skill' },
    { id: 'k2', e: '⛵', title: 'k2.title', skill: 'k2.skill' },
    { id: 'k3', e: '📸', title: 'k3.title', skill: 'k3.skill' },
    { id: 'k4', e: '🧭', title: 'k4.title', skill: 'k4.skill' },
    { id: 'k5', e: '🗿', title: 'k5.title', skill: 'k5.skill' }
  ];

  function perms(a) {
    if (a.length <= 1) return [a.slice()];
    const out = [];
    a.forEach((x, i) => perms(a.slice(0, i).concat(a.slice(i + 1))).forEach((p) => out.push([x].concat(p))));
    return out;
  }

  /* ---------------- K1 · Detectivul junglei (indicii logice) ---------------- */
  const NAMES = ['Lia', 'Tomi', 'Rafa', 'Nina'];
  const PETS = ['monkey', 'parrot', 'turtle', 'sloth'];
  K.gen1 = function (lv) {
    const n = lv === 3 ? 4 : 3;
    const people = NAMES.slice(0, n), pets = EM.shuffle(PETS).slice(0, n);
    const sol = EM.shuffle([...Array(n).keys()]); // sol[p] = indexul animalului
    const all = perms([...Array(n).keys()]);
    const cand = [];
    for (let p = 0; p < n; p++) for (let a = 0; a < n; a++) {
      if (sol[p] === a) cand.push({ kind: 'is', p, a }); else cand.push({ kind: 'not', p, a });
    }
    const holds = (c, s) => (c.kind === 'is' ? s[c.p] === c.a : s[c.p] !== c.a);
    const count = (cs) => all.filter((s) => cs.every((c) => holds(c, s))).length;
    let clues;
    for (let tries = 0; tries < 200; tries++) {
      const order = EM.shuffle(cand.filter((c) => c.kind === 'not')).concat(EM.shuffle(cand.filter((c) => c.kind === 'is')).slice(0, lv === 1 ? 1 : 0));
      let cs = [];
      for (const c of EM.shuffle(order)) { cs.push(c); if (count(cs) === 1) break; }
      if (count(cs) !== 1) continue;
      for (let i = cs.length - 1; i >= 0; i--) { const tr = cs.slice(0, i).concat(cs.slice(i + 1)); if (count(tr) === 1) cs = tr; }
      clues = cs; break;
    }
    // persoana întrebată: nu apare într-un indiciu pozitiv
    const named = clues.filter((c) => c.kind === 'is').map((c) => c.p);
    const askP = EM.pick([...Array(n).keys()].filter((p) => !named.includes(p)));
    const petObj = (i) => EM.byId[pets[i]];
    const clueText = (c) => t(c.kind === 'is' ? 'k1.is' : 'k1.not', { p: people[c.p], a: petObj(c.a).e + ' ' + EM.nm(petObj(c.a)) });
    const options = EM.shuffle([...Array(n).keys()]).map((a) => ({ html: petObj(a).e + ' ' + EM.nm(petObj(a)), ok: a === sol[askP] }));
    return {
      intro: t('k1.intro', { n, names: people.join(', '), pets: pets.map((x) => EM.byId[x].e).join(' ') }),
      memo: lv === 2, // indiciile apar pe rând și apoi dispar
      clues: clues.map(clueText),
      question: t('k1.q', { p: people[askP] }),
      options,
      hint: t('k1.hint'),
      explain: t('k1.sol') + ' ' + people.map((p, i) => p + ' – ' + petObj(sol[i]).e).join(' · ')
    };
  };

  /* ---------------- K2 · Tiparul bărcilor (șiruri care se repetă) ---------------- */
  const COLORS = [
    { id: 'red', c: '#e5484d' }, { id: 'yellow', c: '#f5c518' }, { id: 'blue', c: '#3b82f6' },
    { id: 'green', c: '#2fa84f' }, { id: 'purple', c: '#8e5bd8' }, { id: 'orange', c: '#f28c28' }
  ];
  const boatSVG = (hull, sail) => '<svg viewBox="0 0 60 56" class="boat"><path d="M30 4 L30 38" stroke="#5b4636" stroke-width="2.4"/><path d="M31 6 L52 34 L31 34 Z" fill="' + (sail || '#fffdf3') + '" stroke="#5b4636" stroke-width="1.6"/><path d="M4 38 L56 38 L47 51 L13 51 Z" fill="' + hull + '" stroke="#3b2c22" stroke-width="2"/></svg>';
  const colName = (id, fem) => t('col.' + id + (fem ? '.f' : ''));
  K.gen2 = function (lv) {
    if (lv < 3) {
      const len = lv === 1 ? EM.pick([3, 4]) : EM.pick([4, 5]);
      const cols = EM.sample(COLORS, Math.min(len, 4));
      let pat = [];
      for (let i = 0; i < len; i++) pat.push(cols[i % cols.length]);
      pat = EM.shuffle(pat);
      if (len > cols.length) { /* asigură-te că nu sunt doi vecini egali la început */ }
      const shown = len * 2 + 1;
      const target = lv === 1 ? 10 + EM.rand(9) : 15 + EM.rand(16);
      const ans = pat[(target - 1) % len];
      const used = [...new Set(pat)];
      const extra = EM.sample(COLORS.filter((c) => !used.includes(c)), Math.max(0, 5 - used.length));
      const options = EM.shuffle(used.concat(extra)).slice(0, 5);
      if (!options.includes(ans)) options[0] = ans;
      const row = [];
      for (let i = 0; i < shown; i++) row.push(pat[i % len]);
      return {
        intro: t('k2.intro'),
        visual: '<div class="boats">' + row.map((c, i) => '<span class="b">' + boatSVG(c.c) + '<i>' + (i + 1) + '</i></span>').join('') + '<span class="dots3">…</span></div>',
        memoVisual: lv === 2,
        question: t('k2.q', { n: target }),
        options: EM.shuffle(options).map((c) => ({ html: '<span class="sw" style="background:' + c.c + '"></span> ' + colName(c.id), ok: c === ans })),
        hint: t('k2.hint', { len }),
        explain: t('k2.sol', { len, n: target, r: ((target - 1) % len) + 1, c: colName(ans.id, true) })
      };
    }
    // nivelul 3: corpul și pânza au tipare diferite (ca vagoanele cu acoperiș)
    const a = EM.pick([3, 4]), b = EM.pick([2, 3].filter((x) => x !== a));
    const hc = EM.sample(COLORS.slice(0, 4), 2), sc = EM.sample(COLORS.filter((c) => !hc.includes(c)), 2);
    const hull = EM.shuffle([hc[0], hc[0], hc[1], hc[1], hc[0]].slice(0, a));
    const sail = EM.shuffle([sc[0], sc[1], sc[1]].slice(0, b));
    if (new Set(hull).size < 2) hull[0] = hc[1];
    if (new Set(sail).size < 2) sail[0] = sail[0] === sc[0] ? sc[1] : sc[0];
    const N = 12 + EM.rand(7);
    const H = EM.pick(hull), S = EM.pick(sail);
    let cnt = 0; const pos = [];
    for (let i = 0; i < N; i++) if (hull[i % a] === H && sail[i % b] === S) { cnt++; pos.push(i + 1); }
    const opts = new Set([cnt]);
    [cnt - 2, cnt - 1, cnt + 1, cnt + 2, cnt + 3, cnt * 2].forEach((x) => { if (x >= 0 && opts.size < 5) opts.add(x); });
    const first = [];
    for (let i = 0; i < Math.max(a, b) + 2; i++) first.push(boatSVG(hull[i % a].c, sail[i % b].c));
    return {
      intro: t('k2.intro3', { n: N }),
      visual: '<div class="boats">' + first.map((s, i) => '<span class="b">' + s + '<i>' + (i + 1) + '</i></span>').join('') + '<span class="dots3">…</span></div>' +
        '<p class="pat">' + t('k2.hullPat') + ' ' + hull.map((c) => colName(c.id)).join(', ') + ' …<br>' + t('k2.sailPat') + ' ' + sail.map((c) => colName(c.id)).join(', ') + ' …</p>',
      question: t('k2.q3', { n: N, h: colName(H.id), s: colName(S.id, true) }),
      options: [...opts].sort((x, y) => x - y).map((x) => ({ html: String(x), ok: x === cnt })),
      hint: t('k2.hint3'),
      explain: t('k2.sol3', { list: pos.join(', ') || '—', k: cnt })
    };
  };

  /* ---------------- K3 · Camera de pe pod (ordinea din fotografii) ---------------- */
  const CROSS = ['capy', 'jaguar', 'monkey', 'deer', 'boar', 'lizard'];
  K.gen3 = function (lv) {
    const n = lv === 3 ? 5 : 4;
    const who = EM.sample(CROSS, n).map((id) => EM.byId[id]);
    const order = EM.shuffle(who);
    const shots = [];
    for (let k = 1; k < n; k++) shots.push(k);
    const photos = EM.shuffle(shots).map((k) => {
      const crossed = order.slice(0, k), wait = order.slice(k);
      return '<div class="photo"><div class="bank l">' + EM.shuffle(wait).map((x) => x.e).join('') + '</div><div class="br">🌉</div><div class="bank r">' + EM.shuffle(crossed).map((x) => x.e).join('') + '</div></div>';
    });
    const key = (o) => o.map((x) => x.id).join(',');
    const opts = [order];
    const seen = new Set([key(order)]);
    let guard = 0;
    while (opts.length < 5 && guard++ < 200) {
      let o = order.slice();
      const r = EM.rand(3);
      if (r === 0) { const i = EM.rand(n - 1); [o[i], o[i + 1]] = [o[i + 1], o[i]]; }
      else if (r === 1) o = o.slice().reverse();
      else o = EM.shuffle(o);
      if (!seen.has(key(o))) { seen.add(key(o)); opts.push(o); }
    }
    return {
      intro: t('k3.intro', { n, all: who.map((x) => x.e + ' ' + EM.nm(x)).join(', ') }),
      visual: '<div class="photos">' + photos.map((p, i) => '<figure>' + p + '<figcaption>' + t('k3.photo', { i: i + 1 }) + '</figcaption></figure>').join('') + '</div>',
      memoVisual: lv === 2,
      question: t('k3.q'),
      options: EM.shuffle(opts).map((o) => ({ html: o.map((x) => x.e).join(' ➜ '), ok: o === order })),
      hint: t('k3.hint'),
      explain: t('k3.sol', { o: order.map((x) => x.e + ' ' + EM.nm(x)).join(' ➜ ') })
    };
  };

  /* ---------------- K4 · Curentul râului (săgeți, treci o singură dată prin toate) ---------------- */
  K.hamPath = function (R, C) {
    const N = R * C;
    for (let attempt = 0; attempt < 400; attempt++) {
      const start = EM.rand(N), path = [start], used = new Set([start]);
      const nb = (i) => { const r = Math.floor(i / C), c = i % C, o = []; if (r > 0) o.push(i - C); if (r < R - 1) o.push(i + C); if (c > 0) o.push(i - 1); if (c < C - 1) o.push(i + 1); return o; };
      let steps = 0;
      const dfs = () => {
        if (path.length === N) return true;
        if (++steps > 3000) return false;
        const cur = path[path.length - 1];
        // euristica Warnsdorff + puțin hazard
        const next = EM.shuffle(nb(cur).filter((x) => !used.has(x))).sort((x, y) => nb(x).filter((z) => !used.has(z)).length - nb(y).filter((z) => !used.has(z)).length);
        for (const x of next) { used.add(x); path.push(x); if (dfs()) return true; path.pop(); used.delete(x); }
        return false;
      };
      if (dfs()) return path;
    }
    return null;
  };
  K.gen4 = function (lv) {
    const [R, C] = lv === 1 ? [3, 3] : lv === 2 ? [3, 4] : [4, 4];
    const path = K.hamPath(R, C);
    const arrow = {};
    const dirOf = (a, b) => (b === a - C ? '↑' : b === a + C ? '↓' : b === a - 1 ? '←' : '→');
    for (let i = 0; i < path.length - 1; i++) arrow[path[i]] = dirOf(path[i], path[i + 1]);
    // ultima săgeată nu are voie să arate spre pătratul de pornire
    const last = path[path.length - 1];
    const lr = Math.floor(last / C), lc = last % C;
    const cands = [['↑', lr > 0 ? last - C : -1], ['↓', lr < R - 1 ? last + C : -1], ['←', lc > 0 ? last - 1 : -1], ['→', lc < C - 1 ? last + 1 : -1]].filter(([, x]) => x !== path[0]);
    arrow[last] = EM.pick(cands)[0];
    const lab = (i) => 'ABCD'[i % C] + (Math.floor(i / C) + 1);
    const wrong = EM.sample([...Array(R * C).keys()].filter((x) => x !== path[0]), 4);
    let html = '<div class="agrid" style="grid-template-columns: 26px repeat(' + C + ', 1fr)"><span></span>';
    for (let c = 0; c < C; c++) html += '<span class="ax">' + 'ABCD'[c] + '</span>';
    for (let r = 0; r < R; r++) {
      html += '<span class="ax">' + (r + 1) + '</span>';
      for (let c = 0; c < C; c++) { const i = r * C + c; html += '<span class="ac" data-i="' + i + '">' + arrow[i] + '</span>'; }
    }
    html += '</div>';
    return {
      intro: t('k4.intro', { r: R, c: C }),
      visual: html,
      question: t('k4.q'),
      options: EM.shuffle(wrong.concat([path[0]])).map((x) => ({ html: lab(x), ok: x === path[0] })),
      hint: t('k4.hint'),
      explain: t('k4.sol', { s: lab(path[0]), p: path.map(lab).join(' → ') }),
      after: (root) => path.forEach((x, k) => { const el = root.querySelector('.ac[data-i="' + x + '"]'); if (el) { el.classList.add('walk'); el.style.animationDelay = k * 0.18 + 's'; el.setAttribute('data-k', k + 1); } })
    };
  };

  /* ---------------- K5 · Codul tribului (fiecare cifră are un simbol) ---------------- */
  const SYM = ['🍃', '🌸', '🐾', '⭐', '🌙', '🔥', '💧', '🍄', '🐚', '🌞'];
  K.gen5 = function (lv) {
    const code = EM.shuffle(SYM); // code[d] = simbolul cifrei d
    const enc = (num) => String(num).split('').map((d) => code[+d]).join('');
    const keyHtml = '<div class="ckey">' + [...Array(10).keys()].map((d) => '<span><b>' + d + '</b>' + code[d] + '</span>').join('') + '</div>';
    if (lv < 3) {
      const num = 100 + EM.rand(900);
      const s = String(num);
      const opts = new Set([s]);
      let guard = 0;
      while (opts.size < 5 && guard++ < 100) {
        const a = s.split('');
        const r = EM.rand(3);
        if (r === 0) { const i = EM.rand(2); [a[i], a[i + 1]] = [a[i + 1], a[i]]; }
        else { const i = EM.rand(3); a[i] = String((+a[i] + 1 + EM.rand(8)) % 10); }
        if (a[0] !== '0') opts.add(a.join(''));
      }
      return {
        intro: lv === 1 ? t('k5.intro1') : t('k5.intro2'),
        visual: keyHtml,
        memoVisual: lv === 2,
        memoSecs: 14,
        question: t('k5.q', { x: '<span class="code">' + enc(num) + '</span>' }),
        options: EM.shuffle([...opts]).map((x) => ({ html: x, ok: x === s })),
        hint: t('k5.hint'),
        explain: t('k5.sol', { x: enc(num), n: num })
      };
    }
    // nivelul 3: fără cheie — ca la concurs, potrivești tiparele
    for (let tries = 0; tries < 500; tries++) {
      const pool = EM.sample([1, 2, 3, 4, 5, 6, 7, 8, 9], 4 + EM.rand(2));
      const nums = new Set();
      while (nums.size < 5) nums.add([0, 1, 2].map(() => EM.pick(pool)).join(''));
      const list = [...nums];
      const rows = EM.shuffle(list);
      const target = EM.rand(5);
      const possible = new Set();
      for (const p of perms([0, 1, 2, 3, 4])) {
        const d2s = {}, s2d = {};
        let okk = true;
        for (let r = 0; r < 5 && okk; r++) {
          const num = list[p[r]], symRow = rows[r];
          for (let k = 0; k < 3; k++) {
            const d = num[k], sy = symRow[k]; // în rânduri ținem cifrele reale; simbolul = cifra reală
            if ((d2s[d] && d2s[d] !== sy) || (s2d[sy] && s2d[sy] !== d)) { okk = false; break; }
            d2s[d] = sy; s2d[sy] = d;
          }
        }
        if (okk) possible.add(list[p[target]]);
      }
      if (possible.size !== 1) continue;
      const ans = rows[target];
      const rowHtml = rows.map((r, i) => '<div class="crow">' + enc(r) + (i === target ? ' <b class="qm">= ?</b>' : '') + '</div>').join('');
      return {
        intro: t('k5.intro3', { list: list.slice().sort().join(', ') }),
        visual: '<div class="crows">' + rowHtml + '</div>',
        question: t('k5.q3'),
        options: list.slice().sort().map((x) => ({ html: x, ok: x === ans })),
        hint: t('k5.hint3'),
        explain: t('k5.sol3', { n: ans }) + keyHtml.replace('ckey', 'ckey small')
      };
    }
    return K.gen5(2);
  };

  /* ---------------- ecranele ---------------- */
  K.menu = function () {
    const f = EM.frame({ icon: '🦘', title: 'kg.title', story: 'kg.story', tip: 'tip.kg' });
    const grid = h('div', { class: 'kcards' });
    K.TYPES.forEach((ty) => {
      const r = EM.adapt.peek(ty.id);
      const lv = EM.adapt.preview(ty.id);
      grid.appendChild(h('button', { class: 'kcard', onclick: () => K.play(ty.id) },
        h('span', { class: 'em' }, ty.e), h('b', null, t(ty.title)), h('small', null, t(ty.skill)),
        h('span', { class: 'badge' }, t('hud.level') + ' ' + lv + (r && r.trials ? ' · ' + r.ok + '/' + r.trials + ' ✓' : ''))));
    });
    f.stage.appendChild(grid);
    f.controls.appendChild(EM.btn(t('kg.daily'), () => K.play(EM.pick(K.TYPES).id), 'pulse'));
  };

  K.play = function (id) {
    const ty = K.TYPES.find((x) => x.id === id);
    const f = EM.frame({ g: id, icon: ty.e, title: ty.title, tip: 'tip.kg', onBack: K.menu, levelLabel: (l) => t('kg.lvl' + l) });
    next();
    async function next() {
      const tok = EM.newRun();
      const lv = EM.adapt.level(id);
      const P = K['gen' + id.slice(1)](lv);
      let usedHint = false, done = false;
      EM.clear(f.stage); EM.clear(f.controls);
      const box = h('div', { class: 'kprob' });
      box.appendChild(h('p', { class: 'kintro', html: P.intro }));
      const vis = P.visual ? h('div', { class: 'kvis', html: P.visual }) : null;
      const clueBox = P.clues ? h('ol', { class: 'clues' }) : null;
      if (vis) box.appendChild(vis);
      if (clueBox) box.appendChild(clueBox);
      const qEl = h('p', { class: 'kq', html: P.question });
      const opts = h('div', { class: 'kopts' });
      const hintEl = h('p', { class: 'khint' });
      f.stage.appendChild(box);
      const readAll = () => (P.intro + ' ' + (P.clues ? P.clues.join('. ') : '') + ' ' + P.question).replace(/<[^>]+>/g, ' ');
      box.insertBefore(EM.readBtn(readAll), box.firstChild);

      // memorie: indiciile apar pe rând și dispar / imaginea se ascunde
      if (P.clues && P.memo) {
        box.appendChild(h('p', { class: 'hint small' }, t('kg.memoClues')));
        for (let i = 0; i < P.clues.length; i++) {
          EM.clear(clueBox);
          clueBox.appendChild(h('li', { value: i + 1, class: 'pop' }, P.clues[i]));
          EM.say(P.clues[i]);
          await EM.wait(4500); if (EM.stale(tok)) return;
        }
        EM.clear(clueBox);
        clueBox.appendChild(h('li', { class: 'hidden-clue' }, t('kg.cluesHidden', { n: P.clues.length })));
      } else if (P.clues) P.clues.forEach((c) => clueBox.appendChild(h('li', null, c)));
      if (P.memoVisual && vis) {
        box.appendChild(h('p', { class: 'hint small' }, t('kg.memoVis')));
        if (!(await EM.countdown(f.controls, P.memoSecs || 8, tok))) return;
        vis.classList.add('covered');
      }
      f.stage.appendChild(qEl);
      P.options.forEach((o, i) => opts.appendChild(h('button', { class: 'kopt', onclick: () => answer(i) }, h('b', null, LET[i]), h('span', { html: o.html }))));
      f.stage.appendChild(opts);
      f.stage.appendChild(hintEl);
      const hintBtn = EM.btn('💡 ' + t('kg.hintBtn'), () => {
        usedHint = true; hintEl.innerHTML = '💡 ' + P.hint;
        if (vis) vis.classList.remove('covered');
        if (P.clues && P.memo) { EM.clear(clueBox); P.clues.forEach((c) => clueBox.appendChild(h('li', null, c))); }
        hintBtn.disabled = true;
      }, 'alt small');
      f.controls.appendChild(hintBtn);

      function answer(i) {
        if (done) return; done = true;
        const ok = P.options[i].ok;
        [...opts.children].forEach((b, k) => { b.disabled = true; if (P.options[k].ok) b.classList.add('right'); else if (k === i) b.classList.add('wrong'); });
        if (vis) vis.classList.remove('covered');
        if (P.clues && P.memo) { EM.clear(clueBox); P.clues.forEach((c) => clueBox.appendChild(h('li', null, c))); }
        const success = ok && !usedHint; // cu indiciu nu urcă nivelul
        const ev = EM.adapt.record(id, success, lv, { hint: usedHint, right: ok });
        if (usedHint) EM.adapt.rec(id).hints++;
        const fb = h('div', { class: 'fb ' + (ok ? 'ok' : 'no') }, ok ? '✅ ' : '🌱 ', ok ? (usedHint ? t('kg.okHint') : t('kg.ok')) : t('kg.no'));
        f.stage.appendChild(fb);
        f.stage.appendChild(h('div', { class: 'solution', html: '<b>' + t('kg.why') + '</b> ' + P.explain }));
        if (P.after && vis) P.after(vis);
        if (ok) { EM.burst('🦘'); EM.say(t('kg.ok')); }
        EM.levelEvent(ev, id);
        EM.clear(f.controls);
        f.controls.appendChild(EM.btn(t('kg.next'), next, 'pulse'));
        f.controls.appendChild(EM.btn(t('kg.other'), K.menu, 'alt'));
      }
    }
  };
})();
