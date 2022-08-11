
const CCF = require("./CCF")
const express = require("express");
const keysHandle = require("../handleData/extract_data_from_files")
var zip = require('underscore/cjs/zip.js');

const app = express();
const expRoute = require('../routes/experiments');

app.use("/exp", expRoute.router);


/**
 * Summary. The maximum ccf value from all the shifts in each slide of the window.
 *
 * Description. In each window slide the function computes the ccf once where per1 leads per2 and then when pre2 leads per1.
 * For each one, it takes both the max and the min ccf values.
 * The min means the most negative and the max means the most positive.
 * Then it takes the minimum betweens the 2 minimums and the maximum between the 2 maximums.
 * Finally It takes the max absolute value and it will be the maximum synchronization value.
 * If the maximum was originaly a minimum it means it was negative so it saves the negative value and not the absolout.
 * 
 * @param  {Array}   per1           Description. measured values of person 1.
 * @param  {Array}   per2           Description. measured values of person 2.
 * @param  {Number}  window_size    Description. The window size to compute in ccf.
 * @param  {Number}  shift          Description. The number of shifts to compute in ccf.
 * 
 * @return {Array}                  Return value description. The maximum ccf value from all the shifts in each slide of the window.
 */
function getmaxSyncArray(per1,per2, window_size, shift){
    shift = parseInt(shift)

    syncArray = []
    var i = 0
    while(i+window_size <= per1.length){
 
      var per1slice = per1.slice(i,i+window_size)
      var per2slice = per2.slice(i,i+window_size)
      var sync = CCF(per1slice,per2slice,shift,"X")

      // compute the minimum and maximum shift value
      var max1 = Math.max(...sync)
      var min1 = Math.min(...sync)
      sync = CCF(per1slice,per2slice,shift,"Y")

      var max2 = Math.max(...sync)
      var min2 = Math.min(...sync)
      // the most positive value
      var max = Math.max(max1, max2)
      // the most negative value
      var min = Math.min(min1,min2)
      // take the CCF with the most absolout correlatoin (either negative or positive) that indicates the strength of the correlation
      if(Math.abs(min) > Math.abs(max)){
        max = min
      }
      syncArray.push(max)

      i++
    }

    syncArray = syncArray.map(value => value.toFixed(4))

    return syncArray

}


/**
 * Summary. The average ccf value from all the shifts in each slide of the window.
 *
 * @param  {Array}   per1           Description. measured values of person 1.
 * @param  {Array}   per2           Description. measured values of person 2.
 * @param  {Number}  window_size    Description. The window size to compute in ccf.
 * @param  {Number}  shift          Description. The number of shifts to compute in ccf.
 * 
 * @return {Array}                  Return value description. The average ccf value from all the shifts in each slide of the window
 */
function getavgSyncArray(per1,per2, window_size, shift){
  shift = parseInt(shift)

  syncArray = []
  var i = 0
  while(i+window_size <= per1.length){

    var per1slice = per1.slice(i,i+window_size)
    var per2slice = per2.slice(i,i+window_size)
    var sync = CCF(per1slice,per2slice,shift,per1slice)
    // compute the average shift value
    var average1 = avg(sync)
    sync = CCF(per1slice,per2slice,shift,per2slice)
    var average2 = avg(sync)

    let max = average2
    if(Math.abs(average1) > Math.abs(average1)){
      max = average1
    }

    syncArray.push(max)

    i++
  }

  return syncArray

}



/**
 * Summary. Computes the synchronization value for each minute in the experiment.
 *
 * @param  {Array}    allExpData      Description. Array of vectors. Each subject from the subgroup has a vector of measured values from the whole experiment and in a certain measure.
 * @param  {Number}   takeMax         Description. 1 for taking the maximum shift value and 0 for taking the average.
 * @param  {Number}   shift           Description. The number of shifts to compute in ccf.
 * @param  {Number}   totalMinutes    Description. The number of minutes in the experiments.
 * 
 * @return {Object}                   Return value description. A dictionary that maps between the minute in the exp and the sync value of the minute.
 */
