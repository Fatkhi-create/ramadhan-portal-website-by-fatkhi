const fmt = (n) => 'Rp ' + Math.round(n).toLocaleString('id-ID');
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



// Toggle form
el('jenisZakat').addEventListener('change', () => {
    const jenis = el('jenisZakat').value;
    el('formPenghasilan').classList.toggle('active', jenis === 'penghasilan');
    el('formEmas').classList.toggle('active', jenis === 'emas');
    el('hasilCard').style.display = 'none';
    el('errorMsg').classList.remove('show');
});
//validasi
function validate() {
const harga = parseFloat(el('hargaEmas').value);
    if (!harga || harga <= 0) return 'Masukkan harga emas per gram terlebih dahulu.';

const jenis = el('jenisZakat').value;
    if (jenis === 'penghasilan') {
        const gaji = parseFloat(el('gaji').value);
        if (!gaji || gaji <= 0) return 'Masukkan nominal gaji / upah bulanan.';
    } else {
        const gram = parseFloat(el('jumlahEmas').value);
        if (!gram || gram <= 0) return 'Masukkan jumlah emas (gram) yang dimiliki.';
    }
    return null;
}
el('btnHitung').addEventListener('click', () => {
const errMsg = validate();
    if (errMsg) {
        el('errorMsg').textContent = '⚠️ ' + errMsg;
        el('errorMsg').classList.add('show');
        el('hasilCard').style.display = 'none';
    return;
    }
el('errorMsg').classList.remove('show');
const harga = parseFloat(el('hargaEmas').value);
const nisab = harga * 85;
const jenis = el('jenisZakat').value;
let total = 0;
let jenisLabel = '';
    if (jenis === 'penghasilan') {
      const gaji   = parseFloat(el('gaji').value) || 0;
      const lain   = parseFloat(el('penghasilanLain').value) || 0;
      total        = gaji + lain;
      jenisLabel   = 'Zakat Penghasilan';
    }else {
      const gram   = parseFloat(el('jumlahEmas').value) || 0;
      total        = gram * harga;
      jenisLabel   = 'Zakat Emas';
    }
const wajib = total >= nisab;
const zakat = wajib ? total * 0.025 : 0;
el('resJenis').textContent  = jenisLabel;
el('resTotal').textContent  = fmt(total);
el('resNisab').textContent  = fmt(nisab);
const statusEl = el('resStatus');
    if (wajib) {
    statusEl.innerHTML = '<span class="status-badge wajib">✅ Wajib Zakat</span>';
        el('zakatHighlight').style.display = 'flex';
        el('tidakWajibBox').style.display  = 'none';
        el('resZakat').textContent = fmt(zakat);
    } else {
    statusEl.innerHTML = '<span class="status-badge tidak">❌ Belum Wajib</span>';
        el('zakatHighlight').style.display = 'none';
        el('tidakWajibBox').style.display  = 'block';
    }
    el('hasilCard').style.display = 'block';
    
    setTimeout(() => {
    el('hasilCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
});
//bagian reset
el('btnResetCalc').addEventListener('click', () => {
    el('gaji').value            = '';
    el('penghasilanLain').value = '';
    el('jumlahEmas').value      = '';
    el('hargaEmas').value       = '';
    el('jenisZakat').value      = 'penghasilan';
    el('formPenghasilan').classList.add('active');
    el('formEmas').classList.remove('active');
    el('errorMsg').classList.remove('show');
    el('hasilCard').style.display = 'none';
    el('nisabInfo').textContent = 'Masukkan harga emas untuk menghitung Nisab (harga emas × 85 gram).';
});
//live nisab preview
el('hargaEmas').addEventListener('input', () => {
const harga = parseFloat(el('hargaEmas').value);
    if (harga > 0) {
      el('nisabInfo').innerHTML =
        `Nisab saat ini: <strong>${fmt(harga * 85)}</strong> (${harga.toLocaleString('id-ID')} × 85 gram)`;
    } else {
      el('nisabInfo').textContent = 'Masukkan harga emas untuk menghitung Nisab (harga emas × 85 gram).';
    }
});
