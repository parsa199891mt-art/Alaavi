const ADMIN_PASSWORD = "1234";

function login() {
  const pass = document.getElementById("password").value;

  if (pass === ADMIN_PASSWORD) {
    document.getElementById("loginBox").classList.add("hidden");
    document.getElementById("adminPanel").classList.remove("hidden");
  } else {
    alert("رمز اشتباه است");
  }
}

function uploadImage() {
  const albumName = document.getElementById("albumName").value;
  const file = document.getElementById("imageFile").files[0];

  if (!albumName || !file) {
    alert("همه فیلدها رو پر کن");
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    let albums = JSON.parse(localStorage.getItem("albums")) || [];

    let album = albums.find(a => a.name === albumName);
    if (!album) {
      album = { name: albumName, images: [] };
      albums.push(album);
    }

    album.images.push(reader.result);
    localStorage.setItem("albums", JSON.stringify(albums));

    alert("عکس ذخیره شد ✅");
  };

  reader.readAsDataURL(file);
}
