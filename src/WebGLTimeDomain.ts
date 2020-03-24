import { mat4 } from 'gl-matrix';

export const vsSource = `
attribute vec4 aVertexPosition;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

void main() {
  vec4 aScaledVertexPosition = vec4((-1.0 + 2.0 * (aVertexPosition.x / 1000.0)), (-1.0 + 2.0 * ((aVertexPosition.y + 1000.0) / 2000.0)), 0, 1);
  gl_Position = uProjectionMatrix * uModelViewMatrix * aScaledVertexPosition;
}
`;

export const fsSource = `
void main() {
  gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
}
`;

export default class WebGLTimeDomain {

  gl: WebGLRenderingContext;

  data = [
    [0, 100, 50, 200, 100, 300, 150, 400, 300, 200, 500, 500, 700, 0, 1000, 200],
    [0, -100, 50, -200, 100, -300, 150, -400, 300, -200, 500, -500, 700, 0, 1000, -200],
  ];

  constructor(
    canvas: HTMLCanvasElement | OffscreenCanvas,
  ) {
    const context = canvas.getContext('webgl2', { antialias: true });
    if (context === null) {
      throw new Error('Unable to initialize WebGL. Your browser or machine may not support it.');
    }
    this.gl = context;

    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);

    const shaderProgram = initShaderProgram(this.gl, vsSource, fsSource);

    const programInfo = {
      program: shaderProgram,
      attribLocations: {
        vertexPosition: this.gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
      },
      uniformLocations: {
        projectionMatrix: this.gl.getUniformLocation(shaderProgram, 'uProjectionMatrix')!,
        modelViewMatrix: this.gl.getUniformLocation(shaderProgram, 'uModelViewMatrix')!,
      },
      vertexCount: this.data[0].length / 2,
    };

    drawLines(this.gl, programInfo, this.data);
  }

}

//
// Initialize a shader program, so WebGL knows how to draw our data
//
export function initShaderProgram(gl: WebGLRenderingContext, vsSource: string, frSource: string) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, frSource);

  // Create the shader program

  const shaderProgram = gl.createProgram() as WebGLProgram;

  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);

  gl.linkProgram(shaderProgram);

  // If creating the shader program failed, error

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    throw new Error(`Unable to initialize the shader program: ${gl.getProgramInfoLog(shaderProgram)}`);
  }

  return shaderProgram;
}

//
// creates a shader of the given type, uploads the source and
// compiles it.
//
export function loadShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type) as WebGLShader;

  // Send the source to the shader object

  gl.shaderSource(shader, source);

  // Compile the shader program

  gl.compileShader(shader);

  // See if it compiled successfully

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    throw new Error(`An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}`);
  }

  return shader;
}

function initLineBuffer(gl: WebGLRenderingContext, data: number[]) {
  const buffer = gl.createBuffer()!;

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);

  return buffer;
}

function drawLine(gl: WebGLRenderingContext, programInfo: any, buffer: WebGLBuffer) {
  const projectionMatrix = mat4.create();
  const modelViewMatrix = mat4.create();

  // Tell WebGL how to pull out the positions from the position buffer into the vertexPosition attribute.
  {
    const numComponents = 2; // pull out 2 values per iteration
    const type = gl.FLOAT; // the data in the buffer is 32bit floats
    const normalize = false; // don't normalize
    const stride = 0; // how many bytes to get from one set of values to the next; 0 = use type and numComponents above
    const offset = 0; // how many bytes inside the buffer to start from
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(
      programInfo.attribLocations.vertexPosition,
      numComponents,
      type,
      normalize,
      stride,
      offset,
    );
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
  }

  // Tell WebGL to use our program when drawing

  gl.useProgram(programInfo.program);

  // Set the shader uniforms

  gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
  gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);

  {
    const offset = 0;
    const vertexCount = programInfo.vertexCount;
    gl.drawArrays(gl.LINE_STRIP, offset, vertexCount);
  }
}

function drawLines(gl: WebGLRenderingContext, programInfo: any, data: number[][]) {
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  data.forEach(lineData => {
    const buffer = initLineBuffer(gl, lineData);
    drawLine(gl, programInfo, buffer);
  });
}
