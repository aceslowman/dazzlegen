import {Layer, Glyph} from "./js/Layer.js";
import { stringGen } from "./js/Utilities.js";

let cnv;
window.autoGenerate = false;

let layers = [];

window.workAreaElement = document.querySelector("#workArea");
window.workAreaBounds = workAreaElement.getBoundingClientRect();

window.generate = () => {
  console.log('generating')

  layers[0].generate();
  layers[0].draw();
}

window.setup = async () => {
  cnv = createCanvas(window.workAreaBounds.width, window.workAreaBounds.width);

  cnv.parent("workArea");

  /* set up two default layers */
  layers.push(
    new Layer({
      dim: { x: 30, y: 30 },
      seed: Math.floor(Math.random() * 1000),
      noise_properties: {
        scale: 0.1,
        steps: 8,
      },
    })
  );

  smooth();
  colorMode(HSB, 255);
  background(255);

  window.generate();

  console.log({ layers });

  setupInterface();

  handleRandomizeAll()
};

let setupInterface = () => {
  let layersControl = document.querySelector("#layersControl");
  layersControl.innerHTML = "";

  for (let i = 0; i < layers.length; i++) {
    layers[i].setupInterface();
  }

  let layerAddRemove = document.createElement("div");
  let addButton = document.createElement("button");
  addButton.innerText = "+";
  addButton.addEventListener("click", () => handleAddlayer());
  let removeButton = document.createElement("button");
  removeButton.innerText = "-";
  removeButton.addEventListener("click", () => handleRemovelayer());

  layerAddRemove.append(removeButton, addButton);
  layersControl.appendChild(layerAddRemove);

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
    .addEventListener("click", () => generate());
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
  for (let layer of layers) {
    layer.randomize();
  }
};

let handleAddlayer = () => {
  layers.push(
    new layer(layers.length, [3, 3], Math.floor(Math.random() * 1000), 0.1, 6)
  );
  setupInterface();
  window.generate();
};

let handleRemovelayer = () => {
  if (layers.length > 1) {
    layers.pop();
    setupInterface();
    window.generate();
  }
};

let snapshot = () => {
  saveCanvas(cnv, "dazzlegen_" + stringGen(6));
};