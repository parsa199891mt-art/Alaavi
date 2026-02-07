// js/main.js
// فایل اصلی گالری: بارگذاری آلبوم‌ها و عکس‌ها از localStorage، فیلتر، جستجو و لایت‌باکس

// helper
const qs = s => document.querySelector(s);
const qsa = s => Array.from(document.querySelectorAll(s));

function loadData(){
  try {
    return JSON.parse(localStorage.getItem('albums')) || [];
  } catch(e){
    console.error('bad localStorage data', e);
    return [];
  }
}

function saveData(albums){
  localStorage.setItem('albums', JSON.stringify(albums));
}

// رندر لیست آلبوم در فیلتر
function populateAlbumFilter(albums){
  const sel = qs('#albumFilter');
  sel.innerHTML = '<option value="">همه آلبوم‌ها</option>';
  albums.forEach(a => {
    const opt = document.createElement('option');
    opt.value = a.name;
    opt.textContent = `${a.name} (${a.images.length})`;
    sel.appendChild(opt);
  });
  qs('#albumsCount').textContent = albums.length;
  qs('#imagesCount').textContent = albums.reduce((s,a)=>s+a.images.length,0);
}

// رندر کارت‌ها (هر آلبوم یک کارت)
function renderCards(albums, q=''){
  const wrap = qs('#cards');
  wrap.innerHTML = '';
  const query = q.trim().toLowerCase();

  // اگر جستجو شده، فقط عکس‌های مطابق رو نمایش بده (کارت ویژه)
  if (query){
    const matches = [];
    albums.forEach(album=>{
      album.images.forEach((img, idx) => {
        const caption = (album.captions && album.captions[idx]) ? album.captions[idx] : '';
        if (img.toLowerCase().includes(query) || caption.toLowerCase().includes(query) || album.name.toLowerCase().includes(query)) {
          matches.push({album: album.name, url: img, caption});
        }
      });
    });

    if (!matches.length){
      wrap.innerHTML = `<div class="muted">هیچ تصویری با این جستجو پیدا نشد.</div>`;
      return;
    }

    matches.forEach((m, i)=>{
      const c = document.createElement('div'); c.className='album-card';
      c.innerHTML = `
        <div class="card-thumb"><img src="${m.url}" alt=""></div>
        <div class="card-title"><h4>${m.album}</h4><div class="card-meta">نتیجه ${i+1}</div></div>
        <div style="margin-top:8px;color:var(--muted);font-size:0.95rem">${m.caption || ''}</div>
      `;
      c.addEventListener('click', ()=>openLightboxFromArray([m],0));
      wrap.appendChild(c);
    });
    return;
  }

  if (!albums.length){
    wrap.innerHTML = `<div class="muted">هنوز آلبومی ساخته نشده — از پنل ادمین عکس اضافه کن.</div>`;
    return;
  }

  albums.forEach(album=>{
    const card = document.createElement('div'); card.className='album-card';
    const thumbImgs = album.images.slice(0,4);
    const thumbs = thumbImgs.map(u => `<img src="${u}" alt="">`).join('');
    const imgMarkup = thumbImgs.length ? `<div class="card-thumb"><img src="${album.images[0]}" alt=""></div>` : `<div class="card-thumb" style="display:flex;align-items:center;justify-content:center;color:var(--muted)">بدون تصویر</div>`;
    card.innerHTML = `
      ${imgMarkup}
      <div class="card-title"><h4>${album.name}</h4><div class="card-meta">${album.images.length} تصویر</div></div>
      <div class="card-images">${thumbs}</div>
    `;
    card.addEventListener('click', ()=> openAlbum(album));
    wrap.appendChild(card);
  });
}

// باز کردن آلبوم: نمایش تصاویر آن در حالت لیست با قابلیت باز شدن در لایت‌باکس
function openAlbum(album){
  const items = album.images.map((url, idx)=>({url, caption: (album.captions && album.captions[idx]) ? album.captions[idx] : ''}));
  // رندر modal-like در صفحه اصلی: باز کردن لایت با امکان پیمایش
  openLightboxFromArray(items, 0);
}

// LIGHTBOX
const lb = qs('#lightbox');
const lbImg = qs('#lbImage');
const lbCaption = qs('#lbCaption');
const lbCounter = qs('#lbCounter');
let lbItems = [], lbIndex = 0;

function openLightboxFromArray(items, idx){
  lbItems = items;
  lbIndex = idx;
  showLb();
}
function showLb(){
  const it = lbItems[lbIndex];
  lbImg.src = it.url;
  lbCaption.textContent = it.caption || '';
  lbCounter.textContent = `${lbIndex+1} / ${lbItems.length}`;
  lb.setAttribute('aria-hidden','false');
}
function closeLb(){ lb.setAttribute('aria-hidden','true'); lbItems=[]; }
function prevLb(){ if(lbIndex>0){ lbIndex--; showLb(); } }
function nextLb(){ if(lbIndex<lbItems.length-1){ lbIndex++; showLb(); } }

qs('#lbClose').addEventListener('click', closeLb);
qs('#lbPrev').addEventListener('click', prevLb);
qs('#lbNext').addEventListener('click', nextLb);
window.addEventListener('keydown', e=>{
  if (lb.getAttribute('aria-hidden') === 'false'){
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowLeft') prevLb();
    if (e.key === 'ArrowRight') nextLb();
  }
});

// فیلتر و جستجو
qs('#albumFilter').addEventListener('change', (e)=>{
  const val = e.target.value;
  const albums = loadData();
  if (!val) renderCards(albums);
  else {
    const album = albums.find(a=>a.name === val);
    if (album) renderCards([album]);
    else renderCards([]);
  }
});
qs('#searchInput').addEventListener('input',(e)=>{
  const q = e.target.value;
  renderCards(loadData(), q);
});

// initial
(function init(){
  const albums = loadData();
  populateAlbumFilter(albums);
  renderCards(albums);
})();
