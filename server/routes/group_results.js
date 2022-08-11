const express = require('express');
const router = express.Router();
const ResMDRQA = require('../models/ResMDRQA');
const GroupResults = require('../models/GroupResults');

///////////////////// patch ////////////////////////

/***
 * @description add to the specific group_results the id of MDRQA results.
 * req.body: {
 *  data            -  for example [{part: "part1", measure:"EDA", mdrqa_id:ObjectId("vk34"), calcs:[2,5,3,1]}, {}, ...]
 * } 
 * req.params: {
 *  groupResId      - the id of the group results that the MdRQA need to be added to.
 * }
 */
router.patch("/:groupResId/addmdrqa", async(req, res)=>{
    // req.body.data = [{part: "part1", measure:"EDA", mdrqa_id:ObjectId("vk34"), calcs:[2,5,3,1]}, {}, ...]
    const arr_data = req.body.data;
    try {
        var groupres = await GroupResults.findById(req.params.groupResId);
        if (groupres == null){
            return res.status(400).send({message:"not such group results exist"});
        }
    }
    catch(err){
        return res.status(500).send({message: err.message});
    }
    var group_parts = groupres.parts;
    for (let data of arr_data){
        var part = data.part;
        var measure = data.measure;
        var mdrqa_id = data.mdrqa_id;
        var mdrqa_calcs = data.mdrqa_calcs; // [1,5,2,8,3...]
        var index_relevant_part = group_parts.findIndex(partX => partX.part_name===part);
        var index_relevant_measure = group_parts[index_relevant_part].measures_vec.findIndex(measureX =>measureX.measure_name===measure);
        var relevant_measure = group_parts[index_relevant_part].measures_vec[index_relevant_measure];
        relevant_measure.mdrqa_calcs = mdrqa_calcs;
        relevant_measure.mdrqa_id = mdrqa_id;
    }
    try { 
        await GroupResults.findByIdAndUpdate(req.params.groupResId, { 
            parts: group_parts,
        });
        return res.status(200).send({message:"MDRQA results added to the group results"}); 
    } catch (err) {
        return res.status(500).send({message: err.message});
    }
});

/***
 * @description delete all the MDRQA results of the specific group_results.
 * req.body: {} 
 * req.params: {
 *  groupResId      - the id of the group results that the all the MdRQA need to be removed from.
 * }
 */
router.patch("/:groupResId/deleteallmdrqa", async(req, res)=>{
    try {
        var groupres = await GroupResults.findById(req.params.groupResId);
        if (groupres == null){
            return res.status(400).send({message:"not such group results exist"});
        }
        var group_parts = groupres.parts;
        var mdrqa_ids_to_remove = [];
        var n_parts = group_parts.length;
        for (let part_index = 0; part_index<n_parts; part_index++){
            var n_measures = group_parts[part_index].measures_vec.length;
            for(let measure_index = 0; measure_index<n_measures; measure_index++){
                var relevant_measure = group_parts[part_index].measures_vec[measure_index];
                if (relevant_measure.mdrqa_calcs !== []){
                    relevant_measure.mdrqa_calcs = [];
                    mdrqa_ids_to_remove.push(relevant_measure.mdrqa_id);
                    //relevant_measure.mdrqa_id will stay the same but it means nothing if calcs =[]
                }
            }
        }
        // delete the relevant MdRQA results from ResMDRQA DB
        await GroupResults.findByIdAndUpdate(req.params.groupResId, { 
            parts: group_parts,
        });
        for (mdrqa_id of mdrqa_ids_to_remove){
            if (mdrqa_id !== undefined){
                await ResMDRQA.findByIdAndDelete(mdrqa_id);
            }
        }
        return res.status(200).send({message:"MDRQA results added to the group results"}); 
    }
    catch(err){
        return res.status(500).send({message: err.message});
    }
});

/***
 * @description add to the specific group_results the id of MDRQA results.
 * @param {ObjectId} groupResId - the id of the group results that the MdRQA need to be added to.
 * @param {Array} data - array of jsons in the following format: 
 *                       [{part: "part1", measure:"EDA", mdrqa_id:ObjectId("vk34"), calcs:[2,5,3,1]}, {}, ...]
 */
async function addMdrqa(groupResId,data){
    // req.body.data = [{part: "part1", measure:"EDA", mdrqa_id:ObjectId("vk34"), calcs:[2,5,3,1]}, {}, ...]
    const arr_data = data;
    try {
        var groupres = await GroupResults.findById(groupResId);
        if (groupres == null){
            console.log("not such group results exist")
            return 
        }
    }
    catch(err){
        console.log(err)
        return err
    }
    var group_parts = groupres.parts;
    for (let data of arr_data){
        var part = data.part;
        var measure = data.measure;
        var mdrqa_id = data.mdrqa_id;
        var mdrqa_calcs = data.mdrqa_calcs; // [1,5,2,8,3...]
        var index_relevant_part = group_parts.findIndex(partX => partX.part_name===part);
        var index_relevant_measure = group_parts[index_relevant_part].measures_vec.findIndex(measureX =>measureX.measure_name===measure);
        var relevant_measure = group_parts[index_relevant_part].measures_vec[index_relevant_measure];
        relevant_measure.mdrqa_calcs = mdrqa_calcs;
        relevant_measure.mdrqa_id = mdrqa_id;
    }
    try { 
        await GroupResults.findByIdAndUpdate(groupResId, { 
            parts: group_parts,
        });
        console.log("MDRQA results added to database"); 
    } catch (error) {
        console.log(error)
        return error
    }
    return 
}


module.exports.router = router;
module.exports.addMdrqa = addMdrqa