import React, { Component } from 'react';
import './App.css';
import WebGLTimeSeries from './WebGLTimeSeries';

class App extends Component {

  webglTimeDomain?: WebGLTimeSeries;

  componentDidMount() {
    const canvas = document.querySelector('#glCanvas');
    if (canvas instanceof HTMLCanvasElement) {
      this.webglTimeDomain = new WebGLTimeSeries(canvas);
    }
  }

  render() {
    return (
      <div className="App">
        <canvas id="glCanvas" width="1366" height="768"></canvas>
      </div>
    );
  }

}

export default App;
