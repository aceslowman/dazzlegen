/* 
    - [x] layers are now layers
    - [x] glyphs should be a member of layers
    - [x] get rid of method chaining?
 */

import { stringGen } from "./js/Utilities.js";
import Glyph from "./js/Glyph.js";

let glyphs = [];
let layers;

let bAutoGenerate = false;

let cnv, pg;

/* describes the behavior of each successive layer */
layers = [
  {
    glyphs: [],
    dim: { x: 30, y: 30 },
    seed: Math.floor(Math.random() * 1000),
    noise: {
      scale: 0.1,
      steps: 8,
    },
    margin: { x: 0, y: 0 },
    padding: { x: 0, y: 0 },
  },
  {
    glyphs: [],
    dim: { x: 3, y: 3 },
    seed: Math.floor(Math.random() * 1000),
    noise: {
      scale: 0.1,
      steps: 6,
    },
    margin: { x: 0, y: 0 },
    padding: { x: 0, y: 0 },
  },
];

window.setup = () => {
  window.workAreaElement = document.querySelector("#workArea");
  window.workAreaBounds = workAreaElement.getBoundingClientRect();
  let s =
    window.workAreaBounds.width > window.workAreaBounds.height
      ? window.workAreaBounds.height
      : window.workAreaBounds.width;
  resizeCanvas(s - 30, s - 30);
  cnv = createCanvas(s - 30, s - 30);
  cnv.parent("workArea");

  /* graphics are drawn to pg and are resampled for the main canvas */
  pg = createGraphics(window.workAreaBounds.width, window.workAreaBounds.width);
  let ctx = cnv.canvas.getContext("2d");
  ctx.mozImageSmoothingEnabled = false;
  ctx.webkitImageSmoothingEnabled = false;
  ctx.msImageSmoothingEnabled = false;
  ctx.imageSmoothingEnabled = false;

  colorMode(HSB, 255);
  background(255);

  generate();

  setupInterface();
};

window.windowResized = () => {
  window.workAreaElement = document.querySelector("#workArea");
  window.workAreaBounds = workAreaElement.getBoundingClientRect();
  let s =
    window.workAreaBounds.width > window.workAreaBounds.height
      ? window.workAreaBounds.height
      : window.workAreaBounds.width;
  resizeCanvas(s - 30, s - 30);
  image(pg, 0, 0, width, height);
};

let generate = () => {
  background(255);
  pg.background(255);

  glyphs = [];

  glyphs.push(
    new Glyph({
      anchor: {
        x: 0,
        y: 0,
      },
      dim: {
        ...layers[0].dim,
      },
      size: {
        width: pg.width,
        height: pg.height,
      },
      seed: layers[0].seed,
      noise: {
        scale: layers[0].noise.scale,
        steps: layers[0].noise.steps, // REVISIT
      },
      stroke_color: undefined,
      fill_color: layers[0].seed * 255,
      padding: { x: 0, y: 0 },
      margin: { x: 0, y: 0 },
    })
  );

  glyphs[0].noise();
  glyphs[0].draw(pg);
  glyphs[0].next((t, x, y, i) => next_func(t, x, y, i, 1));

  image(pg, 0, 0, width, height);
};

let next_func = (t, x, y, i, l) => {
  let w = t.size.width / t.dim.x;
  let h = t.size.height / t.dim.y;

  let glyph = new Glyph({
    anchor: {
      x: t.anchor.x + x * w + t.padding.x,
      y: t.anchor.y + y * h + t.padding.y,
    },
    dim: {
      x: layers[l].dim.x,
      y: layers[l].dim.y,
    },
    size: {
      width: w - t.padding.x,
      height: h - t.padding.y,
    },
    seed: layers[l].seed + t.cells[i],
    noise: {
      scale: layers[l].noise.scale,
      steps: layers[l].noise.steps, // REVISIT
    },
    stroke_color: undefined,
    fill_color: 0,
    padding: { x: 0, y: 0 },
    margin: { x: 0, y: 0 },
  });

  glyph.noise();
  glyph.draw(pg);

  // (previous glyph, x coord, y coord, cell index)
  glyphs.push(glyph);

  if (l < layers.length - 1) {
    l += 1;
    glyph.next((t, x, y, i) => next_func(t, x, y, i, l));
  }
};

const randomizeAll = () => {
  for (let i = 0; i < layers.length; i++) {
    let layer = layers[i];
    let layerControl = document.querySelector("#layer_" + i);

    layers[i] = {
      ...layer,
      glyphs: [],
      dim: {
        x: Math.floor(Math.random() * 50),
        y: Math.floor(Math.random() * 50),
      },
      seed: Math.floor(Math.random() * 1000),
      noise: {
        scale: Math.random() * 5,
        steps: Math.random() * 5,
      },
      margin: { x: Math.random(), y: Math.random() },
      padding: { x: Math.random(), y: Math.random() },
    };

    layerControl.querySelector(".dimX input").value = layer.dim.x;
    layerControl.querySelector(".dimY input").value = layer.dim.y;
    layerControl.querySelector(".marginX input").value = layer.margin.x;
    layerControl.querySelector(".marginY input").value = layer.margin.y;
    layerControl.querySelector(".paddingX input").value = layer.padding.x;
    layerControl.querySelector(".paddingY input").value = layer.padding.y;
    layerControl.querySelector(".seed input").value = layer.seed;
    layerControl.querySelector(".noiseScale input").value = layer.noise.scale;
    layerControl.querySelector(".noiseSteps input").value = layer.noise.steps;
  }

  if (bAutoGenerate) generate();
};

