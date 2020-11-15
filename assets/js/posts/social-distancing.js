$(() => {

    $('#on-graph-theory-and-social-distancing__btn-0').on('click', drawPart0Canvas);
    $('#on-graph-theory-and-social-distancing__canvas-0').ready(drawPart0Canvas);

    $('#on-graph-theory-and-social-distancing__btn-6').on('click', drawPart6Canvas);
    $('#on-graph-theory-and-social-distancing__canvas-6').ready(drawPart6Canvas);
});

function drawPart0Canvas() {
    let canvas = $('#on-graph-theory-and-social-distancing__canvas-0').get(0);
    let ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let points = getPoints(25, 5, canvas.width-5, 5, canvas.height-5);
    let graph = getGraph(points, canvas.width * 0.15);

    // draw points
    drawPoints(ctx, points, 2, '#000000', 0);

    // draw lines
    drawGraph(ctx, graph, points, 0);

    // get verts
    let degrees = graph.map(val => val.length);
    let maxDegree = Math.max(...degrees);
    let removedVerts = [];
    while (maxDegree > 0) {
        let maxDegreeVertex = argMax(degrees);

        // remove maxDegree vertex
        graph[maxDegreeVertex] = [];
        graph = graph.map(adj => adj.filter(val => val != maxDegreeVertex));
        removedVerts.push(maxDegreeVertex);

        // recalc
        degrees = graph.map(val => val.length);
        maxDegree = Math.max(...degrees);
    }

    let minimumSet = points.map((_, idx) => idx);
    minimumSet = minimumSet.filter(val => removedVerts.indexOf(val) < 0);

    // draw points
    let prom = new Promise((resolve)=>{resolve();});
    for (let idx of minimumSet) {
        let point = points[idx];
        prom = drawPoint(ctx, point[0], point[1], 2, '#ff0000', 1000, prom);
    }
}

function drawPart6Canvas() {
    let canvas = $('#on-graph-theory-and-social-distancing__canvas-6').get(0);
    let ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    //const K = 8;
    const NUM_POINTS = 75;
    let K = $('#on-graph-theory-and-social-distancing__text-seats').val();
    K = Number(K);

    let points = getPoints(NUM_POINTS, 5, canvas.width-5, 5, canvas.height-5);
    //let graph = getGraph(points, canvas.width * CONNECTIVITY);

    drawPoints(ctx, points, 2, '#000000', 0);
    //drawGraph(ctx, graph, points, 0, '#000000');

    // k-means on points
    let kmeans = new Array(K);
    let clusters = new Array(K);
    for (let i = 0; i < kmeans.length; i++) {
        kmeans[i] = new Array(2);
        for (let j = 0; j < kmeans[i].length; j++) {
            kmeans[i][j] = Math.random() * canvas.width;
        }
    }

    let converged = false;
    let count = 0;
    while (!converged) {
        // reset clusters
        for (let i = 0; i < clusters.length; i++) {
            clusters[i] = [];
        }

        // assign points to nearest clusters
        for (let i = 0; i < points.length; i++) {
            let point = points[i];
            let minDist = math.norm(math.subtract(point, kmeans[0]));
            let minClusterIdx = 0;

            for (let j = 1; j < kmeans.length; j++) {
                let dist = math.norm(math.subtract(point, kmeans[j]));
                if (dist < minDist) {
                    minDist = dist;
                    minClusterIdx = j;
                }
            }

            // add point i to its nearest cluster
            clusters[minClusterIdx].push(i);
        }

        // recalc means
        let totalDiff = 0.0;
        for (let i = 0; i < clusters.length; i++) {
            let last = kmeans[i];
            if (clusters[i].length != 0) {
                kmeans[i] = math.zeros(2).valueOf();
                for (let j = 0; j < clusters[i].length; j++) {
                    // add row clusters[i][j] of T to kmeans
                    kmeans[i] = math.add(kmeans[i], points[clusters[i][j]]).valueOf();
                }
                for (let j = 0; j < kmeans[i].length; j++) {
                    kmeans[i][j] /= clusters[i].length;
                }
            }

            totalDiff += math.norm(math.subtract(last, kmeans[i])).valueOf();
        }
        
        count += 1;
        converged = (totalDiff < 0.001) || (count >= 100);
    }

    console.log('converged in ' + count + ' iterations')

    let colors = ['#ff0000', '#00ff00', '#0000ff', '#ee00ff', '#1383f9', '#88c2cb', '#03cc88', '#631f80',
                  '#b64149', '#977b80'];
    for (let i = colors.length; i < K; i++) {
        colors.push(getRandomColor());
    }
    let prom = new Promise((resolve) => {resolve();});
    for (let i = 0; i < clusters.length; i++) {
        for (let pointIdx of clusters[i]) {
            prom = drawPoint(ctx, points[pointIdx][0], points[pointIdx][1], 2, colors[i], 200, prom);
        }
    }
}

