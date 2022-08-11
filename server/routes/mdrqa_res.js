const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const ResMDRQA = require('../models/ResMDRQA');

/////////////// get /////////////////////////

/***
 * @description get the MdRQA matrix data of the given mdrqaId.
 * req.body: {} 
 * req.params: {
 *  mdrqaId - the id of the mdrqa 
 * }
 */
router.get("/:mdrqaId", async(req, res)=>{
    try{
        const mdrqa_res = await ResMDRQA.findById(req.params.mdrqaId);
    if (!mdrqa_res){
        return res.status(400).send({message: "no mdrqa results found"});
    }
    return res.status(200).send({data: mdrqa_res});
    }
    catch(err){
        return res.status(500).send({message: err});
    }   
} );

/////////////// post ////////////////////////

/***
 * @description the function add the MdRQA result to the DB
 * req.body: {
 *  matrix  - the vector of the results (flatten matrix)
 *  n       - the size of the matrix (nXn)
 * } 
 * req.params: {}
 */
router.post("/", async(req, res)=>{
    const mdrqa_res = new ResMDRQA({
        _id: new mongoose.Types.ObjectId(),
        matrix: req.body.matrix,
        n: req.body.n
    });
    try {
        const savedRes = await mdrqa_res.save();
        return res.status(200).send({message: "MDRQA results added to DB", data: savedRes});
    } catch (error) {
        return res.status(500).send({message: error.message});
    }
});

/***
 * @description the function deletes the given mdrqa result from the DB.
 * @param {ObjectId} mdrqa_id - the id of the mdrqa results to be deleted.
 */
async function deleteMDRQARes(mdrqa_id){
    try {
        const mdrqa_res = await ResMDRQA.findByIdAndDelete(mdrqa_id);
        if (!mdrqa_res){
            return {message: "no such MDRQA results exist"};
        }
        return {message: "MDRQA results deleted from DB"};
    } catch (error) {
        return {message: error.message}
    }
}

/***
 * @description the function returns the given mdrqa result from the DB
 * @param {ObjectId} mdrqa_id - the id of the mdrqa results to be returned.
 */
async function getMDRQARes(mdrqa_id){
    try {
        const mdrqa_res = await ResMDRQA.findById(mdrqa_id);
        if (mdrqa_res == null){
            return {message: "not found MDRQA results with given ID"};
        }
        return {data: mdrqa_res};
    } catch (error) {
        return {message: error.message};
    }
}

/***
 * @description the function add the given results to the DB.
 * @param {Array}  matrix   - the vector of the results (flatten matrix)
 * @param {Number} n        - the size of the matrix (nXn)
 */
async function addMDRQARes(matrix, n){
    const mdrqa_res = new ResMDRQA({
        _id: new mongoose.Types.ObjectId(),
        matrix: matrix,
        n: n
    });
    try {
        const savedRes = await mdrqa_res.save();
        console.log("MDRQA results added to DB")

        return savedRes._id.toString();
    } catch (error) {
        console.log(error)
    }
}

module.exports.router = router;
module.exports.getMDRQARes = getMDRQARes;
module.exports.deleteMDRQARes = deleteMDRQARes;
module.exports.addMDRQARes = addMDRQARes;

