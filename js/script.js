// Foto Fácil — lógica do editor
const $ = (selector) => document.querySelector(selector);
const photo = $("#photo");
const fileInput = $("#fileInput");
const sliders = ["brightness", "contrast", "saturation", "warmth"];

let imageLoaded = false;
let original = new Image();
let objectUrl = null;
let rotation = 0;
let flipped = false;
let preset = "original";

const presets = {
  original: { brightness: 100, contrast: 100, saturation: 100, warmth: 0 },
  film:     { brightness: 103, contrast: 112, saturation: 82, warmth: 17 },
  vivid:    { brightness: 104, contrast: 115, saturation: 155, warmth: 0 },
  mono:     { brightness: 102, contrast: 115, saturation: 0, warmth: 0 },
  dream:    { brightness: 112, contrast: 91, saturation: 83, warmth: 10 },
  night:    { brightness: 78, contrast: 125, saturation: 118, warmth: -8 }
};

function setValues(values) {
  sliders.forEach((key) => { $("#" + key).value = values[key]; });
  updatePreview();
}

function updatePreview() {
  const brightness = Number($("#brightness").value);
  const contrast = Number($("#contrast").value);
  const saturation = Number($("#saturation").value);
  const warmth = Number($("#warmth").value);

  $("#brightnessVal").textContent = brightness + "%";
  $("#contrastVal").textContent = contrast + "%";
  $("#saturationVal").textContent = saturation + "%";
  $("#warmthVal").textContent = (warmth > 0 ? "+" : "") + warmth;

  photo.style.filter =
    `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) ` +
    `sepia(${Math.abs(warmth) / 100})` +
    (warmth < 0 ? ` hue-rotate(${warmth * 0.7}deg)` : "");
  photo.style.transform = `rotate(${rotation}deg) scaleX(${flipped ? -1 : 1})`;

  document.querySelectorAll(".preset").forEach((button) => {
    button.classList.toggle("active", button.dataset.preset === preset);
  });
}

function resetEdits() {
  preset = "original";
  rotation = 0;
  flipped = false;
  setValues(presets.original);
}

function loadFile(file) {
  if (!file || !file.type.startsWith("image/")) return;

  if (objectUrl) URL.revokeObjectURL(objectUrl);
  objectUrl = URL.createObjectURL(file);
  original = new Image();

  original.onload = () => {
    imageLoaded = true;
    photo.src = objectUrl;
    photo.style.display = "block";
    $("#emptyState").style.display = "none";
    $("#download").disabled = false;
    $("#resetTop").disabled = false;
    $("#imageStatus").textContent = file.name;
    $("#dimensions").textContent = `${original.naturalWidth} × ${original.naturalHeight} px`;
    resetEdits();
  };

  original.onerror = () => {
    alert("Não foi possível abrir essa imagem. Tente outro arquivo.");
  };
  original.src = objectUrl;
}

fileInput.addEventListener("change", (event) => loadFile(event.target.files[0]));

sliders.forEach((key) => {
  $("#" + key).addEventListener("input", () => {
    preset = "custom";
    updatePreview();
  });
});

document.querySelectorAll(".preset").forEach((button) => {
  button.addEventListener("click", () => {
    preset = button.dataset.preset;
    setValues(presets[preset]);
  });
});

$("#rotate").addEventListener("click", () => {
  if (!imageLoaded) return;
  rotation = (rotation + 90) % 360;
  updatePreview();
});

$("#flip").addEventListener("click", () => {
  if (!imageLoaded) return;
  flipped = !flipped;
  updatePreview();
});

$("#reset").addEventListener("click", () => {
  if (imageLoaded) resetEdits();
});
$("#resetTop").addEventListener("click", () => {
  if (imageLoaded) resetEdits();
});

$("#download").addEventListener("click", () => {
  if (!imageLoaded) return;

  const width = original.naturalWidth;
  const height = original.naturalHeight;
  const swapDimensions = Math.abs(rotation) % 180 === 90;
  const canvas = document.createElement("canvas");
  canvas.width = swapDimensions ? height : width;
  canvas.height = swapDimensions ? width : height;

  const context = canvas.getContext("2d");
  const brightness = Number($("#brightness").value);
  const contrast = Number($("#contrast").value);
  const saturation = Number($("#saturation").value);
  const warmth = Number($("#warmth").value);

  context.filter =
    `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) ` +
    `sepia(${Math.abs(warmth) / 100})` +
    (warmth < 0 ? ` hue-rotate(${warmth * 0.7}deg)` : "");

  context.translate(canvas.width / 2, canvas.height / 2);
  context.rotate(rotation * Math.PI / 180);
  context.scale(flipped ? -1 : 1, 1);
  context.drawImage(original, -width / 2, -height / 2, width, height);

  const type = $("#format").value;
  const extension = type === "image/jpeg" ? "jpg" : type === "image/png" ? "png" : "webp";

  canvas.toBlob((blob) => {
    if (!blob) {
      alert("Não foi possível exportar a imagem.");
      return;
    }
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `foto-editada.${extension}`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
  }, type, type === "image/jpeg" ? 0.92 : undefined);
});
