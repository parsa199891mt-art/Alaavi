(function(){

  const ADMIN_PASS = "parsa1998";
  const G_KEY = "alaavi_albums";

  const loginBtn = document.getElementById("loginBtn");
  const adminPassword = document.getElementById("adminPassword");
  const loginBox = document.getElementById("loginBox");
  const panel = document.getElementById("panel");

  function load(){ 
    try { return JSON.parse(localStorage.getItem(G_KEY)) || [] }
    catch(e){ return [] }
  }

  function save(data){
    localStorage.setItem(G_KEY, JSON.stringify(data));
  }

  // ورود
  loginBtn.addEventListener("click", ()=>{
    if(adminPassword.value === ADMIN_PASS){
      loginSuccess();
    } else {
      alert("رمز اشتباه است");
      adminPassword.value="";
    }
  });

  adminPassword.addEventListener("keydown", e=>{
    if(e.key === "Enter") loginBtn.click();
  });

  function loginSuccess(){

    loginBox.remove();

    panel.innerHTML = `
      <div class="card">
        <h2>مدیریت گالری</h2>

        <div class="row">
          <select id="albumSelect"></select>
          <input id="newAlbum" type="text" placeholder="نام آلبوم جدید">
          <button id="createAlbumBtn" class="btn small">ایجاد آلبوم</button>
        </div>

        <div class="row">
          <input id="imageFiles" type="file" accept="image/*" multiple>
        </div>

        <div id="preview" class="preview"></div>

        <div class="row">
          <button id="saveBtn" class="btn">ذخیره عکس</button>
          <button id="deleteLastBtn" class="btn danger">حذف آخرین عکس</button>
          <button id="deleteAlbumBtn" class="btn danger">حذف آلبوم</button>
        </div>
      </div>
    `;

    initPanel();
  }

  function initPanel(){

    const albumSelect = document.getElementById("albumSelect");
    const newAlbum = document.getElementById("newAlbum");
    const createAlbumBtn = document.getElementById("createAlbumBtn");
    const imageFiles = document.getElementById("imageFiles");
    const preview = document.getElementById("preview");
    const saveBtn = document.getElementById("saveBtn");
    const deleteAlbumBtn = document.getElementById("deleteAlbumBtn");
    const deleteLastBtn = document.getElementById("deleteLastBtn");

    function populateAlbums(){
      const albums = load();
      albumSelect.innerHTML = '<option value="">انتخاب آلبوم</option>';
      albums.forEach(a=>{
        const o = document.createElement("option");
        o.value = a.name;
        o.textContent = a.name;
        albumSelect.appendChild(o);
      });
    }

    populateAlbums();

    // ساخت آلبوم
    createAlbumBtn.addEventListener("click", ()=>{
      const name = newAlbum.value.trim();
      if(!name) return alert("نام آلبوم را وارد کن");

      const albums = load();
      if(albums.find(a=>a.name===name))
        return alert("این آلبوم وجود دارد");

      albums.push({name, images:[]});
      save(albums);
      newAlbum.value="";
      populateAlbums();
    });

    // پیش‌نمایش آپلود
    let staging = [];

    imageFiles.addEventListener("change", e=>{
      staging = [];
      preview.innerHTML="";
      const files = Array.from(e.target.files);

      files.forEach(file=>{
        if(!file.type.startsWith("image/")) return;

        const reader = new FileReader();
        reader.onload = function(ev){
          staging.push({src:ev.target.result});
          const img = document.createElement("img");
          img.src = ev.target.result;
          img.style.width="120px";
          img.style.margin="5px";
          img.style.borderRadius="8px";
          preview.appendChild(img);
        };
        reader.readAsDataURL(file);
      });
    });

    // ذخیره عکس
    saveBtn.addEventListener("click", ()=>{
      const selected = albumSelect.value || newAlbum.value.trim();
      if(!selected) return alert("آلبوم را انتخاب کن");

      let albums = load();
      let album = albums.find(a=>a.name===selected);

      if(!album){
        album = {name:selected, images:[]};
        albums.push(album);
      }

      album.images.push(...staging);
      save(albums);

      alert("عکس‌ها ذخیره شدند");
      staging=[];
      preview.innerHTML="";
      imageFiles.value="";
      populateAlbums();
    });

    // حذف آخرین عکس
    deleteLastBtn.addEventListener("click", ()=>{
      const selected = albumSelect.value;
      if(!selected) return alert("آلبوم را انتخاب کن");

      const albums = load();
      const album = albums.find(a=>a.name===selected);

      if(!album || album.images.length === 0)
        return alert("عکسی برای حذف وجود ندارد");

      album.images.pop();
      save(albums);

      alert("آخرین عکس حذف شد");
    });

    // حذف آلبوم
    deleteAlbumBtn.addEventListener("click", ()=>{
      const selected = albumSelect.value;
      if(!selected) return alert("آلبوم را انتخاب کن");

      if(!confirm("آیا مطمئنی این آلبوم حذف شود؟")) return;

      let albums = load().filter(a=>a.name!==selected);
      save(albums);
      populateAlbums();
    });

  }

})();
