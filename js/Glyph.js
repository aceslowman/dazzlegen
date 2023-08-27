export default class Glyph {
  constructor(options) {
    this.cells = [];
    this.seed = options.seed;
    this.size = options.size;
    this.dim = options.dim;
    this.anchor = options.anchor;
    this.padding = options.padding;
    this.margin = options.margin;
    this.stroke_color = options.stroke_color;
    this.fill_color = options.fill_color;
    this.noiseParams = options.noise;
  }

  // this is the big performance bottleneck
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
        // set colors with pos_x, pos_y, this.size.width / this.dim.x

        // this.stroke_color !== undefined
        //   ? pg.stroke(color(this.stroke_color), this.cells[i] > 0.5 ? 255 : 0)
        //   : pg.noStroke();
        // this.fill_color !== undefined
        //   ? pg.fill(color(this.fill_color), this.cells[i] > 0.5 ? 255 : 0)
        //   : pg.noFill();

        /* NOTE: Revisit this, color doesn't really make sense in the way it's set up here */
        // if (this.cells[i] > 0.5 ? 255 : 0) pg.fill(255);

        // pg.rect(
        //   Math.floor(pos_x),
        //   Math.floor(pos_y),
        //   Math.ceil(this.size.width / this.dim.x),
        //   Math.ceil(this.size.height / this.dim.y)
        // );

        // debug numbers
        // fill(128)
        // text(this.cells[i].toFixed(2),pos_x+(this.height / this.x_dim)/2,pos_y+(this.height / this.y_dim)/2);
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
