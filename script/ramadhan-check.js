const el  = (id) => document.getElementById(id);
const LS  = (key) => { try { return JSON.parse(localStorage.getItem(key)); } catch(e){ return null; } };
const LSS = (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch(e){} };

var nav = el('mainNav');
  window.addEventListener('scroll', function () {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  });
 
var toggle = el('navToggle');
var links  = el('navLinks');
  toggle.addEventListener('click', function () {
    var open = links.classList.toggle('open');
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
  });
  links.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      links.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
  
function showToast(id) {
  const t = el(id);
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

function statusChip(el_id, pct, thresholds) {
  const chip = el(el_id);
  chip.className = 'status-chip';
  if (pct === 100) {
    chip.classList.add('chip-done');
    chip.textContent = thresholds[2];
  } else if (pct >= thresholds.mid) {
    chip.classList.add('chip-mid');
    chip.textContent = thresholds[1];
  } else {
    chip.classList.add('chip-low');
    chip.textContent = thresholds[0];
  }
}

function setBar(barId, pctId, pct) {
  el(barId).style.width = pct + '%';
  el(pctId).textContent = Math.round(pct) + '%';
}

//navigasi
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    el('tab-' + btn.dataset.tab).classList.add('active');
  });
});

//all progress update
function updateGlobal() {
  const s = getShalatPct();
  const q = getQuranPct();
  const p = getPuasaPct();
  const d = getDzikirPct();

  el('pctShalat').textContent = Math.round(s) + '%';
  el('pctQuran').textContent  = Math.round(q) + '%';
  el('pctPuasa').textContent  = Math.round(p) + '%';
  el('pctDzikir').textContent = Math.round(d) + '%';

  const avg = (s + q + p + d) / 4;
  const mot = el('motivasiGlobal');
  if (avg === 0)        mot.textContent = 'Mulai lagi hari ini! ✨';
  else if (avg < 40)    mot.textContent = 'Ayo semangat! 💪';
  else if (avg < 80)    mot.textContent = 'Luar biasa, lanjutkan! 🌟';
  else if (avg < 100)   mot.textContent = 'Ayo sedikit lagi! 🔥';
  else                  mot.textContent = 'MasyaAllah, sempurna! 🏆';
}

//pengaturan tab shalat
const SHALAT_KEY = 'todo_shalat';
let shalatData = LS(SHALAT_KEY) || {};

function getShalatPct() {
  const done = Object.values(shalatData).filter(Boolean).length;
  return (done / 5) * 100;
}

function renderShalat() {
  const pct = getShalatPct();
  setBar('shalatBar', 'shalatPct', pct);
  statusChip('shalatStatus', pct, ['Belum optimal', 'Cukup baik 👍', 'MasyaAllah lengkap! 🌟']);

  document.querySelectorAll('.shalat-item').forEach(item => {
    const id = item.dataset.id;
    item.classList.toggle('checked', !!shalatData[id]);
  });
  updateGlobal();
}

document.querySelectorAll('.shalat-item').forEach(item => {
  item.addEventListener('click', () => {
    const id = item.dataset.id;
    shalatData[id] = !shalatData[id];
    renderShalat();
  });
});

el('btnSaveShalat').addEventListener('click', () => {
  LSS(SHALAT_KEY, shalatData);
  showToast('toastShalat');
});

//quran
const QURAN_KEY = 'todo_quran';
let quranData = LS(QURAN_KEY) || { target: '', dibaca: '', selesai: false };

function getQuranPct() {
  if (quranData.selesai) return 100;
  const t = parseFloat(quranData.target) || 0;
  const d = parseFloat(quranData.dibaca) || 0;
  if (!t) return 0;
  return Math.min((d / t) * 100, 100);
}

function renderQuran() {
  const pct = getQuranPct();
  setBar('quranBar', 'quranPct', pct);
  statusChip('quranStatus', pct, ['Masih bisa ditambah 📖', 'Hampir selesai! 🌙', 'Target tercapai! 🎉']);

  el('targetHalaman').value = quranData.target || '';
  el('halamanDibaca').value = quranData.dibaca || '';
  el('quranSelesai').checked = quranData.selesai || false;
  el('quranMarkLabel').classList.toggle('done', !!quranData.selesai);
  updateGlobal();
}

['targetHalaman','halamanDibaca'].forEach(id => {
  el(id).addEventListener('input', () => {
    quranData.target = el('targetHalaman').value;
    quranData.dibaca = el('halamanDibaca').value;
    renderQuran();
  });
});

