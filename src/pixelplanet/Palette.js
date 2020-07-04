
class Palette {

  constructor(colors) {
    this.length = colors.length;
    this.rgb = new Uint8Array(this.length * 3);
    this.colors = new Array(this.length);
    this.abgr = new Uint32Array(this.length);
    this.fl = new Array(this.length);

    let cnt = 0;
    for (let index = 0; index < colors.length; index++) {
      const r = colors[index][0];
      const g = colors[index][1];
      const b = colors[index][2];
      this.rgb[cnt++] = r;
      this.rgb[cnt++] = g;
      this.rgb[cnt++] = b;
      this.colors[index] = `rgb(${r}, ${g}, ${b})`;
      this.abgr[index] = (0xFF000000) | (b << 16) | (g << 8) | (r);
      this.fl[index] = [r / 256, g / 256, b / 256];
    }
  }

  /*
  * Check if a color is light (closer to white) or dark (closer to black)
  * @param color Index of color in palette
  * @return dark True if color is dark
  */
  isDark(color) {
    color *= 3;
    const r = this.rgb[color++];
    const g = this.rgb[color++];
    const b = this.rgb[color];
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return (luminance < 128);
  }

  /*
   * Get last matching color index of RGB color
   * @param r r
   * @param g g
   * @param b b
   * @return index of color
   */
  getIndexOfColor(r, g, b) {
    const { rgb } = this;
    let i = rgb.length / 3;
    while (i > 0) {
      i -= 1;
      const off = i * 3;
      if (rgb[off] === r
          && rgb[off + 1] === g
          && rgb[off + 2] === b
      ) {
        return i;
      }
    }
    return null;
  }

  /*
   * Take a buffer of indexed pixels and output it as ABGR Array
   * @param chunkBuffer Buffer of indexed pixels
   * @return ABRG Buffer
   */
  buffer2ABGR(chunkBuffer) {
    const { length } = chunkBuffer;
    const colors = new Uint32Array(length);
    let value;
    const buffer = chunkBuffer;

    let pos = 0;
    for (let i = 0; i < length; i++) {
      value = (buffer[i] & 0x3F);
      colors[pos++] = this.abgr[value];
    }
    return colors;
  }

  /*
   * Take a buffer of indexed pixels and output it as RGB Array
   * @param chunkBuffer Buffer of indexed pixels
   * @return RGB Buffer
   */
  buffer2RGB(chunkBuffer) {
    const { length } = chunkBuffer;
    const colors = new Uint8Array(length * 3);
    let color;
    let value;
    const buffer = chunkBuffer;

    let c = 0;
    for (let i = 0; i < length; i++) {
      value = buffer[i];

      color = (value & 0x3F) * 3;
      colors[c++] = this.rgb[color++];
      colors[c++] = this.rgb[color++];
      colors[c++] = this.rgb[color];
    }
    return colors;
  }

  /*
   * Create a RGB Buffer of a specific size with just one color
   * @param color Color Index of color to use
   * @param length Length of needed Buffer
   * @return RGB Buffer of wanted size with just one color
   */
  oneColorBuffer(color, length) {
    const buffer = new Uint8Array(length * 3);
    const r = this.rgb[color * 3];
    const g = this.rgb[color * 3 + 1];
    const b = this.rgb[color * 3 + 2];
    let pos = 0;
    for (let i = 0; i < length; i++) {
      buffer[pos++] = r;
      buffer[pos++] = g;
      buffer[pos++] = b;
    }

    return buffer;
  }
}

export default Palette;
