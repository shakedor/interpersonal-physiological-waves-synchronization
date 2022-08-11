const XLSX = require('xlsx')
const computeSync = require("../algorithms/computeSync")
const expRoute = require('../routes/experiments');
const keysHandle = require("../handleData/extract_data_from_files")

// const csvData = [
//     ["firstname", "lastname", "email"],
//     [ 0, "Tomi", "ah@smthing.co.com"],
//     ["Raed", "Labes", "rl@smthing.co.com"],
//     ["Yezzi", [1, 2, 3], "ymin@cocococo.com"]
// ];

// data = [
//     { firstname: "Ahmed", lastname: "Tomi", email: "ah@smthing.co.com" },
//     { firstname: "Raed", lastname: "Labes", email: "rl@smthing.co.com" },
//     { firstname: "Yezzi", lastname: "Min l3b", email: "ymin@cocococo.com" }
// ];



const createCSV = async (userId, expId, parameters) => {
  
    var data = await computeSync.getAllCouplesCsvLines(userId, expId, parameters.max, parameters.shift)
    var csv_data = data.csv_data
    return csv_data;
}


const createCSVMdrqa = async (userId, expId, mdrqa_params) => {

  var expData = await expRoute.getGroupResults(userId, expId)
  expData = keysHandle.add_keys_to_mongo_scheme(expData)
  // we want to create multiple files data, one for each measure
  // each measure will have all the parts
  const csv_data = {}

  Object.keys(expData["parts"]).forEach((part)=> {
    Object.keys(expData["parts"][part]["measures_vec"]).forEach((measure)=>{
      if ( csv_data[measure] === undefined ){
        csv_data[measure] = []
      } 
      var calcs = expData["parts"][part]["measures_vec"][measure]["mdrqa_calcs"]
      calcs = {group: expData.group_name, part: part ,rec_plot_size: calcs[0] ,REC: calcs[1] , DET: calcs[2] , Ratio: calcs[3] , Lmax: calcs[4] , Lmean :calcs[5],LAM :calcs[6], Vmax: calcs[7], Vmean : calcs[8]}
      csv_data[measure].push({...calcs,...mdrqa_params})
    })
  })

  return csv_data;

}

module.exports.createCSV = createCSV
module.exports.createCSVMdrqa = createCSVMdrqa

