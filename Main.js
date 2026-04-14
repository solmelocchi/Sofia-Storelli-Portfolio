/* ============================================================
   SOFIA STORELLI — main.js
   Cursor · Page transitions · Scroll reveals · Skill bars
   ============================================================ */

/* ─── CURSOR ─────────────────────────────────────────────────── */
(function initCursor() {
  const cursor = document.getElementById('cursor');
  const ring   = document.getElementById('cursor-ring');
  if (!cursor || !ring) return;

  let mx = -100, my = -100;
  let rx = -100, ry = -100;

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

  /* hover states */
  document.querySelectorAll('a, button, .preview-card, .skill-cell, .space-card, .nav-dot, .panel-nav-dot')
    .forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });
})();

/* ─── PAGE TRANSITION ────────────────────────────────────────── */
(function initTransitions() {
  const trans = document.getElementById('page-transition');
  if (!trans) return;

  /* build columns if not already there */
  if (!trans.children.length) {
    for (let i = 0; i < 5; i++) {
      const col = document.createElement('div');
      col.className = 'pt-col';
      trans.appendChild(col);
    }
  }

  const cols = trans.querySelectorAll('.pt-col');

  function animateIn(cb) {
    trans.style.pointerEvents = 'all';
    cols.forEach((c, i) => {
      c.style.transition = `transform 0.6s cubic-bezier(0.76, 0, 0.24, 1) ${i * 0.06}s`;
      c.style.transformOrigin = 'bottom';
      c.style.transform = 'scaleY(1)';
    });
    setTimeout(cb, 800);
  }

  function animateOut() {
    cols.forEach((c, i) => {
      c.style.transition = `transform 0.6s cubic-bezier(0.76, 0, 0.24, 1) ${(4 - i) * 0.06}s`;
      c.style.transformOrigin = 'top';
      c.style.transform = 'scaleY(0)';
    });
    setTimeout(() => { trans.style.pointerEvents = 'none'; }, 800);
  }

  /* intercept nav links */
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto') || href.startsWith('http')) return;
    link.addEventListener('click', e => {
      e.preventDefault();
      animateIn(() => { window.location.href = href; });
    });
  });

  /* on load: sweep out */
  window.addEventListener('load', () => {
    /* reset cols to scaleY(1) instantly, then animate out */
    cols.forEach(c => {
      c.style.transition = 'none';
      c.style.transformOrigin = 'top';
      c.style.transform = 'scaleY(1)';
    });
    requestAnimationFrame(() => requestAnimationFrame(animateOut));
  });
})();

/* ─── SCROLL REVEAL ──────────────────────────────────────────── */
(function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

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
          setTimeout(() => {
            bar.style.width = e.target.dataset.level + '%';
          }, 200);
        }
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });

  cells.forEach(c => obs.observe(c));
})();

