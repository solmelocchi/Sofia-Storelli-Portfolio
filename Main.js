/* ============================================================
   SOFIA STORELLI — Main.js
   ============================================================ */

/* ─── CURSOR ─────────────────────────────────────────────────── */
(function initCursor() {
  const cursor = document.getElementById('cursor');
  const ring   = document.getElementById('cursor-ring');
  if (!cursor || !ring) return;

  let mx = -100, my = -100, rx = -100, ry = -100;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top  = my + 'px';
  });

  (function animRing() {
    rx += (mx - rx) * 0.1;
    ry += (my - ry) * 0.1;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(animRing);
  })();

  document.querySelectorAll('a, button, .preview-card, .skill-cell, .panel-nav-dot')
    .forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });
})();

/* ─── MOBILE NAV HAMBURGER ───────────────────────────────────── */
(function initMobileNav() {
  const hamburger = document.querySelector('.nav-hamburger');
  const mobileMenu = document.querySelector('.nav-mobile-menu');
  if (!hamburger || !mobileMenu) return;

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open');
    document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
  });

  /* close on link click */
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
})();

/* ─── PAGE TRANSITION ────────────────────────────────────────── */
(function initTransitions() {
  const trans = document.getElementById('page-transition');
  if (!trans) return;

  /* build columns */
  if (!trans.children.length) {
    for (let i = 0; i < 5; i++) {
      const col = document.createElement('div');
      col.className = 'pt-col';
      trans.appendChild(col);
    }
  }
  const cols = Array.from(trans.querySelectorAll('.pt-col'));

  /* start hidden */
  cols.forEach(c => {
    c.style.transition = 'none';
    c.style.transformOrigin = 'bottom';
    c.style.transform = 'scaleY(0)';
  });

  function animateIn(cb) {
    trans.style.pointerEvents = 'all';
    cols.forEach((c, i) => {
      c.style.transition = `transform 0.55s cubic-bezier(0.76, 0, 0.24, 1) ${i * 0.055}s`;
      c.style.transformOrigin = 'bottom';
      c.style.transform = 'scaleY(1)';
    });
    setTimeout(cb, 700);
  }

  function animateOut() {
    cols.forEach((c, i) => {
      c.style.transition = `transform 0.55s cubic-bezier(0.76, 0, 0.24, 1) ${(4 - i) * 0.055}s`;
      c.style.transformOrigin = 'top';
      c.style.transform = 'scaleY(0)';
    });
    setTimeout(() => { trans.style.pointerEvents = 'none'; }, 700);
  }

  /* intercept internal nav links */
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto') || href.startsWith('http') || href.startsWith('https') || href.startsWith('tel')) return;
    link.addEventListener('click', e => {
      e.preventDefault();
      const target = href;
      animateIn(() => { window.location.href = target; });
    });
  });

  /* on load: sweep out */
  window.addEventListener('load', () => {
    /* put cols at full height instantly, then sweep out */
    cols.forEach(c => {
      c.style.transition = 'none';
      c.style.transformOrigin = 'top';
      c.style.transform = 'scaleY(1)';
    });
    /* double rAF to ensure paint happens first */
    requestAnimationFrame(() => requestAnimationFrame(() => animateOut()));
  });
})();

/* ─── SCROLL REVEAL ──────────────────────────────────────────── */
(function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.1 });
  els.forEach(el => obs.observe(el));
})();

/* ─── SKILL BARS ─────────────────────────────────────────────── */
(function initSkillBars() {
  const cells = document.querySelectorAll('.skill-cell[data-level]');
  if (!cells.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const bar = e.target.querySelector('.skill-bar');
        if (bar) {
          e.target.setAttribute('data-bar-init', '1');
          setTimeout(() => { bar.style.width = e.target.dataset.level + '%'; }, 200);
        }
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });
  cells.forEach(c => obs.observe(c));
})();

