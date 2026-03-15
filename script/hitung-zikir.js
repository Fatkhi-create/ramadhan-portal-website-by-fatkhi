const el = (id) => document.getElementById(id)

let count  = 0;
let target = 33;
const RING_CIRCUMFERENCE = 2 * Math.PI * 75; 
const countDisplay = el('countDisplay');
const targetLabel  = el('targetLabel');
const ringFill     = el('ringFill');
const progressFill = el('progressFill');
const progressBar  = el('progressBar');
const notifBadge   = el('notifBadge');
const notifText    = el('notifText');
const btnTambah    = el('btnTambah');
const btnReset     = el('btnReset');
const zikirArabic  = el('zikirArabic');
const zikirLatin   = el('zikirLatin');
const berhenti     = el('berhenti');

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
// update UI
function updateUI() {
    countDisplay.textContent = count;
    targetLabel.textContent  = `/ ${target}`;
    progressBar.setAttribute('aria-valuenow', count);
    progressBar.setAttribute('aria-valuemax', target);

    const ratio    = Math.min(count / target, 1);
    const offset   = RING_CIRCUMFERENCE * (1 - ratio);
    ringFill.style.strokeDashoffset = offset;

    progressFill.style.width = (ratio * 100) + '%';

// warna ring saat selesai
    ringFill.style.stroke = ratio >= 1 ? '#E8D08A' : 'var(--gold)';

// pengaturan tombol tambah
    const selesai = count >= target;
    btnTambah.disabled = selesai;
    berhenti.classList.toggle('show', selesai);
    if (selesai) {
      btnTambah.querySelector('.btn-icon').textContent = '✓';
    } else {
      btnTambah.querySelector('.btn-icon').textContent = '+';
    }

// notifikasi
   if (count > 0 && count % target === 0) 
    { const rounds = count / target; 
        notifText.textContent = rounds === 1 ? `Target tercapai! Alhamdulillah 🤲` : `
        ${rounds}× putaran selesai! Luar biasa ✨`; 
        notifBadge.classList.remove('show');
        void notifBadge.offsetWidth; notifBadge.classList.add('show'); } 
        else { 
            notifBadge.classList.remove('show'); 
        }
  }

// animasi bump saat hitungan bertambah
function triggerBump() {
    countDisplay.classList.remove('bump');
    void countDisplay.offsetWidth;
    countDisplay.classList.add('bump');
  }

// ripple effect saat tombol ditekan
function createRipple(e) {
    const btn  = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x    = (e.clientX || rect.left + rect.width / 2) - rect.left - size / 2;
    const y    = (e.clientY || rect.top + rect.height / 2) - rect.top  - size / 2;
    const rip  = document.createElement('span');
    rip.className = 'ripple';
    rip.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px`;
    btn.appendChild(rip);
    rip.addEventListener('animationend', () => rip.remove());
  }

// tombol tambah
btnTambah.addEventListener('click', (e) => {
    if (count >= target) return; 
    count++;
    triggerBump();
    createRipple(e);
    updateUI();
  });

// tombol reset
btnReset.addEventListener('click', () => {
    count = 0;
    updateUI();
  });

// target
  document.querySelectorAll('.target-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.target-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      target = parseInt(pill.dataset.val);
      count  = 0;
      updateUI();
    });
  });

// zikir 
  document.querySelectorAll('.zikir-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.zikir-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      zikirArabic.style.opacity = '0';
      zikirLatin.style.opacity  = '0';
      setTimeout(() => {
        zikirArabic.textContent = btn.dataset.ar;
        zikirLatin.textContent  = btn.dataset.lat;
        zikirArabic.style.opacity = '1';
        zikirLatin.style.opacity  = '1';
      }, 200);
      count = 0;
      updateUI();
    });
  });

// Shorcut spasi
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && document.activeElement.tagName !== 'BUTTON') {
      e.preventDefault();
      if (count >= target) return;
      count++;
      triggerBump();
      updateUI();
    }
  });

updateUI();