/* ─── PROJECTS HORIZONTAL SCROLL ────────────────────────────── */
(function initHScroll() {
  const track = document.getElementById('h-scroll-track');
  if (!track) return;

  const panels = track.querySelectorAll('.proj-panel');
  const dots   = document.querySelectorAll('.panel-nav-dot');
  const progressBar = document.getElementById('proj-progress');
  let current = 0;
  let locked  = false;

  function goTo(idx) {
    if (locked || idx < 0 || idx >= panels.length) return;
    locked = true;
    current = idx;
    track.style.transform = `translateX(-${current * 100}vw)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
    if (progressBar) {
      progressBar.style.transform = `scaleX(${(current + 1) / panels.length})`;
    }
    setTimeout(() => { locked = false; }, 1050);
  }

  dots.forEach((d, i) => d.addEventListener('click', () => goTo(i)));

  /* Wheel */
  window.addEventListener('wheel', e => {
    if (!track) return;
    if (Math.abs(e.deltaY) < 20) return;
    if (e.deltaY > 0) goTo(current + 1);
    else goTo(current - 1);
  }, { passive: true });

  /* Arrow keys */
  window.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goTo(current + 1);
    if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   goTo(current - 1);
  });

  /* Touch */
  let tsx = 0;
  window.addEventListener('touchstart', e => { tsx = e.touches[0].clientX; }, { passive: true });
  window.addEventListener('touchend', e => {
    const dx = tsx - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 60) {
      if (dx > 0) goTo(current + 1);
      else goTo(current - 1);
    }
  });

  /* init */
  goTo(0);
})();

/* ─── PARALLAX LINES (hero) ──────────────────────────────────── */
(function initParallax() {
  const lines = document.querySelectorAll('.hero-line');
  if (!lines.length) return;
  document.addEventListener('mousemove', e => {
    const rx = (e.clientX / window.innerWidth  - 0.5) * 2;
    const ry = (e.clientY / window.innerHeight - 0.5) * 2;
    lines.forEach((l, i) => {
      const factor = (i % 3 + 1) * 5;
      if (l.classList.contains('h')) {
        l.style.transform = `translateY(${ry * factor}px)`;
      } else {
        l.style.transform = `translateX(${rx * factor}px)`;
      }
    });
  });
})();

/* ─── TESIS ANIMATED GRID LINES ──────────────────────────────── */
(function initGridAnim() {
  const canvas = document.getElementById('tesis-grid-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let w, h, animId;

  function resize() {
    w = canvas.offsetWidth;
    h = canvas.offsetHeight;
    canvas.width  = w;
    canvas.height = h;
  }
  resize();
  window.addEventListener('resize', resize);

  const cols = 12, rows = 8;
  let t = 0;

  function draw() {
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(201,169,122,0.08)';
    ctx.lineWidth = 0.5;

    const cw = w / cols;
    const rh = h / rows;

    /* grid */
    for (let x = 0; x <= cols; x++) {
      ctx.beginPath();
      ctx.moveTo(x * cw, 0);
      ctx.lineTo(x * cw, h);
      ctx.stroke();
    }
    for (let y = 0; y <= rows; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * rh);
      ctx.lineTo(w, y * rh);
      ctx.stroke();
    }

    /* animated accent lines */
    ctx.strokeStyle = 'rgba(201,169,122,0.18)';
    ctx.lineWidth = 1;

    const prog1 = ((Math.sin(t * 0.4) + 1) / 2);
    ctx.beginPath();
    ctx.moveTo(0, h * 0.3);
    ctx.lineTo(w * prog1, h * 0.7);
    ctx.stroke();

    const prog2 = ((Math.cos(t * 0.3 + 1) + 1) / 2);
    ctx.beginPath();
    ctx.moveTo(w, h * 0.5);
    ctx.lineTo(w * (1 - prog2), h * 0.2);
    ctx.stroke();

    /* pulsing node */
    const nx = w * 0.5 + Math.sin(t * 0.5) * w * 0.15;
    const ny = h * 0.5 + Math.cos(t * 0.4) * h * 0.1;
    const pulse = (Math.sin(t) + 1) / 2;
    ctx.beginPath();
    ctx.arc(nx, ny, 3 + pulse * 3, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(201,169,122,${0.3 + pulse * 0.4})`;
    ctx.fill();

    t += 0.015;
    animId = requestAnimationFrame(draw);
  }
  draw();
})();

/* ─── ABOUT PHOTO PLACEHOLDER DRAWING ───────────────────────── */
(function initAboutCanvas() {
  const canvas = document.getElementById('about-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width = canvas.offsetWidth;
  const h = canvas.height = canvas.offsetHeight;

  /* architectural silhouette lines */
  ctx.strokeStyle = 'rgba(201,169,122,0.15)';
  ctx.lineWidth = 0.5;

  const lines = [
    [[0.1,0.8],[0.9,0.8]],
    [[0.3,0.8],[0.3,0.2]],
    [[0.7,0.8],[0.7,0.25]],
    [[0.3,0.2],[0.5,0.1],[0.7,0.25]],
    [[0.1,0.8],[0.1,0.5],[0.3,0.2]],
    [[0.9,0.8],[0.9,0.5],[0.7,0.25]],
    [[0.2,0.6],[0.8,0.6]],
  ];
  lines.forEach(pts => {
    ctx.beginPath();
    pts.forEach(([px,py],i) => i===0 ? ctx.moveTo(px*w,py*h) : ctx.lineTo(px*w,py*h));
    ctx.stroke();
  });

  /* label */
  ctx.fillStyle = 'rgba(201,169,122,0.2)';
  ctx.font = '500 10px DM Sans, sans-serif';
  ctx.letterSpacing = '0.3em';
  ctx.fillText('FOTOGRAFÍA', w/2 - 45, h - 30);
})();

/* ─── MARQUEE ────────────────────────────────────────────────── */
(function initMarquee() {
  const track = document.getElementById('marquee-track');
  if (!track) return;
  let pos = 0;
  const speed = 0.4;
  const totalWidth = track.scrollWidth / 2;

  (function loop() {
    pos -= speed;
    if (Math.abs(pos) >= totalWidth) pos = 0;
    track.style.transform = `translateX(${pos}px)`;
    requestAnimationFrame(loop);
  })();
})();