/* ─── PROJECTS HORIZONTAL SCROLL (desktop only) ─────────────── */
(function initHScroll() {
  const track = document.getElementById('h-scroll-track');
  if (!track) return;

  /* On mobile: CSS already sets display:block + transform:none.
     We skip JS wheel/key listeners entirely on small screens.     */
  function isMobile() { return window.innerWidth <= 900; }

  const panels = track.querySelectorAll('.proj-panel');
  const dots   = document.querySelectorAll('.panel-nav-dot');
  const progressBar = document.getElementById('proj-progress');
  const counter = document.getElementById('panel-counter');
  let current = 0;
  let locked  = false;

  function goTo(idx) {
    if (isMobile()) return;
    if (locked || idx < 0 || idx >= panels.length) return;
    locked = true;
    current = idx;
    track.style.transform = `translateX(-${current * 100}vw)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
    if (progressBar) progressBar.style.transform = `scaleX(${(current + 1) / panels.length})`;
    if (counter) counter.textContent = `0${current + 1} — 0${panels.length}`;
    setTimeout(() => { locked = false; }, 1050);
  }

  dots.forEach((d, i) => d.addEventListener('click', () => goTo(i)));

  window.addEventListener('wheel', e => {
    if (isMobile()) return;
    if (Math.abs(e.deltaY) < 20) return;
    if (e.deltaY > 0) goTo(current + 1);
    else goTo(current - 1);
  }, { passive: true });

  window.addEventListener('keydown', e => {
    if (isMobile()) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goTo(current + 1);
    if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   goTo(current - 1);
  });

  let tsx = 0;
  window.addEventListener('touchstart', e => { tsx = e.touches[0].clientX; }, { passive: true });
  window.addEventListener('touchend', e => {
    if (!isMobile()) {
      const dx = tsx - e.changedTouches[0].clientX;
      if (Math.abs(dx) > 60) { if (dx > 0) goTo(current + 1); else goTo(current - 1); }
    }
  });

  /* Reset on resize so going desktop→mobile doesn't stay stuck */
  window.addEventListener('resize', () => {
    if (isMobile()) {
      track.style.transform = 'none';
      track.style.transition = 'none';
    } else {
      track.style.transition = 'transform 1s cubic-bezier(0.77,0,0.175,1)';
      track.style.transform = `translateX(-${current * 100}vw)`;
    }
  });

  goTo(0);
})();

/* ─── PARALLAX LINES ─────────────────────────────────────────── */
(function initParallax() {
  const lines = document.querySelectorAll('.hero-line');
  if (!lines.length) return;
  document.addEventListener('mousemove', e => {
    const rx = (e.clientX / window.innerWidth  - 0.5) * 2;
    const ry = (e.clientY / window.innerHeight - 0.5) * 2;
    lines.forEach((l, i) => {
      const f = (i % 3 + 1) * 5;
      l.style.transform = l.classList.contains('h') ? `translateY(${ry * f}px)` : `translateX(${rx * f}px)`;
    });
  });
})();

/* ─── TESIS GRID CANVAS ──────────────────────────────────────── */
(function initGridAnim() {
  const canvas = document.getElementById('tesis-grid-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, t = 0;

  function resize() {
    w = canvas.offsetWidth; h = canvas.offsetHeight;
    canvas.width = w; canvas.height = h;
  }
  resize();
  window.addEventListener('resize', resize);

  function draw() {
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(201,169,122,0.07)'; ctx.lineWidth = 0.5;
    const cols = 12, rows = 8, cw = w / cols, rh = h / rows;
    for (let x = 0; x <= cols; x++) { ctx.beginPath(); ctx.moveTo(x*cw,0); ctx.lineTo(x*cw,h); ctx.stroke(); }
    for (let y = 0; y <= rows; y++) { ctx.beginPath(); ctx.moveTo(0,y*rh); ctx.lineTo(w,y*rh); ctx.stroke(); }
    ctx.strokeStyle = 'rgba(201,169,122,0.15)'; ctx.lineWidth = 1;
    const p1 = (Math.sin(t * 0.4) + 1) / 2;
    ctx.beginPath(); ctx.moveTo(0, h*0.3); ctx.lineTo(w*p1, h*0.7); ctx.stroke();
    const p2 = (Math.cos(t * 0.3 + 1) + 1) / 2;
    ctx.beginPath(); ctx.moveTo(w, h*0.5); ctx.lineTo(w*(1-p2), h*0.2); ctx.stroke();
    const nx = w*0.5 + Math.sin(t*0.5)*w*0.15;
    const ny = h*0.5 + Math.cos(t*0.4)*h*0.1;
    const pulse = (Math.sin(t)+1)/2;
    ctx.beginPath(); ctx.arc(nx, ny, 3+pulse*3, 0, Math.PI*2);
    ctx.fillStyle = `rgba(201,169,122,${0.3+pulse*0.4})`; ctx.fill();
    t += 0.015;
    requestAnimationFrame(draw);
  }
  draw();
})();

/* ─── CONTACT CANVAS ─────────────────────────────────────────── */
(function initContactCanvas() {
  const canvas = document.getElementById('contact-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, t = 0;
  function resize() { w = canvas.width = canvas.offsetWidth; h = canvas.height = canvas.offsetHeight; }
  resize();
  window.addEventListener('resize', resize);
  function draw() {
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(154,125,82,0.05)'; ctx.lineWidth = 0.5;
    const step = 80;
    for (let x = 0; x <= w; x += step) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,h); ctx.stroke(); }
    for (let y = 0; y <= h; y += step) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke(); }
    ctx.strokeStyle = 'rgba(154,125,82,0.08)';
    for (let i = 0; i < 4; i++) {
      const r = 80+i*60+Math.sin(t*0.3+i)*20;
      ctx.beginPath(); ctx.arc(w*0.5,h*0.5,r,0,Math.PI*2); ctx.stroke();
    }
    const nx = w*0.5+Math.sin(t*0.5)*w*0.2;
    const ny = h*0.5+Math.cos(t*0.4)*h*0.15;
    const pulse = (Math.sin(t*1.2)+1)/2;
    ctx.beginPath(); ctx.arc(nx,ny,2+pulse*4,0,Math.PI*2);
    ctx.fillStyle = `rgba(154,125,82,${0.12+pulse*0.2})`; ctx.fill();
    t += 0.012;
    requestAnimationFrame(draw);
  }
  draw();
})();

/* ─── MARQUEE ────────────────────────────────────────────────── */
(function initMarquee() {
  const track = document.getElementById('marquee-track');
  if (!track) return;
  let pos = 0;
  const speed = 0.5;
  function loop() {
    const totalWidth = track.scrollWidth / 2;
    pos -= speed;
    if (Math.abs(pos) >= totalWidth) pos = 0;
    track.style.transform = `translateX(${pos}px)`;
    requestAnimationFrame(loop);
  }
  loop();
})();
