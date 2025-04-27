const canvas = document.getElementById('canvas');
const wrapper = document.getElementById('canvas-wrapper');
const ctx = canvas.getContext('2d');
const fontSelect = document.getElementById('font-select');
const fontSizeSelect = document.getElementById('font-size-select');
const textColorInput = document.getElementById('text-color');
const textToolbar = document.getElementById('text-toolbar');
const textModeButton = document.getElementById('text-mode-button');
const drawModeButton = document.getElementById('draw-mode-button');
const submitButton = document.getElementById('submit-button');

let drawing = false;
let textToolActive = false;
let currentFont = 'Arial';
let currentColor = '#000000';
let currentMode = 'draw';
let activeTextBox = null;
let textBoxes = [];

fontSelect.addEventListener('change', e => {
  if (activeTextBox) {
    activeTextBox.style.fontFamily = e.target.value;
    updateCanvas();
  }
});

fontSizeSelect.addEventListener('change', e => {
  if (activeTextBox) {
    activeTextBox.style.fontSize = `${e.target.value}px`;
    updateCanvas();
  }
});

textColorInput.addEventListener('input', e => {
  if (activeTextBox) {
    activeTextBox.style.color = e.target.value;
    updateCanvas();
  }
});

canvas.addEventListener('mousedown', (e) => {
  if (currentMode === 'draw' && !textToolActive) {
    drawing = true;
  }
});

canvas.addEventListener('mouseup', () => {
  drawing = false;
  ctx.beginPath();
});

canvas.addEventListener('mousemove', (e) => {
  if (currentMode === 'draw' && drawing && !textToolActive) {
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = currentColor;
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
  }
});

textModeButton.addEventListener('click', () => {
  activateTextTool();
});

drawModeButton.addEventListener('click', () => {
  currentMode = 'draw';
  canvas.style.cursor = 'crosshair';
});

submitButton.addEventListener('click', submitDesign);

function activateTextTool() {
  textToolActive = true;
  canvas.style.cursor = 'text';
  canvas.onclick = (e) => {
    if (!textToolActive) return;
    createTextBox(e.offsetX, e.offsetY);
    canvas.onclick = null;
    canvas.style.cursor = 'default';
    textToolActive = false;
  };
}

function createTextBox(x, y) {
  const box = document.createElement('div');
  box.className = 'text-box';
  box.contentEditable = true;
  box.style.left = `${x}px`;
  box.style.top = `${y}px`;
  box.style.font = `20px ${currentFont}`;
  box.style.color = currentColor;
  box.style.position = 'absolute';
  box.style.minWidth = '100px';

  makeDraggable(box);
  wrapper.appendChild(box);
  box.focus();

  showTextToolbar(x, y);
  textBoxes.push(box);
}

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

function showTextToolbar(x, y) {
  textToolbar.style.display = 'block';
  textToolbar.style.left = `${x}px`;
  textToolbar.style.top = `${y + 40}px`;

  activeTextBox = document.querySelector('.text-box');
}

function updateCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  textBoxes.forEach((box) => {
    ctx.font = `${box.style.fontSize} ${box.style.fontFamily}`;
    ctx.fillStyle = box.style.color;
    ctx.fillText(box.innerText, parseInt(box.style.left), parseInt(box.style.top) + 20);
  });
}

function submitDesign() {
  const dataURL = canvas.toDataURL('image/png');
  fetch('/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: dataURL })
  }).then((res) => {
    if (res.ok) {
      alert('Submitted!');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    } else {
      alert('Failed to submit.');
    }
  });
}
