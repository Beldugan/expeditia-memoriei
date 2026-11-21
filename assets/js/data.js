/* Expediția memoriei — animale, obiecte, locuri pe râu, lanțuri de recapitulare */
(function () {
  'use strict';
  const EM = (window.EM = window.EM || {});

  /* hab: apă / uscat / aer · size: mic / mare (mare = mai mare decât o pisică) · sw: folosit la „Schimbă regula" */
  EM.ANIMALS = [
    { id: 'caiman', e: '🐊', ro: 'caimanul', en: 'caiman', hab: 'water', size: 'big', sw: 1 },
    { id: 'dolphin', e: '🐬', ro: 'delfinul roz', en: 'pink river dolphin', hab: 'water', size: 'big', sw: 1 },
    { id: 'otter', e: '🦦', ro: 'vidra uriașă', en: 'giant otter', hab: 'water', size: 'big', sw: 1 },
    { id: 'piranha', e: '🐟', ro: 'piranha', en: 'piranha', hab: 'water', size: 'small', sw: 1 },
    { id: 'fish', e: '🐠', ro: 'peștișorul colorat', en: 'little coloured fish', hab: 'water', size: 'small', sw: 1 },
    { id: 'crab', e: '🦀', ro: 'crabul de râu', en: 'river crab', hab: 'water', size: 'small', sw: 1 },
    { id: 'shrimp', e: '🦐', ro: 'creveta', en: 'shrimp', hab: 'water', size: 'small', sw: 1 },
    { id: 'parrot', e: '🦜', ro: 'papagalul', en: 'parrot', hab: 'air', size: 'small', sw: 1 },
    { id: 'eagle', e: '🦅', ro: 'vulturul harpie', en: 'harpy eagle', hab: 'air', size: 'big', sw: 1 },
    { id: 'butterfly', e: '🦋', ro: 'fluturele', en: 'butterfly', hab: 'air', size: 'small', sw: 1 },
    { id: 'bee', e: '🐝', ro: 'albina', en: 'bee', hab: 'air', size: 'small', sw: 1 },
    { id: 'bat', e: '🦇', ro: 'liliacul', en: 'bat', hab: 'air', size: 'small', sw: 1 },
    { id: 'owl', e: '🦉', ro: 'bufnița', en: 'owl', hab: 'air', size: 'small', sw: 1 },
    { id: 'bird', e: '🐦', ro: 'colibriul', en: 'hummingbird', hab: 'air', size: 'small', sw: 1 },
    { id: 'monkey', e: '🐒', ro: 'maimuța', en: 'monkey', hab: 'land', size: 'small', sw: 1 },
    { id: 'jaguar', e: '🐆', ro: 'jaguarul', en: 'jaguar', hab: 'land', size: 'big', sw: 1 },
    { id: 'deer', e: '🦌', ro: 'căprioara de mlaștină', en: 'marsh deer', hab: 'land', size: 'big', sw: 1 },
    { id: 'boar', e: '🐗', ro: 'pecariul', en: 'peccary', hab: 'land', size: 'big', sw: 1 },
    { id: 'ant', e: '🐜', ro: 'furnica', en: 'ant', hab: 'land', size: 'small', sw: 1 },
    { id: 'spider', e: '🕷️', ro: 'tarantula', en: 'tarantula', hab: 'land', size: 'small', sw: 1 },
    { id: 'snail', e: '🐌', ro: 'melcul', en: 'snail', hab: 'land', size: 'small', sw: 1 },
    { id: 'lizard', e: '🦎', ro: 'iguana', en: 'iguana', hab: 'land', size: 'small', sw: 1 },
    { id: 'bug', e: '🐛', ro: 'omida', en: 'caterpillar', hab: 'land', size: 'small', sw: 1 },
    { id: 'sloth', e: '🦥', ro: 'leneșul', en: 'sloth', hab: 'land', size: 'small' },
    { id: 'snake', e: '🐍', ro: 'anaconda', en: 'anaconda', hab: 'water', size: 'big' },
    { id: 'frog', e: '🐸', ro: 'broasca', en: 'frog', hab: 'land', size: 'small' },
    { id: 'turtle', e: '🐢', ro: 'țestoasa', en: 'turtle', hab: 'water', size: 'small' },
    { id: 'capy', e: '🦫', ro: 'capibara', en: 'capybara', hab: 'land', size: 'big' }
  ];

  /* lucrurile din rucsacul exploratorului */
  EM.OBJECTS = [
    { id: 'pack', e: '🎒', ro: 'rucsacul', en: 'backpack' },
    { id: 'compass', e: '🧭', ro: 'busola', en: 'compass' },
    { id: 'torch', e: '🔦', ro: 'lanterna', en: 'torch' },
    { id: 'map', e: '🗺️', ro: 'harta', en: 'map' },
    { id: 'banana', e: '🍌', ro: 'banana', en: 'banana' },
    { id: 'coconut', e: '🥥', ro: 'nuca de cocos', en: 'coconut' },
    { id: 'pine', e: '🍍', ro: 'ananasul', en: 'pineapple' },
    { id: 'mango', e: '🥭', ro: 'mango', en: 'mango' },
    { id: 'tent', e: '⛺', ro: 'cortul', en: 'tent' },
    { id: 'camera', e: '📷', ro: 'aparatul foto', en: 'camera' },
    { id: 'cap', e: '🧢', ro: 'șapca', en: 'cap' },
    { id: 'boots', e: '🥾', ro: 'bocancii', en: 'boots' },
    { id: 'choc', e: '🍫', ro: 'ciocolata', en: 'chocolate' },
    { id: 'glasses', e: '🕶️', ro: 'ochelarii de soare', en: 'sunglasses' },
    { id: 'umbrella', e: '☂️', ro: 'umbrela', en: 'umbrella' },
    { id: 'rod', e: '🎣', ro: 'undița', en: 'fishing rod' },
    { id: 'book', e: '📓', ro: 'jurnalul', en: 'notebook' },
    { id: 'pencil', e: '✏️', ro: 'creionul', en: 'pencil' },
    { id: 'battery', e: '🔋', ro: 'bateria', en: 'battery' },
    { id: 'magnet', e: '🧲', ro: 'magnetul', en: 'magnet' },
    { id: 'plaster', e: '🩹', ro: 'plasturele', en: 'plaster' },
    { id: 'key', e: '🔑', ro: 'cheia', en: 'key' },
    { id: 'bell', e: '🔔', ro: 'clopoțelul', en: 'bell' },
    { id: 'ball', e: '⚽', ro: 'mingea', en: 'ball' },
    { id: 'clock', e: '⏰', ro: 'ceasul', en: 'alarm clock' },
    { id: 'rope', e: '🧶', ro: 'ghemul de sfoară', en: 'ball of string' }
  ];
  EM.KIM_POOL = EM.ANIMALS.concat(EM.OBJECTS);
  EM.byId = {};
  EM.KIM_POOL.forEach((x) => (EM.byId[x.id] = x));

  /* locurile de pe râu — pentru „Barca exploratorului" (metoda locurilor) */
  EM.STATIONS = [
    { e: '🛶', ro: 'debarcaderul', at: 'debarcader', en: 'the jetty' },
    { e: '🏘️', ro: 'satul', at: 'sat', en: 'the village' },
    { e: '🌉', ro: 'podul', at: 'pod', en: 'the bridge' },
    { e: '🧱', ro: 'barajul', at: 'baraj', en: 'the dam' },
    { e: '🐟', ro: 'scara peștilor', at: 'scara peștilor', en: 'the fish ladder' },
    { e: '🌳', ro: 'copacul uriaș', at: 'copacul uriaș', en: 'the giant tree' },
    { e: '🏝️', ro: 'insula', at: 'insulă', en: 'the island' },
    { e: '🌊', ro: 'cascada', at: 'cascadă', en: 'the waterfall' },
    { e: '🐬', ro: 'golful delfinilor', at: 'golful delfinilor', en: 'dolphin bay' },
    { e: '🏁', ro: 'portul', at: 'port', en: 'the harbour' }
  ];

  /* încălzire: lanțuri din lecțiile recente (Inginerii Amazonului, Lecția 39, FD06) */
  EM.CHAINS = [
    { id: 'hydro', e: '⚡', ro: 'Hidrocentrala de pe Xingu', en: 'The Xingu power station', steps: [
      { e: '💧', ro: 'Apa cade din lac', en: 'Water falls from the lake' },
      { e: '⚙️', ro: 'Turbina se învârte', en: 'The turbine spins' },
      { e: '🧲', ro: 'Generatorul face curent', en: 'The generator makes electricity' },
      { e: '⚡', ro: 'Firele duc curentul', en: 'The wires carry the electricity' },
      { e: '💡', ro: 'Casele se aprind', en: 'The houses light up' }] },
    { id: 'water', e: '🌧️', ro: 'Circuitul apei', en: 'The water cycle', steps: [
      { e: '☀️', ro: 'Soarele încălzește apa', en: 'The Sun warms the water' },
      { e: '♨️', ro: 'Apa se evaporă', en: 'The water evaporates' },
      { e: '☁️', ro: 'Vaporii fac nori', en: 'The vapour makes clouds' },
      { e: '🌧️', ro: 'Plouă', en: 'It rains' },
      { e: '🏞️', ro: 'Apa curge înapoi în râu', en: 'The water flows back into the river' }] },
    { id: 'motor', e: '🔄', ro: 'Primul motor electric', en: 'The first electric motor', steps: [
      { e: '🔋', ro: 'Bateria dă curent', en: 'The battery gives electricity' },
      { e: '🔌', ro: 'Curentul trece prin fire', en: 'The current goes through the wires' },
      { e: '🌀', ro: 'Bobina devine magnet', en: 'The coil becomes a magnet' },
      { e: '🧲', ro: 'Magnetul o împinge', en: 'The magnet pushes it' },
      { e: '🔁', ro: 'Motorul se învârte', en: 'The motor spins' }] }
  ];

  EM.STRATEGIES = [
    { id: 'group', e: '🗂️' }, { id: 'repeat', e: '🔁' }, { id: 'picture', e: '🖼️' },
    { id: 'story', e: '📖' }, { id: 'places', e: '🗺️' }, { id: 'chunks', e: '🔢' },
    { id: 'shape', e: '🔷' }, { id: 'slow', e: '🐢' }, { id: 'aloud', e: '🗣️' }
  ];
})();
