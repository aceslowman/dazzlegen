import { createParameterGroup, createParameterInput } from "./Interface.js";
import Glyph from "./Glyph.js";

class Level {
  constructor(
    idx = 0,
    dim = [30, 30],
    seed = Math.floor(Math.random() * 1000),
    noiseScale = 0.1,
    noiseSteps = 6
  ) {
    this.idx = idx;
    this.controls_ele = undefined;
    this.glyphs = [];
    this.dim = dim;
    this.seed = seed;
    this.noise = {
      scale: noiseScale,
      steps: noiseSteps,
    };
  }

  setupInterface() {
    this.controls_ele = document.createElement("fieldset");
    this.controls_ele.classList.add("levelGroup");

    let levelLegend = document.createElement("legend");
    levelLegend.innerText = "lvl " + this.idx;

    let levelNoiseParamGroup = createParameterGroup("noise");

    let levelNoiseScaleInput = createParameterInput(
      "scale",
      "number",
      "levelNoiseScale_" + this.idx,
      this.noise.scale,
      (e) => {
        this.noise.scale = Number(e.target.value);
        if (window.autoGenerate) window.generate();
      }
    );

    let levelNoiseStepInput = createParameterInput(
      "step",
      "number",
      "levelNoiseStep_" + this.idx,
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
      "dimWidth_" + this.idx,
      this.dim[0],
      (e) => {
        this.dim[0] = Number(e.target.value);
        if (window.autoGenerate) window.generate();
      }
    );

    let levelDimensionsHeight = createParameterInput(
      "height",
      "number",
      "dimHeight_" + this.idx,
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
      "seed_" + this.idx,
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

    this.controls_ele.querySelector("#levelNoiseScale_" + this.idx).value =
      this.noise.scale;
    this.controls_ele.querySelector("#levelNoiseStep_" + this.idx).value =
      this.noise.steps;
    this.controls_ele.querySelector("#dimWidth_" + this.idx).value =
      this.dim[0];
    this.controls_ele.querySelector("#dimHeight_" + this.idx).value =
      this.dim[1];
    this.controls_ele.querySelector("#seed_" + this.idx).value = this.seed;

    if (window.autoGenerate) window.generate();
  }
}

export default Level;