function getSyncForMinutes(allExpData, takeMax, shift, totalMinutes){

  // slice the data to minutes
  // take in account that the last minute might be less that 120 timesteps
  // send each minute to computeSync (getMax / Avg)

  var lastMinuteShorterFlag = false
  if(allExpData[0].length % 120 > 0){
    lastMinuteShorterFlag = true
  }

  var n_persons = allExpData.length
  var allMinutesSync = {}

  for(var m=0; m< totalMinutes; m++){
    // take the m minute 

    var minuteData = allExpData.map(person => person.slice(m*120, (m+1)*120))

    // if this is not the last minute set the window size to 120
    // if the last minute is not a full minute, set the window size of the last minute to be its duration. 
    var window_size = lastMinuteShorterFlag ? (m === totalMinutes-1 ? allExpData[0].length % 120 : 120) : 120

    // compute one minute of synchronization
    var syncArrays = []
    for (var i = 0; i < n_persons; i++) {
      for (var j = i + 1; j < n_persons; j++) {
        
        var per1 = minuteData[i]
        var per2 = minuteData[j]

        if(takeMax){
          const syncArray =  getmaxSyncArray(per1,per2, window_size,shift)
          syncArrays.push(syncArray)
        }
        else{
          const syncArray =  getavgSyncArray(per1,per2, window_size,shift)
          syncArrays.push(syncArray)
        }
      }
    }
    var sum_sync = syncArrays.length > 1 ? avgEmAll(syncArrays) : syncArrays[0]
    // sumSync[0] because the array only has one value
    allMinutesSync[`Minute ${m+1}`] = sum_sync[0]

  }
  return allMinutesSync
}


/**
 * Summary. Computes the synchronization value for each part of the experiment.
 *
 * @param  {Array}    allExpData   Description. An array of parts. Each part in the format: {partName: part, partData: personsVectors}. each part has all persons vecs on a specific measure.
 * @param  {Number}   takeMax      Description. 1 for taking the maximum shift value and 0 for taking the average.
 * @param  {Number}   shift        Description. The number of shifts to compute in ccf.
 * 
 * @return {Object}                  Return value description. A dictionary that maps between part name and the sync value of the part.
 */
function getSyncForPart(allExpValues,takeMax, shift){

  var partsSync = {}
  allExpValues.forEach((part)=>{
    var syncArrays = []
    var n_persons = part.partData.length

    for (var i = 0; i < n_persons; i++) {
      for (var j = i + 1; j < n_persons; j++) {
        var per1 = part.partData[i]
        var per2 = part.partData[j]

        if(takeMax){
          const syncArray =  getmaxSyncArray(per1,per2, per1.length,shift)
          syncArrays.push(syncArray)
        }
        else{
          const syncArray =  getavgSyncArray(per1,per2, per1.length,shift)
          syncArrays.push(syncArray)
        }
      }
    }
    var sum_sync = syncArrays.length > 1 ? avgEmAll(syncArrays) : syncArrays[0]
    // sumSync[0] because the array only has one value
    partsSync[part.partName] = sum_sync[0] //[{"BL": BLSyncValue} , {"FS": FSSyncValue}]

  });

  return partsSync

}

/**
 * Summary. Computes the synchronization value for the whole experiment.
 *
 * @param  {Array}    allExpData   Description. Array of vectors. Each subject from the subgroup has a vector of measured values from the whole experiment and in a certain measure.
 * @param  {Number}   takeMax      Description. 1 for taking the maximum shift value and 0 for taking the average.
 * @param  {Number}   shift        Description. The number of shifts to compute in ccf.
 * 
 * @return {Number}                  Return value description. The synchronization value of the whole experiment.
 */
function getSyncForTotal(allExpData,takeMax, shift){
  var syncArrays = []
  var n_persons =allExpData.length

  for (var i = 0; i < n_persons; i++) {
    for (var j = i + 1; j < n_persons; j++) { 
      var per1 = allExpData[i]
      var per2 = allExpData[j]

      if(takeMax){
        const syncArray =  getmaxSyncArray(per1,per2, per1.length,shift)
        syncArrays.push(syncArray)
      }
      else{
        const syncArray =  getavgSyncArray(per1,per2, per1.length,shift)
        syncArrays.push(syncArray)
      }
    }
  }
  var sum_sync = syncArrays.length > 1 ? avgEmAll(syncArrays) : syncArrays[0]
  // sumSync[0] because the array only has one value
  return sum_sync[0]
}


