
(function () {
  'use strict';
 
  const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 
  
  const dateEl = document.getElementById('date');
  if (dateEl) {
    const isMobile = window.innerWidth <= 720;
    dateEl.textContent = new Date().toLocaleDateString('en-GB', {
      weekday: isMobile ? undefined : 'short',
      day: 'numeric',
      month: isMobile ? 'short' : 'long',
      year: 'numeric'
    });
  }
 
  
  const quotes = [
    { text: "Talk is cheap. Show me the code.", by: "Linus Torvalds" },
    { text: "Simplicity is prerequisite for reliability.", by: "Edsger Dijkstra" },
    { text: "Make it work, make it right, make it fast.", by: "Kent Beck" },
    { text: "Keep it simple, stupid.", by: "Kelly Johnson" }
  ];
 
  const quoteEl = document.getElementById('quote-text');
  let currentQuoteIndex = 0;
 
  function cycleQuotes() {
    if (!quoteEl) return;
    quoteEl.classList.add('vanish');
 
    setTimeout(() => {
      currentQuoteIndex = (currentQuoteIndex + 1) % quotes.length;
      const q = quotes[currentQuoteIndex];
      quoteEl.textContent = `${q.text} — ${q.by}`;
      quoteEl.style.transform = 'translateY(8px)';
      void quoteEl.offsetWidth; // Force reflow
      quoteEl.style.transform = '';
      quoteEl.classList.remove('vanish');
    }, 700);
  }
 
  if (quoteEl) {
    setInterval(cycleQuotes, 5500);
  }
 
  
  const views = ['home', 'projects', 'publications', 'contacts'];
  const pill = document.getElementById('pill');
  const navEl = document.getElementById('nav');
  let hasNavigatedOnce = false;
 
  function movePill(animate) {
    const activeLink = document.querySelector('#nav a.on');
    if (!activeLink || !pill) return;
 
    const left = activeLink.offsetLeft;
    const width = activeLink.offsetWidth;
 
    if (!animate || calm) {
      pill.style.transition = 'none';
      pill.style.left = `${left}px`;
      pill.style.width = `${width}px`;
      void pill.offsetWidth;
      pill.style.transition = '';
      return;
    }
 
    pill.style.left = `${left}px`;
    pill.style.width = `${width}px`;
    pill.animate(
      [
        { transform: 'scale(1, 1)' },
        { transform: 'scale(1.3, 0.8)', offset: 0.3 },
        { transform: 'scale(0.94, 1.1)', offset: 0.62 },
        { transform: 'scale(1.03, 0.98)', offset: 0.82 },
        { transform: 'scale(1, 1)' }
      ],
      { duration: 750, easing: 'ease-out' }
    );
  }
 
  function handleRoute() {
    const rawHash = (window.location.hash || '').replace('#', '');
    const activeView = views.includes(rawHash) ? rawHash : 'home';
 
    views.forEach((viewId) => {
      const section = document.getElementById(viewId);
      if (section) {
        section.classList.toggle('on', viewId === activeView);
      }
    });
 
    document.querySelectorAll('#nav a').forEach((link) => {
      link.classList.toggle('on', link.dataset.v === activeView);
    });
 
    window.scrollTo(0, 0);
    movePill(hasNavigatedOnce);
    hasNavigatedOnce = true;
  }
 
  window.addEventListener('resize', () => movePill(false));
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => movePill(false));
  }
 
  if (navEl && !calm) {
    navEl.addEventListener('pointerdown', () => navEl.style.setProperty('--s', '1.07'));
    ['pointerup', 'pointercancel'].forEach((evt) => {
      window.addEventListener(evt, () => navEl.style.setProperty('--s', '1'));
    });
  }
 
  window.addEventListener('hashchange', handleRoute);
  handleRoute();
 
  
  document.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    const glass = e.target.closest && e.target.closest('.glass');
    if (!glass) return;
    const r = glass.getBoundingClientRect();
    glass.style.setProperty('--mx', `${e.clientX - r.left}px`);
    glass.style.setProperty('--my', `${e.clientY - r.top}px`);
  }, { passive: true });
 
  
  const canvas = document.getElementById('grain');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    const scale = window.innerWidth < 640 ? 3.5 : 2.5;
    let imgData;
    let buf32;
 
    function resizeGrain() {
      canvas.width = Math.ceil(window.innerWidth / scale);
      canvas.height = Math.ceil(window.innerHeight / scale);
      imgData = ctx.createImageData(canvas.width, canvas.height);
      
      buf32 = new Uint32Array(imgData.data.buffer);
    }
 
    function renderGrain() {
      if (!buf32) return;
      const len = buf32.length;
      
      
      for (let i = 0; i < len; i++) {
        if (Math.random() < 0.52) {
          const v = (Math.random() * 255) | 0;
          
          buf32[i] = (220 << 24) | (v << 16) | (v << 8) | v;
        } else {
          buf32[i] = 0; 
        }
      }
      ctx.putImageData(imgData, 0, 0);
    }
 
    resizeGrain();
    renderGrain();
    let lastW = window.innerWidth, lastH = window.innerHeight;
    window.addEventListener('resize', () => {
      
      if (window.innerWidth === lastW && Math.abs(window.innerHeight - lastH) < 150) return;
      lastW = window.innerWidth; lastH = window.innerHeight;
      resizeGrain();
      renderGrain();
    });
 
    if (!calm) {
      let lastTime = 0;
      function loop(currentTime) {
        if (currentTime - lastTime > 65) { 
          renderGrain();
          lastTime = currentTime;
        }
        requestAnimationFrame(loop);
      }
      requestAnimationFrame(loop);
    }
  }
})();