const setupInterface = () => {
  document.querySelector("#layersControl").textContent = "";

  /* add level */
  document.querySelector("#addLevelButton").addEventListener("click", (e) => {
    layers.push({
      glyphs: [],
      dim: { x: 3, y: 3 },
      seed: Math.floor(Math.random() * 1000),
      noise: {
        scale: 0.1,
        steps: 6,
      },
      margin: { x: 0, y: 0 },
      padding: { x: 0, y: 0 },
    });
    setupInterface();
  });

  /* remove level */
  document
    .querySelector("#removeLevelButton")
    .addEventListener("click", (e) => {
      layers.pop();
      setupInterface();
    });

  /* snapshot */
  document.querySelector("#snapshotButton").addEventListener("click", (e) => {
    snapshot();
  });

  /* dimension select */
  document.querySelector("#resolutionSelect").addEventListener("input", (e) => {
    pg = createGraphics(Number(e.target.value), Number(e.target.value));
    if (bAutoGenerate) generate();
  });
  /* TODO load from local storage */
  document.querySelector("#resolutionSelect").value = 512;

  /* .randomize all */
  document
    .querySelector("#randomizeAllButton")
    .addEventListener("click", (e) => {
      randomizeAll();
    });

  /* .generate */
  document.querySelector("#generateButton").addEventListener("click", (e) => {
    generate();
  });

  /* auto generate */
  document.querySelector("#autoGenTick").checked = bAutoGenerate;
  document.querySelector("#autoGenTick").addEventListener("input", (e) => {
    bAutoGenerate = Boolean(e.target.checked);
  });

  for (let i = 0; i < layers.length; i++) {
    let layer = layers[i];
    let layerControl = document
      .querySelector("#layerControlTemplate")
      .cloneNode(true);
    layerControl.id = "layer_" + i;

    layerControl.querySelector(".layerLabel").innerText = "layer_" + i;

    /* dim */
    layerControl.querySelector(".dimX input").value = layer.dim.x;
    layerControl.querySelector(".dimX input").addEventListener("input", (e) => {
      let v = Number(e.target.value);
      layer.dim.x = v;
      if (bAutoGenerate) generate();
    });

    layerControl.querySelector(".dimY input").value = layer.dim.y;
    layerControl.querySelector(".dimY input").addEventListener("input", (e) => {
      let v = Number(e.target.value);
      layer.dim.y = v;
      if (bAutoGenerate) generate();
    });

    /* margin */
    layerControl.querySelector(".marginX input").value = layer.margin.x;
    layerControl
      .querySelector(".marginX input")
      .addEventListener("input", (e) => {
        let v = Number(e.target.value);
        layer.margin.x = v;
        if (bAutoGenerate) generate();
      });

    layerControl.querySelector(".marginY input").value = layer.margin.y;
    layerControl
      .querySelector(".marginY input")
      .addEventListener("input", (e) => {
        let v = Number(e.target.value);
        layer.margin.y = v;
        if (bAutoGenerate) generate();
      });

    /* padding */
    layerControl.querySelector(".paddingX input").value = layer.padding.x;
    layerControl
      .querySelector(".paddingX input")
      .addEventListener("input", (e) => {
        let v = Number(e.target.value);
        layer.padding.x = v;
        if (bAutoGenerate) generate();
      });

    layerControl.querySelector(".paddingY input").value = layer.padding.y;
    layerControl
      .querySelector(".paddingY input")
      .addEventListener("input", (e) => {
        let v = Number(e.target.value);
        layer.padding.y = v;
        if (bAutoGenerate) generate();
      });

    /* seed */
    layerControl.querySelector(".seed input").value = layer.seed;
    layerControl.querySelector(".seed input").addEventListener("input", (e) => {
      let v = Number(e.target.value);
      layer.seed = v;
      if (bAutoGenerate) generate();
    });

    /* noise scale */
    layerControl.querySelector(".noiseScale input").value = layer.noise.scale;
    layerControl
      .querySelector(".noiseScale input")
      .addEventListener("input", (e) => {
        let v = Number(e.target.value);
        layer.noise.scale = v;
        if (bAutoGenerate) generate();
      });

    /* noise steps */
    layerControl.querySelector(".noiseSteps input").value = layer.noise.steps;
    layerControl
      .querySelector(".noiseSteps input")
      .addEventListener("input", (e) => {
        let v = Number(e.target.value);
        layer.noise.steps = v;
        if (bAutoGenerate) generate();
      });

    document.querySelector("#layersControl").appendChild(layerControl);
  }
};

const snapshot = () => {
  saveCanvas(pg, "dazzlegen_" + stringGen(6));
};
