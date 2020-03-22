import React, { Component } from 'react';
import './App.css';
import WebGLTimeDomain from './WebGLTimeDomain';

class App extends Component {

  webglTimeDomain?: WebGLTimeDomain;

  componentDidMount() {
    const canvas = document.querySelector('#glCanvas');
    if (canvas instanceof HTMLCanvasElement) {
      this.webglTimeDomain = new WebGLTimeDomain(canvas);
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
