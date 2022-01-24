let titles = {
            max: 'Maximum # Guesses', 
            avg: 'Average # Guesses', 
            wins: 'Percentage Games Won', 
            dist: 'Guess Result Distribution',
            time: 'Average Time per Game'
        };

let yLabels = {
                max: 'Maximum # Guesses', 
                avg: 'Average # Guesses', 
                wins: 'Percentage Games Won',
                dist: 'Guess Result Distribution',
                time: 'Milliseconds'
            };

/* data from seed 42, 5000 iterations */
let data = [];
let layout = {};
let config = {};
let algs = ['Naive Random', 'Random', 'Greedy Probabilistic', 'Genetic', 'Minimax'];
let maxes = [2314, 10, 8, 9, 9];
let avgs = [1151, 5.01, 4.47, 3.86, 4.5];
let pcWins = [0.28, 91.74, 97.7, 98.9, 98.04];
let percCorrect = [7.804, 40.81, 46.15, 47.991, 45.374];
let percMisplaced = [18.229, 14.077, 12.855, 14.778, 13.942];
let percIncorrect = [73.966, 45.112, 40.985, 37.231, 40.684];
let timesSec = [0.006861361217498779, 0.0010380808353424073, 0.01037338433265686, 0.1653439636707306, 0.042025632333755496];
let times = timesSec.map(x => x*1000);


let ranges = {
            max: [0, 15], 
            avg: [0, 10], 
            wins: [0, 100], 
            dist: [0, 100],
            time: 'auto'
        };


function updateData(col) {
    yKey = {'max': maxes, 'avg': avgs, 'wins': pcWins, 'time': times};

    if (col == 'dist') {
        data = [{
            x: algs,
            y: percCorrect,
            name: '% Letters Correct',
            type: 'bar',
            text: percCorrect.map((x) => String(x.toFixed(1))+"%"),
            textposition: 'inside',
            insidetextanchor: 'middle',
            insidetextfont: {
                family: 'Gill Sans, sans-serif',
                size: 18
            },
            hoverinfo: 'none',
            marker: {
                color: 'rgba(17, 119, 51, 0.65)',
                line: {
                  color: 'rgb(8, 48, 107)',
                  width: 0.5
                }
            }
        },
        {
            x: algs,
            y: percMisplaced,
            name: '% Letters Misplaced',
            type: 'bar',
            text: percMisplaced.map((x) => String(x.toFixed(1))+"%"),
            textposition: 'inside',
            insidetextanchor: 'middle',
            insidetextfont: {
                family: 'Gill Sans, sans-serif',
                size: 18
            },
            hoverinfo: 'none',
            marker: {
                color: 'rgba(221, 204, 119, 0.65)',
                line: {
                  color: 'rgb(8, 48, 107)',
                  width: 0.5
                }
            }
        },
        {
            x: algs,
            y: percIncorrect,
            name: '% Letters Incorrect',
            type: 'bar',
            text: percIncorrect.map((x) => String(x.toFixed(1))+"%"),
            textposition: 'inside',
            insidetextanchor: 'middle',
            insidetextfont: {
                family: 'Gill Sans, sans-serif',
                size: 18
            },
            hoverinfo: 'none',
            marker: {
                color: 'rgba(204, 102, 119, 0.65)',
                line: {
                  color: 'rgb(8, 48, 107)',
                  width: 0.5
                }
            }
        }];
    } else {
        labels = yKey[col];
        if (col == 'wins') {
            labels = labels.map((x) => String(x.toFixed(1))+"%");
        } else if (col == 'time') {
            labels = labels.map((x) => String(x.toFixed(1)))
        }
        data = [{
            x: algs,
            y: yKey[col],
            text: labels,
            textposition: (col == 'time') ? 'auto' : 'inside',
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
    }
}

function getSelectedButton() {
    return $('#wordle-col-selection').find('.wordle-col-selection-btn-selected');
}

function drawResultsPlot(key) {
    updateData(key);

    layout = {
        title: titles[key],
        font: {
            family: 'Gill Sans, sans-serif'
        },
        barmode: (key == 'dist') ? 'stack' : 'bar', 
        showlegend: (key == 'dist'),
        margin: {
            r: 18
        },
        yaxis: {
            range: ranges[key],
            title: yLabels[key]
        }
    };
    config = {
        displayModeBar: false
    };

    Plotly.newPlot('wordle-plot', data, layout, config);
}

$(document).ready(function() {
    $('.wordle-col-selection-btn').on('click', function(e) {
        let source = e.target || e.srcElement;
        getSelectedButton().removeClass('wordle-col-selection-btn-selected');
        $(source).addClass('wordle-col-selection-btn-selected');
        drawResultsPlot($(source).val());
    });

    drawResultsPlot(getSelectedButton().val());

});

//window.addEventListener('DOMContentLoaded', drawResultsPlot, false);