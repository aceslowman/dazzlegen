/* 
    - [x] layers are now layers
    - [x] glyphs should be a member of layers
    - [x] get rid of method chaining?
    - [x] instead of drawing rectangles do this with one image and a large array
    - [x] after clicking randomize all the user interface elements do not work
    - [ ] add functionality to input elements allowing for easier adjustable drag
    - [ ] fix padding on levels (greater than 1)
 */

import { stringGen } from "./js/Utilities.js";
import Glyph from "./js/Glyph.js";
import { createAdjustableNumberInput } from "./js/Interface.js";

let glyphs = [];
let layers;

let bAutoGenerate = false;

let cnv, outputimg;

/* describes the behavior of each successive layer */
layers = [
  {
    dim: { x: 30, y: 30 },
    seed: Math.floor(Math.random() * 1000),
    noise: {
      scale: 0.1,
      steps: 8,
    },
    padding: { x: 0, y: 0 },
    fill_color: "black",
    stroke_color: undefined,
  },
  {
    dim: { x: 3, y: 3 },
    seed: Math.floor(Math.random() * 1000),
    noise: {
      scale: 0.1,
      steps: 6,
    },
    padding: { x: 0, y: 0 },
    fill_color: "black",
    stroke_color: undefined,
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

  let ctx = cnv.canvas.getContext("2d");
  ctx.mozImageSmoothingEnabled = false;
  ctx.webkitImageSmoothingEnabled = false;
  ctx.msImageSmoothingEnabled = false;
  ctx.imageSmoothingEnabled = false;

  // instead of using the pg, create one image and edit it's pixels
  outputimg = createImage(
    window.workAreaBounds.width,
    window.workAreaBounds.width
  );

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
  image(outputimg, 0, 0, width, height);
};

let generate = () => {
  outputimg = createImage(outputimg.width, outputimg.width);
  outputimg.loadPixels();
  clear();

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
        width: outputimg.width,
        height: outputimg.height,
      },
      seed: layers[0].seed,
      noise: {
        scale: layers[0].noise.scale,
        steps: layers[0].noise.steps,
      },
      stroke_color: layers[0].stroke_color,
      fill_color: layers[0].fill_color,
      padding: { ...layers[0].padding },
    })
  );

  glyphs[0].noise();
  glyphs[0].draw(outputimg);

  let l = 1;

  let stack = [];
  stack.push(glyphs[0]);

  while (stack.length) {
    let obj = stack.pop();

    for (let x = 0, i = 0; x < obj.dim.x; x++) {
      for (let y = 0; y < obj.dim.y; y++, i++) {
        let t = obj;

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
            steps: layers[l].noise.steps,
          },
          stroke_color: layers[l].stroke_color,
          fill_color: layers[l].fill_color,
          padding: { x: layers[l].padding.x, y: layers[l].padding.y },
        });

        glyph.noise();
        glyph.draw(outputimg);

        glyphs.push(glyph);

        if (l < layers.length - 1) {
          l += 1;
          stack.push(glyph);
        }
      }
    }
  }

  outputimg.updatePixels();

  image(outputimg, 0, 0, width, height);
};

