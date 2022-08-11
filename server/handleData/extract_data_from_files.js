var XLSX = require('xlsx')
const path = require('path');
const fs = require('fs');
const { dirname } = require('path');
const Spline = require('cubic-spline');


const data = {
    group_name: "sync1",
    description: "this is my exp",
    parts: {
        1:{
            part_name: "part 1",
            measures_vec:{
                EDA: {
                    measure_name: "EDA",
                    persons_vectors:[
                        {
                            person_num: "1",
                            measure_values:[2,3,4,8,7]
                        },
                        {
                            person_num: "2",
                            measure_values: [2,7,3,4,5]
                        }
                    ] 
                },
                IBI: {
                    measure_name: "IBI",
                    persons_vectors:[
                        {
                            person_num: "1",
                            measure_values:[4,23,1,4,5]
                        },
                        {
                            person_num: "2",
                            measure_values: [7,3,9,2,5]
                        }
                    ]    
                }
            }   
        },
        2:{
            part_name: "part 2",
            measures_vec:{
                EDA:{
                    measure_name: "EDA",
                    persons_vectors:[
                        {
                            person_num: "1",
                            measure_values:[1,2,3,4,5]
                        },
                        {
                            person_num: "2",
                            measure_values: [7,3,4,6,2]
                        }
                    ] 
                },
                IBI: {
                    measure_name: "IBI",
                    persons_vectors:[
                        {
                            person_num: "1",
                            measure_values:[4,23,1,4,5]
                        },
                        {
                            person_num: "2",
                            measure_values: [7,3,9,2,5]
                        }
                    ]    
                }
            }
        }
    } 
}

// const data = {
//     group_name: "sync1",
//     description: "this is my exp",
//     parts: [
//         {
//             part_name: "part 1",
//             measures_vec:[
//                 {
//                     measure_name: "EDA",
//                     persons_vectors:[
//                         {
//                             person_num: "1",
//                             measure_values:[2,3,4,8,7]
//                         },
//                         {
//                             person_num: "2",
//                             measure_values: [2,7,3,4,5]
//                         }
//                     ] 
//                 },
//                 {
//                     measure_name: "IBI",
//                     persons_vectors:[
//                         {
//                             person_num: "1",
//                             measure_values:[4,23,1,4,5]
//                         },
//                         {
//                             person_num: "2",
//                             measure_values: [7,3,9,2,5]
//                         }
//                     ]    
//                 }
//             ]   
//         },
//         {
//             part_name: "part 2",
//             measures_vec:[
//                 {
//                     measure_name: "EDA",
//                     persons_vectors:[
//                         {
//                             person_num: "1",
//                             measure_values:[1,2,3,4,5]
//                         },
//                         {
//                             person_num: "2",
//                             measure_values: [7,3,4,6,2]
//                         }
//                     ] 
//                 },
//                 {
//                     measure_name: "IBI",
//                     persons_vectors:[
//                         {
//                             person_num: "1",
//                             measure_values:[4,23,1,4,5]
//                         },
//                         {
//                             person_num: "2",
//                             measure_values: [7,3,9,2,5]
//                         }
//                     ]    
//                 }
//             ]
//         }
//     ] 
// }

// This two functions convert the data between the two types above
// (One of them has keys for parts and measures and the other one dont)

function add_keys_to_scheme(expData){

    var dict = {};
    dict["researcher"] = expData.researcher
    dict["group_name"] = expData.group_name
    dict["description"] = expData.description
    dict["parts"] = {}
    expData.parts.map(element => {
        part = {}
        part["part_name"] = element["part_name"]
        var measures_vec = element["measures_vec"]
        part["measures_vec"] = {}
        measures_vec.map(vec => { 
            var measure_name = vec["measure_name"]
            part.measures_vec[measure_name] = vec
        })
        dict.parts[part["part_name"]]  = part
    });
    return dict    
}


function remove_keys_from_scheme(expData){
    var dict = {};
    dict["researcher"] = expData.researcher
    dict["group_name"] = expData.group_name
    dict["description"] = expData.description
    dict["parts"] = []
    const parts_keys = Object.keys(expData.parts)
    parts_keys.forEach(element => {
        part = {}
        part["part_name"] = expData.parts[element]["part_name"]
        var measures_vec = expData.parts[element]["measures_vec"]
        var measures_vec_keys = Object.keys(measures_vec)
        part["measures_vec"] = []
        measures_vec_keys.forEach(k => {
            part.measures_vec.push(measures_vec[k])
        })
        dict.parts.push(part)
    });
    return dict
}

// In this class there is a function that handles each measure. the function name must be in the format: return_<measure name>
class Return_Measure_Data {

