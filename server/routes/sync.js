const express = require('express');
const router = express.Router();

const data_chart = require("../handleData/create_data_for_chart.js")
const keysHandle = require("../handleData/extract_data_from_files")
const computeSync = require("../algorithms/computeSync")
var zip = require('underscore/cjs/zip.js');

const expRoute = require('./experiments');


/**
 * Summary. Get a chart with the synchronization lines of all the couples.
 * All parameters are in req.body.
 *
 * @param  {String}   userId        Description. The id of the researcher in the database.
 * @param  {String}   expId         Description. The id of the group in the database.
 * @param  {String}   exp_part      Description. The part in the experiment to compute the sync in.
 * @param  {String}   measure       Description. The measure to compute the sync for.
 * @param  {Number}   window_size   Description. The window size to compute in ccf.
 * @param  {Number}   shift         Description. The number of shifts to compute in ccf.
 * @param  {Number}   takeMax       Description. 1 for taking the maximum shift value and 0 for taking the average.
 * @param  {Array}    couples       Description. The indexes of the couples to compute sync between. for example: ["0-1", "0-2", "1-2"]
 * 
 * @return {Array}                  Return value description. The chart of the synchronization data in the format for Recharts library 
 */
router.post("/sync", async (req, res) => {
    
    const userId = req.body.userId
    const expId = req.body.expId
    const exp_part = req.body.exp_part
    const measure = req.body.measure
    const window_size = parseInt(req.body.window_size)
    const shift = parseInt(req.body.shift)
    const takeMax = req.body.takeMax
  
    if(req.body.couples == ""){
      res.json({sync: {}})
      return null
    }
    const couples = req.body.couples.split(',').map(couple => couple.split('-'))
  
    try{
  
      var expData = await expRoute.getGroupResults(userId, expId)
      expData = keysHandle.add_keys_to_mongo_scheme(expData) 

      const lines =[]
      const lines_names = []
      // in case of triplets/more it computes each couple and average them
      couples.forEach(couple => {
        var syncArrays = []
        var names = []
        for (var i = 0; i < couple.length; i++) {
          for (var j = i + 1; j < couple.length; j++) {
            // get the values vectors of this couple
            var per1 = expData["parts"][exp_part]["measures_vec"][measure]["persons_vectors"][couple[i]]
            var per2 = expData["parts"][exp_part]["measures_vec"][measure]["persons_vectors"][couple[j]]

            if(takeMax){
              // take the maximum
              const syncArray =  computeSync.getmaxSyncArray(per1["measure_values"],per2["measure_values"], window_size,shift)
              syncArrays.push(syncArray)
            }
            else{
              // take the average
              const syncArray =  computeSync.getavgSyncArray(per1["measure_values"],per2["measure_values"], window_size,shift)
              syncArrays.push(syncArray)
            }
          }
          // save the name of the person
          var per = expData["parts"][exp_part]["measures_vec"][measure]["persons_vectors"][couple[i]]["person_num"]
          names.push(per)
        }
        // if this is the synchronization of a group that is larger than 2, average all the couples
        var sum_sync = syncArrays.length > 1 ? avgEmAll(syncArrays) : syncArrays[0]
        lines_names.push(names.join('-'))
        lines.push(sum_sync)

      });


    const x_values = data_chart.create_x_values(lines[0].length)
    var chart = data_chart.create_data(lines_names,lines,x_values)


    res.json({sync: chart})
  } catch (error) {
    console.error(error);
    return res.status(500).send(error);
  }
  });

// function for averaging arrays
const avgEmAll = arrays => zip.apply(null, arrays).map(avg)
const sum = (y, z) => Number(y) + Number(z)
const avg = x => (x.reduce(sum) / x.length).toFixed(4) 
  
  
module.exports = router;
