
/**
 * The function recieves the arrays after interpolation and calculates the CC.
 * The shifted array is the one we assume is the leading one.
 * 
 * @param {array} X first array
 * @param {array} Y second array
 * @param {number} timeShift how much shifts to cacculate
 * @param {number} shiftedArr the array that leads
 * @returns {array} CCF results in each shift
 */
function CCF(X, Y, timeShift, shiftedArr) {
    const corrArr = []
    // find the size of the array
    const n = X.length;

    // the loop runs on every shift from 0 to the given timeShift
    for(let j = 0; j < timeShift + 1; j++){
        let tempY, tempX = [];

        // slice the arrays according to the current shift
        if(shiftedArr === "X"){
            tempY = Y.slice(j, n);
            tempX = X.slice(0, n - j);
        }
        else{
            tempX = X.slice(j, n);
            tempY = Y.slice(0, n - j);
        }

        let sum_X = 0, sum_Y = 0, sum_XY = 0;
        let squareSum_X = 0, squareSum_Y = 0;
        // find the new array size after the slicing
        let newArrSize = n - j;

        for(let i = 0; i < newArrSize; i++) {
          
            // sum of elements of array X
            sum_X = sum_X + tempX[i];
         
            // sum of elements of array Y
            sum_Y = sum_Y + tempY[i];
         
            // sum of X[i] * Y[i]
            sum_XY = sum_XY + tempX[i] * tempY[i];
         
            // sum of square of array elements
            squareSum_X = squareSum_X + tempX[i] * tempX[i];
            squareSum_Y = squareSum_Y + tempY[i] * tempY[i];
        }

        // calculate the correlation in the current time shift
        let corr = (newArrSize * sum_XY - sum_X * sum_Y)/
        (Math.sqrt((newArrSize * squareSum_X - sum_X * sum_X) * (newArrSize * squareSum_Y - sum_Y * sum_Y)));

        corrArr.push(corr);
    }
    
    return corrArr;
}

module.exports = CCF