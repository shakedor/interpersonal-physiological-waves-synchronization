const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const {BigExperiment, validateCCFparams, validateMDRQAparams}= require('../models/BigExperiment');
const GroupResults = require('../models/GroupResults');
const User = require('../models/User').User;
const Bookmark = require('../models/Bookmark');
const deleteMDRQARes = require('./mdrqa_res').deleteMDRQARes;

///////////////////// get ////////////////////////////

/***
 * @description get all the big experiments of the current researcher.
 * req.body: {} 
 * req.params: {
 *  userId          - the id of the user who sends the request
 * }
 */
router.get("/:userId", async(req, res)=>{
    try {
        const allBigExp = await BigExperiment.find({researcher: req.params.userId});
        return res.status(200).send({data:allBigExp});
    } catch (err) {
        return res.status(500).send({message: err.message});
    }
});

/***
 * @description get all the big experiments that the current user has access to.
 * req.body: {} 
 * req.params: {
 *  userId          - the id of the user who sends the request
 * }
 */
router.get("/hasaccess/:userId", async(req, res)=>{
    try {
        // get all the big experiments where the have_access filed contains the userId
        const allBigExp = await BigExperiment.find({have_access: req.params.userId});
        return res.status(200).send({data:allBigExp});
    } catch (err) {
        return res.status(500).send({message: err.message});
    }
});


/***
 * @description get all the groups results of a specific big experiment of the current researcher.
 * req.body: {} 
 * req.params: {
 *  userId          - the id of the user who sends the request, 
 *  BigExpId        - the id of the big experiment the user wants to get the group results of
 * }
 */
router.get("/:userId/:BigExpId", async(req, res)=>{
    try {
        // Find the specific Big Experiment 
        const bigExp = await BigExperiment.findById(req.params.BigExpId);
        // check if the experiment exists
        if (!bigExp) return res.status(404).send({message: "big experiment not found"});
        // verify that the experiment indeed belong to the specific user or the user has an access to it.
        if (bigExp.researcher != req.params.userId){
            if (!bigExp.have_access.includes(req.params.userId)){
                return res.status(403).send({message: "no such experiment exists for you"});
            }
        }
        // Fetch all the GroupResults that are linked to this BigExp
        const groupsResults = await GroupResults.find({_id: {$in: bigExp.groups_results_array}});
        return res.status(200).send({data:groupsResults});
    } catch (err) {
        return res.status(500).send({message: err.message});
    }
});

/***
 * @description get the given big experiment - 
 *              will succeed only if the user own the experiment or in the list of have access. 
 * req.body: {} 
 * req.params: {
 *  userId          - the id of the user who sends the request, 
 *  BigExpId        - the id of the big experiment the user wants to get
 * }
 */
router.get("/:userId/:BigExpId/getexp", async(req, res)=>{
    try{
        // Find the specific Big Experiment 
        const bigExp = await BigExperiment.findById(req.params.BigExpId);
        // check if the experiment exists
        if (!bigExp) return res.status(404).send({message: "big experiment not found"});
        // verify that the experiment indeed belong to the specific user or the user has an access to it.
        if (bigExp.researcher != req.params.userId){
            if (!bigExp.have_access.includes(req.params.userId)){
                return res.status(403).send({message: "no such experiment exists for you"});
            }
        }
        return res.status(200).send({data:bigExp});
    } catch(err){
        console.log(err);
        return res.status(500).send({message: err.message});

    }
});

/***
 * @description get the specific group results of the current researcher.
 * req.body: {} 
 * req.params: {
 *  userId          - the id of the user who sends the request, 
 *  GroupResultsId  - the id of the group results the user wants to get
 * }
 */
router.get("/groupres/:userId/:GroupResultsId", async(req, res)=>{
    try {
        // Find the specific group results
        const groupResults = await GroupResults.findById(req.params.GroupResultsId);
        // check if the group results exist
        if (!groupResults) return res.status(404).send({message: "group results not found"});
        // return the group results found
        return res.status(200).send({data:groupResults});
    } catch (err) {
        return res.status(500).send({message: err.message});
    }
});

/////////////////////// delete //////////////////////////////////

