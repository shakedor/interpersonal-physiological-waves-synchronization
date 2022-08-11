const mongoose = require('mongoose');
const { Schema } = mongoose;
const jwt = require('jsonwebtoken');
const Joi = require('joi');

const UserSchema = new mongoose.Schema({
    _id: Schema.Types.ObjectId,
    first_name: {
        type: String,
        require: true
    },
    last_name: {
        type: String,
        require: true
    },
    email: {
        type: String,
        unique : true,
        require: true
    }
});

/**
 * create a jwt token to the user that the function is called from and return it.
 * @returns a jwt token for the user the function is called from
 */
UserSchema.methods.generateAuthToken = function(){
    const token = jwt.sign({_id:this.id}, process.env.JWTPRAIVTEKEY, {expiresIn:"1d"})
    return token
}

const User = mongoose.model("User", UserSchema);

/**
 * the function validate that data is a json with all the required filed
 * to describe a user.
 * @param {json} data - data is a json
 * @returns valid = {err, value}. 
 * the err contains the error reason, otherwise it is null. 
 * The value is the value with any type conversions and other modifiers applied.
 */
const validateUser =(data)=>{
    const schema = Joi.object({
        first_name: Joi.string().required().label("First Name"),
        last_name: Joi.string().required().label("Last Name"),
        email: Joi.string().email().required().label("Email")
    });
    const valid = schema.validate(data);
    return valid
};

module.exports = {User, validateUser};