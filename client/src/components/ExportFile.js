import axios from 'axios';
import FileSaver from 'file-saver';
import {ExportToCsv} from 'export-to-csv';

/**
 * Returns x raised to the n-th power.
 *
 * @param setLoaded Loading element for downloading the files
 * @param userID The ID of the user
 * @param bigExpId The ID of the experiment to which we want to export CSV
 * @param groupId The ID of the group to which we want to export CSV
 * @param expOrTrial Whether we want to export CSV to big expirement or to group
 * @param algorithm The algorithm to which we want to export the report
 */
async function ExportFile(setLoaded, userID, bigExpId, groupId, expOrTrial, algorithm) {

    // get the exp from the server
    const token = localStorage.getItem("token");

    let bigexp = null;
    try{
        const res1 = await axios.get('http://localhost:5000/bigexp/'+ userID +"/"+ bigExpId+"/getexp/", {
            headers: {
            'authorization': 'Bearer '+ token
            },
        });
        bigexp = res1.data.data;
    }
    catch(error){
        if(
            error.response &&
            error.response.status >= 400 &&
            error.response.status <= 500
        ){
          alert(error.response.data.message);
        }
    }

    // check the algorithm to which the user wants to export the CSV
    const parameters = algorithm === "MdRQA" ? bigexp.mdrqa_params : bigexp.ccf_params

    // send the request tor the data to the server
    const data = new FormData();
    // send the current 
    data.append('userID', userID);
    data.append('groupId', groupId);
    data.append('algorithm', algorithm);
    Object.keys(parameters).map(parameter =>  data.append(parameter, parameters[parameter]))

    // if the CSV if for a big experiment
    if(expOrTrial === 'bigExp'){

        const all_group_res_ids = bigexp.groups_results_array;
        const n = all_group_res_ids.length;
        var loaded = 0;
        var percentage;
        var fileData = [];
        for (let groupId of all_group_res_ids){

            // set the loading element by the percent of the downloaded files
            percentage = (loaded/n) * 100;
            setLoaded(percentage);
            
            const body = new FormData();
            body.append('userID', userID);
            body.append('groupId', groupId);
            body.append('algorithm', algorithm);
            Object.keys(parameters).map(parameter =>  body.append(parameter, parameters[parameter]))

            // calculate the MdRQA result
            if(algorithm === "MdRQA"){
                // check first if the mdrqa have already been computed and if not, compute
                try{
                    await axios.post("http://localhost:5000/computemdrqa",body)
                }
                catch(error){
                    if(
                        error.response &&
                        error.response.status >= 400 &&
                        error.response.status <= 500
                    ){
                      alert(error.response.data.message);
                    }
                }
            }

            // create the CSV file
            let res2 = null;
            try{
                res2 = await axios.post('http://localhost:5000/createCSV', body, {
                    headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'authorization': 'Bearer '+ token
                    },
                });
            }
            catch(error){
                if(
                    error.response &&
                    error.response.status >= 400 &&
                    error.response.status <= 500
                ){
                  alert(error.response.data.message);
                }
            }

            Object.keys(res2.data.file).forEach(measure=>{
                var x = fileData[measure] === undefined ? fileData[measure] = [] : null
                fileData[measure].push(res2.data.file[measure])
            })

            loaded = loaded + 1;
        }
        percentage = (loaded/n) * 100;
        setLoaded(percentage);
        const all_rows = {}
        Object.keys(fileData).map(measure =>all_rows[measure] = [].concat.apply([], fileData[measure]) )
        setLoaded('');
        return all_rows;


    }
    else { // this is a group res report


        // calculate the MdRQA result
        if(algorithm === "MdRQA"){
            // check first if the mdrqa have already been computed and if not, compute
            try{
                await axios.post("http://localhost:5000/computemdrqa",data);
            }
            catch(error){
                if(
                    error.response &&
                    error.response.status >= 400 &&
                    error.response.status <= 500
                ){
                  alert(error.response.data.message);
                }
            }
        }

        // create the CSV file
        let fileData = null;
        try{
            const res = await axios.post('http://localhost:5000/createCSV', data, {
                headers: {
                'Content-Type': 'multipart/form-data',
                'authorization': 'Bearer '+ token
                },
            });
            fileData = res.data.file;
        }
        catch(error){
            if(
                error.response &&
                error.response.status >= 400 &&
                error.response.status <= 500
            ){
              alert(error.response.data.message);
            }
        }
        return fileData;
    } 
}


