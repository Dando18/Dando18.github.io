
let SURFACE_PLOT = 0, CONTOUR_PLOT = 1, SURFACE_POINTS = 2, CONTOUR_POINTS = 3;
let data = {
    'visualizing-gradient-descent__vanilla__plotly-div': [{}, {}, {}, {}],
    'visualizing-gradient-descent__momentum__plotly-div': [{}, {}, {}, {}],
    'visualizing-gradient-descent__adam__plotly-div': [{}, {}, {}, {}]
};

let functionMap = {
    'quadratic': {
        func: parabola,
        start: [-0.75, -0.42],
        xLim: [-1.0, 1.0],
        yLim: [-1.0, 1.0],
    },
    'waves': {
        func: waves,
        start: [0.4, 0.3],
        xLim: [-3.5, 3.5],
        yLim: [-3.5, 3.5],
    },
    'saddle': {
        func: saddle,
        start: [1.0, 0.0],
        xLim: [-1.5, 1.5],
        yLim: [-1.5, 1.5],
    },
    'terrain': {
        func: terrain,
        start: [-0.2, -2.0],
        xLim: [-2.5, 2.5],
        yLim: [-2.5, 2.5],
    },
    'hills': {
        func: hills,
        start: [-0.5, -0.5],
        xLim: [-2.0, 2.0],
        yLim: [-2.0, 2.0],
    },
    'ripple': {
        func: ripple,
        start: [0.25, 0.25],
        xLim: [-1.0, 1.0],
        yLim: [-1.0, 1.0],
    },
};

$(() => {


    $('#visualizing-gradient-descent__vanilla__plotly-div').ready(() => drawPlot('visualizing-gradient-descent__vanilla__plotly-div'));
    $('#visualizing-gradient-descent__momentum__plotly-div').ready(() => drawPlot('visualizing-gradient-descent__momentum__plotly-div'));
    $('#visualizing-gradient-descent__adam__plotly-div').ready(() => drawPlot('visualizing-gradient-descent__adam__plotly-div'));

    $('#visualizing-gradient-descent__vanilla__function-select').on('change', () => update('visualizing-gradient-descent__vanilla__plotly-div'));
    $('#visualizing-gradient-descent__momentum__function-select').on('change', () => update('visualizing-gradient-descent__momentum__plotly-div'));
    $('#visualizing-gradient-descent__adam__function-select').on('change', () => update('visualizing-gradient-descent__adam__plotly-div'));

    $('#visualizing-gradient-descent__vanilla__step-size-input').on('change', () => update('visualizing-gradient-descent__vanilla__plotly-div'));
    $('#visualizing-gradient-descent__momentum__step-size-input').on('change', () => update('visualizing-gradient-descent__momentum__plotly-div'));
    $('#visualizing-gradient-descent__adam__step-size-input').on('change', () => update('visualizing-gradient-descent__adam__plotly-div'));

    $('#visualizing-gradient-descent__vanilla__plotly-div').on('plotly_click', function(arg1, arg2) {updateStart('visualizing-gradient-descent__vanilla__plotly-div', arg2)});
    $('#visualizing-gradient-descent__momentum__plotly-div').on('plotly_click', function(arg1, arg2) {updateStart('visualizing-gradient-descent__momentum__plotly-div', arg2)});
    $('#visualizing-gradient-descent__adam__plotly-div').on('plotly_click', function(arg1, arg2) {updateStart('visualizing-gradient-descent__adam__plotly-div', arg2)});
});


function drawPlot(divId) {
    
    let layout = {
        title: getName(divId) + ' gradient descent',
        grid: {rows: 1, columns: 2, pattern: 'independent'},
        showlegend: false,
        margin: {l: 5, r: 5, t: 40, b: 40},
    };

    Plotly.newPlot(divId, data[divId], layout, {displayModeBar: false});

    drawFunc(divId, parabola, false, [-1.0, 1.0], [-1.0, 1.0]);
    drawGradientDescent(divId, [-0.75, -0.42], parabola);
}

function redraw(divId) {
    Plotly.redraw(divId);
}

function update(divId) {
    let selectedFunction = $('#visualizing-gradient-descent__' + getName(divId) + '__function-select').val();
    f = functionMap[selectedFunction];

    drawFunc(divId, f.func, false, f.xLim, f.yLim);
    drawGradientDescent(divId, f.start, f.func);
}

function updateStart(divId, data) {
    if (!data.hasOwnProperty('event')) return;

    let selectedFunction = $('#visualizing-gradient-descent__' + getName(divId) + '__function-select').val();
    f = functionMap[selectedFunction];

    let newStart = [data.points[0].x, data.points[0].y];
    drawGradientDescent(divId, newStart, f.func);
}

