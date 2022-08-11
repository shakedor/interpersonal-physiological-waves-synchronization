const xlData = require("./extract_data_from_files")
const decompress = require("decompress");
const fs = require('fs');
const path = require('path');


const unZipFiles = (file_name) => {

    let zipPath = file_name
        try{  
            return decompress(zipPath, path.join(__dirname,"..","server_uploads/"))
        } catch(error){
            console.log(error);
        }

}


/**
 * Summary. Extract the experiment data into a mongoDB scheme format
 *
 * @param  String   zip_name       Description. The name of the experiment directory.
 * @param  String   researcher     Description. The id of the researcher in the database.
 * 
 * @return Object                  Return value description. The mongo scheme format object with the experiment data.
 */
async function handle_zip_bigExp(zip_name, researcher){
    const bigExpData = {}
    var filesfromzip = await unZipFiles(path.join(__dirname,"..","server_uploads",zip_name))
    var fullpath = (filesfromzip[0].path).replace('/','\\' ).split('\\')
    const bigExp_name = fullpath[0]
    bigExpData["researcher"] = researcher
    bigExpData["exp_name"] = bigExp_name
    bigExpData["description"] = ""
    
    fullpath = path.join(__dirname,'..','server_uploads', bigExp_name)
    const dir = await fs.promises.opendir(fullpath)
    const group_results = []
    for await (const dirent of dir) {
      // extract the data
      let expData = await xlData.dir_handle(path.join(fullpath,dirent.name), researcher)
      if(expData === null){
        continue
      }
      group_data = xlData.convert_to_mongo_scheme(expData)
      group_results.push(group_data)
    }
    bigExpData["groups_results"] = group_results

    return bigExpData
}


/**
 * Summary. Extract the group data into a mongoDB scheme format
 *
 * @param  String   zip_name       Description. The name of the group directory.
 * @param  String   researcher     Description. The id of the researcher in the database.
 * 
 * @return Object                  Return value description. The mongo scheme format object with the group data.
 */
async function handle_zip_group(zip_name, researcher){
    var filesfromzip = await unZipFiles(path.join(__dirname,"..","server_uploads",zip_name))
    var fullpath = (filesfromzip[0].path).replace('/','\\' ).split('\\')
    const group_name = fullpath[0]
    fullpath = path.join(__dirname,'..','server_uploads', group_name)
    // extract the data
    let group_data = await xlData.dir_handle(fullpath, researcher)
    if(group_data === null){
        return null
    }
    group_data = xlData.convert_to_mongo_scheme(group_data)

    return group_data
}

module.exports.handle_zip_bigExp = handle_zip_bigExp;
module.exports.handle_zip_group = handle_zip_group;