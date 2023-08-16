/* 
    - [] layers are now layers
    - [] glyphs should be a member of layers
 */

import { stringGen } from "./js/Utilities.js";
import Glyph from "./js/Glyph.js";

let glyphs = [];
let layers;
let generateFlag = false;
let snapshotFlag = false;

let cnv;

window.workAreaElement = document.querySelector("#workArea");
window.workAreaBounds = workAreaElement.getBoundingClientRect();

/* describes the behavior of each successive layer */
layers = [
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

window.setup = () => {
  cnv = createCanvas(window.workAreaBounds.width, window.workAreaBounds.width);
  cnv.parent("workArea");

  smooth();
  colorMode(HSB, 255);
  background(255);

  generate();
};

let generate = () => {
  background(255);

  glyphs = [];

  glyphs.push(
    new Glyph()
      .anchor(0, 0)
      .dim(layers[0].dim[0], layers[0].dim[1])
      .size(width, height)
      .seed(layers[0].seed)
      .noise(layers[0].noise.scale, layers[0].noise.steps)
      // .stroke(0)
      .fill(layers[0].seed * 255)
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
    .dim(layers[l].dim[0], layers[l].dim[1])
    .size(w - t.x_padding, h - t.y_padding)
    .seed(layers[l].seed + t.cells[i])
    .noise(layers[l].noise.scale, layers[1].noise.steps)
    // .stroke(255)
    // .fill(t.cells[i]*255)
    .fill(0)
    // .fill(0)
    // .padding(1,1)
    .draw();

  // (previous glyph, x coord, y coord, cell index)
  glyphs.push(glyph);

  if (l < layers.length - 1) {
    l += 1;
    glyph.next((t, x, y, i) => next_func(t, x, y, i, l));
  }
};
