var nj = require('numjs');

// returns a copy of the i'th row of the matrix data (nj array)
function getRow(data, i){
    var cols = data.shape[1];   // the number ot the columns in the matrix data
    var row = data.lo(i,0).hi(1,cols).clone();  // lo - start the matrix in the i'th row and the first column,
                                                // hi - take one row and all the column, 
                                                //clone() - make a copy, so data won't be corrupted
    return row;
}


// calculate the distance between 2 points (in any dimension)
function distance(pointA, pointB){
    let sub = pointA.subtract(pointB);
    let pow = sub.multiply(sub);
    var dist = pow.sum();
    dist = nj.sqrt(nj.array([dist]));
    return dist.get(0)
}

// calculate the z score of the data matrix
function zscore(nj_data){
    let temp = nj_data.clone();
    let rows = temp.shape[0];
    let cols = temp.shape[1];
    let meu = temp.mean();
    let std = temp.std();
    let meu_matrix = nj.zeros([rows, cols]).assign(meu, false);
    let std_matrix = nj.zeros([rows, cols]).assign(std, false);
    temp.subtract(meu_matrix, false);
    temp.divide(std_matrix, false);
    return temp;
}


// compute the distance matrix of X and Y 
// (X and Y are metrices such that each row is a point (time step),
// so if X is with shape:[n, m]- there are n points in time, each with m dimensions)
function distMtrx(X,Y){
    let Yrows = Y.shape[0];
    let Xrows = X.shape[0]; 
    // initialize the matrix with nonsense values(will later be removed) with 1 row and Xrow cols.
    let dist_mtrix = nj.arange(Xrows).reshape(1,Xrows); 
    for (let i = 0; i < Yrows; i++){
        let distRowI = [];    // this is not a nj array - will be converted later
        let pointI = getRow(Y, i);  // the i'th row (time-point) of Y
        for (let j = 0; j < Xrows; j++){
            let pointJ = getRow(X, j);  // the j'th row (time-point) of X
            let ijDist = distance(pointI, pointJ);  // compute the distance between timepoint i of Y and timepoint j of X
            distRowI.push(ijDist);
        }
        distRowI = nj.array(distRowI).reshape(Xrows, 1);  // convert the array to nj array, and reshape it as a column- so the concate will work
        dist_mtrix = nj.concatenate(dist_mtrix.T, distRowI).T; // add the new row to the distance matrix (using .T to concate by column and then transpose back to normal)
    }
    dist_mtrix = dist_mtrix.slice(1,0);    // removing the first row of nonsense values (were there for initializiation)
    return dist_mtrix;
}
/**
 * 
 * @param {Array}   data      (regular) array with rows as the number of the time-steps and column as the number of participants in the group.
 * @param {Number}  [emb = 1]   number of the dimension embedded in the data. for each participant there will be #emb columns in the new data.
 * @param {Number}  [delay = 1] number of time-steps that the data will be shifted to perform time-delayed embedding (if emb > 1).
 * @param {String}  [norm = 'euc']  
 * @param {Number}  [threshold = 1] the size within points in phase-space are counted as being recurrent.
 * @param {Number}  [minSeq = 2]    the minimum sequnce of points in the reccurent plot that should be counting as a sequnce for the statistic calculations.
 * @param {Number}  [Zscore = 0]    (0 or 1) indicats whether the data should be z-scored before performing MdRQA: 0 - no z-scoring of data, 1 - z-score columns of data.
 * 
 * @return {Array} the function returns array of [error, message, RecPlot, calcs]
 *                  where error = 1 if somthing is wrong and the message describes the problem. in this case
 *                  RecPlot and calcs are empty arrays.
 *                  where error = 0 no error occuerred, the message is empty,
 *                  RecPlot is a matrix holding the resulting recurrence plot.
 *                  calcs is a vector holding the following recurrence variables:
 *                  0.  Size of the RecPlot
 *                  1.  REC   - percentage of recurrent points
 *                  2.  DET   - percentage of diagonally adjacent recurrent points
 *                  3.  Ratio - DET divided by REC
 *                  4.  Lmax  - maximum length of diagonally adjacent recurrent points
 *                  5.  Lmean - average length of adjacent recurrent points 
 *                  6.  LAM   - percentage of vertically adjacent recurrent points
 *                  7.  Vmax  - maximum length of vertically adjacent recurrent points
 *                  8.  Vmean - average length of diagonally adjacent recurrent points
 * 
 * 
 */
