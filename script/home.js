

//Navbar: scroll effect 
  var nav = document.getElementById('mainNav');
  window.addEventListener('scroll', function () {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  });

//Navbar: hamburger toggle 
  var toggle = document.getElementById('navToggle');
  var links  = document.getElementById('navLinks');
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
//Smooth scroll untuk anchor link 
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var target = document.querySelector(a.getAttribute('href'));
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
    });
  });

//Animasi kartu saat muncul di layar
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.style.opacity  = '1';
        entry.target.style.transform = 'translateY(0)';
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.feat-card, .step, .stat-item').forEach(function (el, i) {
    el.style.opacity    = '0';
    el.style.transform  = 'translateY(22px)';
    el.style.transition = 'opacity .5s ' + (i * 0.08) + 's ease, transform .5s ' + (i * 0.08) + 's ease';
    io.observe(el);
  });