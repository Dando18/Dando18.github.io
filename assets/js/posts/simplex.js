$(() => {


    $('#visualizing-simplex__plotly-div').ready(() => drawPolytope('visualizing-simplex__plotly-div', false, false, false));
    $('#visualizing-simplex__plotly-extremes-div').ready(() => drawPolytope('visualizing-simplex__plotly-extremes-div', true, false, false));
    $('#visualizing-simplex__plotly-path-div').ready(() => drawPolytope('visualizing-simplex__plotly-path-div', true, true, false));

});

async function drawPolytope(divId, showExtremes, showPath, generatePoints) {
    let extremes = null, neighbors = null;
    if (generatePoints){
        let [A, b] = getEquations(true);

        if (showPath)
            [extremes, neighbors] = getExtremes(A, b, true);
        else
            extremes = getExtremes(A, b, false);
    } else {
        if (showPath)
            [extremes, neighbors] = getDefaultShape(true);
        else
            extremes = getDefaultShape(false);
    }

    let objFunc = (p) => { return 2.0*p[0] - 3.0*p[1] + 4.0*p[2]; };

    let x = new Array(extremes.length);
    let y = new Array(extremes.length);
    let z = new Array(extremes.length);
    let intensities = new Array(extremes.length);
    let counter = 0;
    for (let extreme of extremes) {
        x[counter] = extreme[0];
        y[counter] = extreme[1];
        z[counter] = extreme[2];
        intensities[counter] = objFunc(extreme);
        counter += 1;
    }

    let data = [
        {
            type: 'mesh3d',
            alphahull: 0,
            x: x, y: y, z: z,
            intensity: intensities,
            colorscale: 'Viridis',
        },
    ];

    if (showExtremes) {
        data.push({
            type: 'scatter3d',
            x: x, y: y, z: z,
            color: 'orange',
            mode: 'markers',
            showlegend: false,
        });
    }

    if (showPath) {

        /* TODO -- calc path maximizing objective */
        /*
        let idx = Math.floor(Math.random() * extremes.length);
        idx = 4;
        let finished = false;
        let xPath = [extremes[idx][0]], yPath = [extremes[idx][1]], zPath = [extremes[idx][2]];

        while (!finished) {
            
            let max = objFunc(extremes[idx]);
            maxIdx = idx;
            for (let neighborIdx of neighbors[idx]) {
                let val = objFunc(extremes[neighborIdx]);
                if (val > max) {
                    max = val;
                    maxIdx = neighborIdx;
                }
            }

            finished = (idx == maxIdx);
            idx = maxIdx;

            xPath.push(extremes[idx][0]);
            yPath.push(extremes[idx][1]);
            zPath.push(extremes[idx][2]);
        }*/

        const pointPath = [[1.20343, 3.79754, 2.03843], [2.0351, 2.98504, 4.73998], [2.41474, 2.04249, 4.76936], 
                            [2.8687, 1.54927, 4.88781],[4.23028, 1.60065, 4.4279]];
        
        let xPath = [], yPath = [], zPath = [];
        for (let p of pointPath) {
            xPath.push(p[0]);
            yPath.push(p[1]);
            zPath.push(p[2]);
        }

        data.push({
           type: 'scatter3d',
           x: xPath, y: yPath, z: zPath,
           color: 'red', 
           line: {
               color: 'red',
               width: 3,
           },
           showlegend: false,
        });
    }

    Plotly.newPlot(divId, data, {}, {displaylogo: false});
}

function getEquations(isNormalPolytope) {

    if (isNormalPolytope) {
        return getPolytopeEquations();
    } else {
        let A = [[ 3,  2,  4],
                [-1,  2,  4],
                [-7,  8, -1],
                [ 8, -2, -3],
                [ 3,  4, -1],
                [ 2, -9,  1]];

        let b = [4, 2, -1, 3, -3, 6];

        return [A, b];
    }
}

