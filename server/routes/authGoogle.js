const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const {User, validateUser} = require('../models/User');

/**
 * the function gets a user details in req.body
 * if the email of the user is found in DB 
 * (meaning that it is not the first time he trierd to log to the app)
 * then log the user in and return his details with a token.
 * if this is the first login of the user (the email is not found in the DB)
 * then register the user - insert the user to the DB, 
 * and then log him in and return his details and token
 * 
 * req.body = {email, first_name, last_name}
 * 
 */
router.post('/', async(req,res) => {
    if (!req.body) {
        return res.status(400).send({message: "no body for the request"});
    }
    const {error} = validateUser(req.body);
    if(error){
        return res.status(400).send({message: error.details[0].message});
    }
    const email = req.body.email;
    // find if this email is already exists in db
    User.findOne({
        email: email
    }).then((user) => {
        // the user is found in the DB - log him in: create a token for him
        if (user) {
            const token = user.generateAuthToken();
            const userDetails = {
                _id: user._id,
                first_name: user.first_name,
                last_name: user.last_name,
                email:user.email
            }
            return res.status(200).send({data: {token, userDetails}, message:"Logged in successfully"});
        } else {
            // the user is not found in DB - create the user
            const user = new User({
                _id: new mongoose.Types.ObjectId(),
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                email: req.body.email
            });
            // save the user in DB and log him in: create a token for him
            user.save(function(err, craetedUser){
                if (err){
                    console.log(err);
                    return res.status(500).send({message: "Internal Server Error - could not create user"});
                }
                const token = craetedUser.generateAuthToken();
                const craetedUserDetails = {
                    _id: craetedUser._id,
                    first_name: craetedUser.first_name,
                    last_name: craetedUser.last_name,
                    email:craetedUser.email
                }
                return res.status(200).send({data: {token: token, userDetails: craetedUserDetails}, message:"Logged in successfully"});
            })
        }
    }).catch((err) => {
        console.log(err);
        return res.status(500).send({message: "Internal Server Error - could not get user"});
    })

})

module.exports = router;