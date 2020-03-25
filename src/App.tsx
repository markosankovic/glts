import React, { Component } from 'react';

import './App.css';
import WebGLTimeSeries from './WebGLTimeSeries';
import { buildRandomLine } from './util';

class App extends Component {

  glts?: WebGLTimeSeries;

  componentDidMount() {
    const canvas = document.querySelector('#glCanvas');
    if (canvas instanceof HTMLCanvasElement) {
      this.glts = new WebGLTimeSeries(canvas);
      this.glts.addLine(buildRandomLine());
    }
  }

  handleAddLine() {
    this.glts?.addLine(buildRandomLine());
  }

  handleClear() {
    this.glts?.clear();
  }

  handleDraw() {
    this.glts?.draw();
  }

  render() {
    return (
      <div className="App">
        <div className="glCanvasContainer">
          <canvas id="glCanvas" width="1366" height="768"></canvas>
        </div>
        <div className="actions">
          <button onClick={this.handleAddLine.bind(this)}>Add Line</button>
          <button onClick={this.handleClear.bind(this)}>Clear</button>
          <button onClick={this.handleDraw.bind(this)}>Draw</button>
        </div>
      </div>
    );
  }

}

export default App;
