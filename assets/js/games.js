/* Expediția memoriei — jocurile de memorie și atenție */
(function () {
  'use strict';
  const EM = window.EM;
  const h = EM.h, t = EM.t;
  const G = (EM.games = EM.games || {});

  const tile = (it, extra) => h('div', { class: 'tile ' + (extra || '') }, h('span', { class: 'em' }, it.e), h('small', null, EM.nm(it)));
  function feedback(stage, ok, text) {
    const el = h('div', { class: 'fb ' + (ok ? 'ok' : 'no') }, ok ? '✅ ' : '🌱 ', text);
    stage.appendChild(el);
    if (ok) EM.say(t(EM.pick(['fb.yes1', 'fb.yes2', 'fb.yes3'])));
    return el;
  }
  function nextRow(controls, fn, label) {
    EM.clear(controls);
    const b = EM.btn(label || t('ui.again'), fn, 'pulse');
    controls.appendChild(b);
    setTimeout(() => b.focus(), 50);
  }

  /* =========================================================
     1. ÎNCĂLZIRE — reconstruiești din memorie un lanț din lecțiile trecute
     ========================================================= */
  G.warm = function () {
    const f = EM.frame({ g: null, icon: '🔥', title: 'warm.title', story: 'warm.story', tip: 'tip.warm' });
    EM.clear(f.stage);
    const list = h('div', { class: 'chains' });
    EM.CHAINS.forEach((c) => list.appendChild(h('button', { class: 'chain', onclick: () => play(c) }, h('span', { class: 'em' }, c.e), EM.nm(c))));
    f.stage.appendChild(list);

    function play(c) {
      EM.clear(f.stage); EM.clear(f.controls);
      const order = c.steps.map((s, i) => i);
      let deck = EM.shuffle(order);
      while (deck.every((v, i) => v === i)) deck = EM.shuffle(order);
      const placed = [];
      const slots = h('div', { class: 'slots' });
      const cards = h('div', { class: 'cards5' });
      const checkBtn = EM.btn(t('ui.check'), check);
      checkBtn.disabled = true;
      f.stage.appendChild(h('h3', null, c.e, ' ', EM.nm(c)));
      f.stage.appendChild(h('p', { class: 'hint' }, t('warm.how')));
      f.stage.appendChild(slots); f.stage.appendChild(cards);
      f.controls.appendChild(checkBtn);
      draw();
      function draw() {
        EM.clear(slots); EM.clear(cards);
        for (let i = 0; i < c.steps.length; i++) {
          const k = placed[i];
          slots.appendChild(h('button', { class: 'slot' + (k !== undefined ? ' full' : ''), onclick: () => { if (k !== undefined) { placed.splice(i, 1); draw(); } } },
            h('b', { class: 'num' }, i + 1), k !== undefined ? [h('span', { class: 'em' }, c.steps[k].e), h('span', null, EM.nm(c.steps[k]))] : h('span', { class: 'empty' }, '…')));
          if (i < c.steps.length - 1) slots.appendChild(h('span', { class: 'arrow' }, '➜'));
        }
        deck.filter((k) => !placed.includes(k)).forEach((k) =>
          cards.appendChild(h('button', { class: 'card5', onclick: () => { placed.push(k); draw(); } }, h('span', { class: 'em' }, c.steps[k].e), EM.nm(c.steps[k]))));
        checkBtn.disabled = placed.length !== c.steps.length;
      }
      function check() {
        const good = placed.filter((k, i) => k === i).length;
        const all = good === c.steps.length;
        [...slots.querySelectorAll('.slot')].forEach((s, i) => s.classList.add(placed[i] === i ? 'right' : 'wrong'));
        EM.adapt.record('warm', all, good, { chain: c.id });
        if (all) EM.burst();
        feedback(f.stage, all, all ? t('warm.ok') : t('warm.part', { n: good, m: c.steps.length }));
        if (!all) {
          f.stage.appendChild(h('div', { class: 'solution' }, h('b', null, t('ui.correctOrder')), ' ', c.steps.map((s) => s.e + ' ' + EM.nm(s)).join('  ➜  ')));
        }
        f.stage.appendChild(h('p', { class: 'hint' }, '🗣️ ', t('warm.explain')));
        EM.clear(f.controls);
        f.controls.appendChild(EM.btn(t('warm.other'), () => G.warm(), 'alt'));
        f.controls.appendChild(EM.btn(t('ui.toMap'), EM.home));
      }
    }
  };

  /* =========================================================
     2. CE LIPSEȘTE? (jocul lui Kim) — memorie vizuală
     nivel L → L+3 lucruri; de la nivelul 5 lucrurile își schimbă locul
     ========================================================= */
  G.kim = function () {
    const g = 'kim';
    const f = EM.frame({ g, icon: '🔍', title: 'kim.title', story: 'kim.story', tip: 'tip.kim', levelLabel: (l) => t('kim.lvl', { n: l + 3 }) });
    intro();
    function intro() {
      EM.clear(f.stage); EM.clear(f.controls);
      f.stage.appendChild(h('div', { class: 'big-emoji' }, '🦜🍌🧭🐆'));
      f.controls.appendChild(EM.btn(t('ui.show'), trial, 'pulse'));
    }
    async function trial() {
      const tok = EM.newRun();
      const lv = EM.adapt.level(g), N = lv + 3, moved = lv >= 5;
      const items = EM.sample(EM.KIM_POOL, N);
      const s = EM.ensureSession();
      if (!s.kimFirst) { s.kimFirst = items.map((x) => x.id); EM.store.save(); }
      EM.clear(f.stage); EM.clear(f.controls);
      const cols = N <= 4 ? N : N <= 6 ? 3 : N <= 8 ? 4 : N <= 10 ? 5 : 6;
      const grid = h('div', { class: 'kgrid', style: { gridTemplateColumns: 'repeat(' + cols + ', 1fr)' } });
      items.forEach((it) => grid.appendChild(tile(it, 'pop')));
      f.stage.appendChild(h('p', { class: 'hint' }, t('kim.look', { n: N })));
      f.stage.appendChild(grid);
      const secs = Math.round(N * 1.3 + 3);
      if (!(await EM.countdown(f.controls, secs, tok))) return;
      // frunzele acoperă tot
      [...grid.children].forEach((c) => c.classList.add('leaf'));
      await EM.wait(900); if (EM.stale(tok)) return;
      const miss = EM.rand(N);
      const rest = items.filter((x, i) => i !== miss);
      EM.clear(grid);
      if (moved) EM.shuffle(rest).forEach((it) => grid.appendChild(tile(it, 'pop')));
      else items.forEach((it, i) => grid.appendChild(i === miss ? h('div', { class: 'tile gap' }, h('span', { class: 'em' }, '❓')) : tile(it)));
      f.stage.querySelector('.hint').textContent = moved ? t('kim.q2') : t('kim.q');
      const others = EM.sample(EM.KIM_POOL.filter((x) => !items.includes(x)), 4);
      const opts = EM.shuffle(others.concat([items[miss]]));
      const row = h('div', { class: 'opts' });
      opts.forEach((o) => row.appendChild(h('button', { class: 'opt', onclick: () => answer(o) }, h('span', { class: 'em' }, o.e), h('small', null, EM.nm(o)))));
      f.stage.appendChild(h('h3', null, t('kim.which')));
      f.stage.appendChild(row);
      EM.say(t('kim.which'));
      function answer(o) {
        const ok = o === items[miss];
        [...row.children].forEach((b, i) => { b.disabled = true; if (opts[i] === items[miss]) b.classList.add('right'); else if (opts[i] === o) b.classList.add('wrong'); });
        const ev = EM.adapt.record(g, ok, N);
        feedback(f.stage, ok, ok ? t('kim.ok', { x: EM.nm(items[miss]) }) : t('kim.no', { x: items[miss].e + ' ' + EM.nm(items[miss]) }));
        EM.levelEvent(ev, g);
        nextRow(f.controls, trial);
      }
    }
  };

  /* =========================================================
     3. CODUL SEIFULUI — cifre înainte și invers (memoria de lucru)
     ========================================================= */
  G.span = function (modeIn) {
    let mode = modeIn || 'F';
    const g = () => 'span' + mode;
    const f = EM.frame({ g: g(), icon: '🔐', title: 'span.title', story: 'span.story', tip: mode === 'F' ? 'tip.spanF' : 'tip.spanB', levelLabel: (l) => t('span.lvl', { n: l }) });
    const seg = h('div', { class: 'seg' },
      h('button', { class: mode === 'F' ? 'on' : '', onclick: () => G.span('F') }, t('span.fwd')),
      h('button', { class: mode === 'B' ? 'on' : '', onclick: () => G.span('B') }, t('span.bwd')));
    f.root.insertBefore(seg, f.root.querySelector('.hud'));
    intro();
    function intro() {
      EM.clear(f.stage); EM.clear(f.controls);
      f.stage.appendChild(h('div', { class: 'safe' }, '🔐'));
      f.stage.appendChild(h('p', { class: 'hint' }, mode === 'F' ? t('span.howF') : t('span.howB')));
      f.controls.appendChild(EM.btn(t('span.start'), trial, 'pulse'));
    }
    async function trial() {
      const tok = EM.newRun();
      const n = EM.adapt.level(g());
      const seq = [];
      while (seq.length < n) { const d = EM.rand(10); if (d !== seq[seq.length - 1]) seq.push(d); }
      EM.clear(f.stage); EM.clear(f.controls);
      const disp = h('div', { class: 'digit' }, '');
      const prog = h('div', { class: 'prog' });
      f.stage.appendChild(h('p', { class: 'hint' }, t('span.listen', { n })));
      f.stage.appendChild(disp); f.stage.appendChild(prog);
      await EM.wait(700); if (EM.stale(tok)) return;
      for (let i = 0; i < n; i++) {
        disp.textContent = seq[i]; disp.classList.remove('flash'); void disp.offsetWidth; disp.classList.add('flash');
        prog.textContent = '● '.repeat(i + 1) + '○ '.repeat(n - i - 1);
        EM.say(String(seq[i]));
        await EM.wait(1000); if (EM.stale(tok)) return;
        disp.textContent = '';
        await EM.wait(250); if (EM.stale(tok)) return;
      }
      disp.textContent = '🔒';
      const target = mode === 'F' ? seq.slice() : seq.slice().reverse();
      const typed = [];
      const slots = h('div', { class: 'dslots' });
      const pad = h('div', { class: 'pad' });
      f.stage.querySelector('.hint').textContent = mode === 'F' ? t('span.typeF') : t('span.typeB');
      EM.say(f.stage.querySelector('.hint').textContent);
      f.stage.appendChild(slots); f.stage.appendChild(pad);
      const draw = () => { EM.clear(slots); for (let i = 0; i < n; i++) slots.appendChild(h('span', { class: 'ds' + (typed[i] !== undefined ? ' full' : '') }, typed[i] !== undefined ? typed[i] : '')); };
      draw();
      let done = false;
      [1, 2, 3, 4, 5, 6, 7, 8, 9, '⌫', 0, '✔'].forEach((k) => pad.appendChild(h('button', { class: 'key' + (typeof k === 'string' ? ' fn' : ''), onclick: () => press(k) }, k)));
      const onKey = (e) => {
        if (!f.root.isConnected) { document.removeEventListener('keydown', onKey); return; }
        if (/^[0-9]$/.test(e.key)) press(+e.key); else if (e.key === 'Backspace') press('⌫'); else if (e.key === 'Enter') press('✔');
      };
      document.addEventListener('keydown', onKey);
      function press(k) {
        if (done) return;
        if (k === '⌫') typed.pop();
        else if (k === '✔') { if (typed.length) finish(); return; }
        else if (typed.length < n) typed.push(k);
        draw();
        if (typed.length === n) setTimeout(finish, 350);
      }
      function finish() {
        if (done) return; done = true;
        document.removeEventListener('keydown', onKey);
        const ok = typed.length === n && typed.every((d, i) => d === target[i]);
        [...slots.children].forEach((s, i) => s.classList.add(typed[i] === target[i] ? 'right' : 'wrong'));
        disp.textContent = ok ? '🔓' : '🔒';
        const ev = EM.adapt.record(g(), ok, n);
        feedback(f.stage, ok, ok ? t('span.ok', { n }) : t('span.no', { s: target.join(' ') }));
        if (!ok && mode === 'B') f.stage.appendChild(h('p', { class: 'hint' }, t('span.heard', { s: seq.join(' ') })));
        EM.levelEvent(ev, g());
        nextRow(f.controls, trial);
      }
    }
  };

  /* =========================================================
     4. HARTA RÂULUI — unde erau animalele? (memorie vizual-spațială)
     ========================================================= */
  G.map = function () {
    const g = 'map';
    const f = EM.frame({ g, icon: '🗺️', title: 'map.title', story: 'map.story', tip: 'tip.map', levelLabel: (l) => t('map.lvl', { n: l }) });
    intro();
    function intro() {
      EM.clear(f.stage); EM.clear(f.controls);
      f.stage.appendChild(h('div', { class: 'big-emoji' }, '🗺️🐊🦜'));
      f.controls.appendChild(EM.btn(t('ui.show'), trial, 'pulse'));
    }
    async function trial() {
      const tok = EM.newRun();
      const n = EM.adapt.level(g), size = n <= 5 ? 4 : 5;
      const cells = EM.sample([...Array(size * size).keys()], n);
      const who = EM.sample(EM.ANIMALS, n);
      EM.clear(f.stage); EM.clear(f.controls);
      const hint = h('p', { class: 'hint' }, t('map.look', { n }));
      const grid = h('div', { class: 'mgrid', style: { gridTemplateColumns: 'repeat(' + size + ', 1fr)' } });
      const els = [];
      for (let i = 0; i < size * size; i++) { const c = h('button', { class: 'mc', disabled: true }); els.push(c); grid.appendChild(c); }
      f.stage.appendChild(hint); f.stage.appendChild(grid);
      await EM.wait(600); if (EM.stale(tok)) return;
      for (let k = 0; k < n; k++) {
        els[cells[k]].textContent = who[k].e; els[cells[k]].classList.add('pop');
        await EM.wait(750); if (EM.stale(tok)) return;
      }
      if (!(await EM.countdown(f.controls, Math.round(n * 0.7 + 2), tok))) return;
      els.forEach((c) => { if (c.textContent) { c.textContent = '🍃'; c.classList.remove('pop'); } });
      await EM.wait(500); if (EM.stale(tok)) return;
      els.forEach((c) => { c.textContent = ''; c.disabled = false; });
      hint.textContent = t('map.q', { n });
      EM.say(hint.textContent);
      const chosen = new Set();
      const check = EM.btn(t('ui.check'), finish);
      check.disabled = true;
      f.controls.appendChild(check);
      const left = h('p', { class: 'hint small' });
      f.stage.appendChild(left);
      const upd = () => { left.textContent = t('map.left', { k: n - chosen.size }); check.disabled = chosen.size !== n; };
      upd();
      els.forEach((c, i) => c.addEventListener('click', () => {
        if (chosen.has(i)) { chosen.delete(i); c.textContent = ''; c.classList.remove('mark'); }
        else if (chosen.size < n) { chosen.add(i); c.textContent = '📍'; c.classList.add('mark'); }
        upd();
      }));
      function finish() {
        els.forEach((c) => (c.disabled = true));
        let good = 0;
        els.forEach((c, i) => {
          const k = cells.indexOf(i);
          if (chosen.has(i) && k >= 0) { good++; c.textContent = who[k].e; c.className = 'mc right'; }
          else if (chosen.has(i)) { c.textContent = '✗'; c.className = 'mc wrong'; }
          else if (k >= 0) { c.textContent = who[k].e; c.className = 'mc missed'; }
        });
        const ok = good === n;
        const ev = EM.adapt.record(g, ok, n, { good });
        feedback(f.stage, ok, ok ? t('map.ok', { n }) : t('map.no', { k: good, n }));
        EM.levelEvent(ev, g);
        nextRow(f.controls, trial);
      }
    }
  };

  /* =========================================================
     5. BARCA EXPLORATORULUI — „Am plecat pe Amazon și am luat în barcă…"
     lista în ordine, cu metoda locurilor de pe râu
     ========================================================= */
  G.boat = function () {
    const g = 'boat';
    const f = EM.frame({ g, icon: '🛶', title: 'boat.title', story: 'boat.story', tip: 'tip.boat', levelLabel: (l) => t('boat.lvl', { n: l }) });
    intro();
    function intro() {
      EM.clear(f.stage); EM.clear(f.controls);
      f.stage.appendChild(h('div', { class: 'big-emoji' }, '🛶🍌🧭🔦'));
      f.controls.appendChild(EM.btn(t('boat.go'), trial, 'pulse'));
    }
    async function trial() {
      const tok = EM.newRun();
      const n = EM.adapt.level(g);
      const items = EM.sample(EM.OBJECTS, n);
      const st = EM.STATIONS.slice(0, n);
      EM.clear(f.stage); EM.clear(f.controls);
      const hint = h('p', { class: 'hint' }, t('boat.look'));
      const river = h('div', { class: 'river' });
      const slotEls = st.map((s, i) => {
        const slot = h('div', { class: 'islot' });
        river.appendChild(h('div', { class: 'station' }, h('div', { class: 'sname' }, h('b', null, i + 1), ' ', s.e, ' ', EM.nm(s)), slot));
        return slot;
      });
      f.stage.appendChild(hint); f.stage.appendChild(river);
      const caption = h('div', { class: 'caption' });
      f.stage.appendChild(caption);
      await EM.wait(700); if (EM.stale(tok)) return;
      const per = n <= 4 ? 2200 : 1800;
      for (let i = 0; i < n; i++) {
        slotEls[i].textContent = items[i].e; slotEls[i].classList.add('pop');
        const line = t('boat.put', { place: EM.lang === 'ro' ? st[i].at : EM.nm(st[i]), item: EM.nm(items[i]) });
        caption.textContent = line;
        EM.say(line);
        await EM.wait(per); if (EM.stale(tok)) return;
      }
      caption.textContent = '';
      if (!(await EM.countdown(f.controls, 3 + n, tok))) return;
      slotEls.forEach((s) => { s.textContent = '❔'; s.classList.remove('pop'); });
      hint.textContent = t('boat.q');
      EM.say(hint.textContent);
      const palette = EM.shuffle(items.concat(EM.sample(EM.OBJECTS.filter((x) => !items.includes(x)), Math.min(4, 2 + Math.ceil(n / 3)))));
      const picked = [];
      const pal = h('div', { class: 'opts' });
      f.stage.appendChild(pal);
      const undo = EM.btn(t('ui.undo'), () => { picked.pop(); draw(); }, 'alt small');
      f.controls.appendChild(undo);
      draw();
      function draw() {
        slotEls.forEach((s, i) => { s.textContent = picked[i] ? picked[i].e : '❔'; s.className = 'islot' + (picked[i] ? ' full' : ''); });
        EM.clear(pal);
        palette.forEach((o) => pal.appendChild(h('button', { class: 'opt', disabled: picked.includes(o), onclick: () => { picked.push(o); draw(); if (picked.length === n) setTimeout(finish, 300); } }, h('span', { class: 'em' }, o.e), h('small', null, EM.nm(o)))));
      }
      function finish() {
        [...pal.children].forEach((b) => (b.disabled = true));
        let good = 0;
        slotEls.forEach((s, i) => {
          if (picked[i] === items[i]) { good++; s.classList.add('right'); }
          else { s.classList.add('wrong'); s.appendChild(h('small', { class: 'was' }, items[i].e)); }
        });
        const ok = good === n;
        const ev = EM.adapt.record(g, ok, n, { good });
        feedback(f.stage, ok, ok ? t('boat.ok', { n }) : t('boat.no', { k: good, n }));
        EM.levelEvent(ev, g);
        nextRow(f.controls, trial);
      }
    }
  };

  /* =========================================================
     6. SCHIMBĂ REGULA — atenție, autocontrol, flexibilitate
     L1: regula se schimbă la 5 cărți, rândul activ e luminat
     L2: se schimbă la 2–4 cărți, rândul activ e luminat
     L3: regula se poate schimba la fiecare carte, fără ajutor
     L4: ca L3, cu 4 secunde pe carte
     ========================================================= */
  G.sw = function () {
    const g = 'sw';
    const f = EM.frame({ g, icon: '🔀', title: 'sw.title', story: 'sw.story', tip: 'tip.sw', levelLabel: (l) => t('sw.lvl' + l) });
    const pool = EM.ANIMALS.filter((a) => a.sw);
    intro();
    function intro() {
      EM.clear(f.stage); EM.clear(f.controls);
      f.stage.appendChild(h('div', { class: 'rules' },
        h('div', { class: 'rule hab' }, '🏠 ', h('b', null, t('sw.habQ')), ' → 💧 ', t('sw.water'), ' · 🌳 ', t('sw.land'), ' · ☁️ ', t('sw.air')),
        h('div', { class: 'rule size' }, '📏 ', h('b', null, t('sw.sizeQ')), ' → 🐭 ', t('sw.small'), ' · 🐘 ', t('sw.big'), h('small', null, ' (', t('sw.bigdef'), ')'))));
      f.controls.appendChild(EM.btn(t('sw.start'), block, 'pulse'));
    }
    async function block() {
      const tok = EM.newRun();
      const lv = EM.adapt.level(g), N = 10;
      // succesiunea regulilor
      const rules = [];
      let r = EM.pick(['hab', 'size']);
      if (lv === 1) { for (let i = 0; i < N; i++) { if (i === 5) r = r === 'hab' ? 'size' : 'hab'; rules.push(r); } }
      else if (lv === 2) { let left = 2 + EM.rand(3); for (let i = 0; i < N; i++) { if (left === 0) { r = r === 'hab' ? 'size' : 'hab'; left = 2 + EM.rand(3); } rules.push(r); left--; } }
      else { for (let i = 0; i < N; i++) rules.push(EM.pick(['hab', 'size'])); }
      let cards = [];
      while (cards.length < N) cards = cards.concat(EM.shuffle(pool));
      cards = cards.slice(0, N);
      const helpRow = lv <= 2, limit = lv === 4 ? 4000 : 0;
      EM.clear(f.stage); EM.clear(f.controls);
      const cue = h('div', { class: 'cue' });
      const card = h('div', { class: 'swcard' });
      const timer = h('div', { class: 'cd thin' }, h('i'));
      const counter = h('div', { class: 'hint small' });
      const rowHab = h('div', { class: 'swrow hab' });
      const rowSize = h('div', { class: 'swrow size' });
      [['water', '💧'], ['land', '🌳'], ['air', '☁️']].forEach(([k, e]) => rowHab.appendChild(h('button', { class: 'swb', 'data-k': k, onclick: () => ans('hab', k) }, e, ' ', t('sw.' + k))));
      [['small', '🐭'], ['big', '🐘']].forEach(([k, e]) => rowSize.appendChild(h('button', { class: 'swb', 'data-k': k, onclick: () => ans('size', k) }, e, ' ', t('sw.' + k))));
      f.stage.appendChild(counter); f.stage.appendChild(cue); f.stage.appendChild(card);
      if (limit) f.stage.appendChild(timer);
      f.stage.appendChild(rowHab); f.stage.appendChild(rowSize);
      let i = 0, good = 0, t0 = 0, waiting = false, to = null;
      const rts = [];
      show();
      function show() {
        if (EM.stale(tok)) return;
        const rr = rules[i], a = cards[i];
        counter.textContent = t('sw.count', { i: i + 1, n: N });
        cue.className = 'cue ' + rr;
        cue.textContent = rr === 'hab' ? '🏠 ' + t('sw.habQ') : '📏 ' + t('sw.sizeQ');
        if (i > 0 && rules[i - 1] !== rr) { cue.classList.add('changed'); }
        card.innerHTML = '';
        card.appendChild(h('span', { class: 'em' }, a.e)); card.appendChild(h('small', null, EM.nm(a)));
        card.classList.remove('pop'); void card.offsetWidth; card.classList.add('pop');
        rowHab.classList.toggle('lit', helpRow && rr === 'hab'); rowHab.classList.toggle('dim', helpRow && rr !== 'hab');
        rowSize.classList.toggle('lit', helpRow && rr === 'size'); rowSize.classList.toggle('dim', helpRow && rr !== 'size');
        t0 = performance.now(); waiting = true;
        if (limit) {
          const fill = timer.firstChild;
          fill.style.transition = 'none'; fill.style.width = '100%';
          requestAnimationFrame(() => requestAnimationFrame(() => { fill.style.transition = 'width ' + limit / 1000 + 's linear'; fill.style.width = '0%'; }));
          to = setTimeout(() => ans(null, null), limit);
        }
      }
      function ans(rowKind, k) {
        if (!waiting || EM.stale(tok)) return;
        waiting = false; clearTimeout(to);
        const rr = rules[i], a = cards[i];
        const right = rr === 'hab' ? a.hab : a.size;
        const ok = rowKind === rr && k === right;
        rts.push(performance.now() - t0);
        if (ok) good++;
        card.classList.add(ok ? 'right' : 'wrong');
        if (!ok) card.appendChild(h('div', { class: 'swans' }, rr === 'hab' ? t('sw.' + right) : t('sw.' + right)));
        setTimeout(() => { card.classList.remove('right', 'wrong'); i++; if (i < N) show(); else end(); }, ok ? 450 : 1300);
      }
      function end() {
        if (EM.stale(tok)) return;
        const acc = Math.round((good / N) * 100);
        const rt = Math.round(rts.reduce((a, b) => a + b, 0) / rts.length / 100) / 10;
        const ok = good >= 8;
        EM.clear(f.stage);
        const ev = EM.adapt.record(g, ok, acc, { good, rt });
        f.stage.appendChild(h('div', { class: 'scorebig' }, good, ' / ', N));
        f.stage.appendChild(h('p', { class: 'hint' }, t('sw.rt', { s: String(rt).replace('.', EM.lang === 'ro' ? ',' : '.') })));
        feedback(f.stage, ok, ok ? t('sw.ok') : t('sw.no'));
        EM.levelEvent(ev, g);
        nextRow(f.controls, block);
      }
    }
  };

  /* =========================================================
     7. FINAL DE ORĂ — reamintire întârziată + „Ce te-a ajutat să ții minte?" + rezumat
     ========================================================= */
  G.final = function () {
    const s = EM.ensureSession();
    const f = EM.frame({ icon: '🏁', title: 'fin.title', story: 'fin.story' });
    if (s.kimFirst && !s.delayed) delayed(); else strategies();

    function delayed() {
      EM.clear(f.stage); EM.clear(f.controls);
      const seen = s.kimFirst.map((id) => EM.byId[id]).filter(Boolean);
      const extra = EM.sample(EM.KIM_POOL.filter((x) => !s.kimFirst.includes(x.id)), Math.min(seen.length + 2, 12 - seen.length > 0 ? 12 - seen.length : 2));
      const all = EM.shuffle(seen.concat(extra));
      const sel = new Set();
      f.stage.appendChild(h('h3', null, '🔍 ', t('fin.dTitle')));
      f.stage.appendChild(h('p', { class: 'hint' }, t('fin.dQ', { n: seen.length })));
      EM.say(t('fin.dQ', { n: seen.length }));
      const grid = h('div', { class: 'opts wide' });
      all.forEach((it) => grid.appendChild(h('button', { class: 'opt', onclick: (e) => { const b = e.currentTarget; if (sel.has(it)) { sel.delete(it); b.classList.remove('sel'); } else { sel.add(it); b.classList.add('sel'); } } }, h('span', { class: 'em' }, it.e), h('small', null, EM.nm(it)))));
      f.stage.appendChild(grid);
      f.controls.appendChild(EM.btn(t('ui.check'), () => {
        let hits = 0, fa = 0;
        [...grid.children].forEach((b, i) => {
          const it = all[i], was = seen.includes(it);
          b.disabled = true;
          if (sel.has(it) && was) { hits++; b.classList.add('right'); }
          else if (sel.has(it)) { fa++; b.classList.add('wrong'); }
          else if (was) b.classList.add('missed');
        });
        s.delayed = { hits, fa, total: seen.length };
        EM.store.save();
        feedback(f.stage, hits >= Math.ceil(seen.length * 0.7) && fa <= 1, t('fin.dRes', { k: hits, n: seen.length, f: fa }));
        EM.clear(f.controls);
        f.controls.appendChild(EM.btn(t('ui.next'), strategies, 'pulse'));
      }));
      f.controls.appendChild(EM.btn(t('fin.skip'), () => { strategies(); }, 'alt small'));
    }

    function strategies() {
      EM.clear(f.stage); EM.clear(f.controls);
      const q = t('fin.sQ');
      f.stage.appendChild(h('h3', { class: 'qbig' }, '💭 ', q, ' ', EM.readBtn(q)));
      f.stage.appendChild(h('p', { class: 'hint' }, t('fin.sHint')));
      EM.say(q);
      const chosen = new Set(s.strategies || []);
      const chips = h('div', { class: 'chips' });
      EM.STRATEGIES.forEach((st) => chips.appendChild(h('button', { class: 'chip' + (chosen.has(st.id) ? ' on' : ''), onclick: (e) => { if (chosen.has(st.id)) chosen.delete(st.id); else chosen.add(st.id); e.currentTarget.classList.toggle('on'); } }, st.e, ' ', t('st.' + st.id))));
      f.stage.appendChild(chips);
      const other = h('input', { class: 'txt', placeholder: t('fin.other'), value: s.other || '' });
      const hard = h('input', { class: 'txt', placeholder: t('fin.hard'), value: s.hard || '' });
      const note = h('textarea', { class: 'txt', rows: 2, placeholder: t('fin.note') });
      note.value = s.note || '';
      f.stage.appendChild(other); f.stage.appendChild(hard); f.stage.appendChild(note);
      f.controls.appendChild(EM.btn(t('fin.save'), () => {
        s.strategies = [...chosen]; s.other = other.value.trim(); s.hard = hard.value.trim(); s.note = note.value.trim();
        EM.store.save();
        summary();
      }, 'pulse'));
    }

    function summary() {
      EM.clear(f.stage); EM.clear(f.controls);
      f.stage.appendChild(h('h3', null, '📊 ', t('fin.sumTitle')));
      f.stage.appendChild(EM.summaryTable(s, EM.prevSession()));
      if (s.strategies.length || s.other) f.stage.appendChild(h('p', { class: 'hint' }, '💭 ', t('fin.helped'), ' ', s.strategies.map((x) => t('st.' + x)).concat(s.other ? [s.other] : []).join(', ')));
      f.stage.appendChild(h('p', { class: 'hint' }, '🌱 ', t('fin.nextTime')));
      if (!s.end) {
        f.controls.appendChild(EM.btn(t('fin.close'), () => {
          s.end = Date.now(); EM.store.save(); EM.session = null;
          EM.burst('⭐'); EM.say(t('fin.bye', { name: EM.store.data.student }));
          EM.toast(t('fin.closed'), 'good');
          EM.home();
        }, 'pulse'));
      }
      f.controls.appendChild(EM.btn(t('ui.toMap'), EM.home, 'alt'));
    }
  };
})();