el('quranSelesai').addEventListener('change', () => {
  quranData.selesai = el('quranSelesai').checked;
  renderQuran();
});

el('btnSaveQuran').addEventListener('click', () => {
  quranData.target = el('targetHalaman').value;
  quranData.dibaca = el('halamanDibaca').value;
  quranData.selesai = el('quranSelesai').checked;
  LSS(QURAN_KEY, quranData);
  showToast('toastQuran');
});

//puasa
const PUASA_KEY  = 'todo_puasa';
const RAMADHAN_START = new Date(2025, 2, 1); // 1 Maret 2025 (contoh)
let puasaData = LS(PUASA_KEY) || { hari: {} };

function getHariKe() {
  const now  = new Date();
  const diff = Math.floor((now - RAMADHAN_START) / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(1, Math.min(diff, 30));
}

function getPuasaPct() {
  const done = Object.values(puasaData.hari).filter(Boolean).length;
  return (done / 30) * 100;
}

function renderPuasa() {
  const hariKe = getHariKe();
  el('hariKeNum').textContent = hariKe;

  const pct = getPuasaPct();
  setBar('puasaBar', 'puasaPct', pct);

  const done = Object.values(puasaData.hari).filter(Boolean).length;
  const chip = el('puasaStatus');
  chip.className = 'status-chip';
  if (done === 30)       { chip.classList.add('chip-done'); chip.textContent = 'Alhamdulillah, puasa sempurna! 🏆'; }
  else if (pct >= 60)    { chip.classList.add('chip-mid');  chip.textContent = 'Hampir selesai, tetap semangat! 🌙'; }
  else                   { chip.classList.add('chip-low');  chip.textContent = 'Semangat berpuasa! 💪'; }

//Checkbox hari ini
  const todayDone = !!puasaData.hari[hariKe];
  el('puasaHariIni').checked = todayDone;
  el('puasaTodayLabel').classList.toggle('done', todayDone);
  el('puasaTodayText').textContent = todayDone
    ? `✅ Alhamdulillah, sudah puasa hari ke-${hariKe}!`
    : `Sudah puasa hari ini? (Hari ke-${hariKe})`;

//Render kalender
  const grid = el('kalenderGrid');
  grid.innerHTML = '';
  for (let i = 1; i <= 30; i++) {
    const div = document.createElement('div');
    div.className = 'kal-day';
    if (puasaData.hari[i]) {
      div.classList.add('puasa-done');
      div.textContent = '✓';
    } else {
      div.textContent = i;
    }
    if (i === hariKe) div.classList.add('today-mark');
    if (i > hariKe)   div.classList.add('future');

    div.addEventListener('click', () => {
      if (i > hariKe) return;
      puasaData.hari[i] = !puasaData.hari[i];
      renderPuasa();
      updateGlobal();
    });
    grid.appendChild(div);
  }
  updateGlobal();
}

el('puasaHariIni').addEventListener('change', () => {
  const hariKe = getHariKe();
  puasaData.hari[hariKe] = el('puasaHariIni').checked;
  renderPuasa();
});

el('btnSavePuasa').addEventListener('click', () => {
  LSS(PUASA_KEY, puasaData);
  showToast('toastPuasa');
});

//zikir
const ZIKIR_KEY = 'todo_dzikir';
const ZIKIR_LIST = [
  { id: 'subhanallah', ar: 'سُبْحَانَ اللّٰهِ',    lat: 'Subhanallah',    target: 33 },
  { id: 'alhamdulillah', ar: 'اَلْحَمْدُ لِلّٰهِ', lat: 'Alhamdulillah',  target: 33 },
  { id: 'allahuakbar', ar: 'اَللّٰهُ أَكْبَرُ',    lat: 'Allahuakbar',    target: 33 },
  { id: 'La ilaha illallah', ar: 'لَا إِلٰهَ إِلَّا اللّٰهُ',   lat: 'La ilaha illallah', target: 33 },
];
const Z_RING_CIRC = 2 * Math.PI * 75;

let zikirData = LS(ZIKIR_KEY) || {};
let z_activeId   = 'subhanallah';
let z_count      = 0;
let z_target     = 33;

ZIKIR_LIST.forEach(d => {
  if (zikirData[d.id] === undefined) {
    zikirData[d.id] = 0;
  }
});
function getDzikirPct() {
  const total = ZIKIR_LIST.reduce((s, d) => s + d.target, 0);
  const done  = ZIKIR_LIST.reduce((s, d) => s + Math.min(zikirData[d.id], d.target), 0);
  return (done / total) * 100;
}

function dz2UpdateUI() {
//summary bar (top)
  const totalPct = getDzikirPct();
  setBar('zikirBar', 'zikirPct', totalPct);
  statusChip('zikirStatus', totalPct, ['Belum optimal', 'Cukup baik 👍', 'MasyaAllah lengkap! 🌟']);

//ring for active dzikir
  const ratio  = Math.min(z_count / z_target, 1);
  const offset = Z_RING_CIRC * (1 - ratio);
  el('zikirRingFill').style.strokeDashoffset = offset;
  el('zikirRingFill').style.stroke = ratio >= 1 ? '#C9A84C' : 'var(--gold)';
  el('zikirCountNum').textContent  = z_count;
  el('zikirTargetLbl').textContent = `/ ${z_target}`;
  el('zikirBarFill').style.width   = (ratio * 100) + '%';

//kunci
  const selesai = z_count >= z_target;
  el('zikirBtnTambah').disabled = selesai;
  el('zikirLockedHint').classList.toggle('show', selesai);
  el('zikirBtnTambah').querySelector('.zikir-icon').textContent = selesai ? '✓' : '+';

//notif
  const notif = el('zikirNotif');
  if (z_count > 0 && z_count === z_target) {
    el('zikirNotifText').textContent = 'Target tercapai! Alhamdulillah 🤲';
    notif.classList.remove('show');
    void notif.offsetWidth;
    notif.classList.add('show');
  } else if (z_count === 0) {
    notif.classList.remove('show');
  }

  updateGlobal();
}

function dz2SetActive(id) {
  z_activeId = id;
  const zikir = ZIKIR_LIST.find(d => d.id === id);
  z_target    = zikir.target;
  z_count     = zikirData[id] || 0;

//fade text
  const arEl = el('zikirArabic');
  const laEl = el('zikirLatin');
  arEl.style.opacity = '0'; laEl.style.opacity = '0';
  setTimeout(() => {
    arEl.textContent   = zikir.ar;
    laEl.textContent   = zikir.lat;
    arEl.style.opacity = '1'; laEl.style.opacity = '1';
  }, 200);

  dz2UpdateUI();
}

//Selector buttons
document.querySelectorAll('.zikir-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.zikir-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    dz2SetActive(btn.dataset.id);
  });
});