function drawPart6CanvasOld() {
    let canvas = $('#on-graph-theory-and-social-distancing__canvas-6').get(0);
    let ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    //const K = 10;
    const SIGMA = 150.0;
    const NUM_POINTS = 50;
    const CONNECTIVITY = 2.0;

    let K = $('on-graph-theory-and-social-distancing__text-seats').val();

    let points = getPoints(NUM_POINTS, 5, canvas.width-5, 5, canvas.height-5);
    //let graph = getGraph(points, canvas.width * CONNECTIVITY);

    drawPoints(ctx, points, 2, '#000000', 0);
    //drawGraph(ctx, graph, points, 0, '#000000');


    // weight matrix
    let weightingFunc0 = (x0, x1, sigma) => {
        let norm = math.norm(math.subtract(x0,x1));
        if (norm == 0) return 1.0;
        return math.exp(-1.0 * (norm * norm) / (2*sigma*sigma));
    };
    let weightingFunc1 = (x0, x1, sigma) => {
        let norm = math.norm(math.subtract(x0, x1));
        if (norm == 0) return 1;
        return sigma / norm;
    };
    let W = new Array(points.length);
    for (let i = 0; i < W.length; i++) {
        W[i] = new Array(points.length);

        for (let j = 0; j < W[i].length; j++) {
            W[i][j] = weightingFunc0(points[i], points[j], SIGMA);
        }
    }

    // degree matrix
    let D = new Array(points.length);
    for (let i = 0; i < D.length; i++) {
        D[i] = new Array(points.length);

        for (let j = 0; j < D[i].length; j++) {
            if (i == j) {
                // sum of row i of weight matrix
                D[i][j] = W[i].reduce((a,b) => a+b, 0);
            } else {
                D[i][j] = 0.0;
            }
        }
    }

    // compute eigenvectors/values of -- I - D^(-1/2).W.D^(-1/2)
    let Dinv = D.map(row => row.slice());
    Dinv.forEach((val, idx, arr) => arr[idx][idx] = 1.0/Math.sqrt(val[idx]));
    let L = math.subtract(D, W);
    //let Lsym = math.subtract(math.identity(W.length), math.multiply(Dinv, math.multiply(W, Dinv)));
    let Lsym = math.multiply(Dinv, math.multiply(L, Dinv));
    //let Lsym = math.subtract(D, W);


    // compute eigenvalues of Lsym
    let eigs = math.eigs(Lsym);

    let V = eigs.vectors;
    let oldT = new Array(K);
    for (let i = 0; i < K; i++) {
        oldT[i] = V[V.length - K + i];  // end
        //oldT[i] = V[i];  // begin
    }
    let T = math.transpose(math.matrix(oldT)).valueOf();

    for (let i = 0; i < T.length; i++) {
        let norm = math.norm(math.row(T, i)[0]);

        for (let j = 0; j < T[i].length; j++) {
            T[i][j] /= norm;
        }
    }

    // k-means on rows of T -- T is nxk
    let kmeans = new Array(K);
    let clusters = new Array(K);
    for (let i = 0; i < kmeans.length; i++) {
        kmeans[i] = new Array(K);
        for (let j = 0; j < kmeans[i].length; j++) {
            kmeans[i][j] = Math.random();
        }
    }

    let converged = false;
    let count = 0;
    while (!converged) {
        // reset clusters
        for (let i = 0; i < clusters.length; i++) {
            clusters[i] = [];
        }

        // assign rows of T to nearest clusters
        for (let i = 0; i < T.length; i++) {
            let point = math.row(T, i)[0];
            let minDist = math.norm(math.subtract(point, math.row(kmeans, 0)[0]));
            let minClusterIdx = 0;

            for (let j = 1; j < kmeans.length; j++) {
                let dist = math.norm(math.subtract(point, math.row(kmeans, j)[0]));
                if (dist < minDist) {
                    minDist = dist;
                    minClusterIdx = j;
                }
            }

            // add point i to its nearest cluster
            clusters[minClusterIdx].push(i);
        }

        // recalc means
        let totalDiff = 0.0;
        for (let i = 0; i < clusters.length; i++) {
            let last = kmeans[i];
            kmeans[i] = math.zeros(K);
            for (let j = 0; j < clusters[i].length; j++) {
                // add row clusters[i][j] of T to kmeans
                kmeans[i] = math.add(math.row(kmeans, i)[0], math.row(T, clusters[i][j])[0]);
            }
            for (let j = 0; j < kmeans[i].length; j++) {
                kmeans[i][j] /= clusters[i].length;
            }

            totalDiff += math.norm(math.subtract(last, kmeans[i]));
        }
        
        count += 1;
        converged = (totalDiff < 0.001) || (count >= 100);
    }

    console.log('converged in ' + count + ' iterations')

    /*let colors = ['#ff0000', '#00ff00', '#0000ff', '#ee00ff', '#1383f9', '#88c2cb', '#03cc88', '#631f80',
                  '#b64149', '#977b80'];*/
    let colors = [];
    for (let i = 0; i < K; i++) {
        colors[i] = getRandomColor();
    }
    let prom = new Promise((resolve) => {resolve();});
    for (let i = 0; i < clusters.length; i++) {
        for (let pointIdx of clusters[i]) {
            prom = drawPoint(ctx, points[pointIdx][0], points[pointIdx][1], 2, colors[i], 200, prom);
        }
    }
}

