import Glyph from './js/Glyph.js';
import { stringGen } from "./js/Utilities.js";

let glyphs;

/* describes the behavior of each successive level */
let levels = [
    {
        glyphs: [],
        dim: [30, 30],
        seed: Math.random() * 1000,
        noise: {
            scale: 0.1,
            steps: 8
        }
    },
    {
        glyphs: [],
        dim: [3, 3],
        seed: Math.random() * 1000,
        noise: {
            scale: 0.1,
            steps: 6
        }
    }
];

window.workAreaElement = document.querySelector("#workArea");
window.workAreaBounds = workAreaElement.getBoundingClientRect();

window.setup = async () => {
    console.log(window.workAreaBounds)

    let cnv = createCanvas(
        window.workAreaBounds.width,
        window.workAreaBounds.height

        // 100,100 
    );

    cnv.parent("workArea");

    smooth();
    colorMode(HSB, 255);
    background(255);

    generate();

    createInterface();
}

/* as changes come in from the interface, adjust and redraw sketch */

// if (props.levels && levels) {
//   if (Object.keys(props.levels).length < levels.length) {
//     levels.pop();
//   }

//   // update local copy of all levels
//   for (let i = 0; i < Object.keys(props.levels).length; i++) {
//     let t_obj = {
//       noise: {
//         scale: props.levels[i].noiseScale,
//         steps: props.levels[i].noiseSteps
//       },
//       dim: [props.levels[i].dimX, props.levels[i].dimY],
//       seed: props.levels[i].seed
//     };

//     if (levels[i]) {
//       levels[i] = t_obj;
//     } else {
//       levels.push(t_obj);
//     }
//   }
// }

//     if (props.width !== canvas_width) {      
//       canvas_width = props.width;
//       p.setup();
//     }

//     if (props.height !== canvas_height) {
//       canvas_height = props.height;
//       p.setup();
//     }

//     if (props.generateFlag !== generateFlag) {
//       generate();
//       generateFlag = props.generateFlag;
//     }

//     if (props.snapshotFlag !== snapshotFlag) {
//       saveCanvas(canvas, "dazzlegen_" + stringGen(6));
//       snapshotFlag = props.snapshotFlag;
//     }
//   };

let createInterface = () => {
    // this creates a single level. shoudl be possible to add / remove

    let levelInterfaceContainer = document.createElement("fieldset");

    // level legend
    let levelLegend = document.createElement('legend')
    levelLegend.innerText = 'lvl 0'
    levelInterfaceContainer.appendChild(levelLegend)

    // level noise param group
    let levelNoiseParamGroup = createParameterGroup('noise');

    // add scale param
    let levelNoiseScaleInput = createParameterInput('scale')
    let levelNoiseStepInput = createParameterInput('step')

    // append to group
    levelNoiseParamGroup.appendChild(levelNoiseScaleInput);
    levelNoiseParamGroup.appendChild(levelNoiseStepInput);

    let levelDimensionsParamGroup = createParameterGroup('dimensions');

    // add width / height param
    let levelDimensionsWidth = createParameterInput('width', (e) => {
        levels[0].dim[0] = e.target.value
        console.log('hello', levels[0].dim[0])
    })
    let levelDimensionsHeight = createParameterInput('height', (e) => {
        levels[0].dim[1] = e.target.value
        console.log('hello', levels[0].dim[1])
    })

    // append to group
    levelDimensionsParamGroup.appendChild(levelDimensionsWidth);
    levelDimensionsParamGroup.appendChild(levelDimensionsHeight);





    levelInterfaceContainer.appendChild(levelNoiseParamGroup)
    levelInterfaceContainer.appendChild(levelDimensionsParamGroup)

    // add level to wrapper
    let controlsInner = document.querySelector('#controlsInner');

    controlsInner.appendChild(levelInterfaceContainer)
}

let createParameterGroup = (legendText = 'text') => {
    let groupElement = document.createElement('fieldset')

    groupElement.classList.add('levelParameter');
    let legend = document.createElement('legend')
    legend.innerText = legendText;
    groupElement.appendChild(legend)

    return groupElement
}

let createParameterInput = (paramLegendText = 'text', eListener = () => {}) => {
    let paramFieldset = document.createElement("fieldset");

    let paramLegend = document.createElement("legend");
    paramLegend.innerText = paramLegendText

    let paramInput = document.createElement("input");
    paramInput.addEventListener('input', eListener);

    paramFieldset.appendChild(paramLegend)
    paramFieldset.appendChild(paramInput)

    return paramFieldset
}

let generate = () => {
    background(255);

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

    // console.log({glyphs})
};

let next_func = (t, x, y, i, l) => {
    let w = t.width / t.x_dim;
    let h = t.height / t.y_dim;

    let glyph = new Glyph()
        .anchor(
            t.x_anchor + x * w + t.x_padding,
            t.y_anchor + y * h + t.y_padding
        )
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