function getPolytopeEquations() {
    /* iterate thru and generate planes for all dTheta */

    const R = 2.0;
    const CENTER = [3, 3, 3];
    let equations = [];
    let b = [];

    for (let theta = 0.0; theta < 2.0*Math.PI; theta += Math.PI/5.0) {
        for (let axis of [0, 1, 2]) {

            /* calculate point radius away along 'axis' */
            let p = [0.0, 0.0, 0.0];
            p[axis] = R;

            /* rotate p along 'axis' by theta */
            p1 = rotateVector(p, theta, (axis+1)%3);
            //p2 = rotateVector(p, theta, (axis+2)%3);
            //p3 = rotateVector(p, theta, (axis+0)%3);

            /* calculate endpoint and vector to it */
            let endPoint1 = [CENTER[0]+p1[0], CENTER[1]+p1[1], CENTER[2]+p1[2]];
            //let endPoint2 = [CENTER[0]+p2[0], CENTER[1]+p2[1], CENTER[2]+p2[2]];
            //let endPoint3 = [CENTER[0]+p3[0], CENTER[1]+p3[1], CENTER[2]+p3[2]];

            /* plane orthogonal to p and containing endPoint e is
                p_x*(x-e_x) + p_y*(y-e_y) + p_z*(z-e_z) = 0 */
            let rhs1 = p1[0]*endPoint1[0] + p1[1]*endPoint1[1] + p1[2]*endPoint1[2];
            //let rhs2 = p2[0]*endPoint2[0] + p2[1]*endPoint2[1] + p2[2]*endPoint2[2];
            //let rhs3 = p3[0]*endPoint3[0] + p3[1]*endPoint3[1] + p3[2]*endPoint3[2];
            let eq1 = [...p1];
            //let eq2 = [...p2];
            //let eq3 = [...p3];

            equations.push(eq1);
            b.push(rhs1);
        }
    }
    return [equations, b];
}

function rotateVector(vec, theta, axis) {
    const x = vec[0], y = vec[1], z = vec[2];
    const c_t = Math.cos(theta), s_t = Math.sin(theta);
    if (axis == 0 || axis == 'x') {
        return [x*c_t - y*s_t, x*s_t + y*c_t, z];
    } else if (axis == 1 || axis == 'y') {
        return [x*c_t + z*s_t, y, -x*s_t + z*c_t];
    } else if (axis == 2 || axis == 'z') {
        return [x, y*c_t - z*s_t, y*s_t + z*c_t];
    }
}


function getExtremes(A, b, getNeighbors) {
    /* continually try sets of 3 equations to find unique solutions */
    let numEqs = A.length;
    let neighborsTmp = {};
    let uniqueSolutions = new Set();

    // get all solutions
    for (let i = 0; i < numEqs-2; i++) {
        for (let j = i+1; j < numEqs-1; j++) {
            for (let k = j+1; k < numEqs; k++) {
                // solve equations A[i], A[j], A[k]
                try {
                    let ans = solveEquations([A[i], A[j], A[k]], [b[i], b[j], b[k]]);
                    ans = math.flatten(ans);

                    if (solutionIsFeasible(ans, A, b, i, j, k, true)) {
                        let strSol = JSON.stringify(ans);
                        if (!uniqueSolutions.has(strSol)) {
                            uniqueSolutions.add(strSol);
                            neighborsTmp[strSol] = [i, j, k];
                        }
                    }
                } catch(err) { }
            }
        }
    }

    // find unique values in allSolutions
    uniqueSolutions = Array.from(uniqueSolutions).map(JSON.parse);

    if (!getNeighbors) return uniqueSolutions;
    
    let neighbors = new Array(uniqueSolutions.length);
    for (let i = 0; i < uniqueSolutions.length; i++) neighbors[i] = [];
    for (let i = 0; i < uniqueSolutions.length; i++) {
        /* given this point, what points are its neighbors -- those with a shared equation */
        let pEquations = neighborsTmp[JSON.stringify(uniqueSolutions[i])];

        for (let j = i+1; j < uniqueSolutions.length; j++) {
            let qEquations = neighborsTmp[JSON.stringify(uniqueSolutions[j])];

            // pEquations and qEquations are sorted indices into A
            // and gives the equations which produced this extreme
            if ( ((pEquations[0] == qEquations[0]) && (pEquations[1] == qEquations[1]) && (pEquations[2] != qEquations[2])) ||
                 ((pEquations[0] == qEquations[0]) && (pEquations[1] != qEquations[1]) && (pEquations[2] == qEquations[2])) ||
                 ((pEquations[0] != qEquations[0]) && (pEquations[1] == qEquations[1]) && (pEquations[2] == qEquations[2])) ) {
                    
                neighbors[i].push(j);
                neighbors[j].push(i);
            }
        }
    }

    return [uniqueSolutions, neighbors];
}