const randomizeAll = () => {
  for (let i = 0; i < layers.length; i++) {
    let layer = layers[i];
    let layerControl = document.querySelector("#layer_" + i);

    layer.dim.x = Math.floor(Math.random() * 10);
    layer.dim.y = Math.floor(Math.random() * 10);
    layer.seed = Math.floor(Math.random() * 1000);
    layer.noise.scale = Math.random() * 3;
    layer.noise.steps = Math.floor(Math.random() * 3);
    layer.padding.x = Math.floor(Math.random() * 10);
    layer.padding.y = Math.floor(Math.random() * 10);

    layerControl.querySelector(".dimX input").value = layer.dim.x;
    layerControl.querySelector(".dimY input").value = layer.dim.y;
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
      padding: { x: 0, y: 0 },
    });
    setupInterface();
    if (bAutoGenerate) generate();
  });

  /* remove level */
  document
    .querySelector("#removeLevelButton")
    .addEventListener("click", (e) => {
      layers.pop();
      setupInterface();
      if (bAutoGenerate) generate();
    });

  /* snapshot */
  document.querySelector("#snapshotButton").addEventListener("click", (e) => {
    snapshot();
  });

  /* dimension select */
  document.querySelector("#resolutionSelect").addEventListener("input", (e) => {
    /* save to local storage */
    window.localStorage.setItem("output_resolution", Number(e.target.value));
    outputimg.resize(Number(e.target.value), Number(e.target.value));
    if (bAutoGenerate) generate();
  });

  /* load from local storage */
  if (window.localStorage.getItem("output_resolution")) {
    document.querySelector("#resolutionSelect").value = Number(
      window.localStorage.getItem("output_resolution")
    );
  } else {
    /* set default */
    document.querySelector("#resolutionSelect").value = 512;
  }

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
  if (window.localStorage.getItem("bAutoGenerate")) {
    bAutoGenerate = Boolean(window.localStorage.getItem("bAutoGenerate"));
  } else {
    bAutoGenerate = false;
  }
  document.querySelector("#autoGenTick").checked = bAutoGenerate;
  document.querySelector("#autoGenTick").addEventListener("input", (e) => {
    bAutoGenerate = Boolean(e.target.checked);
    window.localStorage.setItem("bAutoGenerate", bAutoGenerate);
  });

  for (let i = 0; i < layers.length; i++) {
    let layer = layers[i];
    let layerControl = document
      .querySelector("#layerControlTemplate")
      .cloneNode(true);
    layerControl.id = "layer_" + i;

    layerControl.querySelector(".layerLabel").innerText = "layer #" + (i + 1);

    layerControl.querySelector(".fillColor").addEventListener("input", (e) => {
      layer.fill_color = e.target.value;
      if (bAutoGenerate) generate();
    });

    layerControl
      .querySelector(".strokeColor")
      .addEventListener("input", (e) => {
        layer.stroke_color = e.target.value;
        if (bAutoGenerate) generate();
      });

    /* dim */
    layerControl.querySelector(".dimX input").value = layer.dim.x;
    /* bind the variable input thing */
    createAdjustableNumberInput(
      layerControl.querySelector(".dimX input"),
      (v) => {
        layer.dim.x = v;
        if (bAutoGenerate) generate();
      },
      0.0,
      undefined,
      true
    );

    layerControl.querySelector(".dimY input").value = layer.dim.y;
    /* bind the variable input thing */
    createAdjustableNumberInput(
      layerControl.querySelector(".dimY input"),
      (v) => {
        layer.dim.y = v;
        if (bAutoGenerate) generate();
      },
      0.0,
      undefined,
      true
    );

    /* padding */
    layerControl.querySelector(".paddingX input").value = layer.padding.x;
    layerControl
      .querySelector(".paddingX input")
      .addEventListener("input", (e) => {
        layer.padding.x = Number(e.target.value);
        if (bAutoGenerate) generate();
      });

    layerControl.querySelector(".paddingY input").value = layer.padding.y;
    layerControl
      .querySelector(".paddingY input")
      .addEventListener("input", (e) => {
        layer.padding.y = Number(e.target.value);
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
        layer.noise.scale = Number(e.target.value);
        if (bAutoGenerate) generate();
      });

    /* noise steps */
    layerControl.querySelector(".noiseSteps input").value = layer.noise.steps;
    layerControl
      .querySelector(".noiseSteps input")
      .addEventListener("input", (e) => {
        layer.noise.steps = Number(e.target.value);
        if (bAutoGenerate) generate();
      });

    document.querySelector("#layersControl").appendChild(layerControl);
  }
};

const snapshot = () => {
  outputimg.save("dazzlegen_" + stringGen(6), "png");
};
