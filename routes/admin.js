const express = require('express');
const router = express.Router();
const User = require('../models/user')
const Attendance = require('../models/attendance')
const { isLoggedIn, isAdmin } = require('../middleware')
const moment = require('moment')
const Joi = require('joi')


router.get('/adminHome', isAdmin, isLoggedIn, async (req, res) => {
    console.log(req.user)
    const { _id } = req.user;
    const user = await User.findById(_id);
    res.render('admin/adminHome', { user })
})
router.get('/manageEmploye', isLoggedIn, isAdmin, async (req, res) => {
    const users = await User.find({})
    res.render("admin/manageEmploye", { users })
})

router.get('/adminProfile', isLoggedIn, isAdmin, async (req, res) => {
    const { id } = req.user;
    const user = await User.findById(id)
    const dob = moment(user.dateOfBirth).format('DD/MM/YYYY');
    const joining = moment(user.joiningDate).format('DD/MM/YYYY');
    res.render('admin/adminProfile', { user, dob, joining })
})

router.get('/addEmploye', isAdmin, isLoggedIn, (req, res) => {
    res.render('admin/addEmploye')

})

router.get('/adminAttendance', isLoggedIn, isAdmin, async (req, res) => {
    const users = await Attendance.find({ manager: req.user._id, isCorrection: false }).populate('employe')
    res.render('admin/adminAttendance', { users })
})

router.get('/adminAttendanceCorrection', isLoggedIn, isAdmin, async (req, res) => {
    const users = await Attendance.find({ manager: req.user._id, isCorrection: true }).populate('employe')
    console.log(users)
    res.render('admin/adminCorrection', { users })
})

router.post('/editEmploye', async (req, res) => {
    try {
        const id = req.query.id
        const user = await User.findById(id)
        console.log(user)
        res.render('admin/editEmploye', { user })
    }
    catch (err) {
        res.send(err)
    }
})

router.put('/adminProfile', isLoggedIn, isAdmin, async (req, res) => {
    try {
        const { id } = req.user;
        await User.findByIdAndUpdate(id, { ...req.body })
        req.flash('success', "Profile Updated!!")
        res.redirect('/adminProfile')
    }
    catch (err) {
        res.send(err)
    }
})

router.put('/editEmploye', isLoggedIn, isAdmin, async (req, res) => {
    const id = req.query.id;
    //const { _id, username, firstName, lastName, gender, dateOfBirth, joiningDate, email, contact, role, reportingManager, designation } = req.body;
    await User.findByIdAndUpdate(id, { ...req.body })
    req.flash('success', 'Employe Profile Updated!!')
    res.redirect('/manageEmploye')
})

router.delete('/deleteEmploye', isLoggedIn, isAdmin, async (req, res) => {
    try {
        const id = req.query.id;
        const allAttendance = await Attendance.find({ employe: id })
        for (let attendance of allAttendance) {
            const del = await Attendance.findByIdAndDelete(attendance._id);
            console.log(del)
        }
        const user = await User.findByIdAndDelete(id)
        req.flash('success', 'Employe Deleted')
        res.redirect('/manageEmploye')
    }
    catch (err) {
        const message = err.message
        req.flash('err', message)
    }
})

router.post('/addEmploye', isAdmin, isLoggedIn, async (req, res) => {

    try {
        const { username, fName, lName, password, email, dateOfBirth, contact, designation, joiningDate, role, gender, reportingManager } = req.body;

        const manager = await User.findOne({ username: reportingManager }).select('_id');

        const user = new User({
            username: username,
            firstName: fName,
            lastName: lName,
            email: email,
            dateOfBirth: dateOfBirth,
            contact: contact,
            designation: designation,
            joiningDate: joiningDate,
            role: role,
            gender: gender,
            reportingManager: manager._id
        })

        const newUser = await User.register(user, password);
        req.flash('success', 'New Employe Added!!')
        res.redirect('/manageEmploye')
    }
    catch (err) {
        res.send(err)
    }



})
router.put('/adminAttendanceapprove', isLoggedIn, isAdmin, async (req, res) => {
    try {
        console.log(req.user)
        const id = req.query.id
        console.log(id)
        const attendance = await Attendance.findOne({ employe: id, status: 'Pending' }).select('_id')
        console.log("attendance", attendance)
        const updated = await Attendance.findByIdAndUpdate(attendance, { status: 'Approved' })
        await updated.save()
        console.log("updated", updated)
        req.flash('success', 'Attendance Approved')
        res.redirect('/adminAttendance')
    }
    catch (err) {
        res.send(err)
    }
})

router.put('/adminAttendancereject', isLoggedIn, isAdmin, async (req, res) => {
    try {
        console.log(req.query.id)
        const id = req.query.id
        const attendance = await Attendance.findOne({ employe: id, status: 'Pending' }).select('_id')
        const updated = await Attendance.findByIdAndUpdate(attendance, { status: 'Rejected' })
        await updated.save()
        req.flash('success', 'Attendance Rejected')
        res.redirect('/adminAttendance')
    }
    catch (err) {
        res.send(err)
    }
})



module.exports = router;