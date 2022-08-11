const express = require('express');
const router = express.Router();
const GroupResults = require('../models/GroupResults');

/**
 * The function returns the group results of the group with given groupId
 * @param {ObjectId} userId - the id of the user sends the request
 * @param {ObjectId} groupId - the id of the group wanted
 * @returns the group results of the given groupId
 */
async function getGroupResults(userId , groupId){
    let experiments;
    try{
        if (groupId == undefined){
            experiments = await GroupResults.find({researcher : userId});
        }
        else{
            experiments = await GroupResults.findById(groupId);
        }
        return experiments
    } catch(err){
    }
}


module.exports.router = router;
module.exports.getGroupResults = getGroupResults
