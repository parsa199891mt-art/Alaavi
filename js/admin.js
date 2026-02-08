const ADMIN_PASSWORD = "parsa1998";
const albumSelect = document.getElementById("albumSelect");

function login() {
  if (document.getElementById("password").value === ADMIN_PASSWORD) {
    loginBox.classList.add("hidden");
    adminPanel.classList.remove("hidden");
    loadAlbums();
  } else alert("رمز اشتباه است");
}

function loadAlbums() {
  const albums = JSON.parse(localStorage.getItem("albums")) || [];
  albumSelect.innerHTML = `<option value="">انتخاب آلبوم</option>`;
  albums.forEach(a => {
    const opt = document.createElement("option");
    opt.value = a.name;
    opt.textContent = a.name;
    albumSelect.appendChild(opt);
  });
}

function uploadImage() {
  const albumName = newAlbum.value || albumSelect.value;
  const file = imageFile.files[0];
  if (!albumName || !file) return;

  const reader = new FileReader();
  reader.onload = () => {
    let albums = JSON.parse(localStorage.getItem("albums")) || [];
    let album = albums.find(a => a.name === albumName);
    if (!album) albums.push(album = { name: albumName, images: [] });
    album.images.push(reader.result);
    localStorage.setItem("albums", JSON.stringify(albums));
    loadAlbums();
  };
  reader.readAsDataURL(file);
}

function deleteLast() {
  let albums = JSON.parse(localStorage.getItem("albums")) || [];
  let album = albums.find(a => a.name === albumSelect.value);
  if (!album) return;
  album.images.pop();
  localStorage.setItem("albums", JSON.stringify(albums));
}

function deleteAlbum() {
  let albums = JSON.parse(localStorage.getItem("albums")) || [];
  albums = albums.filter(a => a.name !== albumSelect.value);
  localStorage.setItem("albums", JSON.stringify(albums));
  loadAlbums();
}
