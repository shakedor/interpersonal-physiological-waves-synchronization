const express = require('express');
const router = express.Router();
const Bookmark = require('../models/Bookmark');
const mongoose = require('mongoose');

/////////////////////// get ///////////////////////////

/***
 * @description get all the bookmarks of a specific user.
 * req.body: {} 
 * req.params: {
 *  userId          - the id of the user who sends the request
 * }
 */
router.get("/:userId", async (req, res)=>{
    try{
        const all_bookmarks = await Bookmark.find({user_id: req.params.userId}).populate({ path: 'exp_id', select: 'exp_name' }).populate({ path: 'group_id', select: 'group_name' });
        return res.status(200).send({data: all_bookmarks});
    } catch(err){
        return res.status(500).send({message: err});
    }
});

/***
 * @description get all the bookmarks of a specific user by array.
 * req.body: {} 
 * req.params: {
 *  userId          - the id of the user who sends the request
 * }
 */
router.get("/:userId/format", async (req, res)=>{
    try{
        const all_bookmarks = await Bookmark.find({user_id: req.params.userId}).populate({ path: 'exp_id', select: 'exp_name' }).populate({ path: 'group_id', select: 'group_name' });
        let bookmarks_array = [];
        for (let bookmark of all_bookmarks){
            // {_id, exp_name, group_name, part_name, description, color, time_stamp}
            let bookmark_values = {
                _id: bookmark._id,
                exp_name: bookmark.exp_id.exp_name, 
                group_name: bookmark.group_id.group_name,
                part_name: bookmark.part, 
                description: bookmark.description, 
                color: bookmark.color, 
                time_stamp: bookmark.time_stamp,
                expId: bookmark.exp_id._id,
                groupId: bookmark.group_id._id};
            bookmarks_array.push(bookmark_values);
        }
        return res.status(200).send({data: bookmarks_array});
    } catch(err){
        return res.status(500).send({message: err.message});
    }
});

/***
 * @description get a specific bookmark of a specific user.
 * req.body: {} 
 * req.params: {
 *  userId          - the id of the user who sends the request
 *  bookmarkId      - the id of the wanted bookmark
 * }
 */
router.get("/:userId/:bookmarkId", async (req, res)=>{
    try{
        const bookmark = await Bookmark.findById(req.params.bookmarkId).populate({ path: 'exp_id', select: 'exp_name' }).populate({ path: 'group_id', select: 'group_name' });;
        // check if bookmark exists
        if (!bookmark){
            return res.status(404).send({message: "bookmark not found"});
        }
        // check if the userId sending the req own this bookmark
        if(bookmark.user_id != req.params.userId){
            return res.status(403).send({message: "no such bookmark for you"});
        }
        // return the bookmark
        return res.status(200).send({data: bookmark});
    } catch(err){
        return res.status(500).send({message: err.message});
    }
});

///////////////////// post ////////////////////////////

/***
 * @description add a new book mark to DB.
 * req.body: {
 *  user_id     - the user whom added the bookmark
 *  exp_id      - the id of the exp the bookmark belongs to
 *  group_id    - the id of the group the bookmark belongs to
 *  part        - the part in which the bookmark occured
 *  time_stamp  - the time stamp in which the bookmark occured
 *  description - the description of the bookmark
 *  color       - the color of the bookmark
 * } 
 * req.params: {}
 */
router.post("/", async (req, res)=>{
    const bookmark = new Bookmark({
      _id: new mongoose.Types.ObjectId(),
      user_id: req.body.user_id,
      exp_id: req.body.exp_id,
      group_id: req.body.group_id,
      part: req.body.part,
      time_stamp: req.body.time_stamp,
      description: req.body.description,
      color: req.body.color
    });
    try{
        const savedBookmark = await bookmark.save();
        let extended = await savedBookmark.populate({ path: 'exp_id', select: 'exp_name' });
        exp_name = extended.exp_id.exp_name;
        const msg = "bookmark for "+ exp_name +" created successfully";
        return res.status(201).send({message: msg});
    } catch(err){
        return res.status(500).send({message: err.message});
    }
});

///////////////////////// delete ////////////////////////////

/***
 * @description delete a specific bookmark of the current user.
 * req.body: {} 
 * req.params: {
 *  userId          - the id of the user who sends the request
 *  bookmarkId      - the id of the bookmark to be deleted
 * }
 */
router.delete("/:userId/:bookmarkId", async(req, res)=>{
    try{
        const bookmark = await Bookmark.findById(req.params.bookmarkId);
        // check if bookmark exists
        if (!bookmark){
            return res.status(404).send({message: "bookmark not found"});
        }
        // check if the userId sending the req own this bookmark
        if(bookmark.user_id != req.params.userId){
            return res.status(403).send({message: "no such bookmark for you"});
        }
        // delete the bookmark
        const { deletedCount: x_bookmarks} = await Bookmark.deleteMany({_id: req.params.bookmarkId}); 
        return res.status(200).send({message: "successfuly deleted "+ x_bookmarks+ " bookmark"});  
    } catch(err){
        return res.status(500).send({message: err});
    }
});

////////////////////////// patch //////////////////////////////////
/***
 * @description update the color of a specific bookmark of the current user.
 * req.body: {
 *  new_color       - the new color of the bookmark
 * } 
 * req.params: {
 *  userId          - the id of the user who sends the request
 *  bookmarkId      - the id of the bookmark to be deleted
 * }
 */
router.patch("/:userId/:bookmarkId", async(req, res)=>{
    try{
        const bookmark = await Bookmark.findById(req.params.bookmarkId);
        // check if bookmark exists
        if (!bookmark){
            return res.status(404).send({message: "bookmark not found"});
        }
        // check if the userId sending the req own this bookmark
        if(bookmark.user_id != req.params.userId){
            return res.status(403).send({message: "no such bookmark for you"});
        }
        // update the bookmark
        await Bookmark.findByIdAndUpdate(req.params.bookmarkId, {color: req.body.new_color,}); 
        return res.status(200).send({message: "successfuly changed the color to "+ req.body.new_color});  
    } catch(err){
        return res.status(500).send({message: err});
    }
});

module.exports = router;