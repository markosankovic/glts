import { vec4 } from 'gl-matrix';

export default class WebGLLine {
  constructor(
    public readonly color: vec4,
    public readonly data: number[] = [],
  ) { }
}