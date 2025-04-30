// Konva Setup
var width = window.innerWidth;
var height = window.innerHeight;

var stage = new Konva.Stage({
  container: 'container',
  width: width,
  height: height,
});

var layer = new Konva.Layer();
stage.add(layer);

// Variables for controlling canvas
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
let textModeActive = false; // Track if text mode is active

// Initial canvas background
function setCanvasBackground(color) {
  layer.clear();
  let rect = new Konva.Rect({
    x: 0,
    y: 0,
    width: width,
    height: height,
    fill: color,
  });
  layer.add(rect);
  layer.batchDraw();
}

setCanvasBackground('#ffffff');

// Text Tool - Create and Manipulate Text
function activateTextTool() {
  // If text mode is already active, return early
  if (textModeActive) {
    return;
  }

  // Activate text mode and allow text creation
  textModeActive = true;
  currentMode = 'text';

  // Allow user to click on the canvas to add text
  stage.on('click', function (e) {
    if (currentMode === 'text' && !e.target.hasName('text')) {
      createTextNode(e.evt.offsetX, e.evt.offsetY);
      textModeActive = false; // Disable further text creation until button is pressed again
    }
  });
}

function createTextNode(x, y) {
  // Create the text node at the clicked position
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

  // Add the text node to the layer
  layer.add(textNode);
  layer.batchDraw();

  // Disable editing by preventing text updates
  textNode.on('dblclick', function () {
    console.log("Text cannot be edited.");
    // You can add additional logic here if needed (e.g., alert the user they can't edit)
  });

  // Allow the user to move the text
  textNode.on('dragmove', function () {
    textNode.setAttrs({
      x: textNode.x(),
      y: textNode.y(),
    });
    layer.batchDraw();
  });
}

// Modes
textModeButton.addEventListener('click', () => {
  activateTextTool(); // Activate the text tool
});

drawModeButton.addEventListener('click', () => {
  currentMode = 'draw';
  textModeActive = false; // Reset text mode when switching to draw mode
});

// Clear and Fill Background
clearButton.addEventListener('click', () => {
  setCanvasBackground('#ffffff');
});
fillBgButton.addEventListener('click', () => {
  setCanvasBackground(bgFillInput.value);
});

// Image Upload
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

// Submit Modal
submitButton.addEventListener('click', () => {
  modal.style.display = 'flex';
  previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
  previewCtx.drawImage(stage.toCanvas()._canvas, 0, 0);
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
