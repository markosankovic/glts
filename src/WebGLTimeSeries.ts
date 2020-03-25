import { mat4, vec4 } from 'gl-matrix';

import WebGLLine from './WebGLLine';

export const vsSource = `#version 300 es

in vec4 aVertexPosition;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

void main() {
  vec4 aScaledVertexPosition = vec4((-1.0 + 2.0 * (aVertexPosition.x / 1000.0)), (-1.0 + 2.0 * ((aVertexPosition.y + 1000.0) / 2000.0)), 0, 1);
  gl_Position = uProjectionMatrix * uModelViewMatrix * aScaledVertexPosition;
}
`;

export const fsSource = `#version 300 es
precision mediump float;

uniform vec4 uVertexColor;

out vec4 fragColor;

void main() {
  fragColor = uVertexColor;
}
`;

export default class WebGLTimeSeries {

  gl: WebGLRenderingContext;

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
        vertexPosition: this.gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
        vertexColor: this.gl.getUniformLocation(shaderProgram, 'uVertexColor'),
        projectionMatrix: this.gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
        modelViewMatrix: this.gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
      },
    };

    const lines = initLines();
    drawLines(this.gl, programInfo, lines);
  }

}

function initLines(): WebGLLine[] {
  const data0 = [...Array(2000).keys()];
  for (let i = 0; i < 2000; i += 2) {
    data0[i + 1] = Math.random() * 1600 - 800;
  }

  const data1 = [...Array(2000).keys()];
  for (let i = 0; i < 2000; i += 2) {
    data1[i + 1] = Math.random() * 1600 - 800;
  }

  const line0 = new WebGLLine(vec4.fromValues(0.2, 0.3, 0.4, 1.0), data0);
  const line1 = new WebGLLine(vec4.fromValues(0.7, 0.1, 0.6, 1.0), data1);

  return [line0, line1];
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
    console.error(`Unable to initialize the shader program: ${gl.getProgramInfoLog(shaderProgram)}`);
    gl.deleteProgram(shaderProgram);
    throw new Error('Unable to initialize the shader program');
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
    console.error(`An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}`);
    gl.deleteShader(shader);
    throw new Error('An error occurred compiling the shaders!');
  }

  return shader;
}

function drawLines(gl: WebGLRenderingContext, programInfo: any, lines: WebGLLine[]) {
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  lines.forEach(line => {
    drawLine(gl, programInfo, line);
  });
}

function drawLine(gl: WebGLRenderingContext, programInfo: any, line: WebGLLine) {
  const buffer = initLineBuffer(gl, line.data);

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
  gl.uniform4fv(programInfo.uniformLocations.vertexColor, line.color);

  {
    const offset = 0;
    const vertexCount = line.data.length / 2;
    gl.drawArrays(gl.LINE_STRIP, offset, vertexCount);
  }
}

function initLineBuffer(gl: WebGLRenderingContext, data: number[]) {
  const buffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);

  return buffer;
}