/***
 * @description delete from DB all the group results of the specified big exp,
 *              all the bookmarks of this big exp and the big exp itself.
 * req.body: {} 
 * req.params: {
 *  userId          - the id of the user who sends the request, 
 *  BigExpId        - the id of the big experiment the user wants to delete
 * }
 */
router.delete("/:userId/:BigExpId", async(req, res)=>{
    try{
        let msg = '';
        // Find the specific Big Experiment 
        const bigExp = await BigExperiment.findById(req.params.BigExpId);
        // check if the experiment exists
        if (!bigExp) return res.status(404).send({message: "big experiment not found"});
        // verify that the experiment indeed belong to the specific user
        if (bigExp.researcher != req.params.userId){
            return res.status(403).send({message: "you don't have access to delete the experiment"});
        }
        // delete all the GroupResults that are linked to this BigExp
        const { deletedCount: x_groups} = await GroupResults.deleteMany({_id: {$in: bigExp.groups_results_array}});
        //console.log(js.deletedCount);
        msg = msg + "successfuly deleted "+ x_groups +" group results";
        // delete the relevant bookmarks
        const { deletedCount: x_bookmarks} = await Bookmark.deleteMany({exp_id: req.params.BigExpId}); 
        msg = msg + ",  "+ x_bookmarks +" bookmarks";
        // delete the big exeriment
        const { deletedCount: x_exps} = await BigExperiment.deleteMany({_id: req.params.BigExpId});
        msg = msg + " and "+ x_exps +" experiment";
        return res.status(200).send({message:msg});
    }
    catch(err){
        return res.status(500).send({message: err.message});
    }
});

/***
 * @description delete from DB the specified group result of the specified big exp,
 *              and all the bookmarks connected to this group.
 * req.body: {} 
 * req.params: {
 *  userId          - the id of the user who sends the request, 
 *  BigExpId        - the id of the big experiment the user wants to delete the group from,
 *  GroupResultsId  - the id of the group results to be deleted.
 * }
 */
router.delete("/groupres/:userId/:BigExpId/:GroupResultsId", async(req, res)=>{
    try {
        const bigExp = await BigExperiment.findById(req.params.BigExpId);
        // check if the experiment exists
        if (!bigExp) return res.status(404).send({message: "big experiment not found"});
        if (bigExp.researcher != req.params.userId){ 
            return res.status(403).send({message:"you don't have access to delete the group"});
        }

        // delete the id of the group results from big exp
        var groups_list = bigExp.groups_results_array;
        const index = groups_list.indexOf(req.params.GroupResultsId);
        if (index > -1) {
            groups_list.splice(index, 1); // 2nd parameter means remove one item only
        }
        await BigExperiment.findByIdAndUpdate(req.params.BigExpId, {
            groups_results_array: groups_list,
        });
        let msg = '';
        // delete the relevant bookmarks
        const { deletedCount: x_bookmarks} = await Bookmark.deleteMany({group_id: req.params.GroupResultsId}); 
        msg = msg + "successfuly deleted "+ x_bookmarks +" bookmarks ";
        // delete the group results from DB
        const { deletedCount: x_groups} = await GroupResults.deleteMany({_id: req.params.GroupResultsId});
        msg = msg +  "and "+ x_groups+ " group results";
        return res.status(200).send({message: msg});  
    } catch (error) {
        return res.status(500).send({message: err.message});
    }
});

//////////////////////////////// post //////////////////////////////

/***
 * @description add a new big experiment to BigExperiment collection,
 *              and all it's groups results to the GroupResults collection.
 * req.body: {
 *  groups_results: [{
 *      researcher  - the reasercher of the experiment
 *      group_name  - the name of the group
 *      description - the description of the group results
 *      parts       - the results of the parts
 *          }] 
 * researcher       - the reasercher of the experiment
 * exp_name         - the name of the big experiment
 * description      - the description of the big experiment
 * } 
 * req.params: {}
 */