/**
 * The function recieves the MdRQA matrix from the server
 *
 * @param userID The userId of the account
 * @param expId The experiment to which we want to export the matrix
 * @return The object of the matrix
 */
export async function ExportMatrix(userID, expId) {
    // send the request tor the data to the server
    const data = new FormData();
    const token = localStorage.getItem("token");
    

    data.append('userID', userID);
    data.append('expId', expId);

    let matrices = null;
    // server request
    try{
        const res = await axios.post('http://localhost:5000/sendMatrix', data, {
            headers: {
            'Content-Type': 'multipart/form-data',
            'authorization': 'Bearer '+ token
            },
        });
        matrices = res.data.matrices;
    }
    catch(error){
        if(
            error.response &&
            error.response.status >= 400 &&
            error.response.status <= 500
        ){
          alert(error.response.data.message);
        }    
    }

    // for each measure, unflatten the array into a matrix
    const finalMatrices = []
    matrices.forEach(matData => {
        var resmatrix = matData.matrix;
        var size = matData.size
        resmatrix = JSON.parse(resmatrix)      
        var matrix = []
        // turn the flat string into nxn matrix
        for(let i = 0; i < size; i++){
            matrix.push(resmatrix.slice(0,size))
            resmatrix = resmatrix.slice(size)
        }
        finalMatrices.push({matrix: matrix,name: matData.name})
    })

    return finalMatrices

}


/**
 * The function converts the binary array of the MdRQA into pixels and
 * from the pixels downloads the image
 *
 * @param matrix The matrix as array
 * @param name The name of the file
 */
export async function makeImg(matrix, name){
    // get the matrix parameters
    var width = matrix.length,
    height = matrix[0].length,
    buffer = new Uint8ClampedArray(width * height * 4);
    for(var y = 0; y < height; y++) {
        for(var x = 0; x < width; x++) {
            // position in buffer based on x and y
            var pos = (y * width + x) * 4; 
            // draw in black
            if(matrix[y][x] === 1){
                buffer[pos] = 0;
                buffer[pos + 1] = 0;
                buffer[pos + 2] = 0;
                buffer[pos + 3] = 255;
            }
            // draw in white
            else{
                buffer[pos] = 0;
                buffer[pos + 1] = 0;
                buffer[pos + 2] = 0;
                buffer[pos + 3] = 0.9; 
            }

        }
    }
    // create off-screen canvas element
    var canvas = document.createElement('canvas'),
    ctx = canvas.getContext('2d');

    canvas.width = width;
    canvas.height = height;

    // create imageData object
    var idata = ctx.createImageData(width, height);

    // set our buffer as source
    idata.data.set(buffer);

    // update canvas with new data
    ctx.putImageData(idata, 0, 0);

    // produces a PNG file
    var dataUri = canvas.toDataURL("image/png");

    // download the image
    FileSaver.saveAs(dataUri, "MdRQA_matrix_" + name + ".png");

}

/**
 * The function creates and downloads CSV file from a given data
 *
 * @param csvData The data to write in the CSV file
 * @param fileName The name of the file to download
 */
export const downloadCSV = (csvData, fileName) => {
    const options = { 
        fieldSeparator: ',',
        quoteStrings: '"',
        decimalSeparator: '.',
        showLabels: true, 
        showTitle: false,
        title: '',
        useTextFile: false,
        useBom: true,
        useKeysAsHeaders: true,
    };
    Object.keys(csvData).map((measure) => {
        const file_name = fileName + "_" + measure;
        options["filename"] = file_name;
        const csvExporter = new ExportToCsv(options);
        csvExporter.generateCsv(csvData[measure]);
    })
}


export default ExportFile;
