function drawRooflinePlot() {
  const maxBandwith = 32;
  const maxPerformance = 100;

  let attainable = (ai, b, p) => { return Math.min(p, ai * b); }
  let attainableLog = (ai, b, p) => { return Math.min(Math.log(p), Math.log(ai) + Math.log(b)); }

  /* get lower X */
  const x0 = 1.0 / 8.0;
  const y0 = attainable(x0, maxBandwith, maxPerformance);

  /* get turning point -- where band*ai = perf => ai = perf/bandwidth */
  const x1 = maxPerformance / maxBandwith;
  const y1 = attainableLog(x1, maxBandwith, maxPerformance);

  /* get end of Roofline */
  const x2 = Math.max(32, x1 + 1.0);
  const y2 = attainableLog(x2, maxBandwith, maxPerformance);

  let roofline = {
    x: [x0, x1, x2],
    y: [y0, y1, y2],
    type: 'lines'
  };

  let data = [roofline];

  let layout = {
    title: 'Example Roofline Plot',
    xaxis: {
      type: 'log',
      autorange: true,
      title: 'Arithmetic Intensity',
    },
    yaxis: {
      type: 'log',
      autorange: true,
      title: 'Performance (GFlops/s)',
    },
  };

  Plotly.newPlot('roofline-plot', data, layout);

}

window.addEventListener('DOMContentLoaded', drawRooflinePlot, false);
