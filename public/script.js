const canvas = document.getElementById('canvas');
const wrapper = document.getElementById('canvas-wrapper');
const ctx = canvas.getContext('2d');
let drawing = false;
let textToolActive = false;
let currentFont = 'Arial';
let currentColor = '#000000';
let currentMode = 'draw';

const fontSelect = document.getElementById('font-select');
const colorPicker = document.getElementById('color-picker');
const toolbar = document.getElementById('text-toolbar');

colorPicker.addEventListener('input', e => {
  currentColor = e.target.value;
  updateTextStyle();
});

fontSelect.addEventListener('change', e => {
  currentFont = e.target.value;
  updateTextStyle();
});

canvas.addEventListener('mousedown', () => {
  if (currentMode === 'draw' && !textToolActive) drawing = true;
});
canvas.addEventListener('mouseup', () => {
  drawing = false;
  ctx.beginPath();
});
canvas.addEventListener('mousemove', e => {
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

function activateTextTool() {
  textToolActive = true;
  canvas.style.cursor = 'text';
  canvas.onclick = e => {
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
  box.style.left = x + 'px';
  box.style.top = y + 'px';
  box.style.font = `20px ${currentFont}`;
  box.style.color = currentColor;
  box.style.transform = 'rotate(0deg)';
  box.style.position = 'absolute';

  wrapper.appendChild(box);

  toolbar.style.display = 'block'; // Make the toolbar visible
  toolbar.style.top = `${y + 20}px`; // Place the toolbar below the canvas
  toolbar.style.left = `${x}px`; // Align the toolbar to the left of the text box

  makeDraggable(box);
  makeResizable(box);
  box.focus();
}

function makeDraggable(el) {
  let isDragging = false;
  let offsetX, offsetY;

  el.addEventListener('mousedown', e => {
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

  document.addEventListener('mousemove', e => {
    if (!isDragging) return;
    el.style.left = e.pageX - wrapper.offsetLeft - offsetX + 'px';
    el.style.top = e.pageY - wrapper.offsetTop - offsetY + 'px';

    // Update the toolbar position
    toolbar.style.top = `${e.pageY + 20}px`;
    toolbar.style.left = `${e.pageX}px`;
  });
}

function makeResizable(el) {
  const resizer = document.createElement('div');
  resizer.style.width = '10px';
  resizer.style.height = '10px';
  resizer.style.background = '#000';
  resizer.style.position = 'absolute';
  resizer.style.bottom = '0';
  resizer.style.right = '0';
  resizer.style.cursor = 'se-resize';
  el.appendChild(resizer);

  resizer.addEventListener('mousedown', e => {
    e.preventDefault();
    let startX = e.clientX;
    let startY = e.clientY;
    let startWidth = parseInt(document.defaultView.getComputedStyle(el).width, 10);
    let startHeight = parseInt(document.defaultView.getComputedStyle(el).height, 10);

    const mouseMoveHandler = e => {
      const width = startWidth + (e.clientX - startX);
      const height = startHeight + (e.clientY - startY);
      el.style.width = `${width}px`;
      el.style.height = `${height}px`;

      // Update toolbar position when resizing
      toolbar.style.top = `${e.pageY + 20}px`;
      toolbar.style.left = `${e.pageX}px`;
    };

    const mouseUpHandler = () => {
      document.removeEventListener('mousemove', mouseMoveHandler);
      document.removeEventListener('mouseup', mouseUpHandler);
    };

    document.addEventListener('mousemove', mouseMoveHandler);
    document.addEventListener('mouseup', mouseUpHandler);
  });
}

function updateTextStyle() {
  const textBoxes = document.querySelectorAll('.text-box');
  textBoxes.forEach(box => {
    box.style.fontFamily = currentFont;
    box.style.color = currentColor;
  });
}

function switchToDrawMode() {
  currentMode = 'draw';
  canvas.style.cursor = 'crosshair';
}

function switchToSelectMode() {
  currentMode = 'select';
  canvas.style.cursor = 'default';
}

function submitDesign() {
  const textBoxes = document.querySelectorAll('.text-box');
  textBoxes.forEach(box => {
    const { left, top } = box.getBoundingClientRect();
    const wrapperRect = wrapper.getBoundingClientRect();
    const x = left - wrapperRect.left;
    const y = top - wrapperRect.top;

    const rotation = parseFloat(box.style.transform.replace(/[^\d.-]/g, '')) || 0;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.font = `20px ${box.style.fontFamily}`;
    ctx.fillStyle = box.style.color;
    ctx.fillText(box.innerText, 0, 20);
    ctx.restore();

    box.remove();
  });

  const dataURL = canvas.toDataURL('image/png');
  fetch('/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: dataURL })
  }).then(res => {
    if (res.ok) {
      alert('Submitted!');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    } else {
      alert('Failed to submit.');
    }
  });
}
