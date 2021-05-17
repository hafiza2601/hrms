const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('./user')

var attendanceSchema = new Schema({
    manager: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    employe: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    date: {
        type: String
    },
    checkIn: {
        type: String
    },
    checkOut: {
        type: String
    },
    status: {
        type: String
    },
    reason: {
        type: String,
        enum: ['forgot checkin', 'forgot checkout', 'forgot both']
    },
    isCorrection: {
        type: Boolean,
        default: false
    }

})

module.exports = mongoose.model('Attendance', attendanceSchema);
