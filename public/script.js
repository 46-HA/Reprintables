var width = window.innerWidth;
var height = window.innerHeight;

var stage = new Konva.Stage({
  container: 'container',
  width: width,
  height: height,
});

var layer = new Konva.Layer();
stage.add(layer);

const textModeButton = document.getElementById('text-mode-button');
const drawModeButton = document.getElementById('draw-mode-button');
const clearButton = document.getElementById('clear-button');
const fillBgButton = document.getElementById('fill-bg-button');
const imageUpload = document.getElementById('image-upload');
const bgFillInput = document.getElementById('bg-fill');
const fontSelect = document.getElementById('font-select');
const fontSizeSelect = document.getElementById('font-size-select');
const textColorInput = document.getElementById('text-color');
const submitButton = document.getElementById('submit-button');
const modal = document.getElementById('submission-modal');
const closeModal = document.getElementById('close-modal');
const previewCanvas = document.getElementById('preview-canvas');
const previewCtx = previewCanvas.getContext('2d');
const submissionForm = document.getElementById('submission-form');

let currentMode = 'draw';
let textModeActive = false;

function setCanvasBackground(color) {
  layer.destroyChildren();
  let rect = new Konva.Rect({
    x: 0,
    y: 0,
    width: width,
    height: height,
    fill: color,
    name: 'background',
  });
  layer.add(rect);
  layer.batchDraw();
}

setCanvasBackground('#ffffff');

function activateTextTool() {
  if (textModeActive) return;
  textModeActive = true;
  currentMode = 'text';

  stage.on('click.textMode', function (e) {
    if (currentMode === 'text' && !e.target.hasName('text')) {
      createTextNode(e.evt.offsetX, e.evt.offsetY);
      textModeActive = false;
      stage.off('click.textMode');
    }
  });
}

function createTextNode(x, y) {
  var textNode = new Konva.Text({
    text: 'Double-click to edit',
    x: x,
    y: y,
    fontSize: parseInt(fontSizeSelect.value),
    fontFamily: fontSelect.value,
    fill: textColorInput.value,
    draggable: true,
    name: 'text',
  });

  layer.add(textNode);
  layer.draw();

  var tr = new Konva.Transformer({
    node: textNode,
    enabledAnchors: [],
  });
  layer.add(tr);

  textNode.on('dblclick', () => {
    textNode.hide();
    tr.hide();
    layer.draw();

    const textPosition = textNode.absolutePosition();
    const stageBox = stage.container().getBoundingClientRect();

    const area = document.createElement('textarea');
    document.body.appendChild(area);

    area.value = textNode.text();
    area.style.position = 'absolute';
    area.style.top = `${stageBox.top + textPosition.y}px`;
    area.style.left = `${stageBox.left + textPosition.x}px`;
    area.style.fontSize = textNode.fontSize() + 'px';
    area.style.fontFamily = textNode.fontFamily();
    area.style.color = textNode.fill();
    area.style.padding = '0';
    area.style.margin = '0';
    area.style.border = '1px solid #ccc';
    area.style.background = 'white';
    area.style.outline = 'none';
    area.style.resize = 'none';
    area.style.lineHeight = textNode.lineHeight();
    area.style.textAlign = textNode.align();
    area.style.minWidth = '50px';

    area.focus();

    area.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        textNode.text(area.value);
        document.body.removeChild(area);
        textNode.show();
        tr.nodes([textNode]);
        tr.show();
        layer.draw();
      } else if (e.key === 'Escape') {
        document.body.removeChild(area);
        textNode.show();
        tr.nodes([textNode]);
        tr.show();
        layer.draw();
      }
    });
  });
}

textModeButton.addEventListener('click', () => {
  activateTextTool();
});
drawModeButton.addEventListener('click', () => {
  currentMode = 'draw';
  textModeActive = false;
  stage.off('click.textMode');
});

clearButton.addEventListener('click', () => {
  setCanvasBackground('#ffffff');
});
fillBgButton.addEventListener('click', () => {
  setCanvasBackground(bgFillInput.value);
});

imageUpload.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file && file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = function (event) {
      const img = new Image();
      img.onload = function () {
        let image = new Konva.Image({
          image: img,
          x: 0,
          y: 0,
          width: width,
          height: height,
        });
        layer.add(image);
        layer.batchDraw();
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }
});

submitButton.addEventListener('click', () => {
  modal.style.display = 'flex';
  previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
  previewCtx.drawImage(stage.toCanvas()._canvas, 0, 0, previewCanvas.width, previewCanvas.height);
});

closeModal.addEventListener('click', () => {
  modal.style.display = 'none';
});

submissionForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const name = document.getElementById('modal-name').value;
  const address = document.getElementById('modal-address').value;
  const city = document.getElementById('modal-city').value;
  const state = document.getElementById('modal-state').value;
  const zip = document.getElementById('modal-zip').value;
  const imageData = stage.toDataURL();

  fetch('/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, address, city, state, zip, image: imageData }),
  }).then((res) => {
    if (res.ok) {
      alert('Submission successful!');
      modal.style.display = 'none';
    } else {
      alert('Submission failed.');
    }
  });
});
