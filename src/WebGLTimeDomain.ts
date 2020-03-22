export default class WebGLTimeDomain {

  gl: WebGL2RenderingContext;

  constructor(
    canvas: HTMLCanvasElement,
  ) {
    const context = canvas.getContext('webgl2');
    if (context === null) {
      throw new Error('Unable to initialize WebGL. Your browser or machine may not support it.');
    }
    this.gl = context;

    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
  }

}