// Mobile menu
const navToggle = document.getElementById('navToggle');
const mobileMenu = document.getElementById('mobileMenu');
navToggle.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
});
mobileMenu.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => mobileMenu.classList.remove('open'));
});

// Navbar background on scroll
const nav = document.getElementById('nav');
const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Reveal on scroll
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// Hero particles (teal + gold dust)
(function () {
  const canvas = document.getElementById('particles');
  if (!canvas || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const ctx = canvas.getContext('2d');
  let w, h, parts = [];
  const resize = () => {
    w = canvas.width = canvas.offsetWidth;
    h = canvas.height = canvas.offsetHeight;
  };
  resize();
  window.addEventListener('resize', resize);
  const N = Math.max(40, Math.min(110, Math.floor(w * h / 20000)));
  for (let i = 0; i < N; i++) {
    parts.push({
      x: Math.random() * w, y: Math.random() * h,
      r: Math.random() * 1.8 + 0.4,
      vx: (Math.random() - 0.5) * 0.28, vy: (Math.random() - 0.5) * 0.28,
      gold: Math.random() < 0.3, a: Math.random() * 0.5 + 0.15
    });
  }
  (function tick() {
    ctx.clearRect(0, 0, w, h);
    parts.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7);
      ctx.fillStyle = p.gold ? 'rgba(217,167,95,' + p.a + ')' : 'rgba(111,227,208,' + p.a + ')';
      ctx.fill();
    });
    requestAnimationFrame(tick);
  })();
})();

// Mouse-follow glow in hero
(function () {
  const glow = document.getElementById('mouseGlow');
  const hero = document.querySelector('.hero');
  if (!glow || !hero || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  hero.addEventListener('mousemove', e => {
    const r = hero.getBoundingClientRect();
    glow.style.transform = 'translate(' + (e.clientX - r.left - 260) + 'px,' + (e.clientY - r.top - 260) + 'px)';
  });
})();

// Custom select (inquiry type dropdown)
(function () {
  const root = document.querySelector('.custom-select');
  if (!root) return;
  const btn = root.querySelector('.cs-button');
  const list = root.querySelector('.cs-list');
  const value = root.querySelector('.cs-value');
  const hidden = root.querySelector('input[type="hidden"]');
  const options = Array.from(list.querySelectorAll('[role="option"]'));
  let open = false, hi = 0;

  function highlight(i) {
    options.forEach((o, j) => o.classList.toggle('highlight', i === j));
    const el = options[i];
    if (el) el.scrollIntoView({ block: 'nearest' });
  }
  function setOpen(v) {
    open = v;
    list.hidden = !v;
    btn.setAttribute('aria-expanded', String(v));
    if (v) {
      hi = Math.max(0, options.findIndex(o => o.getAttribute('aria-selected') === 'true'));
      highlight(hi);
    }
  }
  function choose(i) {
    options.forEach(o => { o.setAttribute('aria-selected', 'false'); o.classList.remove('selected'); });
    const o = options[i];
    o.setAttribute('aria-selected', 'true');
    o.classList.add('selected');
    value.textContent = o.textContent;
    hidden.value = o.dataset.value;
    setOpen(false);
    btn.focus();
  }
  btn.addEventListener('click', () => setOpen(!open));
  options.forEach((o, i) => o.addEventListener('click', () => choose(i)));
  document.addEventListener('click', e => { if (open && !root.contains(e.target)) setOpen(false); });
  document.addEventListener('keydown', e => {
    if (!open) return;
    if (e.key === 'Escape') setOpen(false);
    else if (e.key === 'ArrowDown') { e.preventDefault(); hi = (hi + 1) % options.length; highlight(hi); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); hi = (hi - 1 + options.length) % options.length; highlight(hi); }
    else if (e.key === 'Enter') { e.preventDefault(); choose(hi); }
  });
})();
