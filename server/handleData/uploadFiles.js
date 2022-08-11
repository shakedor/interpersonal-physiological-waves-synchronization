const express = require('express');
const router = express.Router();
const path = require('path');
const handle_zip = require("./handle_zip");
const bigExpRoute = require('../routes/big_experiments');
const decompress = require("decompress");
const fs = require('fs');

/**
 * The function decompresses a zip file
 *
 * @param {number} x The number to raise.
 * @param {number} n The power, must be a natural number.
 * @return {number} x raised to the n-th power.
 */
router.post("/unzipsingle", async(req, res) => {
    // save the name of the zip file
    const zipFileName = req.body.namesForUnzip;
    // save the name of the zip source and destination
    let zipPath = path.join("../client/src/videos/", zipFileName);
    let destZipPath = path.join("../client/src/videos/", path.parse(zipFileName).name);
    await decompress(zipPath, destZipPath,)
    // save the names of the unzipped files
    const files = fs.readdirSync(destZipPath)
    const unzippedFiles = [];
    for (const file of files) {
        unzippedFiles.push(file)
    }
    res.json({names: unzippedFiles});
});


// Upload Endpoint from upload page - upload big experiment
router.post('/upload', async (req, res) => {
    // if no files uploaded
    if (req.files === null) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }
    try {
      // save information about the files
      const files = req.files.file;
      const fileName = files.name;
      // create the path for the files
      savePath = path.join(__dirname,'../server_uploads', files.name)
      // save the files in the path
      await files.mv(savePath)
  
      // fit the data to the mongoDB format
      const bigExpData = await handle_zip.handle_zip_bigExp(fileName, req.body.researcher)
      const saved_exp = await bigExpRoute.add_big_exp(bigExpData)
      res.json({ fileName: fileName, filePath: savePath, expId: saved_exp._id});
  
    } catch (error) {
        return res.status(500).send(error);
    }
  
});

// Upload Endpoint from upload page - upload group
router.post('/uploadGroup', async (req, res) => {
    if (req.files === null) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }
    try {
      // save information about the files
      const files = req.files.file;
      const fileName = files.name;
      // create the path for the files
      savePath = path.join(__dirname,'../server_uploads', files.name);
      // save the files in the path
      await files.mv(savePath);
  
      // fit the data to the mongoDB format
      const groupData = await handle_zip.handle_zip_group(fileName, req.body.researcher)
      bigExpRoute.addGroup2bigexp(req.body.bigExpId, req.body.researcher, groupData)
      res.json({ fileName: fileName, filePath: savePath});
      
    } catch (error) {
        return res.status(500).send(error);
    }
});

// Upload Endpoint for the video files from select page
router.post('/selectExp', async (req, res) => {
    let fileName = [];
    // in case no files were uploaded
    if (req.files === null) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }
    try {
      const files = req.files.file;
      // in case multiple file uploaded
      if(files.length >= 2){
        // save the files names
        for(let i = 0; i < files.length; i++){
          fileName.push(files[i].name);
        }
        let savePath = "";
        const allPaths = [];
        const promises = [];
        
        files.forEach(file => {
          savePath = path.join('../client/src/videos', file.name)
          allPaths.push(path.join('../client/src/videos', file.name))
          promises.push(file.mv(savePath))
        })
        await Promise.all(promises);
        res.json({ fileName: fileName, filePath: allPaths});
      }
      // in case one file uploaded
      else{
        fileName = files.name;
        savePath = path.join('../client/src/videos', files.name)
        await files.mv(savePath)
        res.json({ fileName: fileName, filePath: savePath});
      }
      
  
    } catch (error) {
        console.log(error)
        return res.status(500).send(error);
    }
  
});

module.exports.router = router;