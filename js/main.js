// main.js
(function(){
  const G_KEY = 'alaavi_albums';
  const gallery = document.getElementById('galleryArea');
  const darkToggle = document.getElementById('darkToggle');

  // dark mode init
  if (localStorage.getItem('alaavi_dark') === 'true') document.body.classList.add('dark');
  darkToggle.addEventListener('click', () => {
    const on = document.body.classList.toggle('dark');
    localStorage.setItem('alaavi_dark', on ? 'true' : 'false');
  });

  // load albums
  function loadAlbums() {
    try { return JSON.parse(localStorage.getItem(G_KEY)) || []; }
    catch(e){ return []; }
  }

  function saveAlbums(data){ localStorage.setItem(G_KEY, JSON.stringify(data)); }

  // render gallery
  function render() {
    gallery.innerHTML = '';
    const albums = loadAlbums();
    if (!albums.length) {
      gallery.innerHTML = `<div class="album-card"><h3>هیچ آلبومی وجود ندارد</h3><p class="muted">برای اضافه کردن عکس به بخش admin برو (admin.html)</p></div>`;
      return;
    }

    albums.forEach(album=>{
      const card = document.createElement('div');
      card.className = 'album-card';

      const header = document.createElement('div');
      header.className = 'album-header';
      header.innerHTML = `<h3>${escapeHtml(album.name)}</h3><div class="album-meta">${album.images.length} تصویر</div>`;

      const thumbGrid = document.createElement('div');
      thumbGrid.className = 'thumb-grid';
      album.images.slice(0,8).forEach((imgObj, idx)=>{
        const img = document.createElement('img');
        img.src = imgObj.src;
        img.alt = album.name;
        img.addEventListener('click', ()=> openLightbox(album.images, idx));
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
  const lbCounter = document.getElementById('lbCounter');
  let lbItems=[], lbIndex=0;

  function openLightbox(images, idx){
    lbItems = images.map(i=>i.src);
    lbIndex = idx;
    showLb();
  }

  function showLb(){
    lbImg.src = lbItems[lbIndex];
    lbCounter.textContent = `${lbIndex+1} / ${lbItems.length}`;
    lb.setAttribute('aria-hidden','false');
  }

  function closeLb(){ lb.setAttribute('aria-hidden','true'); lbItems=[]; }
  function prevLb(){ if(lbIndex>0){ lbIndex--; showLb(); } }
  function nextLb(){ if(lbIndex<lbItems.length-1){ lbIndex++; showLb(); } }

  document.getElementById('lbClose').addEventListener('click', closeLb);
  document.getElementById('lbPrev').addEventListener('click', prevLb);
  document.getElementById('lbNext').addEventListener('click', nextLb);
  window.addEventListener('keydown', e=>{
    if (lb.getAttribute('aria-hidden')==='false'){
      if (e.key==='Escape') closeLb();
      if (e.key==='ArrowLeft') prevLb();
      if (e.key==='ArrowRight') nextLb();
    }
  });

  // escape html
  function escapeHtml(s){ return (s+'').replace(/[&<>"']/g, c=>'&#'+c.charCodeAt(0)+';'); }

  // initial render
  render();
})();
