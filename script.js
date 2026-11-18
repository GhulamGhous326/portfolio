// Mobile menu (guarded: a missing nav must never kill the rest of the script)
const navToggle = document.getElementById('navToggle');
const mobileMenu = document.getElementById('mobileMenu');
if (navToggle && mobileMenu) {
  navToggle.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
  });
  mobileMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => mobileMenu.classList.remove('open'));
  });
}

// Navbar background on scroll
const nav = document.getElementById('nav');
const onScroll = () => { if (nav) nav.classList.toggle('scrolled', window.scrollY > 40); };
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
  const dpr = Math.min(window.devicePixelRatio || 1, 2); // retina-sharp
  let w, h, parts = [], running = true, rafId = null;
  const resize = () => {
    w = canvas.offsetWidth; h = canvas.offsetHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
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
  function tick() {
    if (!running) { rafId = null; return; }
    ctx.clearRect(0, 0, w, h);
    parts.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.gold ? 'rgba(217,167,95,' + p.a + ')' : 'rgba(111,227,208,' + p.a + ')';
      ctx.fill();
    });
    rafId = requestAnimationFrame(tick);
  }
  function start() { if (rafId === null && running) rafId = requestAnimationFrame(tick); }
  // Pause when the hero scrolls off-screen (saves CPU/battery)
  const hero = document.querySelector('.hero');
  if (hero && 'IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      running = entries[0].isIntersecting;
      if (running) start();
    }).observe(hero);
  }
  start();
})();

// Mouse-follow glow in hero (rAF-throttled)
(function () {
  const glow = document.getElementById('mouseGlow');
  const hero = document.querySelector('.hero');
  if (!glow || !hero || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let rafPending = false, lastX = 0, lastY = 0;
  hero.addEventListener('mousemove', e => {
    const r = hero.getBoundingClientRect();
    lastX = e.clientX - r.left - 260; lastY = e.clientY - r.top - 260;
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(() => {
      glow.style.transform = 'translate(' + lastX + 'px,' + lastY + 'px)';
      rafPending = false;
    });
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
    else if (e.key === 'Tab') setOpen(false); // don't trap tabbing away
    else if (e.key === 'ArrowDown') { e.preventDefault(); hi = (hi + 1) % options.length; highlight(hi); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); hi = (hi - 1 + options.length) % options.length; highlight(hi); }
    else if (e.key === 'Enter') { e.preventDefault(); choose(hi); }
  });
})();
