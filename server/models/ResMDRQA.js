const mongoose = require('mongoose');
const { Schema } = mongoose;

const ResMDRQA = Schema({
    _id: Schema.Types.ObjectId,
    matrix: {
        type: String,
        required: true
    },
    n: Number
});

module.exports = mongoose.model('ResMDRQA', ResMDRQA);