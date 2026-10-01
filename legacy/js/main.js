/* Naveen Chand — motion engine
   preloader · liquid page transitions · cursor · split text · scroll choreography */
(function () {
  const html = document.documentElement;
  const body = document.body;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const hasGsap = !!window.gsap;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const store = {
    get(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} },
    del(k) { try { sessionStorage.removeItem(k); } catch (e) {} },
  };

  if (!hasGsap) {
    html.classList.remove('is-arriving', 'is-loading');
    return;
  }
  const gsap = window.gsap;
  if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
  const ST = window.ScrollTrigger;

  /* ---------- Smooth scroll ---------- */
  let lenis = null;
  if (window.Lenis && !reduce) {
    lenis = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    if (ST) lenis.on('scroll', ST.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    window.lenis = lenis;
  }

  /* ---------- Split text ---------- */
  function split(el) {
    if (el.dataset.splitDone) return $$('.c', el);
    const walk = (node) => {
      Array.from(node.childNodes).forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((word) => {
            if (!word) return;
            if (/^\s+$/.test(word)) { frag.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span');
            w.className = 'w';
            Array.from(word).forEach((ch) => {
              const c = document.createElement('span');
              c.className = 'c';
              c.textContent = ch;
              w.appendChild(c);
            });
            frag.appendChild(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && !n.matches('img, svg, .no-split')) {
          walk(n);
        }
      });
    };
    el.setAttribute('aria-label', el.textContent.trim().replace(/\s+/g, ' '));
    walk(el);
    $$('.w', el).forEach((w) => w.setAttribute('aria-hidden', 'true'));
    el.dataset.splitDone = '1';
    return $$('.c', el);
  }

  function splitWords(el) {
    const walk = (node) => {
      Array.from(node.childNodes).forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((word) => {
            if (!word) return;
            if (/^\s+$/.test(word)) { frag.appendChild(document.createTextNode(' ')); return; }
            const s = document.createElement('span');
            s.className = 'sw';
            s.textContent = word;
            frag.appendChild(s);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(el);
    return $$('.sw', el);
  }

  /* ---------- Intro choreography (runs after preloader / transition) ---------- */
  const heroChars = $$('[data-split-hero]').map(split);

  /* Fit the home hero title so "Naveen" and "photo + Chand" always fit the row */
  const heroTitle0 = $('.hero__title');
  function fitHero() {
    if (!heroTitle0) return;
    heroTitle0.style.fontSize = '';
    const words = $$('[data-split-hero]', heroTitle0);
    const ph = $('.hero__photo', heroTitle0);
    const line2 = $('.hero__line--2', heroTitle0);
    for (let i = 0; i < 3; i++) {
      const fs = parseFloat(getComputedStyle(heroTitle0).fontSize);
      const avail = heroTitle0.clientWidth;
      const gap = parseFloat(getComputedStyle(line2).columnGap) || 0;
      const need = Math.max(words[0].getBoundingClientRect().width, words[1].getBoundingClientRect().width + (ph ? ph.offsetWidth + gap : 0));
      if (need <= avail) break;
      heroTitle0.style.fontSize = (fs * (avail / need) * 0.985) + 'px';
    }
  }
  fitHero();
  if (document.fonts) document.fonts.ready.then(fitHero);
  window.addEventListener('resize', fitHero);
  window.addEventListener('load', fitHero);
  gsap.set(heroChars.flat(), { yPercent: 115, rotate: 6 });
  const heroFades = $$('[data-hero-fade]');
  gsap.set(heroFades, { y: 30, autoAlpha: 0 });
  const heroPhoto = $('[data-hero-photo]');
  if (heroPhoto) gsap.set(heroPhoto, { scale: 0, rotate: -25 });

  function playIntro() {
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    heroChars.forEach((chars, i) => {
      tl.to(chars, { yPercent: 0, rotate: 0, duration: 1.4, stagger: 0.045 }, i * 0.12);
    });
    if (heroPhoto) tl.to(heroPhoto, { scale: 1, rotate: 0, duration: 1.6, ease: 'elastic.out(1, 0.6)' }, 0.35);
    tl.to(heroFades, { y: 0, autoAlpha: 1, duration: 1.2, stagger: 0.08 }, 0.5);
    if (window.Liquid) window.Liquid.pulse = 1;
    return tl;
  }

  /* ---------- Preloader + arrival ---------- */
  const tr = $('.transition');
  const trBack = tr && $('.t-back', tr);
  const trFront = tr && $('.t-front', tr);
  const trLabel = tr && $('.transition__label', tr);
  const trFill = tr && $('.transition__fill', tr);

  const P = {
    hidden:   'M 0 100 V 100 Q 50 100 100 100 V 100 z',
    rising:   'M 0 100 V 55 Q 50 5 100 55 V 100 z',
    full:     'M 0 100 V 0 Q 50 0 100 0 V 100 z',
    topFull:  'M 0 0 V 100 Q 50 100 100 100 V 0 z',
    topDrip:  'M 0 0 V 45 Q 50 105 100 45 V 0 z',
    topGone:  'M 0 0 V 0 Q 50 0 100 0 V 0 z',
  };

  function setLabel(text) {
    if (!trLabel) return [];
    trLabel.innerHTML = '';
    const span = document.createElement('span');
    span.textContent = text;
    trLabel.appendChild(span);
    return split(span);
  }

  function arrive() {
    const label = store.get('nc-nav');
    store.del('nc-nav');
    if (!tr || !html.classList.contains('is-arriving')) { playIntro(); return; }
    const chars = setLabel(label || '');
    gsap.set(trLabel, { opacity: 1 });
    gsap.set(chars, { yPercent: 0 });
    trBack.setAttribute('d', P.topFull);
    trFront.setAttribute('d', P.topFull);
    trFill.style.display = 'none';
    html.classList.remove('is-arriving');
    tr.classList.add('is-active');
    const tl = gsap.timeline({ onComplete: () => tr.classList.remove('is-active') });
    tl.to(chars, { yPercent: -115, duration: 0.6, stagger: 0.025, ease: 'power3.in' }, 0.05)
      .set(trLabel, { opacity: 0 })
      .to(trFront, { attr: { d: P.topDrip }, duration: 0.55, ease: 'power2.in' }, 0.35)
      .to(trFront, { attr: { d: P.topGone }, duration: 0.55, ease: 'power2.out' })
      .to(trBack, { attr: { d: P.topDrip }, duration: 0.55, ease: 'power2.in' }, 0.48)
      .to(trBack, { attr: { d: P.topGone }, duration: 0.55, ease: 'power2.out' }, '>-0.05')
      .add(playIntro, 0.8);
  }

  function preload() {
    const pre = $('.preloader');
    const count = $('.preloader__count', pre);
    const fill = $('.preloader__name .fill', pre);
    const o = { v: 0 };
    const tl = gsap.timeline();
    tl.to(o, {
      v: 100, duration: reduce ? 0.3 : 2.1, ease: 'power2.inOut',
      onUpdate: () => {
        count.textContent = String(Math.round(o.v)).padStart(3, '0');
        fill.style.clipPath = `inset(${100 - o.v}% 0 0 0)`;
      },
    });
    tl.to(pre, {
      clipPath: 'inset(0 0 100% 0)', duration: 1.1, ease: 'expo.inOut',
      onStart: () => setTimeout(playIntro, 450),
      onComplete: () => { html.classList.remove('is-loading'); pre.remove(); store.set('nc-seen', '1'); },
    }, '+=0.15');
  }

  if (html.classList.contains('is-loading') && $('.preloader')) {
    if (lenis) lenis.stop();
    preload();
    setTimeout(() => lenis && lenis.start(), 3400);
  } else {
    html.classList.remove('is-loading');
    const pre = $('.preloader');
    if (pre) pre.remove();
    arrive();
  }

  /* ---------- Leaving: liquid wave covers the screen ---------- */
  function leave(url, label) {
    if (!tr || reduce) { window.location.href = url; return; }
    store.set('nc-nav', label);
    tr.classList.add('is-active');
    trBack.setAttribute('d', P.hidden);
    trFront.setAttribute('d', P.hidden);
    const chars = setLabel(label);
    gsap.set(trLabel, { opacity: 1 });
    gsap.set(chars, { yPercent: 115 });
    if (window.Liquid) window.Liquid.pulse = 1;
    gsap.timeline({ onComplete: () => { window.location.href = url; } })
      .to(trBack, { attr: { d: P.rising }, duration: 0.45, ease: 'power2.in' })
      .to(trBack, { attr: { d: P.full }, duration: 0.4, ease: 'power2.out' })
      .to(trFront, { attr: { d: P.rising }, duration: 0.45, ease: 'power2.in' }, 0.12)
      .to(trFront, { attr: { d: P.full }, duration: 0.4, ease: 'power2.out' })
      .to(chars, { yPercent: 0, duration: 0.6, stagger: 0.03, ease: 'expo.out' }, 0.62);
  }

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    if (a.target === '_blank' || a.hasAttribute('download')) return;
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || !/\.html?$|\/$/.test(url.pathname)) return;
    if (url.pathname === location.pathname && url.hash) return;
    e.preventDefault();
    closeMenu();
    leave(url.href, a.dataset.label || a.textContent.trim().split(/\s+/).pop());
  });

  // returning via the back button restores a frozen page — reset the overlay
  window.addEventListener('pageshow', (e) => {
    if (e.persisted && tr) {
      tr.classList.remove('is-active');
      html.classList.remove('is-arriving');
      trBack.setAttribute('d', P.hidden);
      trFront.setAttribute('d', P.hidden);
      gsap.set(trLabel, { opacity: 0 });
    }
  });

  /* ---------- Nav ---------- */
  const nav = $('.nav');
  let lastY = 0;
  const onScroll = () => {
    const y = window.scrollY;
    if (nav) {
      nav.classList.toggle('is-scrolled', y > 40);
      nav.classList.toggle('is-hidden', y > lastY && y > 300 && !body.classList.contains('menu-open'));
    }
    lastY = y;
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  const burger = $('.nav__burger');
  function closeMenu() {
    body.classList.remove('menu-open');
    if (burger) burger.setAttribute('aria-expanded', 'false');
    if (lenis) lenis.start();
  }
  if (burger) {
    burger.addEventListener('click', () => {
      const open = !body.classList.contains('menu-open');
      body.classList.toggle('menu-open', open);
      burger.setAttribute('aria-expanded', String(open));
      if (lenis) open ? lenis.stop() : lenis.start();
      if (open) gsap.fromTo('.menu__link', { yPercent: 60, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 1, stagger: 0.06, ease: 'expo.out', delay: 0.25 });
    });
  }

  /* ---------- Cursor ---------- */
  if (fine && !reduce) {
    html.classList.add('has-cursor');
    const cur = $('.cursor');
    const dot = $('.cursor__dot', cur);
    const ring = $('.cursor__ring', cur);
    const lab = $('.cursor__label', cur);
    const pos = { x: innerWidth / 2, y: innerHeight / 2 };
    const rp = { ...pos };
    window.addEventListener('pointermove', (e) => { pos.x = e.clientX; pos.y = e.clientY; }, { passive: true });
    gsap.ticker.add(() => {
      rp.x += (pos.x - rp.x) * 0.16;
      rp.y += (pos.y - rp.y) * 0.16;
      dot.style.transform = `translate(${pos.x}px, ${pos.y}px) translate(-50%, -50%)`;
      ring.style.transform = `translate(${rp.x}px, ${rp.y}px) translate(-50%, -50%)`;
    });
    document.addEventListener('pointerover', (e) => {
      const t = e.target.closest('[data-cursor], a, button, input, textarea');
      cur.classList.remove('is-hover', 'is-label');
      if (!t) return;
      if (t.dataset.cursor) { lab.textContent = t.dataset.cursor; cur.classList.add('is-label'); }
      else cur.classList.add('is-hover');
    });
    document.addEventListener('pointerleave', () => gsap.to(cur, { opacity: 0, duration: 0.3 }));
    document.addEventListener('pointerenter', () => gsap.to(cur, { opacity: 1, duration: 0.3 }));
  }

  /* ---------- Magnetic ---------- */
  if (fine && !reduce) {
    $$('[data-magnetic]').forEach((el) => {
      const strength = parseFloat(el.dataset.magnetic) || 0.35;
      const xTo = gsap.quickTo(el, 'x', { duration: 0.8, ease: 'elastic.out(1, 0.4)' });
      const yTo = gsap.quickTo(el, 'y', { duration: 0.8, ease: 'elastic.out(1, 0.4)' });
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * strength);
        yTo((e.clientY - (r.top + r.height / 2)) * strength);
      });
      el.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
    });
  }

  /* ---------- Clock (Bengaluru) ---------- */
  const clocks = $$('[data-clock]');
  if (clocks.length) {
    const fmt = new Intl.DateTimeFormat('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: 'Asia/Kolkata' });
    const tick = () => clocks.forEach((c) => (c.textContent = fmt.format(new Date()) + ' IST'));
    tick();
    setInterval(tick, 1000);
  }

  /* ---------- Role rotor ---------- */
  $$('[data-rotor]').forEach((ul) => {
    const items = $$('li', ul);
    ul.appendChild(items[0].cloneNode(true));
    const tl = gsap.timeline({ repeat: -1, delay: 3 });
    items.forEach((_, i) => {
      tl.to(ul, { yPercent: -(100 / (items.length + 1)) * (i + 1), duration: 0.9, ease: 'expo.inOut' }, '+=1.6');
    });
    tl.set(ul, { yPercent: 0 });
  });

  /* ---------- Copy email ---------- */
  $$('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.copy);
        btn.classList.add('is-copied');
        setTimeout(() => btn.classList.remove('is-copied'), 2000);
      } catch (e) {
        window.location.href = 'mailto:' + btn.dataset.copy;
      }
    });
  });

  /* ---------- Mailto form ---------- */
  const form = $('[data-mailto-form]');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const d = new FormData(form);
      const subject = encodeURIComponent(`Hello Naveen — from ${d.get('name') || 'your portfolio'}`);
      const bodyTxt = encodeURIComponent(`${d.get('message') || ''}\n\n— ${d.get('name') || ''}${d.get('email') ? ' (' + d.get('email') + ')' : ''}`);
      window.location.href = `mailto:${form.dataset.mailtoForm}?subject=${subject}&body=${bodyTxt}`;
    });
  }

  /* ---------- Hover preview list ---------- */
  const preview = $('.hover-preview');
  if (preview && fine) {
    const imgs = $$('img', preview);
    const xTo = gsap.quickTo(preview, 'x', { duration: 0.7, ease: 'power3' });
    const yTo = gsap.quickTo(preview, 'y', { duration: 0.7, ease: 'power3' });
    let rot = 0, lastX = 0;
    window.addEventListener('pointermove', (e) => {
      xTo(e.clientX); yTo(e.clientY);
      rot = gsap.utils.clamp(-14, 14, (e.clientX - lastX) * 0.6);
      lastX = e.clientX;
      gsap.to(preview, { rotate: rot, duration: 0.6, ease: 'power3' });
    }, { passive: true });
    $$('[data-preview]').forEach((a) => {
      a.addEventListener('pointerenter', () => {
        imgs.forEach((im) => im.classList.toggle('is-on', im.dataset.key === a.dataset.preview));
        gsap.to(preview, { opacity: 1, scale: 1, duration: 0.5, ease: 'expo.out' });
      });
      a.addEventListener('pointerleave', () => gsap.to(preview, { opacity: 0, scale: 0.6, duration: 0.4, ease: 'power3' }));
    });
  }

  /* ---------- Card glow follows pointer + tilt ---------- */
  $$('.card, [data-tilt]').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      el.style.setProperty('--mx', px * 100 + '%');
      el.style.setProperty('--my', py * 100 + '%');
      if (fine && !reduce && el.hasAttribute('data-tilt')) {
        gsap.to(el, { rotateY: (px - 0.5) * 10, rotateX: (0.5 - py) * 10, transformPerspective: 900, duration: 0.6, ease: 'power3' });
      }
    });
    el.addEventListener('pointerleave', () => {
      if (el.hasAttribute('data-tilt')) gsap.to(el, { rotateY: 0, rotateX: 0, duration: 1, ease: 'elastic.out(1, 0.5)' });
    });
  });

  /* ---------- Liquid image distortion on hover ---------- */
  const disp = $('#liquid-distort feDisplacementMap');
  const turb = $('#liquid-distort feTurbulence');
  if (disp) {
    const o = { s: 0 };
    let raf = null;
    const loop = () => {
      const t = performance.now() / 1000;
      turb.setAttribute('baseFrequency', `${0.012 + Math.sin(t * 0.9) * 0.004} ${0.02 + Math.cos(t * 0.7) * 0.006}`);
      disp.setAttribute('scale', o.s.toFixed(2));
      raf = o.s > 0.05 ? requestAnimationFrame(loop) : null;
    };
    $$('[data-liquid-img]').forEach((el) => {
      el.addEventListener('pointerenter', () => {
        gsap.to(o, { s: 38, duration: 0.6, ease: 'power2.out' });
        if (!raf) raf = requestAnimationFrame(loop);
      });
      el.addEventListener('pointerleave', () => gsap.to(o, { s: 0, duration: 1.4, ease: 'elastic.out(1, 0.35)', onUpdate: () => { if (!raf) raf = requestAnimationFrame(loop); } }));
    });
  }

  if (!ST) return;

  /* ---------- Reveals ---------- */
  $$('[data-reveal]').forEach((el) => {
    gsap.from(el, {
      y: 60, autoAlpha: 0, duration: 1.3, ease: 'expo.out', delay: parseFloat(el.dataset.reveal) || 0,
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  });

  $$('[data-stagger]').forEach((wrap) => {
    gsap.from(wrap.children, {
      y: 70, autoAlpha: 0, duration: 1.2, ease: 'expo.out', stagger: 0.09,
      scrollTrigger: { trigger: wrap, start: 'top 85%', once: true },
    });
  });

  $$('[data-split]').forEach((el) => {
    const chars = split(el);
    gsap.from(chars, {
      yPercent: 115, rotate: 5, duration: 1.2, ease: 'expo.out', stagger: 0.022,
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  });

  $$('[data-scrub]').forEach((el) => {
    const words = splitWords(el);
    gsap.to(words, {
      opacity: 1, stagger: 0.1, ease: 'none',
      scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: true },
    });
  });

  $$('[data-count]').forEach((el) => {
    const end = parseFloat(el.dataset.count);
    const dec = parseInt(el.dataset.decimals || '0', 10);
    const suffix = el.innerHTML.includes('<sup') ? el.querySelector('sup').outerHTML : '';
    const o = { v: 0 };
    el.innerHTML = '0' + suffix;
    gsap.to(o, {
      v: end, duration: 2.2, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      onUpdate: () => { el.innerHTML = (dec ? o.v.toFixed(dec) : Math.round(o.v).toLocaleString('en-IN')) + suffix; },
    });
  });

  $$('[data-speed]').forEach((el) => {
    const sp = parseFloat(el.dataset.speed);
    gsap.to(el, { yPercent: sp * 100, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  $$('[data-img-parallax] img').forEach((img) => {
    gsap.fromTo(img, { yPercent: -7 }, { yPercent: 7, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  // Hero title drifts apart as you scroll away
  const heroTitle = $('.hero__title');
  if (heroTitle) {
    gsap.to('.hero__line:first-child', { xPercent: -8, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero__line--2', { xPercent: 6, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  }

  // Marquee speeds up and skews with scroll velocity
  const tracks = $$('.marquee__track');
  if (tracks.length && lenis) {
    lenis.on('scroll', ({ velocity }) => {
      const skew = gsap.utils.clamp(-12, 12, velocity * 0.4);
      tracks.forEach((t) => gsap.to(t, { skewX: -skew, duration: 0.5, ease: 'power3', overwrite: 'auto' }));
    });
  }

  // Timeline rail fills as you scroll
  const prog = $('.timeline__progress');
  if (prog) {
    gsap.to(prog, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.timeline', start: 'top 70%', end: 'bottom 60%', scrub: true } });
    $$('.tl').forEach((t) => gsap.from(t, { x: 40, autoAlpha: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: t, start: 'top 85%', once: true } }));
  }

  // Gallery strip drifts horizontally
  const gal = $('.gallery__track');
  if (gal) {
    gsap.fromTo(gal, { x: () => innerWidth * 0.1 }, {
      x: () => -(gal.scrollWidth - innerWidth) - innerWidth * 0.05, ease: 'none',
      scrollTrigger: { trigger: '.gallery', start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true },
    });
  }

  // Horizontal project scroller (desktop)
  const hs = $('.hs');
  if (hs) {
    ST.matchMedia({
      '(min-width: 901px)': () => {
        const track = $('.hs__track', hs);
        const bar = $('.hs__progress i', hs);
        const dist = () => track.scrollWidth - innerWidth;
        const tween = gsap.to(track, {
          x: () => -dist(), ease: 'none',
          scrollTrigger: {
            trigger: hs, pin: '.hs__pin', start: 'top top', end: () => '+=' + dist(), scrub: 1, invalidateOnRefresh: true,
            onUpdate: (self) => { if (bar) bar.style.transform = `scaleX(${self.progress})`; },
          },
        });
        $$('.proj', hs).forEach((p) => {
          gsap.from($$('.proj__body > *', p), {
            y: 40, autoAlpha: 0, stagger: 0.06, duration: 1, ease: 'expo.out',
            scrollTrigger: { trigger: p, containerAnimation: tween, start: 'left 75%', once: true },
          });
        });
      },
    });
  }

  window.addEventListener('load', () => ST.refresh());
})();
