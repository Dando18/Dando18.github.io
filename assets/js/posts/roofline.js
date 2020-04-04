
let roofline = { x: [], y: [], mode: 'lines', type: 'scatter' };

function updateRooflinePlotData(maxBandwidth = 32.0, maxPerformance = 100.0) {
  let attainable = (ai, b, p) => { return Math.min(p, ai * b); }
  let attainableLog = (ai, b, p) => { return Math.min(Math.log2(p), Math.log2(ai) + Math.log2(b)); }

  /* get lower X */
  const x0 = 1.0 / 8.0;
  const y0 = attainable(x0, maxBandwidth, maxPerformance);

  /* get turning point -- where band*ai = perf => ai = perf/bandwidth */
  const x1 = maxPerformance / maxBandwidth;
  const y1 = attainable(x1, maxBandwidth, maxPerformance);

  /* get end of Roofline */
  const x2 = Math.max(32, x1 + 1.0);
  const y2 = attainable(x2, maxBandwidth, maxPerformance);

  roofline.x = [x0, x1, x2];
  roofline.y = [y0, y1, y2];
}

function drawRooflinePlot() {

  updateRooflinePlotData();

  let perfSlider = document.getElementById('MaxPerformance');
  let bandSlider = document.getElementById('MaxBandwidth');
  let perfValue = document.getElementById('MaxPerformanceValue');
  let bandValue = document.getElementById('MaxBandwidthValue');
  let updateFunc = () => {
    perfValue.innerHTML = perfSlider.value;
    bandValue.innerHTML = bandSlider.value;
    updateRooflinePlotData(bandSlider.value, perfSlider.value);
    Plotly.redraw('roofline-plot');
  };
  perfSlider.oninput = updateFunc;
  bandSlider.oninput = updateFunc;

  let data = [roofline];

  let layout = {
    title: 'Example Roofline Plot',
    xaxis: {
      type: 'log',
      exponentformat: 'power',
      autorange: true,
      title: 'Arithmetic Intensity',
    },
    yaxis: {
      type: 'log',
      exponentformat: 'power',
      autorange: true,
      title: 'Performance (GFlops/s)',
    },
  };

  Plotly.newPlot('roofline-plot', data, layout);
}

window.addEventListener('DOMContentLoaded', drawRooflinePlot, false);