/**
 * Summary. Get the csv line for a given subgroup
 *
 * Description. The function gets the indexes of the persons in a couple (["0","1"]) and returns the couples data for the csv.
 *
 * @param  {Array}    coupleIdxs  Description. The indexes of the persons in a couple (["0","1"])
 * @param  {Object}   expData     Description. The group data
 * @param  {Number}   takeMax     Description. 1 for taking the maximum shift value and 0 for taking the average.
 * @param  {Number}   shift       Description. The number of shifts to compute in ccf.
 * @param  {Number}   persons     Description. Array from 0 to n-1 ; n = num of subjects
 * 
 * @return {Object}                 Return value description. The ccf results for the csv file and the duration of the experiment in minutes.
 * 
 * the return value is in the format: {csv_data: csv_data , totalMinutes: totalMinutes }
 * csv_data = {group: 1001, subject 1: 101, subject2: 102,..., minute 1: syncValue, minute 2:syncValue,..., EDA: partSync,...,totalSync}
 * total minutes = The number of minutes in the experiment
 */
async function getCoupleCsvLine(coupleIdxs,expData, takeMax, shift, persons){
  try{
    const csv_data = {}
    const allExpValues = {}
    var names = []
    var totalMinutes = {};
    Object.keys(expData["parts"]).forEach((part)=>{

      Object.keys(expData["parts"][part]["measures_vec"]).forEach((measure)=>{

        var personsVectors = expData["parts"][part]["measures_vec"][measure]["persons_vectors"]
        // map between person idx to his name
        names = names.length ===0 ? coupleIdxs.map((idx)=> personsVectors[idx]["person_num"]) : names
        // take the minimum length of persons values.

        var pervecLen = Math.min(...coupleIdxs.map((idx) => personsVectors[idx]["measure_values"].length))
        // we want to take all the data for this part except for the last minute if it's less than 30 seconds=(60 timesteps)
        // take only the relevant persons - the persons that are in the couple
        // the sliceing also makes sure that all the persons will have the same length (the minimum)
        personsVectors = coupleIdxs.map( (idx)=> personsVectors[idx]["measure_values"].slice(0,pervecLen - (pervecLen%120 > 60 ? 0 : pervecLen%120)) )
        // count the minutes for each part 
        if(totalMinutes[measure] === undefined){
          totalMinutes[measure] = Math.floor(pervecLen/120) + (pervecLen%120 > 60 ? 1 : 0)
        }
        else{
          totalMinutes[measure] += Math.floor(pervecLen/120) + (pervecLen%120 > 60 ? 1 : 0)
        }

        if(allExpValues[measure] === undefined){
          allExpValues[measure] = []
        }
        
        allExpValues[measure].push({partName: part, partData: personsVectors})
      });
    });

    // round up the float number
    Object.keys(totalMinutes).map(measure => totalMinutes[measure] = Math.ceil(totalMinutes[measure]))
    
    // allExpValues = {"EDA": [{partName: "BL", partData: [[per1values],[per2values]]} ,{...},...], "IBI": [...]}
    Object.keys(allExpValues).forEach((measure)=>{

      // compute the synchronization of each part
      var allpartsData = allExpValues[measure].map(part => part.partData)
      var partsSync =  getSyncForPart(allExpValues[measure],takeMax, shift)
      
      // transpose from [[1,2,3],[1,2,3]] to [[1,1],[2,2],[3,3]]
      // after the transpose, each row will be the data of the same person in the different parts
      var transposeMat = allpartsData[0].map((_, colIndex) => allpartsData.map(row => row[colIndex]));
      // concat the vectors of parts of each person to one long vector. now it will be: [1,2,3]
      allpartsData = transposeMat.map(personValues => [].concat.apply([], personValues));

      var minutesSync = getSyncForMinutes(allpartsData,takeMax, shift, totalMinutes[measure])
      
      var totalSync = {Total: getSyncForTotal(allpartsData,takeMax, shift,totalMinutes[measure])}
      var subjects = {}
      persons.map((person,idx) =>(subjects[`Subject ${parseInt(idx)+1}`] = (names[idx]===undefined ? '':names[idx] ))) // [{subject 1: 101}, {subject 2: 102}]
      // coupleIdxs.map((person,idx) =>(subjects[`subject ${parseInt(idx)+1}`] = names[idx])) // [{subject 1: 101}, {subject 2: 102}]
      var group = {Group: expData["group_name"]}
      var maxfield = {"Max or Avg": takeMax? "max" : "avg"}
      var shiftfield = {"Shift": shift}
      var combine = {...group,...subjects, ...minutesSync, ...partsSync,...totalSync,...maxfield,...shiftfield}

      // csv_data = {"EDA": csv_line}, {"IBI": csv_line}
      csv_data[measure] = combine

    
    });
    // from the total minutes of each measure take the maximun amount
    totalMinutes = Math.max(...Object.keys(totalMinutes).map((measure) => totalMinutes[measure]))
    return {csv_data: csv_data , totalMinutes: totalMinutes }


  }
  catch(error){
    console.log(error)
    return null
  }
}