    return_IBI(filepath){
        var workbook = XLSX.readFile(filepath);
        var xlData = XLSX.utils.sheet_to_json(workbook.Sheets["IBI Series"]);
        const ys = []
        const xs = []
        var time_counter = 0
        // values from the first coloumn of the worksheet
        for(let i=0; i< xlData.length; i++){
            var key = Object.keys(xlData[i])[0]
            ys.push(xlData[i][key])
            time_counter += xlData[i][key]
            xs.push(time_counter)
        }
        // interpolation of the data
        const spline = new Spline(xs, ys);
        const Fs = 500
        // var n_samples = Math.floor(xs[xs.length-1] / Fs )
        var n_samples = Math.floor(time_counter / Fs )
        const ibi = []
        for(let i=1; i<=n_samples; i++){
            ibi.push(spline.at(Fs*i))
        }
        return ibi
    }

    return_HRV(filepath){
        return this.return_IBI(filepath)
    }

    return_EDA(filepath){
        var workbook = XLSX.readFile(filepath);
        var sheet_name_list = workbook.SheetNames;
        var xlData = XLSX.utils.sheet_to_json(workbook.Sheets["Interval Stats"]);
        const eda = []
        for(let i=0; i< xlData.length; i++){
            eda.push(xlData[i]["Mean SC"])

        }
        return eda
    }
}

/**
 * Summary. Extract and save the data of a subject.
 *
 * Description. This function gets a directory of a subject and extracts all the files of the subject.
 * It adds the subjects data to an updating dictionary.
 *
 * @param  String   filepath     Description. The path of the subject directory.
 * @param  Object   dict         Description. The dictionary with previous subjects data.
 * 
 * @return Object                Return value description. The dictionary with previous subjects and current subject data.
 */
async function open_experiment_folder(filepath, dict){
    try{
        const return_measure_data = new Return_Measure_Data()
        const dir = await fs.promises.opendir(filepath)

        var n_files = 0
        for await (const dirent of dir) {
            var extention = dirent.name.split(".").pop()
            if(extention !== "xlsx"){
                continue
            }
            n_files += 1
            idx = dirent.name.indexOf("_")
            parsed_name = dirent.name.split("_")
            exp_part = parsed_name[3]
            person = parsed_name[2]
            if(dict.parts[exp_part] == undefined){
                // add experiment part fields
                dict.parts[exp_part] = {}
                dict.parts[exp_part]["part_name"] = exp_part
                dict.parts[exp_part]["measures_vec"] = {} 
            }
            measure = parsed_name[0]
            if(dirent.name.startsWith(measure)){
                if(dict.parts[exp_part]["measures_vec"][measure] == undefined){
                    // add measure fields
                    dict.parts[exp_part]["measures_vec"][measure] = {}
                    dict.parts[exp_part]["measures_vec"][measure]["measure_name"] = measure
                    dict.parts[exp_part]["measures_vec"][measure]["persons_vectors"] = []
                }
                // if there is a function that handles this measure:
                if(return_measure_data["return_" +measure] instanceof Function){
                    // add subject fields
                    dict.parts[exp_part]["measures_vec"][measure]["persons_vectors"].push({
                        person_num: person,
                        measure_values: return_measure_data["return_" +measure](path.join(filepath,dirent.name))
                    })
                }
                else{
                    dict.parts[exp_part]["measures_vec"][measure]["persons_vectors"].push({
                        person_num: person,
                        measure_values: []
                    })
                }
            }

        }
        if(n_files === 0){
            return null
        }
        return [dict,n_files]
    }catch(err){
        return null
    }
}

/**
 * Summary. Extract and save the data of a group.
 *
 * Description. This function gets a directory of a group and extracts all the files of all the subjects.
 * It saves all the data in a dictionary.
 *
 * @param  String   filepath       Description. The path of the group directory.
 * @param  String   researcher     Description. The id of the researcher in the database.
 * 
 * @return Object                  Return value description. The dictionary with the group data.
 */
async function dir_handle(filepath, researcher){
    var dict = {};
    var dir = undefined;
    try{
        dir = await fs.promises.opendir(filepath)

    }catch(err){
        return null
    }
    var dir_name = path.parse(dir.path).base
    // add experiment fields
    dict["researcher"] = researcher
    dict["group_name"] = dir_name
    dict["description"] = ""
    dict["parts"] = {}
    const countFilesPerPerson = []
    var n_persons = 0
    // add each person
    for await (const dirent of dir) {
        return_value = await open_experiment_folder(path.join(filepath,dirent.name), dict)
        if(return_value === null){
            continue
        }
        n_persons += 1
        dict = return_value[0]

        countFilesPerPerson.push(return_value[1])
    }
    if(n_persons === 0){
        return null
    }
    const n_files = countFilesPerPerson[0]
    // check all subjects have same number of files
    for (const files of countFilesPerPerson){
        if(files != n_files){
            return null
        }
    }
    return dict
}


module.exports.add_keys_to_mongo_scheme = add_keys_to_scheme
module.exports.convert_to_mongo_scheme = remove_keys_from_scheme
module.exports.get_data = open_experiment_folder
module.exports.dir_handle = dir_handle



