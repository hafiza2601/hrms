const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');
const Attendance = require('./attendance')

var UserSchema = new Schema({

    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String
    },
    email: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true,
        enum: ['Admin', 'Manager', 'Employee']
    },
    dateOfBirth: {
        type: Date
    },
    gender: {
        type: String,
        enum: ['Male', 'Female']
    },
    contact: {
        type: String
    },
    designation: {
        type: String
    },
    joiningDate: {
        type: Date
    },
    reportingManager: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }

});

UserSchema.plugin(passportLocalMongoose)
module.exports = mongoose.model('User', UserSchema); 