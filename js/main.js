document.addEventListener('DOMContentLoaded', () => {
  const G_KEY = 'alaavi_albums';
  function load() {
    try { return JSON.parse(localStorage.getItem(G_KEY)) || []; }
    catch(e){ return []; }
  }
  function save(data){ localStorage.setItem(G_KEY, JSON.stringify(data)); }

  const gallery = document.getElementById('galleryArea');
  const darkToggle = document.getElementById('darkToggle');

  // dark mode init
  if (localStorage.getItem('alaavi_dark') === 'true') document.body.classList.add('dark');
  darkToggle.addEventListener('click', () => {
    const on = document.body.classList.toggle('dark');
    localStorage.setItem('alaavi_dark', on ? 'true' : 'false');
  });

  // render
  function render() {
    gallery.innerHTML = '';
    const albums = load();
    if (!albums.length) {
      gallery.innerHTML = `<div class="album-card"><div class="album-header"><h3>هیچ آلبومی وجود ندارد</h3></div><div class="album-meta">برای اضافه کردن عکس به بخش admin برو (admin.html)</div></div>`;
      return;
    }

    albums.forEach(album => {
      const card = document.createElement('div');
      card.className = 'album-card';

      const header = document.createElement('div');
      header.className = 'album-header';
      header.innerHTML = `<h3>${escapeHtml(album.name)}</h3><div class="album-meta">${album.images.length} تصویر</div>`;

      const thumbGrid = document.createElement('div');
      thumbGrid.className = 'thumb-grid';
      // show up to 6 thumbs
      album.images.slice(0,8).forEach((imgObj, idx)=>{
        const img = document.createElement('img');
        img.src = imgObj.src;
        img.alt = album.name;
        img.addEventListener('click', ()=> openLightbox(album, idx));
        thumbGrid.appendChild(img);
      });

      card.appendChild(header);
      card.appendChild(thumbGrid);
      gallery.appendChild(card);
    });
  }

  // Lightbox
  const lb = document.getElementById('lightbox');
  const lbImg = document.getElementById('lbImg');
  const lbCaption = document.getElementById('lbCaption');
  const lbCounter = document.getElementById('lbCounter');
  const lbClose = document.getElementById('lbClose');
  const lbPrev = document.getElementById('lbPrev');
  const lbNext = document.getElementById('lbNext');

  let lbItems = [], lbIndex = 0;
  function openLightbox(album, idx) {
    lbItems = album.images.map(i=>i.src);
    lbIndex = idx;
    showLb();
  }
  function showLb(){
    lbImg.src = lbItems[lbIndex];
    lbCaption.textContent = '';
    lbCounter.textContent = `${lbIndex+1} / ${lbItems.length}`;
    lb.setAttribute('aria-hidden','false');
  }
  function closeLb(){ lb.setAttribute('aria-hidden','true'); lbItems=[]; }
  function prevLb(){ if(lbIndex>0){ lbIndex--; showLb(); } }
  function nextLb(){ if(lbIndex < lbItems.length-1){ lbIndex++; showLb(); } }

  lbClose.addEventListener('click', closeLb);
  lbPrev.addEventListener('click', prevLb);
  lbNext.addEventListener('click', nextLb);
  window.addEventListener('keydown', (e)=>{
    if (lb.getAttribute('aria-hidden') === 'false') {
      if (e.key === 'Escape') closeLb();
      if (e.key === 'ArrowLeft') prevLb();
      if (e.key === 'ArrowRight') nextLb();
    }
  });

  // helper
  function escapeHtml(s){ return (s+'').replace(/[&<>"']/g, c=>'&#'+c.charCodeAt(0)+';'); }

  // initial
  render();

  // re-render when localStorage changes in same tab (not cross-tab)
  window.addEventListener('storage', () => render()); // in case user imports/edits in another tab
});