router.post("/addBigExp", async(req, res)=>{
    try {

        let groups_list = [];

        for (const group_result of req.body.groups_results){

            const group = new GroupResults({
                _id: new mongoose.Types.ObjectId(),
                researcher: group_result.researcher,
                group_name: group_result.group_name,
                description: group_result.description,
                parts: group_result.parts
            });
            const savedGroup = await group.save();
            groups_list.push(savedGroup._id);
        }

        const bigExp = new BigExperiment({
            researcher: req.body.researcher,
            have_access: [],
            exp_name: req.body.exp_name,
            description: req.body.description,
            groups_results_array: groups_list
        });

        const savedBigExp = await bigExp.save();
        console.log(savedBigExp);
        res.status(201).send({message:"Big Experiment created successfully"});
    } catch(err){
        res.status(500).send({message:"Internal server error\n" + err.message});
    }
});

/////////////////////// patch /////////////////////////

/***
 * @description change the name and description for the given big exp.
 * req.body: {
 *  new_name_desc: {
 *      name        - the new name of the experiment
 *      description - the new description of the experiment.
 *      } 
 * } 
 * req.params: {
 *  userId          - the id of the user who sends the request, 
 *  BigExpId        - the id of the big experiment the user wants to change the parameters of.
 * }
 */
router.patch("/changeName/:userId/:BigExpId", async(req,res)=>{
    try {
        const bigExp = await BigExperiment.findById(req.params.BigExpId);
        // check if the experiment exists
        if (!bigExp) return res.status(404).send({message: "big experiment not found"});

        if (bigExp.researcher != req.params.userId){ 
            return res.status(403).send({message:"you don't have access to change parameters"});
        }

        var new_name_desc = req.body.new_name_desc;
        await BigExperiment.findByIdAndUpdate(req.params.BigExpId, {
            exp_name: new_name_desc.name,
            description: new_name_desc.description,
        });
        return res.status(200).send({message:"parameters changed successfully"});
        
    } catch (err) {
        return res.status(500).send({message:err.message});
    }
});

/***
 * @description change the CCF parameters for the given big exp.
 * req.body: {
 *  new_ccf_params  - the new CCF parameters the user wishes to apply on the given big exp
 * } 
 * req.params: {
 *  userId          - the id of the user who sends the request, 
 *  BigExpId        - the id of the big experiment the user wants to change the CCF parameters of.
 * }
 */
router.patch("/changeCCFparams/:userId/:BigExpId", async(req,res)=>{
    try {
        const bigExp = await BigExperiment.findById(req.params.BigExpId);
        // check if the experiment exists
        if (!bigExp) return res.status(404).send({message: "big experiment not found"});

        if (bigExp.researcher != req.params.userId){ 
            return res.status(403).send({message:"you don't have access to change parameters"});
        }

        var new_ccf_params = req.body.new_ccf_params;
        const {error, value} = validateCCFparams(new_ccf_params);
        if (error){
            return res.status(400).send({message: error.details[0].message});
        }
        new_ccf_params = value;
        await BigExperiment.findByIdAndUpdate(req.params.BigExpId, {
            ccf_params: new_ccf_params,
        });
        return res.status(200).send({message:"CCF parameters changed successfully"});
        
    } catch (err) {
        return res.status(500).send({message:err.message});
    }
});


/***
 * @description change the MDRQA parameters for the given big exp,
 *              and delete all the results of the MDRQA that related to this big exp
 * req.body: {
 *  new_mdrqa_params - the new MdRQA parameters the user wishes to apply on the given big exp
 * } 
 * req.params: {
 *  userId          - the id of the user who sends the request, 
 *  BigExpId        - the id of the big experiment the user wants to change the MdRQA parameters of.
 * }
 */
router.patch("/changeMDRQAparams/:userId/:BigExpId", async(req,res)=>{
    try {
        const bigExp = await BigExperiment.findById(req.params.BigExpId);
        // check if the experiment exists
        if (!bigExp) return res.status(404).send({message: "big experiment not found"});

        if (bigExp.researcher != req.params.userId){ 
            return res.status(403).send({message:"you don't have access to change parameters"});
        }

        var new_mdrqa_params = req.body.new_mdrqa_params;
        const {error, value} = validateMDRQAparams(new_mdrqa_params);
        if (error){
            return res.status(400).send({message: error.details[0].message});
        }
        new_mdrqa_params = value;
        // change the parameters of the MDRQA in the big exp 
        await BigExperiment.findByIdAndUpdate(req.params.BigExpId, {
            mdrqa_params: new_mdrqa_params,
        });
        // delete all the MDRQA results related to this big exp, and set all the mdrqa calcs to []
        const groups_arr = bigExp.groups_results_array;
        for (let group_id of groups_arr){
            var group_res = await GroupResults.findById(group_id).select("parts").select("measures_vec");
            for (let part of group_res.parts){
                for (let measure_vec of part.measures_vec){
                    measure_vec.mdrqa_calcs = [];
                    if (measure_vec.mdrqa_id){
                        await deleteMDRQARes(measure_vec.mdrqa_id);
                    }
                }
            }
            await group_res.save();
        }
        return res.status(200).send({message:"MDRQA parameters changed successfully and all the previous MDRQA results were deleted"});
    } catch (err) {
        return res.status(500).send({message:err.message});
    }
});

