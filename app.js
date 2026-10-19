(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const all = selector => [...document.querySelectorAll(selector)];
  const main = $('#main');
  const brandsSection = $('#brands');
  const servicesSection = $('#services');
  const storiesSection = $('#stories');
  if (main && brandsSection && servicesSection && storiesSection) {
    main.insertBefore(brandsSection, storiesSection);
    main.insertBefore(servicesSection, storiesSection);
  }
  const translations = all('[data-zh]').map(element => {
    const original = element.textContent;
    return { element, en: original, zh: element.dataset.zh.replace(/\\n/g, '\n') };
  });
  const copy = (en, zh) => document.documentElement.lang === 'en' ? en : zh;
  const form = $('#contact-form');
  const hints = {
    business: ['Tell us about your brand, audience, objective and preferred timing.', '告诉我们你的品牌、受众、目标与预计时间。'],
    collaboration: ['Share an idea for content, a media partnership or a cross-brand project.', '分享内容、媒体合作或跨品牌项目的想法。'],
    agency: ['Tell us the client brief, media needs and production scope.', '请分享客户简报、媒体需求与制作范围。'],
    sales: ['Introduce your market, experience and proposed collaboration.', '介绍你的市场、经验与合作设想。'],
    careers: ['Tell us your interests and include a portfolio link.', '告诉我们感兴趣的方向，并附上作品链接。']
  };
  let language = 'zh';

  function setLanguage(next, persist = true) {
    language = next;
    document.documentElement.lang = next === 'en' ? 'en' : 'zh-Hans';
    translations.forEach(({element, en, zh}) => { element.textContent = next === 'en' ? en : zh; });
    const button = $('#language-toggle');
    button.textContent = next === 'en' ? '中文' : 'EN';
    button.lang = next === 'en' ? 'zh-Hans' : 'en';
    button.setAttribute('aria-label', next === 'en' ? '切换至中文' : 'Switch to English');
    document.documentElement.querySelector('meta[name="description"]').content = next === 'en'
      ? 'Red Point brings the discipline of traditional media into the speed, creativity and platform-native language of new media, helping Malaysian brands sharpen how they are seen.'
      : 'Red Point 取传统媒体的严谨与判断，融入新媒体的速度、创意与平台语言，为马来西亚品牌塑造更清晰的形象。';
    document.title = next === 'en' ? 'RED POINT SDN. BHD. - Your story deserves to be seen.' : 'RED POINT SDN. BHD. - 让值得被认识的故事，更好地被看见。';
    updateHint();
    if (persist) { try { localStorage.setItem('redpoint-language', next); } catch {} }
  }

  function setTheme(next, persist = true) {
    document.documentElement.dataset.theme = next;
    const button = $('#theme-toggle');
    const dark = next === 'dark';
    button.setAttribute('aria-pressed', String(dark));
    button.setAttribute('aria-label', dark ? copy('Switch to light mode', '切换至浅色模式') : copy('Switch to dark mode', '切换至深色模式'));
    button.querySelector('.icon-moon').style.display = dark ? 'none' : 'block';
    button.querySelector('.icon-sun').style.display = dark ? 'block' : 'none';
    if (persist) { try { localStorage.setItem('redpoint-theme', next); } catch {} }
  }

  let savedLanguage = 'zh';
  let savedTheme = document.documentElement.dataset.theme || 'light';
  try { savedLanguage = localStorage.getItem('redpoint-language') === 'en' ? 'en' : 'zh'; savedTheme = localStorage.getItem('redpoint-theme') || savedTheme; } catch {}
  setTheme(savedTheme, false);
  setLanguage(savedLanguage, false);
  $('#language-toggle').addEventListener('click', () => {
    setLanguage(language === 'en' ? 'zh' : 'en');
    updateStoryLabel();
    updateFilterStatus();
  });
  $('#theme-toggle').addEventListener('click', () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'));

  const menu = $('.menu');
  const nav = $('#nav');
  function closeMenu() { menu.setAttribute('aria-expanded', 'false'); nav.classList.remove('open'); document.body.classList.remove('menu-open'); }
  menu.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded', String(open)); nav.classList.toggle('open', open); document.body.classList.toggle('menu-open', open); });
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && nav.classList.contains('open')) { closeMenu(); menu.focus(); } });

  function selectedKind() { return form.elements.kind.value; }
  function updateHint() { $('#type-hint').textContent = hints[selectedKind()][language === 'en' ? 0 : 1]; }
  form.elements.kind.addEventListener('change', updateHint);
  all('[data-kind]').forEach(link => link.addEventListener('click', () => { if (form.elements.kind) { form.elements.kind.value = link.dataset.kind; updateHint(); } }));

  const cards = all('.story-card');
  const storyFilters = all('[data-story-filter]');
  const showStories = $('#show-stories');
  let storyFilter = 'all';
  let storyExpanded = false;
  function updateStories() {
    cards.forEach(card => { card.hidden = storyFilter === 'all' ? (!storyExpanded && card.dataset.rank !== '1') : card.dataset.brand !== storyFilter; });
    showStories.hidden = storyFilter !== 'all';
    showStories.setAttribute('aria-expanded', String(storyExpanded));
    updateStoryLabel();
    storyFilters.forEach(button => { const active = button.dataset.storyFilter === storyFilter; button.classList.toggle('active', active); button.setAttribute('aria-pressed', String(active)); });
    const visible = cards.filter(card => !card.hidden).length;
    $('#story-status').textContent = copy(`Showing ${visible} stories.`, `显示 ${visible} 条精选内容。`);
  }
  function updateStoryLabel() { if (showStories) showStories.querySelector('span').textContent = language === 'en' ? (storyExpanded ? 'Show featured stories' : 'View all 12 stories') : (storyExpanded ? '收起精选内容' : '查看全部 12 条精选'); }
  storyFilters.forEach(button => button.addEventListener('click', () => { storyFilter = button.dataset.storyFilter; if (storyFilter !== 'all') storyExpanded = false; updateStories(); }));
  showStories.addEventListener('click', () => { storyExpanded = !storyExpanded; updateStories(); });
  updateStoryLabel();

  const brandFilters = all('[data-filter]');
  function updateFilterStatus() { const visible = all('.brand').filter(brand => !brand.hidden).length; $('#filter-status').textContent = copy(`Showing ${visible} brands.`, `显示 ${visible} 个品牌。`); }
  brandFilters.forEach(button => button.addEventListener('click', () => { const filter = button.dataset.filter; brandFilters.forEach(item => { const active = item === button; item.classList.toggle('active', active); item.setAttribute('aria-pressed', String(active)); }); all('.brand').forEach(brand => { brand.hidden = filter !== 'all' && brand.dataset.category !== filter; }); updateFilterStatus(); }));
  updateFilterStatus();

  const enquiry = () => {
    const data = new FormData(form);
    const type = form.elements.kind.selectedOptions[0].textContent.trim();
    const name = String(data.get('name') || '').trim();
    const email = String(data.get('email') || '').trim();
    const company = String(data.get('company') || '').trim();
    const lines = language === 'en'
      ? [`Enquiry type: ${type}`, `Name: ${name}`, `Email: ${email}`, `Company / brand: ${company || '-'}`, `Brand of interest: ${data.get('brand') || '-'}`, `Audience / market: ${data.get('audience') || '-'}`, `Preferred timing: ${data.get('timing') || '-'}`, `Budget: ${data.get('budget') || '-'}`, '', String(data.get('message') || '').trim()]
      : [`咨询类别：${type}`, `姓名：${name}`, `电邮：${email}`, `公司／品牌：${company || '—'}`, `意向品牌：${data.get('brand') || '—'}`, `目标受众／市场：${data.get('audience') || '—'}`, `预计时间：${data.get('timing') || '—'}`, `预算：${data.get('budget') || '—'}`, '', String(data.get('message') || '').trim()];
    return { subject: `[Red Point] ${type} - ${name}`, body: lines.join('\n') };
  };
  function valid() { const required = ['name', 'email', 'message']; for (const name of required) { const field = form.elements[name]; field.setCustomValidity(field.value.trim() ? '' : (language === 'en' ? 'Please complete this field.' : '请填写此字段。')); } return form.reportValidity(); }
  function displayDraft(draft) { $('#enquiry-preview').hidden = false; $('#draft-preview').textContent = `${draft.subject}\n\n${draft.body}`; }
  form.addEventListener('submit', event => { event.preventDefault(); if (!valid()) return; const draft = enquiry(); displayDraft(draft); window.location.href = `mailto:contact@redpointmedia.my?subject=${encodeURIComponent(draft.subject)}&body=${encodeURIComponent(draft.body)}`; $('#form-status').textContent = language === 'en' ? 'Email draft prepared. Review and send it in your email app.' : '电邮草稿已整理，请在电邮应用中确认并发送。'; });
  $('#copy').addEventListener('click', async () => { if (!valid()) return; const draft = enquiry(); displayDraft(draft); try { await navigator.clipboard.writeText(`${draft.subject}\n\n${draft.body}`); $('#form-status').textContent = language === 'en' ? 'Copied. Paste it into an email to contact@redpointmedia.my.' : '已复制，请粘贴到电邮并发送至 contact@redpointmedia.my。'; } catch { $('#form-status').textContent = language === 'en' ? 'Copy the enquiry shown below.' : '请复制下方显示的咨询草稿。'; } });
  all('input, textarea, select').forEach(field => field.addEventListener('input', () => field.setCustomValidity('')));

  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => entry.target.classList.toggle('in-view', entry.isIntersecting)), { rootMargin: '0px 0px -10% 0px' });
    all('.hero-content > *, .brand-universe, .story-card, .brand, .timeline article, .career-poster, .partner-grid>a').forEach(element => observer.observe(element));
  } else all('.hero-content > *, .brand-universe, .story-card, .brand, .timeline article, .career-poster, .partner-grid>a').forEach(element => element.classList.add('in-view'));

  const canvas = $('#cosmic-field');
  const traveller = $('.cosmic-traveller');
  if (canvas && traveller) {
    const ctx = canvas.getContext('2d');
    let width = innerWidth, height = innerHeight;
    function draw() {
      const ratio = Math.min(devicePixelRatio || 1, 1.5); canvas.width = width * ratio; canvas.height = height * ratio; ctx.setTransform(ratio, 0, 0, ratio, 0, 0); ctx.clearRect(0, 0, width, height);
      const cx = width * .86; const cy = height * .2; const radius = Math.min(width * .38, 320);
      ctx.strokeStyle = document.documentElement.dataset.theme === 'dark' ? 'rgba(241,88,111,.18)' : 'rgba(171,53,78,.11)'; ctx.lineWidth = .7;
      for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.ellipse(cx, cy, radius * (.65 + i * .14), radius * (.22 + i * .09), -.5 + i * .5, 0, Math.PI * 2); ctx.stroke(); }
      traveller.style.transform = `translate3d(${Math.max(0, width - traveller.offsetWidth)}px,90px,0)`;
    }
    addEventListener('resize', () => { width = innerWidth; height = innerHeight; draw(); }, { passive: true }); draw();
  }
})();
