import { createParameterGroup, createParameterInput } from "./Interface.js";

/*  
a glyph represents a single element within the grid 
it is different than a level although they share many 
of the same parameters
*/
class Glyph {
  constructor(parent_level, anchor, size) {
    this.parent_level = parent_level;
    this.anchor = anchor;
    this.size = size;
  }

  next(f) {
    for (let _x = 0, i = 0; _x < this.parent_level.dim.x; _x++) {
      for (let _y = 0; _y < this.parent_level.dim.y; _y++, i++) {
        f(this, _x, _y, i); //move to draw
      }
    }
  }

  draw() {
    /*  
      this really just draws each cell to it's position, 
      does not generate noise itself
    */
    for (let _x = 0, i = 0; _x < this.parent_level.dim[0]; _x++) {
      for (let _y = 0; _y < this.parent_level.dim[1]; _y++, i++) {
        let pos_x = (_x / this.parent_level.dim[0]) * this.parent_level.width;
        pos_x += this.anchor[0];

        let pos_y = (_y / this.parent_level.dim[1]) * this.parent_level.height;
        pos_y += this.anchor[1];

        this.parent_level.stroke_color !== undefined
          ? stroke(this.parent_level.stroke_color)
          : noStroke();
        this.parent_level.fill_color !== undefined
          ? fill(
              this.parent_level.fill_color,
              this.parent_level.glyphs[i] > 0.5 ? 255 : 0
            )
          : noFill();

        rect(
          floor(pos_x),
          floor(pos_y),
          ceil(this.parent_level.width / this.parent_level.dim[0]),
          ceil(this.parent_level.height / this.parent_level.dim[1])
        );

        // debug numbers
        // fill(128)
        // text(this.cells[i].toFixed(2),pos_x+(this.height / this.x_dim)/2,pos_y+(this.height / this.y_dim)/2);
      }
    }
  }
}

/*  
  layers are grid based organizing tools that contain collections of glyphs
*/
class Layer {
  constructor(options) {
    this.controls_ele = undefined;
    // what glyphs are being stored?
    this.glyphs = new Map();
    // how many glyphs?
    this.dim = options.dim;
    // the base seed, glyphs have their own but are linked to this seed
    this.seed = options.seed;
    // how does the randomness behave?
    this.noise_properties = options.noise_properties;
    // what's the stroke color
    this.stroke_color = options.stroke_color;
    // whats the fill color
    this.fill_color = options.fill_color;
    // how much space within glyphs?
    this.padding = options.padding;
    // how much space around glyphs
    this.margin = options.margin;
  }

  setupInterface() {
    this.controls_ele = document.createElement("fieldset");
    this.controls_ele.classList.add("levelGroup");

    let levelLegend = document.createElement("legend");
    levelLegend.innerText = "lvl " + this.depth;

    let levelNoiseParamGroup = createParameterGroup("noise");

    let levelNoiseScaleInput = createParameterInput(
      "scale",
      "number",
      "levelNoiseScale_" + this.depth,
      this.noise.scale,
      (e) => {
        this.noise.scale = Number(e.target.value);
        if (window.autoGenerate) window.generate();
      }
    );

    let levelNoiseStepInput = createParameterInput(
      "step",
      "number",
      "levelNoiseStep_" + this.depth,
      this.noise.steps,
      (e) => {
        this.noise.steps = Number(e.target.value);
        if (window.autoGenerate) window.generate();
      }
    );

    // append to group
    levelNoiseParamGroup.append(levelNoiseScaleInput, levelNoiseStepInput);

    let levelDimensionsParamGroup = createParameterGroup("dimensions");

    // add width / height param
    let levelDimensionsWidth = createParameterInput(
      "width",
      "number",
      "dimWidth_" + this.depth,
      this.dim[0],
      (e) => {
        this.dim[0] = Number(e.target.value);
        if (window.autoGenerate) window.generate();
      }
    );

    let levelDimensionsHeight = createParameterInput(
      "height",
      "number",
      "dimHeight_" + this.depth,
      this.dim[1],
      (e) => {
        this.dim[1] = Number(e.target.value);
        if (window.autoGenerate) window.generate();
      }
    );

    // seed parameter
    let seedParameter = createParameterInput(
      "seed",
      "number",
      "seed_" + this.depth,
      this.seed,
      (e) => {
        this.seed = Number(e.target.value);
        if (window.autoGenerate) window.generate();
      }
    );

    // add randomizer button
    let randButtonEle = document.createElement("button");
    randButtonEle.innerText = "rand";
    randButtonEle.addEventListener("click", () => {
      this.randomize();
    });

    // append to group
    levelDimensionsParamGroup.append(
      levelDimensionsWidth,
      levelDimensionsHeight
    );

    this.controls_ele.append(
      levelLegend,
      randButtonEle,
      levelNoiseParamGroup,
      levelDimensionsParamGroup,
      seedParameter
    );

    // add level to wrapper
    let layersControl = document.querySelector("#layersControl");
    layersControl.appendChild(this.controls_ele);
  }

  randomize() {
    this.seed = Math.floor(Math.random() * 1000);

    let d = Math.floor(Math.random() * 100);
    this.dim = [d, d];
    this.noise = {
      scale: Math.random() * 2,
      steps: Math.floor(Math.random() * 30),
    };

    this.controls_ele.querySelector("#levelNoiseScale_" + this.depth).value =
      this.noise.scale;
    this.controls_ele.querySelector("#levelNoiseStep_" + this.depth).value =
      this.noise.steps;
    this.controls_ele.querySelector("#dimWidth_" + this.depth).value =
      this.dim[0];
    this.controls_ele.querySelector("#dimHeight_" + this.depth).value =
      this.dim[1];
    this.controls_ele.querySelector("#seed_" + this.depth).value = this.seed;

    if (window.autoGenerate) window.generate();
  }

  noise(scale, steps) {
    /* set seed for random generation */
    noiseSeed(this.seed);

    for (let _x = 0; _x < this.dim[0]; _x++) {
      for (let _y = 0; _y < this.dim[1]; _y++) {
        /* set the color of the glyph according to its position and scale */
        let glyph = noise(_x * scale + this.seed, _y * scale + this.seed);

        if (steps !== undefined) {
          glyph = floor(glyph * (steps + 1)) / (steps - 1);
        }
        console.log({glyph})
        this.glyphs.push(glyph);
      }
    }

    return this;
  }

  draw() {
    console.log("drawing level", this);
  }



  generate() {
    console.log('generating')
    /* start going cell by cell */
    for (let x = 0, i = 0; x < this.dim.x; x++) {
      for (let y = 0; y < this.dim.y; y++, i++) {
        // if there is an existing glyph here
        if(this.glyphs.get(`${x},${y}`)) {
          // generate whatever glyph is at this location
          this.glyphs.get(`${x},${y}`).generate();
        } else {
          // otherwise, make and push glyph
          this.glyphs.set(`${x},${y}`, new Glyph())          
        }
      }
    }
  }
}

export { Glyph, Layer };