/***
 * @description give access to some users for the specified experiment.
 * req.body: {
 *  to_users_emails - the mails the user wish to give access to
 * } 
 * req.params: {
 *  userId          - the id of the user who sends the request, 
 *  BigExpId        - the id of the big experiment the user wants to share
 * }
 */
router.patch("/letAccess/:userId/:BigExpId", async(req,res)=>{
    try {
        const bigExp = await BigExperiment.findById(req.params.BigExpId);
        // check if the experiment exists
        if (!bigExp) return res.status(404).send({message: "big experiment not found"});
        // check if the user own this experiment 
        if (bigExp.researcher != req.params.userId){ 
            return res.status(403).send({message:"you don't have access"});
        }
        const users_email = req.body.to_users_emails;
        // find all the users that matches one of the given email from
        // the email list and take their ids to add to the have access list of the experiment.
        const users_to_add = await User.find({email: {$in:users_email}}).select("_id email");
        let updated_access = bigExp.have_access;
        let registered_emails = [];
        for (const user of users_to_add){
            registered_emails.push(user.email);
            if (!updated_access.includes(user._id)){
                updated_access.push(user._id);
            }
        }
        await BigExperiment.findByIdAndUpdate(req.params.BigExpId, {
            have_access: updated_access,
        });
        // if the length of the found users is not equal (smaller) than the provided email list,
        // then some of the given mails were not belong to register users.
        if(users_to_add.length !== users_email.length){
            // get a list of all the users that were not found in the DB
            let not_registered = users_email.filter(function(item){
                return registered_emails.indexOf(item)==-1;
            });
            return res.status(200).send({message:"the mails: "+ not_registered +
                 " are not connected to a registered user, the others now have access"});
        }
        return res.status(200).send({message:"access added successfuly to the users"});
        
    } catch (err) {
        return res.status(500).send({message:err.message});
    }
});

/***
 * @description remove big exp that shared with the user from his list of shared exp.
 * req.body: {} 
 * req.params: {
 *  userId      - the id of the user who sends the request, 
 *  BigExpId    - the id of the big experiment the user wants to remove from his shared list
 * }
 */
router.patch("/removeSharedExp/:userId/:BigExpId", async(req,res)=>{
    try {
        const bigExp = await BigExperiment.findById(req.params.BigExpId);
        // check if the experiment exists
        if (!bigExp) return res.status(404).send({message: "big experiment not found"});

        const user = await User.findById(req.params.userId).select("_id");
        if (!user) return res.status(404).send({message: "user not found"});

        let updated_access = bigExp.have_access;
        const index = updated_access.indexOf(user._id);
        // if the id is included in the have access - remove it
        if(index > -1){
            updated_access.splice(index, 1); // 2nd parameter means remove one item only
        } 
        
        await BigExperiment.findByIdAndUpdate(req.params.BigExpId, {
            have_access: updated_access,
        });
        return res.status(200).send({message:"removed shared experiment successfuly"});
        
    } catch (err) {
        return res.status(500).send({message:err.message});
    }
});

/***
 * @description remove access of some users to the specified experiment.
 * req.body: {
 *  to_users_emails - the mails the user wishes to remove access from
 * } 
 * req.params: {
 *  userId          - the id of the user who sends the request, 
 *  BigExpId        - the id of the big experiment the user wants to unshare
 * }
 */
