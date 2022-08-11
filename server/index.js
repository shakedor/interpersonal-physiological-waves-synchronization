const express = require("express");
const fileUpload = require("express-fileupload");
const path = require('path');
const cors = require('cors')
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken')
require('dotenv/config');
const app = express();

const {Worker} = require("worker_threads");

// import handle data routes
const uploadFiles = require('./handleData/uploadFiles');
const csv = require('./handleData/createCSV');
const data_chart = require("./handleData/create_data_for_chart.js");
const keysHandle = require("./handleData/extract_data_from_files");
// const handle_zip = require("./handleData/handle_zip");


const PORT = process.env.PORT || 5000;

app.use(fileUpload());

// Import routes
const bigExpRoute = require('./routes/big_experiments');
const expRoute = require('./routes/experiments');
const groupResRoute = require('./routes/group_results');
const bookmarkRoute = require('./routes/bookmarks');
const mdrqaRoute = require('./routes/mdrqa_res');
const authGoogle = require('./routes/authGoogle');
const syncRoute = require("./routes/sync.js");



const corsOptions = {
  origin:'http://localhost:8081',
  credentials:true,
  optionSuccessStatus:200
}

app.use(cors(corsOptions));

app.use(bodyParser.json());
app.use("/bigexp", authenticateToken, bigExpRoute.router);
app.use("/groupres", authenticateToken, groupResRoute.router);
app.use("/bookmarks",authenticateToken, bookmarkRoute);
app.use("/exp", expRoute.router);
app.use("/mdrqa", mdrqaRoute.router);
app.use("/getAuth", authGoogle);
app.use("/sync", syncRoute);
app.use('/uploads', uploadFiles.router);



//connect to DB
const url = 'mongodb://127.0.0.1:27017/sync'
mongoose.connect(url, { useNewUrlParser: true })
const db = mongoose.connection
db.once('open', _ => {
  console.log('Database connected:', url)
})

db.on('error', err => {
  console.error('connection error:', err)
})

// Authenticate token
function authenticateToken(req, res, next){
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (token == null) return res.sendStatus(401)
  jwt.verify(token, process.env.JWTPRAIVTEKEY, (err, userId)=>{
    if(err) return res.sendStatus(403)
    req.userId = userId
    next()
  })
}


app.post("/createCSV",async (req, response) => {
  const userID = req.body.userID
  const expID = req.body.groupId
  const algorithm = req.body.algorithm
  var parameters = req.body
  delete parameters["userID"]
  delete parameters["groupId"]
  delete parameters["algorithm"]


  var csvData;
  if(algorithm === "MdRQA"){
    csvData = await csv.createCSVMdrqa(userID, expID, parameters);
  }
  else{
    csvData = await csv.createCSV(userID, expID, parameters);
  }
  response.json({file: csvData})
})


app.post("/sendMatrix", async (req, res) => {
  const userId = req.body.userID
  const expId = req.body.expId
  var expData = await expRoute.getGroupResults(userId, expId)
  expData = keysHandle.add_keys_to_mongo_scheme(expData)  

  const matrices = []
      for(const part of Object.keys(expData["parts"])){
        for(const measure of Object.keys(expData["parts"][part]["measures_vec"])){
          const mdrqaId = expData.parts[part].measures_vec[measure].mdrqa_id
          // get the mdrqa matrix from the database
          const resmdrqa = await mdrqaRoute.getMDRQARes(mdrqaId);
          var matrix_name = expData.group_name + "_" + part + "_" + measure
          matrices.push({matrix: resmdrqa.data.matrix, size:resmdrqa.data.n, name: matrix_name})
        }
      }

  res.json({matrices : matrices})

});


/**
 * Summary. Sends the mdrqa results to the database
 * 
 * @param  String   groupResId            Description. The id of the group in the database
 * @param  Array    mdrqa_computations    Description. Each index in the array contains: {part:.., measure: .., mdrqa_calcs: .., rec_plot: .. }
 * 
 * @return Return value description. 1 for success and null for failure
 */

