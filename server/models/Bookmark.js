const mongoose = require('mongoose');
const { Schema } = mongoose;

const BookmarkSchema = Schema({
    _id: Schema.Types.ObjectId,
    user_id: {
        type: Schema.Types.ObjectId, ref: 'User',
        require: true
    },
    exp_id:{
        type: Schema.Types.ObjectId, ref: 'BigExperiment',
        require: true
    },
    group_id:{
        type: Schema.Types.ObjectId, ref: 'GroupResults',
        require: true
    },
    part:{
        type: String,
        require: true
    },
    time_stamp: {
        type: String,
        require: true
    },
    description: {
        type: String,
        default: ''
    },
    color: {
        type: String,
        default: 'yellow'
    }
});

module.exports = mongoose.model('Bookmarks', BookmarkSchema);