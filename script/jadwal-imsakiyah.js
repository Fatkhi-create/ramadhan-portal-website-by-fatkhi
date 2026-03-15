const el = (id) => document.getElementById(id);

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

//bagian tanggal
(function renderTanggal() {
  const now = new Date();
  const masehi = now.toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });
  el('tglMasehi').textContent = masehi;

  const EPOCH_M = new Date(2024, 6, 7);
  const BULAN_H = [
    'Muharram','Safar','Rabiul Awwal','Rabiul Akhir',
    'Jumadil Awwal','Jumadil Akhir','Rajab','Syaban',
    'Ramadhan','Syawal','Dzulqaidah','Dzulhijjah'
  ];
  const HARI_H = ['Ahad','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
  const diffDays = Math.floor((now - EPOCH_M) / 86400000);
  let totalMonths = 1446 * 12;
  let remDays = diffDays;
  while (remDays >= 0) {
    const mIdx = totalMonths % 12;
    const mLen = (mIdx % 2 === 0) ? 30 : 29;
    if (remDays < mLen) break;
    remDays -= mLen;
    totalMonths++;
  }
  const hYear  = Math.floor(totalMonths / 12);
  const hMonth = totalMonths % 12;
  const hDay   = remDays + 1;
  el('tglHijriyah').textContent =
    HARI_H[now.getDay()] + ', ' + hDay + ' ' + BULAN_H[hMonth] + ' ' + hYear + ' H';
})();

//bagian API
const API_BASE  = 'https://api.myquran.com/v2/sholat/jadwal';
const API_KOTA  = 'https://api.myquran.com/v2/sholat/kota/cari';
const TODAY     = new Date();
const TODAY_ISO = TODAY.toISOString().slice(0, 10);

//lokasi
let selectedKota = null; // { id, lokasi, daerah }
let searchTimer  = null;

//element
const kotaInput   = el('kotaSearchInput');
const kotaDrop    = el('kotaDropdown');
const kotaChip    = el('kotaChip');
const kotaChipTxt = el('kotaChipText');
const kotaChipClr = el('kotaChipClear');
const bulanSelect = el('bulanSelect');
const tahunSelect = el('tahunSelect');
const btnFetch    = el('btnFetch');
const kotaInfo    = el('kotaInfo');
const kotaInfoTxt = el('kotaInfoText');
const waktuCard   = el('waktuCard');
const waktuEl     = el('waktuSekarang');
const stateEmpty  = el('stateEmpty');
const stateLoad   = el('stateLoading');
const stateErr    = el('stateError');
const errText     = el('errorText');
const tableWrap   = el('tableWrap');
const tableBody   = el('tableBody');

//init tahun dan bulan
(function initTahun() {
  const yr = TODAY.getFullYear();
  for (let y = yr - 1; y <= yr + 1; y++) {
    const opt = document.createElement('option');
    opt.value = y; opt.textContent = y;
    if (y === yr) opt.selected = true;
    tahunSelect.appendChild(opt);
  }
  bulanSelect.value = String(TODAY.getMonth() + 1).padStart(2, '0');
})();

//helper untuk switch state tampilan: empty, loading, error, data
function setState(state) {
  stateEmpty.classList.remove('show');
  stateLoad.classList.remove('show');
  stateErr.classList.remove('show');
  tableWrap.classList.remove('show');
  if (state === 'empty')   stateEmpty.classList.add('show');
  if (state === 'loading') stateLoad.classList.add('show');
  if (state === 'error')   stateErr.classList.add('show');
  if (state === 'data')    tableWrap.classList.add('show');
}

//mencari kota dengan API
async function searchKota(keyword) {
  if (keyword.length < 3) { closeDropdown(); return; }

  kotaInput.classList.add('loading-input');
  try {
    const res  = await fetch(`${API_KOTA}/${encodeURIComponent(keyword)}`);
    const json = await res.json();

    kotaInput.classList.remove('loading-input');

    if (!json.status || !json.data || json.data.length === 0) {
      showDropdown([]);
      return;
    }
    showDropdown(json.data);
  } catch (e) {
    kotaInput.classList.remove('loading-input');
    closeDropdown();
  }
}

function showDropdown(items) {
  kotaDrop.innerHTML = '';
  if (items.length === 0) {
    kotaDrop.innerHTML = '<div class="kota-option-empty">Kota tidak ditemukan </div>';
  } else {
    items.forEach(item => {
      const div = document.createElement('div');
      div.className = 'kota-option';
      div.setAttribute('role', 'option');
      div.innerHTML = (
        '<span class="opt-nama">' + item.lokasi + '</span>' +
        '<span class="opt-daerah">' + item.daerah + '</span>'
      );
      div.addEventListener('click', () => selectKota(item));
      kotaDrop.appendChild(div);
    });
  }
  kotaDrop.classList.add('open');
}

function closeDropdown() {
  kotaDrop.classList.remove('open');
}

function selectKota(item) {
  selectedKota = item;
  kotaInput.value = item.lokasi;
  closeDropdown();

  //tampilan chip
  kotaChipTxt.textContent = item.lokasi + ' — ' + item.daerah;
  kotaChip.classList.add('show');

  btnFetch.disabled = false;
}

