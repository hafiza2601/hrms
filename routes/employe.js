const express = require('express');
const { authenticate } = require('passport');
const router = express.Router();
const passport = require('passport')
const User = require('../models/user')
const Attendance = require('../models/attendance')
const { isLoggedIn } = require('../middleware');
const moment = require('moment')
const alert = require('alert');
const { route } = require('./admin');




router.get('/login', (req, res) => {
    res.render('login');
})

router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), async (req, res) => {

    if (req.user.role === "Admin") {
        req.flash('success', 'Logged In as Admin!')
        return res.redirect('/adminHome')
    }
    if (req.user.role === "Manager") {
        req.flash('success', 'Logged In as Manager!')
        return res.redirect('/managerHome')
    }
    req.flash('success', 'Logged In as Employe!')
    res.redirect('/home')

})

router.get('/home', isLoggedIn, async (req, res) => {

    console.log(req.user)
    const { _id } = req.user;
    const user = await User.findById(_id).populate('reportingManager');
    res.render('employe/home', { user })
})


router.get('/profile', isLoggedIn, async (req, res) => {
    const { id } = req.user;
    const user = await User.findById(id).populate('reportingManager')
    //let dob = user.dateOfBirth;
    const dob = moment(user.dateOfBirth).format('DD/MM/YYYY');
    const joining = moment(user.joiningDate).format('DD/MM/YYYY');
    res.render('employe/profile', { user, dob, joining })
})

router.put('/profile', isLoggedIn, async (req, res) => {
    const { id } = req.user;
    await User.findByIdAndUpdate(id, { ...req.body })
    res.redirect('/profile')
})

router.get('/attendance', isLoggedIn, async (req, res) => {
    const { _id } = req.user;
    const allAttendance = await Attendance.find({ employe: _id, isCorrection: false }).populate('employe')
    console.log(allAttendance)
    res.render('employe/attendance', { allAttendance })
})

router.get('/attendanceCorrection', isLoggedIn, async (req, res) => {
    const { _id } = req.user;
    console.log(req.user)
    res.render('employe/attendanceCorrection')
})

router.get('/attendanceCorrectionHistory', isLoggedIn, async (req, res) => {
    const { _id } = req.user;
    const allAttendance = await Attendance.find({ employe: _id, isCorrection: true }).populate('employe')
    console.log(allAttendance)
    res.render('employe/attendanceCorrectionHistory', { allAttendance })
})



router.post('/attendanceCorrection', isLoggedIn, async (req, res) => {
    try {
        console.log("requested user:", req.user)
        const { id, reportingManager } = req.user;
        console.log("user id:", id)
        const { attendanceDate, reason, punchIn, punchout } = req.body
        console.log("timee:", punchIn, punchout)
        if (reason === 'forgot checkin') {
            const attendance = new Attendance({
                manager: reportingManager,
                employe: id,
                date: moment(attendanceDate).format('L'),
                checkIn: punchIn,
                reason: reason,
                isCorrection: true,
                status: 'Pending'
            })
            await attendance.save();
            console.log("attendance", attendance)
            return res.redirect('/attendanceCorrectionHistory')

        } else if (reason === 'forgot checkout') {

            const attendance = new Attendance({
                manager: reportingManager,
                employe: id,
                date: moment(attendanceDate).format('L'),
                checkOut: punchout,
                reason: reason,
                isCorrection: true,
                status: 'Pending'
            })
            await attendance.save();
            console.log(attendance)
            return res.redirect('/attendanceCorrectionHistory')

        } else {
            const attendance = new Attendance({
                manager: reportingManager,
                employe: id,
                date: moment(attendanceDate).format('L'),
                checkIn: punchIn,
                checkOut: punchout,
                reason: reason,
                isCorrection: true,
                status: 'Pending'
            })
            await attendance.save();
            console.log(attendance)
            res.redirect('/attendanceCorrectionHistory')
        }

    }
    catch (err) {
        res.send(err)
    }

})

router.post('/checkIn', isLoggedIn, async (req, res) => {

    try {
        const { _id, reportingManager } = req.user;
        const today = await Attendance.find({ employe: _id, date: moment().format('L') })
        if (today.length) {
            const found = 1;
            console.log("Already checked In!!")
            alert("Aready, Checked In!!")
            res.redirect('/home')
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
            res.redirect('/attendance')
        }
    }
    catch (err) {
        res.send(err)
    }

})

router.post('/checkOut', isLoggedIn, async (req, res) => {

    try {
        const { _id } = req.user;
        const findUser = await Attendance.findOne({
            employe: _id,
            date: moment().format('L')
        })
        if (!findUser) {
            console.log("Please checkin!!")
            alert("Please CheckIn,before CheckOut!!")
            return res.redirect('/home')

        } else if (findUser && typeof (findUser.checkOut) !== 'undefined') {
            console.log("Already!! checked Out")
            alert('Already,Checked Out!!')
            return res.redirect('/attendance')

        } else {
            const id = findUser._id;
            const check = await Attendance.findByIdAndUpdate(id, { checkOut: moment().format('LTS') })
            req.flash('success', 'Successfully! Checked Out')
            return res.redirect('/home')
        }
    }
    catch (err) {
        res.send(err)
    }

})


router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/login');
})

module.exports = router;