const updateMdrqaInMongo = async (groupResId, mdrqa_computations) =>{
  try{
    await groupResRoute.addMdrqa(groupResId,mdrqa_computations)
    return 1
  }catch (error) {
    return null
  }
} 


/**
 * Summary. Calculates mdrqa and saves the results in the database.
 *
 * Description. This function is responsible for saving the mdrqa results in MongoDB
 * by using worker thread to calculate the results in another thread.
 * All parameters are in req.body.
 *
 * @param String   userId                 Description. The id of the researcher in the database
 * @param String   expId                  Description  The id of the group in the database
 * @param Object   mdrqa_params           Description  The parameters for the mdrqa algorithm
 * @param number   mdrqa_params.threshold Description  threshold for mdrqa
 * @param number   mdrqa_params.min_seq   Description  min_seq for mdrqa
 * @param number   mdrqa_params.embedding Description  embedding for mdrqa
 * @param number   mdrqa_params.zscore    Description  zscore for mdrqa
 * @param number   mdrqa_params.delay     Description  delay for mdrqa
 *
 * 
 * @return  Return value description. res.json({finished: 1}) for success and res.status(500).send(error) for error
 */
app.post("/computemdrqa", async (req, res) => {

  const userId = req.body.userId
  const expId = req.body.groupId
  const mdrqa_params = req.body
  delete mdrqa_params["userID"]
  delete mdrqa_params["groupId"]

  try{
    var expData = await expRoute.getGroupResults(userId, expId)
    const calcs = expData.parts[0].measures_vec[0].mdrqa_calcs
    expData = keysHandle.add_keys_to_mongo_scheme(expData)

    // check if there is already mdrqa data for this group
    if(!(calcs === undefined || calcs.length === 0)){
      res.json({finished: 1})
      return
    }

    const mdrqa_computations = []
    // create a worker thread for parallel processing
    const workerData = {workerData:{expData: JSON.stringify(expData),
      threshold: mdrqa_params["threshold"],
      min_seq: mdrqa_params["min_seq"],
      embedding: mdrqa_params["embedding"],
      zscore: mdrqa_params["zscore"],
      delay: mdrqa_params["delay"],
      userId: userId, expId: expId} }
    const worker = new Worker("./algorithms/computeMDRQA.js", workerData);

    worker.on('message',async msg => {
      msg["mdrqa_id"] = await mdrqaRoute.addMDRQARes(msg["rec_plot"], msg["mdrqa_calcs"][0])
      mdrqa_computations.push(msg)
    }); 

    worker.on('exit',async () => {
      const didupdate = await updateMdrqaInMongo(expId, mdrqa_computations);
      if(didupdate == null){
        res.status(500).send(error);
        return
      }
      res.json({finished: 1})
    }); 

  } catch (error) {
    return res.status(500).send(error);
  }
});



app.post("/chart", async (req, res) => {

  const userId = req.body.userId
  const expId = req.body.expId
  const exp_part = req.body.exp_part
  const measure = req.body.measure

  try{
    var expData = await expRoute.getGroupResults(userId, expId)
    expData = keysHandle.add_keys_to_mongo_scheme(expData)  
    var chart = undefined
    chart = data_chart.extract_measure_values(expData,exp_part,measure)
    res.json({chart: chart});

  } catch (error) {
    return res.status(500).send(error);
  }
});


app.post("/groupInfo", async (req, res) => {
  const userId = req.body.userId
  const groupId = req.body.groupId
  try{
    var expData = await expRoute.getGroupResults(userId, groupId)
    const info = []
    expData.parts.map(part => {
      var part_length = part["measures_vec"][0]["persons_vectors"][0]["measure_values"].length
      var part_name = part["part_name"]
      info.push({part_name: part_name, part_length: part_length })
    })

    const personsNames = []
    var personsVector = expData["parts"][0]["measures_vec"][0]["persons_vectors"]
    personsVector.map(person =>  personsNames.push(person["person_num"]))
    res.json({info: info, personsNames:  personsNames, groupName: expData.group_name})

  } catch (error) {
    console.error(error);
    return res.status(500).send(error);
  }  

});


app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});

