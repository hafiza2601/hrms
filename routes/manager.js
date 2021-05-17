const express = require('express');
const router = express.Router();
const User = require('../models/user')
const Attendance = require('../models/attendance')
const { isLoggedIn, isManager } = require('../middleware')
const moment = require('moment')
const alert = require('alert');


router.get('/managerHome', isLoggedIn, isManager, async (req, res) => {
    console.log(req.user)
    const { _id } = req.user;
    const user = await User.findById(_id).populate('reportingManager');
    console.log(user)
    res.render('manager/managerHome', { user })
})

router.get('/managerProfile', isLoggedIn, isManager, async (req, res) => {
    const { id } = req.user;
    const user = await User.findById(id).populate('reportingManager')
    res.render('manager/managerProfile', { user })
})

router.put('/managerProfile', isLoggedIn, isManager, async (req, res) => {
    const { id } = req.user;
    await User.findByIdAndUpdate(id, { ...req.body })
    res.redirect('/managerProfile')
})

router.post('/managerCheckIn', isLoggedIn, isManager, async (req, res) => {

    const { _id, reportingManager } = req.user;
    const today = await Attendance.find({ employe: _id, date: moment().format('L') })
    if (today.length) {
        const found = 1;
        console.log("Already checked In!!")
        alert("Aready, Checked In!!")
        res.redirect('/managerHome')
    }
    else {
        const newAttendance = new Attendance({
            manager: reportingManager,
            employe: _id,
            date: moment().format('L'),
            checkIn: moment().format('LTS'),
            status: 'Pending'
        })
        await newAttendance.save();
        req.flash('success', `Successfully! Checked In`)
        res.redirect('/managerAttendance')
    }

})

router.post('/managerCheckOut', isLoggedIn, isManager, async (req, res) => {

    const { _id } = req.user;
    const findUser = await Attendance.findOne({
        employe: _id,
        date: moment().format('L')
    })
    if (!findUser) {
        console.log("Please checkin!!")
        alert("Please CheckIn,before CheckOut!!")
        return res.redirect('/managerHome')

    } else if (findUser && typeof (findUser.checkOut) !== 'undefined') {
        console.log("Already!! checked Out")
        alert('Already,Checked Out!!')
        return res.redirect('/managerAttendance')

    } else {
        const id = findUser._id;
        const check = await Attendance.findByIdAndUpdate(id, { checkOut: moment().format('LTS') })
        req.flash('success', 'Successfully! Checked Out')
        return res.redirect('/managerHome')
    }

})


router.get('/managerAttendance', isLoggedIn, isManager, async (req, res) => {
    const { _id } = req.user;
    const allAttendance = await Attendance.find({ employe: _id }).populate('employe')
    console.log(allAttendance)
    res.render('manager/managerAttendance', { allAttendance })
})


router.get('/managerAttendanceApproval', isLoggedIn, isManager, async (req, res) => {
    const users = await Attendance.find({ manager: req.user._id }).populate('employe')
    console.log(users)
    res.render('manager/attendanceApproval', { users })
})


router.put('/managerAttendanceapprove', isLoggedIn, isManager, async (req, res) => {
    console.log("manager")
    console.log(req.query.id)
    const id = req.query.id
    const attendance = await Attendance.findOne({ employe: id }).select('_id')
    const updated = await Attendance.findByIdAndUpdate(attendance, { status: 'Approved' })
    await updated.save()
    console.log(updated)
    req.flash('success', 'Attendance Approved')
    res.redirect('/managerAttendanceApproval')
})

router.put('/managerAttendancereject', isLoggedIn, isManager, async (req, res) => {
    console.log(req.query.id)
    const id = req.query.id
    const attendance = await Attendance.findOne({ employe: id }).select('_id')
    const updated = await Attendance.findByIdAndUpdate(attendance, { status: 'Rejected' })
    await updated.save()
    req.flash('success', 'Attendance Rejected')
    res.redirect('/managerAttendanceApproval')
})



module.exports = router;