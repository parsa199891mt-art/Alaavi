// js/admin.js
// پنل ادمین: مدیریت آلبوم‌ها و تصاویر فقط در localStorage
// تغییر رمز: مقدار ADMIN_PASSWORD را عوض کن

const ADMIN_PASSWORD = "1234"; // ← اینو عوض کن به پسورد قوی‌تر
const loginBtn = document.getElementById('loginBtn');
const panel = document.getElementById('panel');
const loginWrap = document.getElementById('loginWrap');

const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const selectFilesBtn = document.getElementById('selectFiles');
const previewArea = document.getElementById('previewArea');
const existingAlbumSelect = document.getElementById('existingAlbumSelect');
const newAlbumInput = document.getElementById('newAlbumName');

const saveImgsBtn = document.getElementById('saveImgsBtn');
const clearAllBtn = document.getElementById('clearAllBtn');
const albumsList = document.getElementById('albumsList');
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const importFile = document.getElementById('importFile');

let staging = []; // آرایه فایل‌های آماده ذخیره {dataURL, name}
let albums = [];  // مدل در حافظه

// helpers
const qs = s => document.querySelector(s);
const el = (tag, cls) => { const d=document.createElement(tag); if (cls) d.className=cls; return d; }

function loadAlbums(){
  try { albums = JSON.parse(localStorage.getItem('albums')) || []; }
  catch(e){ albums = []; }
  renderAlbumsList();
  fillExistingAlbumSelect();
}

function saveAlbums(){
  localStorage.setItem('albums', JSON.stringify(albums));
  loadAlbums(); // refresh UI and selects
}

function renderAlbumsList(){
  albumsList.innerHTML = '';
  if (!albums.length){ albumsList.innerHTML = '<small class="muted">هیچ آلبومی وجود ندارد.</small>'; return; }
  albums.forEach((a, idx)=>{
    const row = el('div','album-item');
    row.innerHTML = `<div><strong>${a.name}</strong><div class="meta">${a.images.length} تصویر</div></div>`;
    const actions = el('div');
    const viewBtn = el('button','btn ghost'); viewBtn.textContent='نمایش';
    const renameBtn = el('button','btn ghost'); renameBtn.textContent='تغییر نام';
    const delBtn = el('button','btn danger'); delBtn.textContent='حذف';
    actions.appendChild(viewBtn); actions.appendChild(renameBtn); actions.appendChild(delBtn);
    row.appendChild(actions);
    albumsList.appendChild(row);

    viewBtn.addEventListener('click', ()=> {
      // باز کردن آلبوم در تب جدید (یا در صفحه اصلی از localStorage خوانده میشه)
      window.location.href = 'index.html';
      setTimeout(()=>{ // بعد از ردایرکت، فیلتر رو ست کن (اگر صفحه لود بشه)
        localStorage.setItem('lastAlbumToOpen', a.name);
      }, 100);
    });

    renameBtn.addEventListener('click', ()=>{
      const newName = prompt('نام جدید آلبوم را وارد کنید:', a.name);
      if (newName && newName.trim()){
        a.name = newName.trim();
        saveAlbums();
      }
    });

    delBtn.addEventListener('click', ()=>{
      if (!confirm('آیا مطمئنی این آلبوم حذف شود؟ (تمام تصاویر آن حذف می‌شود)')) return;
      albums.splice(idx,1);
      saveAlbums();
    });
  });
}

function fillExistingAlbumSelect(){
  existingAlbumSelect.innerHTML = '<option value="">انتخاب آلبوم موجود</option>';
  albums.forEach(a=>{
    const o = document.createElement('option'); o.value = a.name; o.textContent = a.name;
    existingAlbumSelect.appendChild(o);
  });
  qs('#albumsCount')?.textContent = albums.length;
}

function addToPreview(file, dataURL){
  const card = el('div','preview-card');
  const img = el('img'); img.src = dataURL;
  const name = el('div'); name.className='small'; name.textContent = file.name;
  const removeBtn = el('button','btn ghost'); removeBtn.textContent='حذف';
  removeBtn.style.marginTop='6px';
  card.appendChild(img); card.appendChild(name); card.appendChild(removeBtn);
  previewArea.appendChild(card);
  removeBtn.addEventListener('click', ()=>{
    const i = staging.findIndex(s => s.dataURL === dataURL && s.name === file.name);
    if (i!==-1) staging.splice(i,1);
    card.remove();
  });
}

