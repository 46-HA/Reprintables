const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const wrapper = document.getElementById('canvas-wrapper');
const textModeButton = document.getElementById('text-mode-button');
const drawModeButton = document.getElementById('draw-mode-button');
const clearButton = document.getElementById('clear-button');
const fillBgButton = document.getElementById('fill-bg-button');
const imageUpload = document.getElementById('image-upload');
const bgFillInput = document.getElementById('bg-fill');
const fontSelect = document.getElementById('font-select');
const fontSizeSelect = document.getElementById('font-size-select');
const textColorInput = document.getElementById('text-color');
const textToolbar = document.getElementById('text-toolbar');
const saveAddressButton = document.getElementById('save-address-button');
const addressForm = document.getElementById('address-form');
const submitAddressButton = document.getElementById('submit-address');

let isDrawing = false;
let currentMode = 'draw';
let activeTextBox = null;
let textBoxes = [];

// Set initial canvas background color to white
function setCanvasBackground(color) {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

setCanvasBackground('#ffffff');

// Handle draw mode
canvas.addEventListener('mousedown', (e) => {
  if (currentMode === 'draw') {
    isDrawing = true;
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
  }
});

canvas.addEventListener('mousemove', (e) => {
  if (currentMode === 'draw' && isDrawing) {
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = textColorInput.value;
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
  }
});

canvas.addEventListener('mouseup', () => {
  isDrawing = false;
  ctx.beginPath();
});

// Switch to text mode
textModeButton.addEventListener('click', () => {
  activateTextTool();
});

// Switch to draw mode
drawModeButton.addEventListener('click', () => {
  currentMode = 'draw';
  canvas.style.cursor = 'crosshair';
});

// Clear canvas
clearButton.addEventListener('click', () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  setCanvasBackground('#ffffff');
  textBoxes = [];
});

// Fill background with selected color
fillBgButton.addEventListener('click', () => {
  setCanvasBackground(bgFillInput.value);
});

// Upload image to canvas
imageUpload.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file && file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = function (event) {
      const img = new Image();
      img.onload = function () {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }
});

// Activate text tool and show text toolbar
function activateTextTool() {
  currentMode = 'text';
  canvas.style.cursor = 'text';
  canvas.onclick = (e) => {
    if (currentMode === 'text') {
      createTextBox(e.offsetX, e.offsetY);
      canvas.onclick = null;
      canvas.style.cursor = 'default';
    }
  };
}

// Create text box on canvas
function createTextBox(x, y) {
  const box = document.createElement('div');
  box.className = 'text-box';
  box.contentEditable = true;
  box.style.left = `${x}px`;
  box.style.top = `${y}px`;
  box.style.font = `${fontSizeSelect.value}px ${fontSelect.value}`;
  box.style.color = textColorInput.value;
  box.style.position = 'absolute';
  box.style.minWidth = '100px';
  box.style.zIndex = 5;

  makeDraggable(box);
  wrapper.appendChild(box);
  box.focus();

  showTextToolbar(x, y);
  textBoxes.push(box);
}

// Make text box draggable
function makeDraggable(el) {
  let isDragging = false;
  let offsetX, offsetY;

  el.addEventListener('mousedown', (e) => {
    if (e.target === el) {
      isDragging = true;
      offsetX = e.offsetX;
      offsetY = e.offsetY;
      document.body.style.userSelect = 'none';
    }
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
    document.body.style.userSelect = 'auto';
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    let newX = e.pageX - wrapper.offsetLeft - offsetX;
    let newY = e.pageY - wrapper.offsetTop - offsetY;

    newX = Math.max(0, Math.min(newX, canvas.width - el.offsetWidth));
    newY = Math.max(0, Math.min(newY, canvas.height - el.offsetHeight));

    el.style.left = `${newX}px`;
    el.style.top = `${newY}px`;

    if (textToolbar.style.display === 'block') {
      textToolbar.style.top = `${e.pageY + 20}px`;
      textToolbar.style.left = `${e.pageX}px`;
    }
  });
}

// Show the text toolbar near the selected text box
function showTextToolbar(x, y) {
  textToolbar.style.display = 'block';
  textToolbar.style.left = `${x}px`;
  textToolbar.style.top = `${y + 40}px`;

  activeTextBox = document.querySelector('.text-box');
}

// Address form display and save
saveAddressButton.addEventListener('click', () => {
  addressForm.style.display = 'block';
});

submitAddressButton.addEventListener('click', () => {
  const name = document.getElementById('name').value;
  const address = document.getElementById('address').value;
  const city = document.getElementById('city').value;
  const state = document.getElementById('state').value;
  const zip = document.getElementById('zip').value;

  if (name && address && city && state && zip) {
    alert(`Address Saved:\nName: ${name}\nAddress: ${address}\nCity: ${city}\nState: ${state}\nZip: ${zip}`);
    addressForm.reset();
    addressForm.style.display = 'none';
  } else {
    alert('Please fill out all fields!');
  }
});

// Add text box updates
fontSelect.addEventListener('change', () => {
  if (activeTextBox) {
    activeTextBox.style.fontFamily = fontSelect.value;
  }
});

fontSizeSelect.addEventListener('change', () => {
  if (activeTextBox) {
    activeTextBox.style.fontSize = `${fontSizeSelect.value}px`;
  }
});

textColorInput.addEventListener('input', () => {
  if (activeTextBox) {
    activeTextBox.style.color = textColorInput.value;
  }
});