function getName(divId) {
    if (divId == 'visualizing-gradient-descent__vanilla__plotly-div') {
        return 'vanilla';
    } else if (divId == 'visualizing-gradient-descent__momentum__plotly-div') {
        return 'momentum';
    } else if (divId == 'visualizing-gradient-descent__adam__plotly-div') {
        return 'adam';
    }
}

function getStepSize(divId) {
    return Number($('#visualizing-gradient-descent__' + getName(divId) + '__step-size-input').val());
}

function drawFunc(divId, func, doRedraw, xLim, yLim) {
    let generatedData = generateData(xLim[0], xLim[1], yLim[0], yLim[1], 25, func);

    data[divId][SURFACE_PLOT] = {
        x: generatedData.x,
        y: generatedData.y,
        z: generatedData.z,
        xaxis: 'x1',
        yaxis: 'y1',
        type: 'surface',
        showscale: false,
    };
    data[divId][CONTOUR_PLOT] = {
        x: generatedData.x,
        y: generatedData.y,
        z: generatedData.z,
        xaxis: 'x2',
        yaxis: 'y2',
        type: 'contour',
        showscale: false,
    };
    
    if (doRedraw)
        redraw(divId);
}

function drawGradientDescent(divId, point, func) {
    let path = optimize(getName(divId), point, getStepSize(divId), 1000, func);

    /* add points to contour plot */
    let x = new Array(path.length);
    let y = new Array(path.length);
    for (let i = 0; i < path.length; i++) {
        x[i] = path[i][0];
        y[i] = path[i][1];
    }

    data[divId][CONTOUR_POINTS] = {
        x: x, y: y,
        xaxis: 'x2',
        yaxis: 'y2',
        type: 'scatter',
    };

    /* add points to surface plot */
    let z = new Array(path.length);
    for (let i = 0; i < z.length; i++) {
        z[i] = func(x[i], y[i], 'normal');
    }

    data[divId][SURFACE_POINTS] = {
        x: x, y: y, z: z,
        xaxis: 'x1',
        yaxis: 'y1',
        mode: 'markers',
        markers: {
            size: 12,
            symbol: 'circle',
            color: 'rgb(255, 0, 0)',
        },
        type: 'scatter3d',
    };

    redraw(divId);

    updateInfo(divId, 'Converged to ('+x[x.length-1].toFixed(4)+', '+y[y.length-1].toFixed(4)+') in ' + (path.length-1) + ' iterations.')
}

function optimize(type, start, stepSize, maxIter, func) {
    if (type == 'vanilla') {
        return gradientDescent(start, stepSize, maxIter, func);
    } else if (type == 'momentum') {
        return momentumDescent(start, stepSize, maxIter, func);
    } else if (type == 'adam') {
        return adamDescent(start, stepSize, maxIter, func);
    }
}

function gradientDescent(start, stepSize, maxIter, func) {
    let x = start[0];
    let y = start[1];
    let diff = 10000.0;
    let iter = 0;

    let visits = [[x, y]];

    while (diff > 1e-5 && iter < maxIter) {

        let grad = func(x, y, 'grad');
        x -= stepSize * grad.x;
        y -= stepSize * grad.y;
        visits.push([x,y]);

        diff = Math.abs(stepSize * (grad.x + grad.y));
        iter += 1;
    }
    return visits;
}

function momentumDescent(start, stepSize, maxIter, func) {
    let x = start[0];
    let y = start[1];
    let diff = 10000.0;
    let iter = 0;
    let alpha = 0.1;

    let visits = [[x, y]];
    let velocity = {x: 0, y: 0};

    while (diff > 1e-5 && iter < maxIter) {

        let grad = func(x, y, 'grad');
        velocity.x = alpha * velocity.x - stepSize * grad.x;
        velocity.y = alpha * velocity.y - stepSize * grad.y;
        x += velocity.x;
        y += velocity.y;
        visits.push([x,y]);

        diff = Math.abs(stepSize * (grad.x + grad.y));
        iter += 1;
    }
    return visits;
}

