(() => {
  'use strict';
  let language = 'en';
  let toastTimer;
  try { const saved = localStorage.getItem('yilu-language'); if (saved === 'en' || saved === 'zh') language = saved; } catch {}
  const menu = document.querySelector('.menu-button');
  const navigation = document.querySelector('.navigation');
  const dialog = document.querySelector('#research-dialog');
  const citation = document.querySelector('#citation-panel');
  const citationToggle = document.querySelector('#toggle-citation');
  const t = (en, zh) => language === 'en' ? en : zh;
  const setMenu = open => { navigation.classList.toggle('open', open); menu.setAttribute('aria-expanded', String(open)); menu.textContent = t(open ? 'Close' : 'Menu', open ? '关闭' : '菜单'); };
  const setLanguage = value => {
    language = value;
    document.documentElement.lang = value === 'en' ? 'en' : 'zh-CN';
    document.querySelectorAll('[data-en][data-zh]').forEach(element => { element.innerHTML = element.dataset[value]; });
    document.querySelectorAll('[data-aria-en]').forEach(element => element.setAttribute('aria-label', element.dataset[value === 'en' ? 'ariaEn' : 'ariaZh']));
    document.querySelectorAll('[data-alt-en]').forEach(element => element.setAttribute('alt', element.dataset[value === 'en' ? 'altEn' : 'altZh']));
    document.querySelectorAll('[data-lang]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.lang === value)));
    document.title = t('Yilu Cao 曹义路 · Research', '曹义路 Yilu Cao · 学术主页');
    setMenu(navigation.classList.contains('open'));
    try { localStorage.setItem('yilu-language', value); } catch {}
  };
  const setFilter = filter => {
    document.querySelectorAll('[data-filter]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === filter)));
    let visible = 0;
    dialog.querySelectorAll('[data-type]').forEach(item => { item.hidden = filter !== 'all' && item.dataset.type !== filter; if (!item.hidden) visible++; });
    document.querySelector('.filter-status').textContent = t(`${visible} research items shown`, `显示 ${visible} 项研究成果`);
  };
  const setCitation = open => { citation.hidden = !open; citationToggle.setAttribute('aria-expanded', String(open)); citationToggle.textContent = 'BibTeX ' + (open ? '−' : '+'); };
  const openResearch = (showCitation = false) => { setFilter(showCitation ? 'paper' : 'all'); setCitation(showCitation); if (!dialog.open) dialog.showModal(); document.body.classList.add('modal-open'); if (showCitation) citationToggle.focus(); };
  dialog.addEventListener('close', () => document.body.classList.remove('modal-open'));
  dialog.addEventListener('click', event => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close(); } });
  document.querySelectorAll('.all-research').forEach(button => button.addEventListener('click', () => openResearch()));
  document.querySelector('.citation-trigger').addEventListener('click', () => openResearch(true));
  document.querySelector('.close-dialog').addEventListener('click', () => dialog.close());
  document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => setFilter(button.dataset.filter)));
  citationToggle.addEventListener('click', () => setCitation(citation.hidden));
  const notify = message => { const el = document.querySelector('.toast'); (dialog.open ? dialog : document.body).appendChild(el); clearTimeout(toastTimer); el.textContent = message; el.hidden = false; toastTimer = setTimeout(() => { el.hidden = true; }, 2800); };
  const copy = async (value, message) => {
    const previous = document.activeElement; let success = false;
    try { await navigator.clipboard.writeText(value); success = true; } catch { const field = document.createElement('textarea'); field.value = value; field.setAttribute('readonly', ''); field.style.cssText = 'position:fixed;left:-9999px;top:0'; (dialog.open ? dialog : document.body).appendChild(field); field.select(); try { success = document.execCommand('copy'); } catch {} field.remove(); }
    previous?.focus({preventScroll:true}); notify(success ? message : t('Please select and copy the text manually.', '请选中文字手动复制。'));
  };
  document.querySelector('#copy-citation').addEventListener('click', () => copy(document.querySelector('#citation-text').textContent, t('Citation copied', '引用已复制')));
  document.querySelector('#copy-email').addEventListener('click', () => copy('maple_v@sjtu.edu.cn', t('Email copied', '邮箱已复制')));
  document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => { setLanguage(button.dataset.lang); if (window.matchMedia('(max-width:700px)').matches) setMenu(false); }));
  menu.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
  document.querySelectorAll('nav a').forEach(link => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('pointerdown', event => { if (navigation.classList.contains('open') && !document.querySelector('.header').contains(event.target)) setMenu(false); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && navigation.classList.contains('open')) { setMenu(false); menu.focus(); } });
  window.matchMedia('(min-width:701px)').addEventListener('change', event => { if (event.matches) setMenu(false); });
  const links = [...document.querySelectorAll('nav a')];
  if ('IntersectionObserver' in window) { const observer = new IntersectionObserver(entries => { const entry = entries.find(item => item.isIntersecting); if (entry) links.forEach(link => link.classList.toggle('active', link.hash === '#' + entry.target.id)); }, {rootMargin:'-15% 0px -65% 0px'}); ['about','research','experience','contact'].forEach(id => observer.observe(document.getElementById(id))); }
  const mobileLayout = window.matchMedia('(max-width:700px)');
  const interestsToggle = document.querySelector('.interests-toggle');
  const interestsList = document.querySelector('#interest-list');
  const interestsLabel = document.querySelector('.interests .sidebar-label');
  const setInterests = open => {
    interestsList.hidden = !open;
    interestsToggle.setAttribute('aria-expanded', String(open));
    interestsToggle.querySelector('.interest-chevron').textContent = open ? '−' : '+';
  };
  const syncInterests = () => {
    interestsToggle.hidden = !mobileLayout.matches;
    interestsLabel.hidden = mobileLayout.matches;
    setInterests(!mobileLayout.matches);
  };
  interestsToggle.addEventListener('click', () => setInterests(interestsList.hidden));
  mobileLayout.addEventListener('change', syncInterests);
  syncInterests();
  setLanguage(language);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const activeAnimations = new Set();
  const enter = (element, delay = 0) => {
    if (reducedMotion.matches || !element.animate || element.hidden) return;
    const bounds = element.getBoundingClientRect();
    if (bounds.bottom <= 0 || bounds.top >= document.documentElement.clientHeight) return;
    const animation = element.animate([
      {opacity:.65, transform:'translateY(8px)'},
      {opacity:1, transform:'translateY(0)'}
    ], {duration:420, delay, easing:'cubic-bezier(.2,.75,.3,1)', fill:'backwards'});
    activeAnimations.add(animation);
    animation.finished.catch(() => {}).finally(() => activeAnimations.delete(animation));
  };
  ['.profile-inner', '.intro'].forEach(selector => {
    [...document.querySelector(selector).children].forEach((element, index) => enter(element, index * 40));
  });
  let revealObserver;
  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        enter(entry.target);
        revealObserver.unobserve(entry.target);
      });
    }, {threshold:.1, rootMargin:'0px 0px -32px 0px'});
    document.querySelectorAll('.section').forEach(section => revealObserver.observe(section));
  }
  reducedMotion.addEventListener('change', event => {
    if (!event.matches) return;
    activeAnimations.forEach(animation => animation.cancel());
    activeAnimations.clear();
    revealObserver?.disconnect();
  });
  const progress = document.createElement('div');
  progress.className = 'reading-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.querySelector('.header').appendChild(progress);
  let progressFrame;
  const updateProgress = () => {
    progressFrame = undefined;
    const root = document.documentElement;
    const available = root.scrollHeight - root.clientHeight;
    const fraction = available > 0 ? Math.min(1, Math.max(0, root.scrollTop / available)) : 0;
    progress.style.transform = `scaleX(${fraction})`;
  };
  const scheduleProgress = () => {
    if (progressFrame === undefined) progressFrame = requestAnimationFrame(updateProgress);
  };
  window.addEventListener('scroll', scheduleProgress, {passive:true});
  window.addEventListener('resize', scheduleProgress, {passive:true});
  document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', scheduleProgress));
  if ('ResizeObserver' in window) new ResizeObserver(scheduleProgress).observe(document.querySelector('main'));
  updateProgress();
})();
