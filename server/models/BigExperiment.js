
const mongoose = require('mongoose');
const { Schema } = mongoose;
const Joi = require('joi');


const BigExperimentSchema = Schema({
    researcher: { type: Schema.Types.ObjectId, ref: 'User' },
    have_access:[{type: Schema.Types.ObjectId, ref: 'User'}],
    exp_name: String,
    description: String,
    mdrqa_params: {
        threshold: {type: Number, default: 1},
        min_seq: {type: Number, default: 2},
        embedding: {type: Number, default: 1},
        zscore: {type: Number, default: 0},
        delay: {type: Number, default: 1}
    },
    ccf_params: {
        window_size: {type: Number, default: 20},
        shift: {type: Number, default: 6},
        max: {type: Number, default: 1}
    },
    date: { type: Date, default: Date.now},
    groups_results_array: [{type: Schema.Types.ObjectId, ref: 'GroupResults'}]
});

const BigExperiment = mongoose.model("BigExperiment", BigExperimentSchema);

/**
 * the function validate that data is a json with all the required filed
 * to describe the CCF params.
 * @param {json} data - data is a json
 * @returns valid = {err, value}. 
 * the err contains the error reason, otherwise it is null. 
 * The value is the value with any type conversions and other modifiers applied.
 */
const validateCCFparams =(data)=>{
    const CCF_params = Joi.object({
        window_size: Joi.number().default(20).label("Window Size"),
        shift: Joi.number().default(0).label("Shift"),
        max: Joi.number().integer().min(0).max(1).default(1).label("Max")
    });
    const valid = CCF_params.validate(data)
    return valid
};

/**
 * the function validate that data is a json with all the required filed
 * to describe the MDRQA params.
 * @param {json} data - data is a json
 * @returns valid = {err, value}. 
 * the err contains the error reason, otherwise it is null. 
 * The value is the value with any type conversions and other modifiers applied.
 */
const validateMDRQAparams =(data)=>{
    const MDRQA_params = Joi.object({
        threshold: Joi.number().default(1).label("Threshold"),
        min_seq: Joi.number().default(2).label("Min seq"),
        embedding: Joi.number().default(1).label("Embedding"),
        zscore: Joi.number().integer().min(0).max(1).default(0).label("Zscore"),
        delay: Joi.number().default(1).label("Delay")
    });
    const valid = MDRQA_params.validate(data)
    return valid
};

module.exports = {BigExperiment,  validateCCFparams, validateMDRQAparams};