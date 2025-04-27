const canvas = document.getElementById('canvas');
const wrapper = document.getElementById('canvas-wrapper');
const ctx = canvas.getContext('2d');
let drawing = false;
let textToolActive = false;

canvas.addEventListener('mousedown', () => {
  if (!textToolActive) drawing = true;
});
canvas.addEventListener('mouseup', () => {
  drawing = false;
  ctx.beginPath();
});
canvas.addEventListener('mousemove', e => {
  if (!drawing || textToolActive) return;
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#000';
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);
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
  box.style.transform = 'rotate(0deg)';
  box.style.font = '20px Arial';

  makeDraggable(box);
  wrapper.appendChild(box);
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
  });

  el.addEventListener('wheel', e => {
    e.preventDefault();
    let current = parseFloat(el.style.transform.replace(/[^\d.-]/g, '')) || 0;
    current += e.deltaY > 0 ? 5 : -5;
    el.style.transform = `rotate(${current}deg)`;
  });
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
    ctx.font = '20px Arial';
    ctx.fillStyle = '#000';
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
