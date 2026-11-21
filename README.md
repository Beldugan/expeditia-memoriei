# 🧭 Expediția memoriei · The Memory Expedition

Aplicație pentru copii (~7–10 ani), în **română și engleză**, care antrenează memoria și atenția în lumea Amazonului (continuă `amazon-eva` și `inginerii-amazonului`). Are 8 opriri pe hartă, în ordinea unei ore de ~50 de minute, și un modul cu probleme în stil **Primary Kangaroo**.

## Opririle de pe hartă

| # | Joc | Ce antrenează | Cum crește nivelul |
|---|-----|---------------|--------------------|
| 1 | 🔥 **Încălzirea** | reamintire din lecțiile trecute | pune în ordine pașii: hidrocentrala de pe Xingu, circuitul apei (L39), motorul electric (FD06) |
| 2 | 🔍 **Ce lipsește?** (jocul lui Kim) | memorie vizuală | nivel L = L+3 lucruri; de la nivelul 5 lucrurile își schimbă și locul |
| 3 | 🔐 **Codul seifului** | memoria de lucru | cifre **în ordine** (2–9) și **invers** (2–8), fiecare cu nivelul lui |
| 4 | 🗺️ **Harta râului** | memorie vizual-spațială | 2–9 animale de ținut minte pe grilă (4×4, apoi 5×5) |
| 5 | 🛶 **Barca exploratorului** | listă în ordine + metoda locurilor | 2–10 lucruri lăsate la opririle de pe râu |
| 6 | 🔀 **Schimbă regula** | atenție, autocontrol, flexibilitate | regula (mediu / mărime) se schimbă tot mai des; la nivelul 4 ai 4 secunde pe cartonaș |
| 7 | 🦘 **Provocarea Kangaroo** | raționament | 5 tipuri × 3 niveluri (vezi mai jos) |
| 8 | 🏁 **Finalul** | reamintire întârziată + strategii | „Mai ții minte ce ai văzut la începutul orei?" și „Ce te-a ajutat să ții minte?" |

Fiecare joc are un **„Truc al exploratorului"** (o strategie de memorare: grupare, chunking, forme, metoda locurilor), cu buton 🔊 Citește-mi.

## 🦘 Provocarea Kangaroo

Probleme **originale**, generate aleator la fiecare apăsare, inspirate de tipurile din Primary Kangaroo (nu sunt copiate din lucrările UKMT):

| Tip | Inspirat de | Nivel 1 | Nivel 2 (cu memorie) | Nivel 3 (ca la concurs) |
|-----|-------------|---------|----------------------|--------------------------|
| 🕵️ Detectivul junglei | indicii logice (cine are ce) | 3 exploratori, indiciile la vedere | indiciile apar pe rând și dispar | 4 exploratori |
| ⛵ Tiparul bărcilor | șiruri care se repetă | tipar de 3–4 bărci | tiparul se ascunde | corp + pânză cu tipare diferite: „câte bărci sunt…?" |
| 📸 Camera de pe pod | ordinea din fotografii | 4 animale | pozele se ascund | 5 animale |
| 🧭 Curentul râului | grilă cu săgeți, drum prin toate pătratele | 3×3 | 3×4 | 4×4 |
| 🗿 Codul tribului | cifre scrise cu simboluri | cheia la vedere | cheia se ascunde după 14 s | fără cheie: potrivești tiparele |

Variantele de răspuns sunt A–E. Butonul **💡 Indiciu** ajută, dar un răspuns cu indiciu nu se numără la urcarea nivelului. Fiecare problemă are explicația soluției.

## Cele trei sfaturi practice, integrate

1. **Notează scorurile.** Aplicația notează singură, pentru fiecare oră: cifre înainte și invers, numărul de poziții, lungimea listei, câte lucruri la „Ce lipsește?", reamintirea de la final, strategiile alese. 👩‍🏫 **Profesor → Jurnal** arată orele una sub alta, cu ⬆️ unde e mai bine decât ora trecută. **Export CSV** se deschide în Excel (separator `;`).
2. **Crește dificultatea doar după 2 reușite la rând.** Nivelul urcă automat după 2 reușite la rând și coboară după 2 greșeli la rând. Bara de sus arată rata de reușită față de ținta **70–80%** (zona verde). Butoanele − / + schimbă nivelul de mână. Ora următoare fiecare joc pornește cu **un nivel sub** cel atins, ca încălzire.
3. **„Ce te-a ajutat să ții minte?"** Ultima oprire pune întrebarea, cu variante pe care Eva le bifează (am grupat, am repetat în gând, mi-am făcut o imagine, metoda locurilor…) plus „altceva", „ce a fost cel mai greu" și notițe pentru profesor. Totul intră în jurnal.

## Panoul profesorului (👩‍🏫)

- **Planul orei** — cele 8 opriri cu minutele (0–5, 5–13, …), bifate automat când au fost jucate, și butonul „Deschide".
- **Azi** — tabelul orei: nivel start → acum, reușite cu culoarea zonei, cel mai bun rezultat, nivelul de pornire de data viitoare.
- **Jurnal** — toate orele; Export CSV, Backup (JSON) și Importă backup.
- **Reguli** — cele trei reguli, numele elevei, resetarea nivelurilor.

Jurnalul se păstrează în browser (localStorage), separat pentru fiecare adresă și browser. Pe GitHub Pages rămâne de la o oră la alta, dar fă din când în când **Backup**. Dacă schimbi calculatorul, folosește **Importă backup**.

## În lecția online (Preply)

Partajezi ecranul; Eva răspunde cu voce tare și tu apeși. Butonul **✋ Gata, am memorat!** oprește timpul de memorare când e pregătită. Vocea (🔊 sus) citește cifrele, lucrurile din barcă și instrucțiunile; o poți opri din 🔇. Cu tableta grafică poți încercui pe ecran în timpul jocului.

## Structura

```
index.html
assets/css/style.css
assets/js/i18n.js      textele RO / EN
assets/js/core.js      stare, nivel adaptiv, jurnal, voce, cadrul jocurilor
assets/js/data.js      animale, obiecte, opririle de pe râu, lanțurile de recapitulare
assets/js/games.js     jocurile 1–6 și finalul
assets/js/kangaroo.js  generatoarele Kangaroo + ecranele
assets/js/teacher.js   panoul profesorului, jurnal, export
assets/js/app.js       harta (meniul) și pornirea
```

Fără biblioteci externe, fără server: merge și cu dublu-click pe `index.html`, și offline. `index.html?lang=en` pornește direct în engleză.

## Publicare pe GitHub Pages

1. Creează repo-ul `expeditia-memoriei` și urcă tot conținutul folderului, inclusiv `.github/` (comenzile sunt în `adresa pagina aplicatie.txt`).
2. **Settings → Pages → Source: GitHub Actions**. Workflow-ul `pages.yml` publică automat la fiecare push pe `main`.
3. Aplicația va fi la `https://beldugan.github.io/expeditia-memoriei/`.
