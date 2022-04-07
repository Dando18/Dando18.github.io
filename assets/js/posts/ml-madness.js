

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

function drawResultsPlot(column) {
    let dataX = ['Personal', 'Random', 'Linear Regression', 'Gradient Boosting', 'SVM', 'SGD', 'Gaussian Naive Bayes', 'Perceptron', 'Neural Network', 'AdaBoost', 'kNN', 'Decision Tree', 'Random Forest', 'Gaussian Process'];
    
    // espn scores
    let r32Score   = [430, 120, 120, 410, 410, 320, 390, 260, 370, 430, 400, 440, 420, 390];
    let r16Score   = [550, 160, 160, 530, 570, 440, 510, 340, 450, 590, 520, 520, 540, 400];
    let finalScore = [630, 160, 160, 610, 650, 520, 590, 340, 450, 590, 600, 600, 780, 400];
    
    // espn percentiles
    let r16Perc   = [94.6, 0.5, 0.5, 87.4, 97.3, 44.9, 80.6, 9.4, 50.2, 98.7, 84.3, 84.3, 92.4, 25.8];
    let finalPerc = [73.3, 0.5, 0.5, 68.2, 75.9, 48.6, 64.9, 7.6, 30.3, 64.9, 66.6, 66.6, 87.2, 18];

    let columns = {score: finalScore, percentile: finalPerc};
    let titles = {score: 'Bracket Score After 3 Rounds (ESPN Scoring)', percentile: 'Percentile in Nation Bracket Pool After 3 Rounds'};
    let extants = {score: [0.0, 800.0], percentile: [0.0, 100.0]};
    let yAxes = {score: 'Score (out of 1920)', percentile: 'Percentile'};
    let dataY = columns[column];

    let data = [{
        x: dataX,
        y: dataY.map((x) => x),
        text: dataY.map((x) => x),
        textposition: 'auto',
        insidetextanchor: 'start',
        insidetextfont: {
            family: 'Gill Sans, sans-serif',
            size: 16
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
        title: titles[column],
        font: {
            family: 'Gill Sans, sans-serif'
        },
        barmode: 'bar', 
        showlegend: false,
        margin: {
            r: 18
        },
        yaxis: {
            range: extants[column],
            title: yAxes[column]
        }
    };
    let config = {
        displayModeBar: false
    };

    Plotly.newPlot('ml-madness-results-plot', data, layout, config);
}

function getSelectedButton() {
    return $('#ml-madness-col-selection').find('.ml-madness-col-selection-btn-selected');
}

$(document).ready(function() {
    $('.ml-madness-col-selection-btn').on('click', function(e) {
        let source = e.target || e.srcElement;
        getSelectedButton().removeClass('ml-madness-col-selection-btn-selected');
        $(source).addClass('ml-madness-col-selection-btn-selected');
        drawResultsPlot($(source).val());
    });

    drawPlot();
    drawResultsPlot('score');

});