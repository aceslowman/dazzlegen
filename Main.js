import { stringGen } from "./js/Utilities.js";
import Level from "./js/Level.js";
import Glyph from "./js/Glyph.js";


let cnv;
window.autoGenerate = false;

/* output resolution when saving */
let outputResolution = [128, 128];

// let glyphs = [];
let levels = [];

window.workAreaElement = document.querySelector("#workArea");
window.workAreaBounds = workAreaElement.getBoundingClientRect();

window.generate = () => {
  background(255);

  /*  
    level and glyph are being merged, so i don't know how to fix this method yet
  */

  glyphs = [];

  glyphs.push(
    new Glyph()
      .anchor(0, 0)
      .dim(levels[0].dim[0], levels[0].dim[1])
      .size(width, height)
      .seed(levels[0].seed)
      .noise(levels[0].noise.scale, levels[0].noise.steps)
      // .stroke(0)
      .fill(levels[0].seed * 255)
    // .padding(10,10)
    // .draw()
  );

  glyphs[0].next((t, x, y, i) => next_func(t, x, y, i, 1));
};

window.setup = async () => {
  cnv = createCanvas(window.workAreaBounds.width, window.workAreaBounds.width);

  cnv.parent("workArea");

  /* set up two default levels */

  levels.push(new Level({
    depth: 0,
    dim: [30,30], 
    size: [width,height],
    seed: Math.floor(Math.random() * 1000),
    anchor: [0,0],
    noise: {scale: 0.1, step: 8},
    stroke: 0,
    fill: 0,
    padding: [0,0],
    margin: [0,0]
  }))

  levels.push(new Level({
    depth: 1,
    dim: [30,30], 
    size: [width,height],
    seed: Math.floor(Math.random() * 1000),
    anchor: [0,0],
    noise: {scale: 0.1, step: 6},
    stroke: 0,
    fill: 0,
    padding: [0,0],
    margin: [0,0]
  }))

  smooth();
  colorMode(HSB, 255);
  background(255);

  setupInterface();

  window.generate();
};

window.windowResized = () => {
  window.workAreaBounds = workAreaElement.getBoundingClientRect();
  resizeCanvas(window.workAreaBounds.width, window.workAreaBounds.width);
  window.generate();
}

let setupInterface = () => {
  let levelsControl = document.querySelector("#levelsControl");
  levelsControl.innerHTML = "";

  for (let i = 0; i < levels.length; i++) {
    levels[i].setupInterface();
  }

  let levelAddRemove = document.createElement("div");
  let addButton = document.createElement("button");
  addButton.innerText = "+";
  addButton.addEventListener("click", () => handleAddLevel());
  let removeButton = document.createElement("button");
  removeButton.innerText = "-";
  removeButton.addEventListener("click", () => handleRemoveLevel());

  levelAddRemove.append(removeButton, addButton);
  levelsControl.appendChild(levelAddRemove);

  document
    .querySelector("#randomizeAllButton")
    .addEventListener("click", () => handleRandomizeAll());

  document
    .querySelector("#autoGenTick")
    .addEventListener("input", (e) => handleToggleAutogenerate(e));

  if (window.localStorage.getItem("autogenerate")) {
    window.autoGenerate = window.localStorage.getItem("autogenerate");
    document.querySelector("#autoGenTick").checked =
      window.localStorage.getItem("autogenerate");
  }

  document
    .querySelector("#generateButton")
    .addEventListener("click", () => window.generate());
  document
    .querySelector("#resolutionSelect")
    .addEventListener("input", (e) => console.log(e));
  document
    .querySelector("#snapshotButton")
    .addEventListener("click", () => snapshot());
};

let handleToggleAutogenerate = (e) => {
  window.localStorage.setItem("autogenerate", e.target.checked);
  window.autoGenerate = e.target.checked;
};

let handleRandomizeAll = () => {
  for (let level of levels) {
    level.randomize();
  }
};

let handleAddLevel = () => {
  levels.push(
    new Level(levels.length, [3, 3], Math.floor(Math.random() * 1000), 0.1, 6)
  );
  setupInterface();
  window.generate();
};

let handleRemoveLevel = () => {
  if (levels.length > 1) {
    levels.pop();
    setupInterface();
    window.generate();
  }
};

let snapshot = () => {
  saveCanvas(cnv, "dazzlegen_" + stringGen(6));
};

let next_func = (t, x, y, i, l) => {
  // if (l <= 1) return;

  let w = t.width / t.x_dim;
  let h = t.height / t.y_dim;

  let glyph = new Glyph()
    .anchor(t.x_anchor + x * w + t.x_padding, t.y_anchor + y * h + t.y_padding)
    .dim(levels[l].dim[0], levels[l].dim[1])
    .size(w - t.x_padding, h - t.y_padding)
    .seed(levels[l].seed + t.cells[i])
    .noise(levels[l].noise.scale, levels[1].noise.steps)
    // .stroke(255)
    // .fill(t.cells[i]*255)
    .fill(0)
    // .padding(1,1)
    .draw();

  // (previous glyph, x coord, y coord, cell index)
  glyphs.push(glyph);

  // go one level deeper
  if (l < levels.length - 1) {
    l += 1;
    glyph.next((t, x, y, i) => next_func(t, x, y, i, l));
  }
};
