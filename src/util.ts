import { vec4 } from 'gl-matrix';

import WebGLLine from './WebGLLine';

export function buildRandomLine(): WebGLLine {
  const data = [...Array(2000).keys()];
  for (let i = 0; i < 2000; i += 2) {
    data[i + 1] = Math.random() * 1600 - 800;
  }

  const color = vec4.fromValues(Math.random(), Math.random(), Math.random(), 1.0);

  return new WebGLLine(color, data);
}
