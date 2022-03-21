

function drawPlot() {
    let dataX = ['Random', 'Linear Regression', 'Gradient Boosting', 'SVM', 'SGD', 'Gaussian Naive Bayes', 'Perceptron', 'Neural Network', 'AdaBoost', 'kNN', 'Decision Tree', 'Random Forest', 'Gaussian Process'];
    let dataY = [0.508, 0.4, 0.703, 0.72, 0.707, 0.712, 0.655, 0.668, 0.71, 0.683, 0.647, 0.706, 0.609];

    let data = [{
        x: dataX,
        y: dataY.map((x) => x*100.0),
        text: dataY.map((x) => String((x*100.0).toFixed(1))),
        textposition: 'auto',
        insidetextanchor: 'start',
        insidetextfont: {
            family: 'Gill Sans, sans-serif',
            size: 18
        },
        outsidetextfont: {
            family: 'Gill Sans, sans-serif',
            size: 18
        },
        hoverinfo: 'none',
        marker: {
            color: 'rgba(136, 204, 238, 0.65)',
            line: {
                color: 'rgb(8, 48, 107)',
                width: 1.5
            }
        },
        type: 'bar'
    }];

    let layout = {
        title: 'Classification Accuracy',
        font: {
            family: 'Gill Sans, sans-serif'
        },
        barmode: 'bar', 
        showlegend: false,
        margin: {
            r: 18
        },
        yaxis: {
            range: [0.0, 100.0],
            title: 'Accuracy (%)'
        }
    };
    let config = {
        displayModeBar: false
    };

    Plotly.newPlot('ml-madness-plot', data, layout, config);
}

function drawResultsPlot() {
    let dataX = ['Personal', 'Random', 'Linear Regression', 'Gradient Boosting', 'SVM', 'SGD', 'Gaussian Naive Bayes', 'Perceptron', 'Neural Network', 'AdaBoost', 'kNN', 'Decision Tree', 'Random Forest', 'Gaussian Process'];
    let dataY = [430, 120, 120, 410, 410, 320, 390, 260, 370, 430, 400, 440, 420, 390];

    let data = [{
        x: dataX,
        y: dataY.map((x) => x),
        text: dataY.map((x) => x),
        textposition: 'auto',
        insidetextanchor: 'start',
        insidetextfont: {
            family: 'Gill Sans, sans-serif',
            size: 18
        },
        outsidetextfont: {
            family: 'Gill Sans, sans-serif',
            size: 18
        },
        hoverinfo: 'none',
        marker: {
            color: 'rgba(136, 204, 238, 0.65)',
            line: {
                color: 'rgb(8, 48, 107)',
                width: 1.5
            }
        },
        type: 'bar'
    }];

    let layout = {
        title: 'Bracket Score After 2 Rounds (ESPN Scoring)',
        font: {
            family: 'Gill Sans, sans-serif'
        },
        barmode: 'bar', 
        showlegend: false,
        margin: {
            r: 18
        },
        yaxis: {
            range: [0.0, 500.0],
            title: 'Score (0-1920)'
        }
    };
    let config = {
        displayModeBar: false
    };

    Plotly.newPlot('ml-madness-results-plot', data, layout, config);
}

$(document).ready(function() {

    drawPlot();
    drawResultsPlot();

});