function handleFiles(files){
  Array.from(files).forEach(file=>{
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = function(e){
      staging.push({dataURL: e.target.result, name: file.name});
      addToPreview(file, e.target.result);
    };
    reader.readAsDataURL(file);
  });
}

// events
selectFilesBtn.addEventListener('click', ()=> fileInput.click());
fileInput.addEventListener('change', (e)=> handleFiles(e.target.files));

dropZone.addEventListener('dragover', (e)=>{ e.preventDefault(); dropZone.classList.add('dragover'); });
dropZone.addEventListener('dragleave', ()=> dropZone.classList.remove('dragover'));
dropZone.addEventListener('drop', (e)=>{ e.preventDefault(); dropZone.classList.remove('dragover'); handleFiles(e.dataTransfer.files); });

document.getElementById('createAlbumBtn').addEventListener('click', ()=>{
  const name = (newAlbumInput.value || existingAlbumSelect.value || '').trim();
  if (!name){ alert('نام آلبوم را وارد یا انتخاب کن'); return; }
  if (!albums.find(a=>a.name===name)) albums.push({name, images: [], captions:[]});
  saveAlbums();
  newAlbumInput.value='';
});

saveImgsBtn.addEventListener('click', ()=>{
  if (!staging.length){ alert('عکسی جهت ذخیره وجود ندارد'); return; }
  const target = existingAlbumSelect.value || newAlbumInput.value.trim();
  if (!target){ alert('نام آلبوم را انتخاب یا وارد کن'); return; }
  let album = albums.find(a=>a.name===target);
  if (!album){ album = {name: target, images: [], captions:[]}; albums.push(album); }
  staging.forEach(s => { album.images.push(s.dataURL); album.captions.push(''); });
  staging = [];
  previewArea.innerHTML = '';
  saveAlbums();
  alert('عکس‌ها ذخیره شدند (فقط روی مرورگر شما)');
});

clearAllBtn.addEventListener('click', ()=>{
  if (!confirm('می‌خوای همهٔ عکس‌ها و آلبوم‌ها از مرورگر پاک بشه؟')) return;
  localStorage.removeItem('albums');
  albums = [];
  staging = [];
  previewArea.innerHTML = '';
  renderAlbumsList();
  fillExistingAlbumSelect();
  alert('پاک شد');
});

loginBtn.addEventListener('click', ()=>{
  const pass = document.getElementById('adminPassword').value;
  if (pass === ADMIN_PASSWORD){
    loginWrap.style.display='none';
    panel.style.display='block';
    loadAlbums();
  } else alert('رمز اشتباه است');
});

// export / import
exportBtn.addEventListener('click', ()=>{
  const data = localStorage.getItem('albums') || '[]';
  const blob = new Blob([data], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href=url; a.download='alavi-albums.json'; a.click();
  URL.revokeObjectURL(url);
});

importBtn.addEventListener('click', ()=> importFile.click());
importFile.addEventListener('change', (e)=>{
  const f = e.target.files[0];
  if (!f) return;
  const r = new FileReader();
  r.onload = function(ev){
    try {
      const obj = JSON.parse(ev.target.result);
      if (!Array.isArray(obj)) throw new Error('فرمت اشتباه');
      if (!confirm('آیا می‌خوای این داده‌ها جایگزین داده‌های فعلی شوند؟')) return;
      localStorage.setItem('albums', JSON.stringify(obj));
      loadAlbums();
      alert('بارگذاری با موفقیت انجام شد');
    } catch(err){
      alert('فایل نامعتبر است');
    }
  };
  r.readAsText(f);
});

// initial load to show existing albums on login screen counts
(function init(){
  try { const tmp = JSON.parse(localStorage.getItem('albums')) || []; qs('#albumsCount')?.textContent = tmp.length; } catch(e){}
})();
