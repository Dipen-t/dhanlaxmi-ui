// Motion is progressive enhancement: the HTML and CSS default to visible content.
(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const root = document.documentElement;
  const header = document.querySelector('.site-header');
  const progress = document.querySelector('.reading-progress');
  const activeAnimations = new Set();
  const elementAnimations = new WeakMap();
  const easing = 'cubic-bezier(0.16, 1, 0.3, 1)';
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const splitHeadings = new Map();
  document.querySelectorAll('h1, h2:not(#dialog-title)').forEach(heading => {
    const words = [];
    [...heading.childNodes].forEach(node => {
      if (node.nodeType !== Node.TEXT_NODE) return;
      const fragment = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach(text => {
        if (!text.trim()) { fragment.append(document.createTextNode(text)); return; }
        const mask = document.createElement('span'); mask.className = 'word-mask';
        const word = document.createElement('span'); word.className = 'reveal-word'; word.textContent = text;
        mask.append(word); fragment.append(mask); words.push(word);
      });
      node.replaceWith(fragment);
    });
    splitHeadings.set(heading, words);
  });
  function revealHeading(heading) {
    const words = splitHeadings.get(heading) || [];
    words.forEach((word, index) => play(word, [
      { transform: 'translateY(105%) rotateX(-55deg) rotateZ(3deg)', opacity: .15 },
      { transform: 'translateY(0) rotateX(0) rotateZ(0)', opacity: 1 }
    ], { duration: 1000, delay: Math.min(index * 70, 420) }));
  }

  function play(element, keyframes, options = {}) {
    if (!element || reducedMotion.matches || !element.animate) return;
    elementAnimations.get(element)?.cancel();
    const animation = element.animate(keyframes, { duration: 700, easing, fill: 'backwards', ...options });
    elementAnimations.set(element, animation);
    activeAnimations.add(animation);
    const cleanup = () => { activeAnimations.delete(animation); if (elementAnimations.get(element) === animation) elementAnimations.delete(element); };
    animation.addEventListener('finish', cleanup, { once: true });
    animation.addEventListener('cancel', cleanup, { once: true });
    return animation;
  }

  // A single opening sequence: invitation first, then the table itself.
  play(document.querySelector('.hero-intro'), [{ opacity: .3 }, { opacity: 1 }], { duration: 450 });
  revealHeading(document.querySelector('h1'));
  play(document.querySelector('.hero-image'), [{ clipPath: 'inset(0 0 0 24%)' }, { clipPath: 'inset(0)' }], { duration: 1000 });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const element = entry.target;
        if (!entry.isIntersecting) { element.dataset.inView = 'false'; return; }
        if (element.dataset.inView === 'true') return;
        element.dataset.inView = 'true';
        const kind = element.dataset.reveal;
        if (kind === 'heading') {
          revealHeading(element);
        } else if (kind === 'closing') {
          revealHeading(element);
        } else if (element.classList.contains('occasion-list')) {
          element.querySelectorAll('.occasion').forEach((item, index) => {
            play(item, [{ transform: `translateX(${index ? 65 : -65}px) rotate(${index ? 2 : -2}deg)`, opacity: .15 }, { transform: 'translateX(0) rotate(0)', opacity: 1 }], { duration: 950, delay: index * 120 });
          });
        } else if (element.classList.contains('steps')) {
          element.querySelectorAll('li').forEach((item, index) => {
            play(item, [{ transform: 'translateY(18px)', opacity: .3 }, { transform: 'translateY(0)', opacity: 1 }], { duration: 600, delay: index * 110 });
          });
        } else if (element.classList.contains('menu-image')) {
          play(element, [{ clipPath: 'inset(0 0 25% 0)' }, { clipPath: 'inset(0)' }], { duration: 900 });
        }
      });
    }, { threshold: .18 });
    document.querySelectorAll('[data-reveal], .occasion-list, .steps, .menu-image').forEach(element => observer.observe(element));
  }

  // Cache document geometry only when it changes; scrolling performs style writes.
  const hero = document.querySelector('.hero');
  const story = document.querySelector('.story-visual');
  const about = document.querySelector('#about');
  const slices = [...document.querySelectorAll('.photo-slices span')];
  const ribbon = document.querySelector('.gathering-ribbon');
  const navLinks = [...document.querySelectorAll('#navigation a[href^="#"]')];
  let geometry = {};
  let frame = 0;
  let needsMeasure = true;
  let currentSection = '';
  function measure() {
    const y = window.scrollY;
    const position = element => {
      const rect = element.getBoundingClientRect();
      return { top: rect.top + y, height: rect.height };
    };
    geometry = {
      hero: position(hero), story: position(about), ribbon: position(ribbon),
      viewport: window.innerHeight,
      scrollLength: Math.max(1, document.documentElement.scrollHeight - window.innerHeight),
      sections: navLinks.map(link => ({ link, id: link.hash, ...position(document.querySelector(link.hash)) }))
    };
    // All five columns use the same cover crop, so the assembled image is exact.
    const photo = document.querySelector('.story-photo');
    const width = photo.clientWidth, height = photo.clientHeight;
    const sourceRatio = 1122 / 1402;
    const imageWidth = Math.max(width, height * sourceRatio);
    const imageHeight = imageWidth / sourceRatio;
    slices.forEach((slice, index) => {
      slice.style.backgroundSize = `${imageWidth}px ${imageHeight}px`;
      slice.style.backgroundPosition = `${-(imageWidth - width) / 2 - index * width / 5}px ${(height - imageHeight) / 2}px`;
    });
    needsMeasure = false;
  }
  function update() {
    frame = 0;
    if (document.hidden) return;
    if (needsMeasure) measure();
    const y = window.scrollY;
    header.classList.toggle('has-scrolled', y > 30);
    let section = '';
    geometry.sections.forEach(item => { if (y + geometry.viewport * .38 >= item.top) section = item.id; });
    if (section !== currentSection) {
      currentSection = section;
      navLinks.forEach(link => { if (link.hash === section) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current'); });
    }
    if (reducedMotion.matches) return;
    progress.style.transform = `scaleX(${clamp(y / geometry.scrollLength, 0, 1)})`;
    // Photos shift by only a few pixels; the host's scrolling stays native.
    if (y <= geometry.hero.top + geometry.hero.height) {
      hero.style.setProperty('--hero-shift', `${clamp((y - geometry.hero.top) * .12, 0, 65)}px`);
      hero.style.setProperty('--hero-orbit', `${(y - geometry.hero.top) * .12}deg`);
    }
    const storyDistance = geometry.story.top - y;
    if (storyDistance < geometry.viewport && storyDistance + geometry.story.height > 0) {
      const journey = clamp((geometry.viewport - storyDistance) / (geometry.viewport + Math.min(geometry.story.height, geometry.viewport * .8)), 0, 1);
      const assembled = clamp(journey / .7, 0, 1);
      story.style.setProperty('--story-shift', `${(journey - .5) * 40}px`);
      story.style.setProperty('--story-scale', String(.92 + assembled * .08));
      story.style.setProperty('--story-clarity', String(.4 + assembled * .6));
      story.style.setProperty('--spice-y', `${(journey - .5) * -120}px`);
      story.style.setProperty('--spice-turn', `${(journey - .5) * 36}deg`);
      story.style.setProperty('--mint-y', `${(journey - .5) * 90}px`);
      story.style.setProperty('--mint-turn', `${(journey - .5) * -28}deg`);
      const detail = clamp((journey - .2) / .5, 0, 1);
      story.style.setProperty('--detail-y', `${(1 - detail) * 80}px`);
      story.style.setProperty('--detail-turn', `${-12 + detail * 8}deg`);
      slices.forEach((slice, index) => {
        const stage = clamp((journey - index * .045) / .42, 0, 1);
        slice.style.transform = `translateY(${(1-stage) * (index % 2 ? -95 : 95)}px) rotate(${(1-stage) * (index % 2 ? -5 : 5)}deg)`;
        slice.style.opacity = String(.4 + stage * .6);
      });
    }
    const ribbonDistance = geometry.ribbon.top - y;
    if (ribbonDistance < geometry.viewport && ribbonDistance + geometry.ribbon.height > 0) {
      const amount = clamp((geometry.viewport - ribbonDistance) / (geometry.viewport + geometry.ribbon.height), 0, 1);
      ribbon.style.setProperty('--ribbon-shift', `${-amount * (window.innerWidth < 700 ? 110 : 160)}px`);
    }
  }
  function requestUpdate(remeasure = false) {
    needsMeasure ||= remeasure;
    if (!frame) frame = requestAnimationFrame(update);
  }
  root.classList.add('motion-ready');
  window.addEventListener('scroll', () => requestUpdate(), { passive: true });
  window.addEventListener('resize', () => requestUpdate(true), { passive: true });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) requestUpdate(true); });
  document.querySelectorAll('img').forEach(image => { if (!image.complete) image.addEventListener('load', () => requestUpdate(true), { once: true }); });
  document.fonts?.ready.then(() => requestUpdate(true));
  if ('ResizeObserver' in window) new ResizeObserver(() => requestUpdate(true)).observe(document.body);
  reducedMotion.addEventListener('change', () => {
    activeAnimations.forEach(animation => animation.cancel());
    hero.style.removeProperty('--hero-shift');
    hero.style.removeProperty('--hero-orbit');
    for (const property of ['--story-shift','--story-scale','--story-clarity','--spice-y','--spice-turn','--mint-y','--mint-turn','--detail-y','--detail-turn']) story.style.removeProperty(property);
    slices.forEach(slice => { slice.style.removeProperty('transform'); slice.style.removeProperty('opacity'); });
    ribbon.style.removeProperty('--ribbon-shift');
    requestUpdate(true);
  });
  document.addEventListener('menu:changed', () => {
    document.querySelectorAll('.menu-item').forEach((item, index) => play(item, [{ opacity: .25, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 300, delay: index * 45 }));
    requestUpdate(true);
  });
  // Dialog feedback follows the existing booking interaction; it does not delay it.
  new MutationObserver(() => {
    if (document.querySelector('#event-dialog').open) play(document.querySelector('#event-dialog'), [{ opacity: .3, transform: 'translateY(12px) scale(.98)' }, { opacity: 1, transform: 'translateY(0) scale(1)' }], { duration: 280 });
  }).observe(document.querySelector('#event-dialog'), { attributes: true, attributeFilter: ['open'] });
  requestUpdate(true);
})();
