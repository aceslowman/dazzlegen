class Level {
  constructor(idx = 0) {
    this.idx = idx;
    this.controls_ele = undefined;
    this.glyphs = [];
    this.dim = [30, 30];
    this.seed = Math.floor(Math.random() * 1000);
    this.noise = {
      scale: 0.1,
      steps: 8,
    };
  }

  setupInterface(){
    // this creates a single level. shoudl be possible to add / remove
    this.controls_ele = document.createElement("fieldset");
    this.controls_ele.classList.add("levelGroup");

    // level legend
    let levelLegend = document.createElement("legend");
    levelLegend.innerText = "lvl " + i;

    // level noise param group
    let levelNoiseParamGroup = createParameterGroup("noise");

    // add scale param
    let levelNoiseScaleInput = createParameterInput(
      "scale",
      "number",
      this.noise.scale,
      (e) => {
        this.noise.scale = Number(e.target.value);
        if (autoGenerate) generate();
      }
    );

    let levelNoiseStepInput = createParameterInput(
      "step",
      "number",
      this.noise.steps,
      (e) => {
        this.noise.steps = Number(e.target.value);
        if (autoGenerate) generate();
      }
    );

    // append to group
    levelNoiseParamGroup.append(levelNoiseScaleInput, levelNoiseStepInput);

    let levelDimensionsParamGroup = createParameterGroup("dimensions");

    // add width / height param
    let levelDimensionsWidth = createParameterInput(
      "width",
      "number",
      this.dim[0],
      (e) => {
        this.dim[0] = Number(e.target.value);
        if (autoGenerate) generate();
      }
    );

    let levelDimensionsHeight = createParameterInput(
      "height",
      "number",
      this.dim[1],
      (e) => {
        this.dim[1] = Number(e.target.value);
        if (autoGenerate) generate();
      }
    );

    // seed parameter
    let seedParameter = createParameterInput(
      "seed",
      "number",
      this.seed,
      (e) => {
        this.seed = Number(e.target.value);
        if (autoGenerate) generate();
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
    levelsControl.appendChild(levelInterfaceContainer);
  }

  randomize() {
    this.seed = Math.floor(Math.random() * 1000);
    this.controls_ele.querySelector("input").value = this.seed;

    if (this.autoGenerate) this.generate();
  }
}

export default Level