export default class Glyph {
  constructor(options) {
    this.cells = [];
    this.seed = options.seed;
    this.size = options.size;
    this.dim = options.dim;
    this.anchor = options.anchor;
    this.padding = options.padding;
    this.stroke_color = options.stroke_color;
    this.fill_color = options.fill_color;
    this.noiseParams = options.noise;
  }

  noise() {
    /* set seed for random generation */
    noiseSeed(this.seed);

    for (let _x = 0; _x < this.dim.x; _x++) {
      for (let _y = 0; _y < this.dim.y; _y++) {
        /* set the color of the cell according to its position and scale */
        let cell = noise(
          _x * this.noiseParams.scale + this.seed,
          _y * this.noiseParams.scale + this.seed
        );

        if (this.noiseParams.steps !== undefined) {
          cell =
            Math.floor(cell * (this.noiseParams.steps + 1)) /
            (this.noiseParams.steps - 1);
        }

        this.cells.push(cell);
      }
    }
  }

  draw(img) {
    /*  
        this really just draws each cell to it's position, 
        does not generate noise itself
    */
    for (let _x = 0, i = 0; _x < this.dim.x; _x++) {
      for (let _y = 0; _y < this.dim.y; _y++, i++) {
        let pos_x = (_x / this.dim.x) * this.size.width;
        pos_x += this.anchor.x;

        let pos_y = (_y / this.dim.y) * this.size.height;
        pos_y += this.anchor.y;

        fillCellsWithin(
          Math.floor(pos_x),
          Math.floor(pos_y),
          Math.floor(this.size.width / this.dim.x),
          Math.floor(this.size.height / this.dim.y),
          img,
          color(this.cells[i] > 0.5 ? "white" : "black")
        );
      }
    }
  }
}

function fillCellsWithin(x1, y1, x2, y2, img, c) {
  for (let x = x1; x <= x1 + x2; x++) {
    for (let y = y1; y <= y1 + y2; y++) {
      img.set(x, y, c);
    }
  }
}