async function MDRQA(data, emb = 1, delay = 1,  threshold = 1, minSeq = 2, Zscore = 0){
    
    let error = 0;
    let message = '';
    let calcs = [];
    let RecPlot = [];
    let results = [error, message, RecPlot, calcs];
    // check that the data exists
    if (data.length === 0){
        error = 1;
        message = 'No input data specified.';
        results = [error, message, RecPlot, calcs];
        return results;
    }
    // check that the parameters make sence - the data is big enough for the delay and embedding given.
    if ((data.length - (delay*emb)) <= 1){
        error = 1;
        message = 'data is not big enough for the delay and embedding given';
        results = [error, message, RecPlot, calcs];
        return results;
    }
    var nj_data = nj.array(data);   // convert the given data (regular aaray) to nj array.

    if (Zscore === 1){
        nj_data = zscore(nj_data);
    }

    // if emb > 1 -perform time-delayed embedding - create new_data with the new dimensions.
    if (emb > 1){      
        const prevCols = nj_data.shape[1];    //calculate dimensionality of input time-series
        const prevRows = nj_data.shape[0];       // how many time steps were measured
        const rows = prevRows - (delay * emb);  // how many rows will be after creating the embedded dimensions data 
        // const cols = prevCols * emb;    // how many cols will be after creating the embedded dimensions data 
        const num_persons = prevCols;

        let new_data = nj.arange(rows).reshape(rows,1);     // initializing by nonsense values - will be removed later
        for (let embedded = 0; embedded < emb; embedded++){
            for (let person = 0; person < num_persons; person++){
                var vec = nj_data.lo(delay*embedded, person).hi(rows,1).clone(); // lo is the left upper corner of the start and hi is the size of the section that is taken
                new_data = nj.concatenate(new_data, vec);
            }
        }
        new_data = new_data.slice(0,1);    // removing the first column of nonsense values (were there for initializiation)
        nj_data = new_data;
    }

    // calculate distance matrix
    let a = distMtrx(nj_data, nj_data);

    // NORM-ecu - divide a by its mean.
    let sum_a = a.sum();
    let a_size = a.shape[1];
    let non_diag_cells = a_size*a_size - a_size;
    let mean_a = sum_a/non_diag_cells;  // on the diag of a all the cells are zeros, so the sum doesn't change
    let mean_a_matrix = nj.zeros([a_size, a_size]).assign(mean_a, false);
    a.divide(mean_a_matrix, false);

    // make a a binary matrix: all cells under threshold = 1 (recurrent),
    // all cells above it = 0 (are not recurrent)
    let Arows = a.shape[0];
    let Acols = a.shape[1]; 

    for (let i = 0; i < Arows; i++){
        for(let j = 0; j < Acols; j++){
            let dist = a.get(i,j);
            if(dist <= threshold){
                a.set(i,j,1);   // set the cell in the matrix to be 1 if they recurrent (<=threshold)
            }
            else{
                a.set(i,j,0);   // set the cell in the matrix to be 0 if they don't recurrent (>threshold)
            }
        }
    }

    // calc the diagonal lines sequnces in the matrix a.
    var diag_stricks = [];
    let a_copy = a.clone();
    // there are Arows-1 diagonal lines in the matrix. (Arows = a.shape[0])
    for (let i = 0; i < Arows-1; i++){
        a = a.slice(0,1);   // move to the next diagonal in the matrix (we want to skip the first one)
        let vec = nj.diag(a);   // get the vector of the diagonal
        let vec_len = vec.size;
        // calc the sequnces of reapiting ones (neighbors) that are at list of length *minSeq* in the current diagonal 
        for (let j = 0; j < vec_len; j++){
            let count = 0;
            while (j < vec_len && vec.get(j) == 1){
                count ++;
                j++;
            }
            if (count >= minSeq){ // if we found a sequnce longer than minSeq - insert the len of the seq to stricks array.
                diag_stricks.push(count);
            }
        }
    }
    diag_stricks = diag_stricks.concat(diag_stricks);   // since we only computed on half the matrix and the matrix is symetrical
    diag_stricks = nj.array(diag_stricks);    // convert stricks to nj array

    a = a_copy;     // after corrupting a return it back to normal.

    // calc the horizontal line sequnces in the matrix a.
    var horiz_stricks = [];
    a_copy = a.clone();
    // make the diagonal not counting - set it to 0.
    for (let i = 0; i < Arows; i++){
        a.set(i,i,0);
    }
    // go throght all the rows in the matix and search for horizontal sequnces.
    for (let i = 0; i < Arows; i++){
        let vec = getRow(a, i).tolist()[0];   // get the vector of the first row
        vec = nj.array(vec);
        let vec_len = vec.size;
        // calc the sequnces of reapiting ones (neighbors) that are at list of length *minSeq* in the current row 
        for (let j = 0; j < vec_len; j++){
            let count = 0;
            while (j < vec_len && vec.get(j) == 1){
                count ++;
                j++;
            }
            if (count >= minSeq){   // if we found a sequnce longer than minSeq - insert the len of the seq to stricks array.
                horiz_stricks.push(count);    
            }
        }
    }
    horiz_stricks = horiz_stricks.concat(horiz_stricks) // we only computed the horizontal and not the vertical but because the matrix is symetric, each horizontal has equivalent vertical sequnce and vice versa.
    horiz_stricks = nj.array(horiz_stricks);    // convert stricks to nj array

    a = a_copy;     // after corrupting a return it back to normal.
    RecPlot = a.tolist();    // RecPlot is the binary matrix itself
    // RecPlot = a;

    // compute statistics
    let recurrent_points = a.sum() - Arows;     // the total number of recurrent points (1) without the main diag
    let total_points = Arows ** 2 -Arows    // the total cells in the plot without the main diag
    let REC = recurrent_points/total_points;
    let rec_diag = diag_stricks.sum();   // recurrence points on diagonal lines (of length >= minSeq)
    let DET = rec_diag/recurrent_points;
    let Ratio = DET/REC;
    let Lmax = 0;
    let Lmean = 0;
    if (!(rec_diag===0)){
        Lmax = diag_stricks.max();   // the longest sequnce on diagonal lines
        Lmean = diag_stricks.mean(); // the mean sequnce on diagonal lines.
    }
    let rec_horiz = horiz_stricks.sum();    //recurrence points wich are part of horizontal line structures
    let LAM = rec_horiz/recurrent_points;
    let Vmax = 0;
    let Vmean = 0;
    if (!(rec_horiz === 0)){
        Vmax = horiz_stricks.max(); // the longest sequnce on horizontal lines
        Vmean = horiz_stricks.mean();   // the avarage length of horizontal line structuers
    }

    calcs = [Arows, REC, DET, Ratio, Lmax, Lmean, LAM, Vmax, Vmean];
    results = [error, message, RecPlot, calcs];
    return results;
}

module.exports = MDRQA;