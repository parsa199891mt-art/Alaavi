document.addEventListener('DOMContentLoaded', () => {
  const ADMIN_PASS = 'parsa1998';
  const G_KEY = 'alaavi_albums';

  // DOM
  const loginBox = document.getElementById('loginBox');
  const panel = document.getElementById('panel');
  const loginBtn = document.getElementById('loginBtn');
  const adminPassword = document.getElementById('adminPassword');

  const albumSelect = document.getElementById('albumSelect');
  const newAlbum = document.getElementById('newAlbum');
  const createAlbumBtn = document.getElementById('createAlbumBtn');
  const imageFiles = document.getElementById('imageFiles');
  const preview = document.getElementById('preview');
  const saveBtn = document.getElementById('saveBtn');
  const deleteLastBtn = document.getElementById('deleteLastBtn');
  const deleteAlbumBtn = document.getElementById('deleteAlbumBtn');

  // storage helpers
  function load(){ try { return JSON.parse(localStorage.getItem(G_KEY)) || []; } catch(e){ return []; } }
  function save(data){ localStorage.setItem(G_KEY, JSON.stringify(data)); }

  function populateAlbums(){
    const albums = load();
    albumSelect.innerHTML = '<option value="">انتخاب آلبوم</option>';
    albums.forEach(a=>{
      const o = document.createElement('option');
      o.value = a.name;
      o.textContent = a.name;
      albumSelect.appendChild(o);
    });
  }

  // login
  loginBtn.addEventListener('click', ()=>{
    if (adminPassword.value === ADMIN_PASS) {
      loginBox.classList.add('hidden');
      panel.classList.remove('hidden');
      populateAlbums();
    } else {
      alert('رمز اشتباه است');
    }
  });

  // create album
  createAlbumBtn.addEventListener('click', ()=>{
    const name = (newAlbum.value || '').trim();
    if (!name) { alert('نام آلبوم را وارد کن'); return; }
    const albums = load();
    if (albums.find(a=>a.name === name)){ alert('آلبوم با این نام وجود دارد'); return; }
    albums.push({ name, images: [] });
    save(albums);
    newAlbum.value = '';
    populateAlbums();
    alert('آلبوم ساخته شد');
  });

  // preview staging
  let staging = []; // {name, src}
  imageFiles.addEventListener('change', async (e)=>{
    const files = Array.from(e.target.files || []);
    preview.innerHTML = '';
    staging = [];
    for (const f of files) {
      if (!f.type.startsWith('image/')) continue;
      const data = await fileToCompressedDataURL(f, 0.7, 1200); // compress
      staging.push({ name: f.name, src: data });
      addPreviewCard(f.name, data);
    }
  });

  function addPreviewCard(name, src){
    const card = document.createElement('div'); card.className='preview-item';
    card.innerHTML = `<img src="${src}"><div class="pname">${name}</div>`;
    const rm = document.createElement('button'); rm.textContent='حذف'; rm.className='btn small';
    rm.addEventListener('click', ()=> {
      staging = staging.filter(s=>s.src !== src);
      card.remove();
    });
    card.appendChild(rm);
    preview.appendChild(card);
  }

  // save staging into selected/new album
  saveBtn.addEventListener('click', ()=>{
    const target = (newAlbum.value || albumSelect.value || '').trim();
    if (!target) { alert('آلبوم را انتخاب یا نام جدید وارد کن'); return; }
    if (!staging.length) { alert('تصویری برای ذخیره وجود ندارد'); return; }
    const albums = load();
    let album = albums.find(a=>a.name === target);
    if (!album) { album = { name: target, images: [] }; albums.push(album); }
    staging.forEach(s=> album.images.push({ src: s.src, name: s.name, created: Date.now() }));
    save(albums);
    staging = [];
    preview.innerHTML = '';
    imageFiles.value = '';
    newAlbum.value = '';
    populateAlbums();
    alert('تصاویر ذخیره شدند');
  });

  // delete last image from selected album
  deleteLastBtn.addEventListener('click', ()=>{
    const selected = albumSelect.value;
    if (!selected) { alert('آلبوم را انتخاب کن'); return; }
    const albums = load();
    const album = albums.find(a=>a.name === selected);
    if (!album || !album.images.length) { alert('عکسی برای حذف وجود ندارد'); return; }
    album.images.pop();
    save(albums);
    populateAlbums();
    alert('آخرین تصویر حذف شد');
  });

  // delete entire album
  deleteAlbumBtn.addEventListener('click', ()=>{
    const selected = albumSelect.value;
    if (!selected) { alert('آلبوم را انتخاب کن'); return; }
    if (!confirm('آیا مطمئنی این آلبوم حذف شود؟')) return;
    let albums = load();
    albums = albums.filter(a=>a.name !== selected);
    save(albums);
    populateAlbums();
    alert('آلبوم حذف شد');
  });

  // helper: compress large images using canvas -> dataURL (resizes preserving aspect ratio)
  function fileToCompressedDataURL(file, quality=0.8, maxWidth=1200){
    return new Promise((res, rej) => {
      const img = new Image();
      const reader = new FileReader();
      reader.onload = e => {
        img.onload = () => {
          // compute size
          let w = img.width, h = img.height;
          if (w > maxWidth) {
            const ratio = maxWidth / w;
            w = Math.round(w * ratio);
            h = Math.round(h * ratio);
          }
          const canvas = document.createElement('canvas');
          canvas.width = w; canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          res(dataUrl);
        };
        img.onerror = () => rej(new Error('img load error'));
        img.src = e.target.result;
      };
      reader.onerror = () => rej(new Error('file read error'));
      reader.readAsDataURL(file);
    });
  }

  // initial populate
  populateAlbums();

  // allow pressing Enter for login
  adminPassword.addEventListener('keydown', (e)=> { if (e.key === 'Enter') loginBtn.click(); });

});
