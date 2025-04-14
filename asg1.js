// Katrina Apostol (kaaposto)
// CSE160 - James Davis - Spring 2025 - asg1

// Constants
const POINT    = 0;
const TRIANGLE = 1;
const CIRCLE   = 2;
const FLOWER   = 3;

// Global Variables
let gl, canvas;
let a_Position, u_FragColor, u_Size;

// Shape State
let g_shapesList     = [];
let g_selectedColor  = [0.5, 0.5, 0.5, 1.0];
let g_selectedSize   = 5;
let g_selectedType   = POINT;
let g_selectedsCount = 12;
let g_outline        = 0;
let drag             = false;

// Vertex Shader Source
const VSHADER_SOURCE = `
attribute vec4 a_Position;
uniform float u_Size;
void main() {
  gl_Position = a_Position;
  gl_PointSize = u_Size;
}
`;

// Fragment Shader Source
const FSHADER_SOURCE = `
precision mediump float;
uniform vec4 u_FragColor;
void main() {
  gl_FragColor = u_FragColor;
}
`;

// HTML UI Bindings
function addActionsForHtmlUI() {
  // Shape Buttons
  document.getElementById('clear').onclick     = () => { g_shapesList = []; renderAllShapes(); };
  document.getElementById('square').onclick    = () => { g_selectedType = POINT;    g_outline = 0; };
  document.getElementById('triangle').onclick  = () => { g_selectedType = TRIANGLE; g_outline = 0; };
  document.getElementById('circle').onclick    = () => { g_selectedType = CIRCLE;   g_outline = 0; };
  document.getElementById('flower').onclick    = () => { g_selectedType = FLOWER;   g_outline = 0; };
  document.getElementById('hourglass').onclick = () => { g_selectedType = POINT;    g_outline = 1; };
  document.getElementById('otriangle').onclick = () => { g_selectedType = TRIANGLE; g_outline = 1; };
  document.getElementById('ocircle').onclick   = () => { g_selectedType = CIRCLE;   g_outline = 1; };
  document.getElementById('oflower').onclick   = () => { g_selectedType = FLOWER;   g_outline = 1; };

  // Color Sliders
  document.getElementById('red').addEventListener('mouseup',   function() { g_selectedColor[0] = this.value * 0.1; });
  document.getElementById('green').addEventListener('mouseup', function() { g_selectedColor[1] = this.value * 0.1; });
  document.getElementById('blue').addEventListener('mouseup',  function() { g_selectedColor[2] = this.value * 0.1; });

  // Size and Segment Count Sliders
  document.getElementById('size').addEventListener('mouseup',   function() { g_selectedSize = this.value; });
  document.getElementById('sCount').addEventListener('mouseup', function() { g_selectedsCount = this.value; });
}

// WebGL Setup
function setupWebGL() {
  canvas = document.getElementById('asg1');
  if (!canvas) {
    console.error('Failed to retrieve <canvas> element');
    return;
  }

  gl = getWebGLContext(canvas);
  if (!gl) {
    console.error('Failed to get rendering context for WebGL');
    return;
  }
}

// GLSL Variable Setup
function connectVariablesToGLSL() {
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.error('Failed to initialize shaders');
    return;
  }

  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  u_Size = gl.getUniformLocation(gl.program, 'u_Size');

  if (a_Position < 0 || !u_FragColor || !u_Size) {
    console.error('Failed to get shader variable location');
    return;
  }
}

// Main Function
function main() {
  setupWebGL();
  connectVariablesToGLSL();
  addActionsForHtmlUI();

  canvas.onmousedown = (ev) => { click(ev); drag = true; };
  canvas.onmouseup   = ()  => { drag = false; };
  canvas.onmousemove = (ev) => { if (drag) click(ev); };

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
}

// Coordinate Conversion
function convertCoordinatesEventToGL(ev) {
  const rect = ev.target.getBoundingClientRect();
  const x = ((ev.clientX - rect.left) - canvas.width / 2) / (canvas.width / 2);
  const y = (canvas.height / 2 - (ev.clientY - rect.top)) / (canvas.height / 2);
  return [x, y];
}

// Mouse Click Event
function click(ev) {
  const [x, y] = convertCoordinatesEventToGL(ev);
  let shape;

  switch (g_selectedType) {
    case POINT:    shape = new Point(); break;
    case TRIANGLE: shape = new Triangle(); break;
    case CIRCLE:   shape = new Circle(); shape.sCount = g_selectedsCount; break;
    case FLOWER:   shape = new Flower(); break;
  }

  shape.position = [x, y];
  shape.color    = g_selectedColor.slice();
  shape.size     = g_selectedSize;
  shape.outline  = g_outline;

  g_shapesList.push(shape);
  renderAllShapes();
}

// Render All Shapes
function renderAllShapes() {
  gl.clear(gl.COLOR_BUFFER_BIT);
  for (let shape of g_shapesList) {
    shape.render();
  }
}
