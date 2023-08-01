import { createParameterGroup, createParameterInput } from "./Interface.js";

class Level {
  constructor(
    options
  ) {
    [depth, dim, size, seed, anchor, noise, stroke, fill, padding, margin] = options;
    
    this.controls_ele = undefined;

    //-----------------------
    // depth: 0,
    // dim: [30,30], 
    // size: [width,height],
    // seed: Math.floor(Math.random() * 1000),
    // anchor: [0,0],
    // noise: {scale: 0.1, step: 8},
    // stroke: 0,
    // fill: 0,
    // padding: [0,0],
    // margin: [0,0]
    //-----------------------

    // this.depth = depth;
    
    // this.glyphs = [];
    // this.dim = dim;
    // this.seed = seed;
    // this.noise = {
    //   scale: noiseScale,
    //   steps: noiseSteps,
    // };

    // this.cells = [];

    // this._seed = random(1000);

    // this.width = 100;
    // this.height = 100;

    // this.x_dim = 4;
    // this.y_dim = 4;

    // this.x_anchor = 0;
    // this.y_anchor = 0;

    // this.x_padding = 0;
    // this.y_padding = 0;

    // this.x_margin = 5;
    // this.y_margin = 5;
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
    let levelsControl = document.querySelector("#levelsControl");
    levelsControl.appendChild(this.controls_ele);
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

  anchor(x, y) {
    this.x_anchor = x;
    this.y_anchor = y;
    return this;
  }

  padding(x, y) {
    this.x_padding = x;
    this.y_padding = y;
    return this;
  }

  dim(x, y) {
    this.x_dim = x;
    this.y_dim = y;
    return this;
  }

  size(x, y) {
    this.width = x;
    this.height = y;
    return this;
  }

  seed(s) {
    this._seed = s;
    return this;
  }

  noise(scale, steps) {
    /* set seed for random generation */
    noiseSeed(this._seed);

    for (let _x = 0; _x < this.x_dim; _x++) {
      for (let _y = 0; _y < this.y_dim; _y++) {
        /* set the color of the cell according to its position and scale */
        let cell = noise(_x * scale + this._seed, _y * scale + this._seed);

        if (steps !== undefined) {
          cell = floor(cell * (steps + 1)) / (steps - 1);
        }

        this.cells.push(cell);
      }
    }

    return this;
  }

  stroke(c) {
    this.stroke_color = c;
    return this;
  }

  fill(c) {
    this.fill_color = c;
    return this;
  }

  next(f) {
    for (let _x = 0, i = 0; _x < this.x_dim; _x++) {
      for (let _y = 0; _y < this.y_dim; _y++, i++) {
        f(this, _x, _y, i); //move to draw
      }
    }
  }

  draw() {
    /*  
      this really just draws each cell to it's position, 
      does not generate noise itself
    */
    for (let _x = 0, i = 0; _x < this.x_dim; _x++) {
      for (let _y = 0; _y < this.y_dim; _y++, i++) {
        let pos_x = (_x / this.x_dim) * this.width;
        pos_x += this.x_anchor;

        let pos_y = (_y / this.y_dim) * this.height;
        pos_y += this.y_anchor;

        this.stroke_color !== undefined
          ? stroke(this.stroke_color)
          : noStroke();
        this.fill_color !== undefined
          ? fill(this.fill_color, this.cells[i] > 0.5 ? 255 : 0)
          : noFill();

        rect(
          floor(pos_x),
          floor(pos_y),
          ceil(this.width / this.x_dim),
          ceil(this.height / this.y_dim)
        );

        // debug numbers
        // fill(128)
        // text(this.cells[i].toFixed(2),pos_x+(this.height / this.x_dim)/2,pos_y+(this.height / this.y_dim)/2);
      }
    }

    return this;
  }
}

export default Level;