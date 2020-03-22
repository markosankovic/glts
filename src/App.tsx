import React, { useEffect } from 'react';
import './App.css';
import WebGLTimeDomain from './WebGLTimeDomain';

function App() {

  useEffect(() => {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    const webglTimeDomain = new WebGLTimeDomain(canvas);
    console.log(webglTimeDomain);
  });

  return (
    <div className="App">
      <canvas id="canvas" width="1366" height="768"></canvas>
    </div>
  );
}

export default App;