function solveEquations(A, b) {
    return math.lusolve(A, b);
}

/**
 * Returns true if Ax <= b for rows not i,j,k where ans is the x solution for rows i,j,k
 * @param {*} ans 
 * @param {*} A 
 * @param {*} b 
 * @param {*} i 
 * @param {*} j 
 * @param {*} k 
 */
function solutionIsFeasible(ans, A, b, i, j, k, requirePositive=true) {
    let numVars = A[0].length;
    let numEqs = A.length;

    if (requirePositive) {
        if (ans.some((x) => x < 0)) return false;
    }

    for (let n = 0; n < numEqs; n++) {
        if (n == i || n == j || n == k) continue;

        let eq = A[n];
        let sum = 0.0;
        for (let m = 0; m < numVars; m++) {
            sum += ans[m] * eq[m];
        }

        if (sum > b[n]) {
            return false;
        }
    }
    return true;
}


function getDefaultShape(returnNeighbors) {
    // [[1.20343, 3.79754, 2.03843], [2.0351, 2.98504, 4.73998], [2.41474, 2.04249, 4.76936], [2.8687, 1.54927, 4.88781],[4.23028, 1.60065, 4.4279]]

    const verts = [[2.41474, 2.04249, 4.76936], [4.4324, 3.24371, 4.05396], [2.0351, 
        2.98504, 4.73998], [1.89759, 4.82164, 2.3679], [1.20343, 3.79754, 
        2.03843], [4.22298, 1.58075, 2.43236], [3.26676, 1.02758, 
        2.40598], [1.8868, 4.55745, 1.52004], [4.01459, 4.22728, 
        3.13346], [2.97796, 2.25138, 1.00016], [1.96548, 2.43506, 
        3.64091], [2.76976, 1.63109, 1.63511], [4.23028, 1.60065, 
        4.4279], [2.67373, 4.47193, 4.93515], [3.55062, 4.41566, 
        4.04645], [3.40241, 1.38072, 4.01031], [3.24093, 4.41968, 
        1.6158], [2.8687, 1.54927, 4.88781]];

    /*const verts = [[4.23028, 1.60065, 4.4279], [2.8687, 1.54927, 4.88781], [3.40241, 
        1.38072, 4.01031], [3.26676, 1.02758, 2.40598], [1.20343, 3.79754, 
        2.03843], [1.89759, 4.82164, 2.3679], [1.8868, 4.55745, 
        1.52004], [2.67373, 4.47193, 4.93515], [2.0351, 2.98504, 
        4.73998], [3.55062, 4.41566, 4.04645], [2.41474, 2.04249, 
        4.76936], [1.96548, 2.43506, 3.64091], [2.76976, 1.63109, 
        1.63511], [4.4324, 3.24371, 4.05396], [4.22298, 1.58075, 
        2.43236], [3.24093, 4.41968, 1.6158], [2.97796, 2.25138, 
        1.00016], [4.01459, 4.22728, 3.13346]];*/

    const neighbors = [[17, 15, 6, 13, 1, 5], [12, 15, 6, 13, 2, 0, 10], [12, 17, 6], [12, 
        17, 15, 10, 11, 5, 9], [3, 7, 13, 2, 10, 11, 9], [4, 7, 13, 14, 
        16], [4, 3, 16, 9], [12, 17, 4, 3, 2, 14, 1], [17, 4, 13, 0, 
        10], [3, 13, 1, 16, 8], [17, 2, 10], [17, 6, 4, 2, 0, 11], [6, 4, 
        10, 9], [12, 13, 14, 5, 8], [12, 6, 1, 16, 9, 8], [3, 7, 14, 5, 9, 
        8], [6, 4, 7, 11, 5, 16], [14, 1, 5, 16]];

    if (returnNeighbors) {
        return [verts, neighbors];
    } else {
        return verts;
    }
}