/**
 * Summary. Create csv format object with the ccf results for the group.
 *
 * Description. The data includes the synchronization levels between each
 * subgroup of subjects for each minute in the experiment, each part and for the total experiment.
 * It includes one object like this for each measure. 
 *
 * @param  {String}   userId       Description. The id of the researcher in the database.
 * @param  {String}   expId        Description. The id of the group in the database.
 * @param  {Number}   takeMax      Description. 1 for taking the maximum shift value and 0 for taking the average.
 * @param  {Number}   shift        Description. The number of shifts to compute in ccf.
 * 
 * @return {Object}                Return value description. The ccf results for the csv file and the duration of the experiment in minutes.
 */
async function getAllCouplesCsvLines(userId, expId, takeMax, shift){
  try{
    const csv_lines = {}
    var maxMinutes = 0
    var expData = await expRoute.getGroupResults(userId, expId)

    
    n_persons = expData["parts"][0]["measures_vec"][0]["persons_vectors"].length
    persons = [...Array(n_persons).keys()] // = [0,1,2,...,n]
    // find all subsets in length >= 2
    allsubsetes = getAllSubsets(persons) // [["1","2"], ["1","3"],...]
    expData = keysHandle.add_keys_to_mongo_scheme(expData)

    for(let couple of allsubsetes) {
      var csv_line = await getCoupleCsvLine(couple, expData, takeMax, shift, persons)
      // csv_lines = {"EDA": [{csv line}, {csv line}] , "IBI": [{},{}]}
      if(csv_line === null){
        continue;
      }
      Object.keys(csv_line.csv_data).map(measure => (csv_lines[measure] === undefined) ?  csv_lines[measure] = [csv_line.csv_data[measure]] : csv_lines[measure].push(csv_line.csv_data[measure]))
      maxMinutes = csv_line.totalMinutes > maxMinutes ? csv_line.totalMinutes : maxMinutes
    };
    return {csv_data: csv_lines, maxMinutes: maxMinutes}
  }
  catch(error){
    return null
  }
}

// function for averaging arrays
const avgEmAll = arrays => zip.apply(null, arrays).map(avg)
const sum = (y, z) => Number(y) + Number(z)
const avg = x => (x.reduce(sum) / x.length).toFixed(4)

// get all subsets in length 2 and above
function getAllSubsets(array) {
  const subsets = [[]];
  
  for (const el of array) {
      const last = subsets.length-1;
      for (let i = 0; i <= last; i++) {
          subsets.push( [...subsets[i], el] );
      }
  }
  
  return subsets.filter(subset => subset.length > 1);
}

module.exports.getmaxSyncArray = getmaxSyncArray
module.exports.getavgSyncArray = getavgSyncArray
module.exports.getAllCouplesCsvLines = getAllCouplesCsvLines