//Tambah
el('zikirBtnTambah').addEventListener('click', (e) => {
  if (z_count >= z_target) return;
  z_count++;
  zikirData[z_activeId] = z_count;

//bump animation
  const num = el('zikirCountNum');
  num.classList.remove('bump');
  void num.offsetWidth;
  num.classList.add('bump');

//ripple
  const btn  = el('zikirBtnTambah');
  const rect = btn.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const rip  = document.createElement('span');
  rip.className = 'zikir-ripple'
  rip.style.cssText = `width:${size}px;height:${size}px;left:${(e.clientX||rect.left+rect.width/2)-rect.left-size/2}px;top:${(e.clientY||rect.top+rect.height/2)-rect.top-size/2}px`;
  btn.appendChild(rip);
  rip.addEventListener('animationend', () => rip.remove());

  dz2UpdateUI();
});

// Reset (hanya reset dzikir aktif)
el('zikirBtnReset').addEventListener('click', () => {
  z_count = 0;
  zikirData[z_activeId] = 0;
  el('zikirNotif').classList.remove('show');
  dz2UpdateUI();
});

// Target pills
document.querySelectorAll('.zikir-pill').forEach(pill => {
  pill.addEventListener('click', () => {
    document.querySelectorAll('.zikir-pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    z_target = parseInt(pill.dataset.val);
    z_count  = 0;
    zikirData[z_activeId] = 0;
    el('zikirNotif').classList.remove('show');
    dz2UpdateUI();
  });
});

function renderDzikir() {
//load fresh data from storage for today
  const fresh = LS(ZIKIR_KEY) || {};
  ZIKIR_LIST.forEach(d => { zikirData[d.id] = fresh[d.id] || 0; });
  z_count = zikirData[z_activeId] || 0;
  dz2UpdateUI();
}
el('btnSaveZikir').addEventListener('click', () => {
  LSS(ZIKIR_KEY, zikirData);
  showToast('toastZikir');
});

//init
renderShalat();
renderQuran();
renderPuasa();
renderDzikir();
updateGlobal();