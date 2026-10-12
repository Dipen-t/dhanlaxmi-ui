(() => {
  const root = document.documentElement;
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const mouse = matchMedia('(hover: hover) and (pointer: fine)');
  const dialog = document.querySelector('#event-dialog');
  const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
  let lenis, frame = 0, magnet, scene, magnetRect, sceneRect, x = 0, y = 0;
  function setupScrolling() {
    lenis?.destroy(); lenis = undefined; root.classList.remove('smooth-enabled');
    if (preference.matches || !window.Lenis || document.hidden) return;
    lenis = new window.Lenis({ autoRaf: true, lerp: .085, smoothWheel: true, syncTouch: false, anchors: { offset: -110 }, prevent: node => node.id === 'event-dialog' });
    root.classList.add('smooth-enabled'); if (dialog.open) lenis.stop();
  }
  function reset() {
    if (magnet) { magnet.style.removeProperty('--magnet-x'); magnet.style.removeProperty('--magnet-y'); }
    if (scene) {
      for (const property of ['--tilt-x','--tilt-y','--light-x','--light-y']) scene.style.removeProperty(property);
      scene.classList.remove('pointer-lit');
    }
    magnet = scene = undefined;
    if (frame) cancelAnimationFrame(frame); frame = 0;
  }
  function updatePointer() {
    frame = 0;
    if (magnet) {
      magnet.style.setProperty('--magnet-x', `${clamp((x - magnetRect.left - magnetRect.width / 2) * .12, -8, 8)}px`);
      magnet.style.setProperty('--magnet-y', `${clamp((y - magnetRect.top - magnetRect.height / 2) * .12, -6, 6)}px`);
    }
    if (scene) {
      const px = clamp((x - sceneRect.left) / sceneRect.width, 0, 1), py = clamp((y - sceneRect.top) / sceneRect.height, 0, 1);
      scene.style.setProperty('--tilt-x', `${(py - .5) * -4}deg`); scene.style.setProperty('--tilt-y', `${(px - .5) * 4}deg`);
      scene.style.setProperty('--light-x', `${px * 100}%`); scene.style.setProperty('--light-y', `${py * 100}%`);
    }
  }
  const schedule = () => { if (!frame) frame = requestAnimationFrame(updatePointer); };
  document.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' || !mouse.matches || preference.matches || dialog.open || document.hidden) { reset(); return; }
    x = event.clientX; y = event.clientY;
    const nextMagnet = event.target.closest('.button,.round-link');
    const nextScene = event.target.closest('.hero-image,.menu-image,.story-photo');
    if (nextMagnet !== magnet || nextScene !== scene) {
      reset(); magnet = nextMagnet; scene = nextScene;
      if (magnet) magnetRect = magnet.getBoundingClientRect();
      if (scene) { sceneRect = scene.getBoundingClientRect(); scene.classList.add('pointer-lit'); }
    }
    if (magnet || scene) schedule();
  }, { passive: true });
  document.addEventListener('pointerout', event => { if (!event.relatedTarget) reset(); });
  document.addEventListener('keydown', reset); window.addEventListener('blur', reset);
  window.addEventListener('resize', reset, { passive: true }); window.addEventListener('scroll', reset, { passive: true });
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => entry.target.classList.toggle('ambient-active', entry.isIntersecting)));
    document.querySelectorAll('.hero,.closing').forEach(section => observer.observe(section));
  }
  new MutationObserver(() => { reset(); if (dialog.open) lenis?.stop(); else if (!document.hidden) lenis?.start(); }).observe(dialog, { attributes: true, attributeFilter: ['open'] });
  document.addEventListener('visibilitychange', () => { reset(); root.classList.toggle('page-asleep', document.hidden); setupScrolling(); });
  preference.addEventListener('change', () => { reset(); setupScrolling(); }); mouse.addEventListener('change', reset);
  window.addEventListener('pagehide', () => { reset(); lenis?.destroy(); lenis = undefined; });
  window.addEventListener('pageshow', event => { if (event.persisted) setupScrolling(); });
  setupScrolling();
})();
