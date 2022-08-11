const mongoose = require('mongoose');
const { Schema } = mongoose;

const PersonVector = Schema({
    person_num: {
        type: String,
        require: true
    },
    measure_values: {
        type: [Number],
        required: true
    }
});

const SyncVector = Schema({
    persons_included: {
        type: [String],
        required: true,
        default: []
    },
    sync_values: {
        type: [Number],
        required: true,
        default:[]
    }
});


const Measure = Schema({
    measure_name: {
        type: String,
        required: true
    },
    persons_vectors: [PersonVector],
    sync_vectors: {
        type: [SyncVector],
        default: []
    },
    mdrqa_calcs:{
        type: [Number],
        default:[]
    },
    mdrqa_id:{
        type: Schema.Types.ObjectId,
        ref: 'ResMDRQA'
    }
});

const Part = Schema({
    part_name:{
        type: String,
        required: true
    },
    measures_vec: [Measure]
});

const GroupResults = Schema({
    _id: Schema.Types.ObjectId,
    researcher: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    group_name: {
        type: String,
        required: true
    },
    description: String,
    parts: [Part]
});

module.exports = mongoose.model('GroupResults', GroupResults);