router.patch("/removeAccess/:userId/:BigExpId", async(req,res)=>{
    try {
        const bigExp = await BigExperiment.findById(req.params.BigExpId);
        // check if the experiment exists
        if (!bigExp) return res.status(404).send({message: "big experiment not found"});

        if (bigExp.researcher != req.params.userId){ 
            return res.status(403).send({message:"you don't have access"});
        }

        const users_email = req.body.to_users_emails;
        const users_to_remove = await User.find({email: {$in:users_email}}).select("_id");
        let updated_access = bigExp.have_access;
        for (const user of users_to_remove){
            const index = updated_access.indexOf(user._id);
            // if the id is included in the have access - remove it
            if(index > -1){
                updated_access.splice(index, 1); // 2nd parameter means remove one item only
            } 
        }
        await BigExperiment.findByIdAndUpdate(req.params.BigExpId, {
            have_access: updated_access,
        });
        return res.status(200).send({message:"access removed successfuly from the users"});
        
    } catch (err) {
        return res.status(500).send({message:err.message});
    }
});

/***
 * @description add a new group results to exsisting Big Experiment.
 * req.body: {
 *  researcher      - the id of the reasercher
 *  group_name      - the name of the group to be added
 *  description     - description of the group results
 *  parts           - the results of the group results
 * } 
 * req.params: {
 *  BigExpId        - the id of the big experiment the user wants to add the group to.
 * }
 */
// add a new group results to exsisting Big Experiment
router.patch("/addGroupResults/:BigExpId", async(req, res)=>{
    try {
        const bigExp = await BigExperiment.findById(req.params.BigExpId);
        // check if the experiment exists
        if (!bigExp) return res.status(404).send({message: "big experiment not found"});

        if (bigExp.researcher != req.body.researcher){ // req.body.researcher equals to the userId connected 
            return res.status(403).send({message:"no such big experiment for you to add to the results"});
        }

        var groups_list = bigExp.groups_results_array;

        const group = new GroupResults({
            _id: new mongoose.Types.ObjectId(),
            researcher: req.body.researcher,
            group_name: req.body.group_name,
            description: req.body.description,
            parts: req.body.parts
        });
        const savedGroup = await group.save();

        groups_list.push(savedGroup._id);

        await BigExperiment.findByIdAndUpdate(req.params.BigExpId, {
            groups_results_array: groups_list,
        });
        return res.status(200).send({message:"group results added successfuly to the experiment"});
    } catch (err) {
        return res.status(500).send({message:err.message});
    }
});

// add a new big experiment to BigExperiment collection,
// and all it's groups results to the GroupResults collection.
async function add_big_exp(big_experiment){
    try {

        let groups_list = [];

        for (const group_result of big_experiment.groups_results){

            const group = new GroupResults({
                _id: new mongoose.Types.ObjectId(),
                researcher: group_result.researcher,
                group_name: group_result.group_name,
                description: group_result.description,
                parts: group_result.parts
            });
            const savedGroup = await group.save();
            groups_list.push(savedGroup._id);
        }

        const bigExp = new BigExperiment({
            researcher: big_experiment.researcher,
            exp_name: big_experiment.exp_name,
            description: big_experiment.description,
            groups_results_array: groups_list
        });

        const saved_exp = await bigExp.save();
        return saved_exp;
    } catch(error){
        console.log("Something went wrong with saving the data");
        return;
    }
}

// add a new group results to exsisting Big Experiment
async function addGroup2bigexp(BigExpId, researcher, groupdata ){
    try {
        const bigExp = await BigExperiment.findById(BigExpId);
        // check if the experiment exists
        if (!bigExp){
            console.log("big experiment not found")
            return
        } 

        if (bigExp.researcher != researcher){ // req.body.researcher equals to the userId connected 
            console.log("no such big experiment for you to add to the results");
            return
        }

        var groups_list = bigExp.groups_results_array;

        const group = new GroupResults({
            _id: new mongoose.Types.ObjectId(),
            researcher: groupdata.researcher,
            group_name: groupdata.group_name,
            description: groupdata.description,
            parts: groupdata.parts
        });
        const savedGroup = await group.save();

        groups_list.push(savedGroup._id);

        await BigExperiment.findByIdAndUpdate(BigExpId, {
            groups_results_array: groups_list,
        });

    } catch(error){
        console.log("Something went wrong with saving the data");
    }
}

module.exports.router = router;
module.exports.add_big_exp = add_big_exp
module.exports.addGroup2bigexp = addGroup2bigexp