async function drawGraph(ctx, graph, points, delay, color='#000000') {
    let prom = new Promise((resolve)=>{resolve();});
    for (let i = 0; i < graph.length; i++) {
        for (let adj of graph[i]) {
            // line from point[i] to point[adj]
            prom = drawLine(ctx, points[i][0], points[i][1], points[adj][0], points[adj][1], color, delay, prom);
        }
    }
    await prom;
}

async function drawLine(ctx, x0, y0, x1, y1, color, delay, lastPromise) {
    await lastPromise;
    return new Promise((resolve) => {
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.strokeStyle = color;
        ctx.stroke();

        setTimeout(resolve, delay);
    });
}

async function drawPoint(ctx, x, y, radius, color, delay, lastPromise) {
    await lastPromise;
    return new Promise((resolve) => {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2*Math.PI, true);
        ctx.fillStyle = color;
        ctx.fill();

        setTimeout(resolve, delay);
    });
}

async function drawPoints(ctx, points, radius, color, delay) {
    let prom = new Promise((resolve)=>{resolve();});
    for (let point of points) {
        prom = drawPoint(ctx, point[0], point[1], radius, color, delay, prom);
    }
    await prom;
}


function argMax(arr) {
    let idx = 0;
    let max = arr[0];

    for (let i = 1; i < arr.length; i++) {
        if (arr[i] > max) {
            max = arr[i];
            idx = i;
        }
    }
    return idx;
}

function getPoints(N, minX, maxX, minY, maxY) {
    let arr = [];

    for (let i = 0; i < N; i++) {
        const tmpX = Math.floor(Math.random() * (maxX-minX+1) + minX);
        const tmpY = Math.floor(Math.random() * (maxY-minY+1) + minY);
        arr.push([tmpX, tmpY]);
    }
    return arr;
}

function distance(x0, x1) {
    return Math.sqrt( (x0[0]-x1[0])*(x0[0]-x1[0]) + (x0[1]-x1[1])*(x0[1]-x1[1]) );
}

function getGraph(points, minDist) {
    let adj = [];

    for (let i = 0; i < points.length; i++) {
        adj[i] = [];
        for (let j = 0; j < points.length; j++) {
            if (i != j && distance(points[i], points[j]) <= minDist) {
                adj[i].push(j);
            }
        }
    }
    return adj;
}   

// from -- https://stackoverflow.com/questions/1484506/random-color-generator
function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
  