function adamDescent(start, stepSize, maxIter, func) {
    let x = start[0];
    let y = start[1];
    let diff = 10000.0;
    let iter = 0;
    let beta1 = 0.9, beta2 = 0.999;
    let beta1Power = beta1, beta2Power = beta2;
    let epsilon = 1e-8;

    let visits = [[x, y]];
    let m = {x: 0.0, y: 0.0}, mHat = {x: 0.0, y: 0.0};
    let v = {x: 0.0, y: 0.0}, vHat = {x: 0.0, y: 0.0};

    while (diff > 1e-8 && iter < maxIter) {

        let grad = func(x, y, 'grad');

        /* compute first moment */
        m.x = beta1*m.x + (1.0-beta1)*grad.x;
        m.y = beta1*m.y + (1.0-beta1)*grad.y;
        mHat.x = m.x / (1.0-beta1Power);
        mHat.y = m.y / (1.0-beta1Power);
        beta1Power *= beta1;

        /* compute second moment */
        v.x = beta2*v.x + (1.0-beta2)*grad.x*grad.x;
        v.y = beta2*v.y + (1.0-beta2)*grad.y*grad.y;
        vHat.x = v.x / (1.0 - beta2Power);
        vHat.y = v.y / (1.0 - beta2Power);
        beta2Power *= beta2;

        x -= stepSize * mHat.x / (Math.sqrt(vHat.x) + epsilon);
        y -= stepSize * mHat.y / (Math.sqrt(vHat.y) + epsilon);
        visits.push([x,y]);

        diff = Math.abs(func(x, y, 'normal') - func(visits[visits.length-2][0], visits[visits.length-2][1], 'normal'));
        iter += 1;
    }
    return visits;
}


function generateData(minX, maxX, minY, maxY, numSamples, func) {
    let data = {
        x: new Array(numSamples),
        y: new Array(numSamples),
        z: new Array(numSamples),
    };

    let stepX = (maxX - minX) / numSamples;
    let stepY = (maxY - minY) / numSamples;
    
    let curX = minX;
    let curY = minY;
    for (let i = 0; i < numSamples; i++) {
        data.x[i] = curX;
        data.y[i] = curY;
        data.z[i] = new Array(numSamples);

        curX += stepX;
        curY += stepY;
    }

    for (let i = 0; i < numSamples; i++) {
        for (let j = 0; j < numSamples; j++) {
            data.z[i][j] = func(data.x[j], data.y[i], 'normal');
        }
    }

    return data;
}


function updateInfo(divId, message) {
    $('#visualizing-gradient-descent__' + getName(divId) + '__info-div').html(message);
}





/* math functions */
function parabola(x, y, type) {
    if (type === 'grad')
        return {x: 2*x, y: 2*y};
    return x*x + y*y;
}

function waves(x, y, type) {
    if (type === 'grad')
        return {x: -Math.sin(x)*Math.sin(y), y: Math.cos(x)*Math.cos(y)};
    return Math.cos(x) * Math.sin(y);
}

function saddle(x, y, type) {
    if (type === 'grad')
        return {x: 2*x, y: -2*y};
    return x*x - y*y;
}

function terrain(x, y, type) {
    if (type === 'grad') {
        // dx -- x cos(1 - e^y + 2 x) cos(3 + x^2/2 - y^2/4) - 2 sin(1 - e^y + 2 x) sin(3 + x^2/2 - y^2/4)
        // dy -- -1/2 y cos(1 - e^y + 2 x) cos(3 + x^2/2 - y^2/4) + e^y sin(1 - e^y + 2 x) sin(3 + x^2/2 - y^2/4)
        let ey = Math.exp(y);
        let dx = x*Math.cos(1-ey+2*x) * Math.cos(3+x*x/2-y*y/4) - 2*Math.sin(1-ey+2*x) * Math.sin(3 + x*x/2 - y*y/4);
        let dy = -0.5*y*Math.cos(1-ey+2*x) * Math.cos(3+x*x/2-y*y/4) + ey*Math.sin(1-ey+2*x)*Math.sin(3+x*x/2-y*y/4);
        return {x: dx, y: dy};
    }
    return Math.sin(0.5*x*x - 0.25*y*y + 3) * Math.cos(2*x + 1 - Math.exp(y));
}

function hills(x, y, type) {
    // 7xy/e^(x^2 + y^2)
    if (type === 'grad') {
        // dx -- -7 e^(-x^2 - y^2) (-1 + 2 x^2) y
        // dy -- -7 e^(-x^2 - y^2) x (-1 + 2 y^2)
        let dx = -7 * Math.exp(-x*x - y*y) * (-1 + 2*x*x) * y;
        let dy = -7 * Math.exp(-x*x - y*y) * (-1 + 2*y*y) * x;
        return {x: dx, y: dy};
    }
    return 7*x*y / Math.exp(x*x + y*y);
}

function ripple(x, y, type) {
    if (type === 'grad') {
        return {x: 2*x*Math.cos(10*(x*x + y*y)), y: 2*y*Math.cos(10*(x*x + y*y))};
    }
    return Math.sin(10 * (x*x + y*y)) / 10;
}