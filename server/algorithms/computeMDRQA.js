const {workerData, parentPort} = require("worker_threads");
const MDRQA = require('./MDQRA')

// This is a worker thread so we want to use the values that its parent gave it

const threshold= workerData["threshold"]
const min_seq = workerData["min_seq"]
const embedding = workerData["embedding"]
const zscore = workerData["zscore"]
const delay = workerData["delay"]
const expData = JSON.parse(workerData.expData)


mdrqa( threshold, min_seq, embedding, zscore, delay, expData  )


/**
 * Summary. This function computes the mdrqa for the group
 *
 * Description. This function is responsible for calling the mdrqa algorithm for every part and 
 * every measure of the experiment of the group. After each call to the algorithm, it will send
 * the data it returned to the one who called this worker thread.
 *
 * @param number   threshold           Description. parameter for the mdrqa algorithm
 * @param number   minSeq              Description. parameter for the mdrqa algorithm
 * @param number   emb                 Description. parameter for the mdrqa algorithm
 * @param number   Zscore              Description. parameter for the mdrqa algorithm
 * @param number   delay               Description. parameter for the mdrqa algorithm
 * @param object   expData             Description. includes all the group data for the experiment
 *
 */
async function mdrqa(threshold, minSeq, emb, Zscore, delay ,expData ){

  try{

  for(const part of Object.keys(expData["parts"])){
    for(const measure of Object.keys(expData["parts"][part]["measures_vec"])){
      const personsVectors = expData["parts"][part]["measures_vec"][measure]["persons_vectors"]
      var input = []
      var minlen = personsVectors[0]["measure_values"].length

      personsVectors.forEach(person => {
        if(person["measure_values"].length < minlen) {
          minlen = person["measure_values"].length
        }
        input.push(person["measure_values"])
      });

      // all the vectors should be at the same size
      for(let i = 0; i < input.length; i++){
        input[i] = input[i].slice(0,minlen)
      }
    
      // transpose the matrix
      input = input[0].map((_, colIndex) => input.map(row => row[colIndex]));

      // calling the mdrqa algorithm
      const results = await MDRQA(input, emb, delay, threshold, minSeq, Zscore)
      
      let rec_plot = undefined
      let calcs = undefined
      const error = results[0];

      if(!error){
        rec_plot = results[2];
        // console.log("resulted recurrent plot: \n" + rec_plot);
        calcs = results[3];
        rec_plot_size = calcs[0]
        // console.log("rec plot size = "+ calcs[0] +", REC = "+calcs[1] +", DET = "+calcs[2]+", Ratio = "+calcs[3]+", Lmax = "+calcs[4]+", Lmean = "+calcs[5]+", LAM = "+ calcs[6]+", Vmax = "+ calcs[7]+", Vmean = "+ calcs[8]);
        // flat the multidimentional matrix
        const flatmat = [].concat.apply([], rec_plot);
        // if there is "NaN", replace it with zero
        calcs = calcs.map(a=> a || 0)

        // send the data to the parent
        parentPort.postMessage({part:part, measure: measure, mdrqa_calcs: calcs, rec_plot: JSON.stringify(flatmat) })

      }else{
        throw error
      }
      
    }
  }
  return
  
  }
  catch(error){
    console.error(error);
    return 
  }


}



module.exports = mdrqa;