function clearKota() {
  selectedKota = null;
  kotaInput.value = '';
  kotaChip.classList.remove('show');
  btnFetch.disabled = true;
  setState('empty');
  kotaInfo.classList.remove('show');
  waktuCard.style.display = 'none';
  closeDropdown();
}

//search input event dengan debounce 350ms
kotaInput.addEventListener('input', () => {
  const val = kotaInput.value.trim();
  clearTimeout(searchTimer);
  if (val.length < 3) { closeDropdown(); return; }
  searchTimer = setTimeout(() => searchKota(val), 350); 
});

kotaInput.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeDropdown();
});

kotaChipClr.addEventListener('click', clearKota);

//Tutup dropdown saat klik luar
document.addEventListener('click', (e) => {
  if (!kotaInput.closest('.kota-search-wrap').contains(e.target)) closeDropdown();
});

//fetch jadwal sholat dengan API
async function fetchJadwal() {
  if (!selectedKota) return;

  const bulan = bulanSelect.value;
  const tahun = tahunSelect.value;

  setState('loading');
  btnFetch.disabled = true;
  waktuCard.style.display = 'none';
  kotaInfo.classList.remove('show');

  try {
    const url = `${API_BASE}/${selectedKota.id}/${tahun}/${bulan}`;
    const res  = await fetch(url);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const json = await res.json();
    if (!json.status || !json.data || !json.data.jadwal)
      throw new Error('Format data tidak sesuai');

    renderTable(json.data);
    renderKotaInfo(json.data);
  } catch (err) {
    setState('error');
    errText.textContent = 'Gagal memuat data: ' + err.message + '. Periksa koneksi internet Anda.';
  } finally {
    btnFetch.disabled = false;
  }
}

//tabel jadwal sholat
function renderTable(data) {
  tableBody.innerHTML = '';
  let todayRowEl = null;

  data.jadwal.forEach(item => {
    const tr = document.createElement('tr');
    const isToday = item.date === TODAY_ISO;
    if (isToday) tr.classList.add('today');

    tr.innerHTML = (
      '<td>' + item.tanggal + (isToday ? '<span class="today-badge">Hari ini</span>' : '') + '</td>' +
      '<td>' + item.imsak   + '</td>' +
      '<td>' + item.subuh   + '</td>' +
      '<td>' + item.terbit  + '</td>' +
      '<td>' + item.dhuha   + '</td>' +
      '<td>' + item.dzuhur  + '</td>' +
      '<td>' + item.ashar   + '</td>' +
      '<td>' + item.maghrib + '</td>' +
      '<td>' + item.isya    + '</td>'
    );

    tableBody.appendChild(tr);
    if (isToday) {
      todayRowEl = tr;
      renderWaktuSekarang(item);
    }
  });

  setState('data');
  if (todayRowEl) setTimeout(() => todayRowEl.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
}

//waktu sekarang dan berikutnya
function renderWaktuSekarang(d) {
  const list = [
    { label:'Imsak',   time: d.imsak   },
    { label:'Subuh',   time: d.subuh   },
    { label:'Terbit',  time: d.terbit  },
    { label:'Dzuhur',  time: d.dzuhur  },
    { label:'Ashar',   time: d.ashar   },
    { label:'Maghrib', time: d.maghrib },
    { label:'Isya',    time: d.isya    },
  ];
  const nowMin = TODAY.getHours() * 60 + TODAY.getMinutes();
  let nextLabel = null, nextTime = null;
  for (const w of list) {
    const [h, m] = w.time.split(':').map(Number);
    if (h * 60 + m > nowMin) { nextLabel = w.label; nextTime = w.time; break; }
  }
  waktuEl.innerHTML = list.map(w =>
    '<div class="ws-item"><span class="ws-label">' + w.label + '</span>' +
    '<span class="ws-val">' + w.time + '</span></div>'
  ).join('') + (nextLabel
    ? '<span class="ws-next">&#9197; Berikutnya: ' + nextLabel + ' ' + nextTime + '</span>'
    : '<span class="ws-next">&#9989; Semua waktu sholat hari ini telah lewat</span>'
  );
  waktuCard.style.display = 'block';
}

//informasi kota dan bulan tahun
function renderKotaInfo(data) {
  const bulanNama = new Date(tahunSelect.value, parseInt(bulanSelect.value) - 1, 1)
    .toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  kotaInfoTxt.innerHTML =
    '<strong>' + data.lokasi + '</strong>, ' + data.daerah +
    ' &nbsp;&middot;&nbsp; ' + data.jadwal.length + ' hari' +
    ' &nbsp;&middot;&nbsp; ' + bulanNama;
  kotaInfo.classList.add('show');
}

//event fetch jadwal sholat dan perubahan bulan/tahun
btnFetch.addEventListener('click', fetchJadwal);
[bulanSelect, tahunSelect].forEach(sel => {
  sel.addEventListener('change', () => { if (selectedKota) fetchJadwal(); });
});

setState('empty');
