import Glyph from "./js/Glyph.js";
import { stringGen } from "./js/Utilities.js";
import { createParameterGroup, createParameterInput } from "./js/Interface.js";

let glyphs;
let cnv;

/* output resolution when saving */
let outputResolution = [128, 128];

/* describes the behavior of each successive level */
let levels = [
  {
    glyphs: [],
    dim: [30, 30],
    seed: Math.random() * 1000,
    noise: {
      scale: 0.1,
      steps: 8,
    },
  },
  {
    glyphs: [],
    dim: [3, 3],
    seed: Math.random() * 1000,
    noise: {
      scale: 0.1,
      steps: 6,
    },
  },
];

window.workAreaElement = document.querySelector("#workArea");
window.workAreaBounds = workAreaElement.getBoundingClientRect();

window.setup = async () => {
  cnv = createCanvas(window.workAreaBounds.width, window.workAreaBounds.width);

  cnv.parent("workArea");

  smooth();
  colorMode(HSB, 255);
  background(255);

  generate();

  createInterface();
};

let createInterface = () => {
  for (let i = 0; i < levels.length; i++) {
    // this creates a single level. shoudl be possible to add / remove
    let levelInterfaceContainer = document.createElement("fieldset");
    levelInterfaceContainer.classList.add('levelGroup')

    // level legend
    let levelLegend = document.createElement("legend");
    levelLegend.innerText = "lvl " + i;
    levelInterfaceContainer.appendChild(levelLegend);

    // level noise param group
    let levelNoiseParamGroup = createParameterGroup("noise");

    // add scale param
    let levelNoiseScaleInput = createParameterInput(
      "scale",
      "number",
      levels[i].noise.scale,
      (e) => {
        levels[i].noise.scale = Number(e.target.value);
      }
    );

    let levelNoiseStepInput = createParameterInput(
      "step",
      "number",
      levels[i].noise.steps,
      (e) => {
        levels[i].noise.steps = Number(e.target.value);
      }
    );

    // append to group
    levelNoiseParamGroup.appendChild(levelNoiseScaleInput);
    levelNoiseParamGroup.appendChild(levelNoiseStepInput);

    let levelDimensionsParamGroup = createParameterGroup("dimensions");

    // add width / height param
    let levelDimensionsWidth = createParameterInput(
      "width",
      "number",
      levels[0].dim[0],
      (e) => {
        levels[i].dim[0] = e.target.value;
        console.log("hello", levels[0].dim[0]);
      }
    );

    let levelDimensionsHeight = createParameterInput(
      "height",
      "number",
      levels[i].dim[1],
      (e) => {
        levels[i].dim[1] = e.target.value;
        console.log("hello", levels[0].dim[1]);
      }
    );

    // append to group
    levelDimensionsParamGroup.appendChild(levelDimensionsWidth);
    levelDimensionsParamGroup.appendChild(levelDimensionsHeight);

    levelInterfaceContainer.appendChild(levelNoiseParamGroup);
    levelInterfaceContainer.appendChild(levelDimensionsParamGroup);

    // add level to wrapper
    let levelsControl = document.querySelector("#levelsControl");

    levelsControl.appendChild(levelInterfaceContainer);
  }

  document
    .querySelector("#generateButton")
    .addEventListener("click", () => generate());
  document
    .querySelector("#resolutionSelect")
    .addEventListener("input", (e) => handleResolutionSelect(e));
  document
    .querySelector("#snapshotButton")
    .addEventListener("click", () => snapshot());
};

let handleResolutionSelect = (e) => {
  console.log(e);
};

let snapshot = () => {
  saveCanvas(cnv, "dazzlegen_" + stringGen(6));
};

let generate = () => {
  background(255);

  glyphs = [];

  console.log({ levels });

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

  // console.log({glyphs})
};

let next_func = (t, x, y, i, l) => {
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
    // .fill(0)
    // .padding(1,1)
    .draw();

  // (previous glyph, x coord, y coord, cell index)
  glyphs.push(glyph);

  if (l < levels.length - 1) {
    l += 1;
    glyph.next((t, x, y, i) => next_func(t, x, y, i, l));
  }
};
