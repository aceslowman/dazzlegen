class Glyph {
  constructor(position, parent) {
    this.position = { x: position.x };
    // the parent is a glyph
    this.parent = parent;
    // glyphs is a collection of children
    this.glyphs = new Map();
    this.dim = { x: 0, y: 0 };
  }

  generate() {
    /* start going cell by cell */
    for (let x = 0, i = 0; x < this.dim.x; x++) {
      for (let y = 0; y < this.dim.y; y++, i++) {
        // if there is an existing glyph here
        if (this.glyphs.get(`${x},${y}`)) {
          // generate whatever glyph is at this location
          this.glyphs.get(`${x},${y}`).generate();
        } else {
          // otherwise, make and push glyph
          this.glyphs.set(`${x},${y}`, new Glyph());
        }
      }
    }
  }
}
