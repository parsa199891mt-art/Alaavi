const gallery = document.getElementById("gallery");
const slider = document.getElementById("slider");
const albums = JSON.parse(localStorage.getItem("albums")) || [];

let allImages = [];

albums.forEach(album => {
  allImages.push(...album.images);
});

/* ===== slider ===== */
let slideIndex = 0;
function renderSlider() {
  if (allImages.length === 0) return;
  slider.innerHTML = `<img src="${allImages[slideIndex]}">`;
  slideIndex = (slideIndex + 1) % allImages.length;
}
setInterval(renderSlider, 3000);
renderSlider();

/* ===== gallery ===== */
if (albums.length === 0) {
  gallery.innerHTML = `<div class="empty">تصویری برای نمایش وجود ندارد</div>`;
}

albums.forEach(album => {
  const box = document.createElement("div");
  box.className = "album-box";

  box.innerHTML = `<h2>${album.name}</h2>`;
  const images = document.createElement("div");
  images.className = "album-images";

  album.images.forEach(src => {
    const img = document.createElement("img");
    img.src = src;
    img.onclick = () => openLightbox(src);
    images.appendChild(img);
  });

  box.appendChild(images);
  gallery.appendChild(box);
});

/* ===== lightbox ===== */
function openLightbox(src) {
  document.getElementById("lightboxImg").src = src;
  document.getElementById("lightbox").classList.remove("hidden");
}
function closeLightbox() {
  document.getElementById("lightbox").classList.add("hidden");
}

/* ===== dark mode ===== */
function toggleDark() {
  document.body.classList.toggle("dark");
  localStorage.setItem("dark", document.body.classList.contains("dark"));
}
if (localStorage.getItem("dark") === "true") {
  document.body.classList.add("dark");
}
