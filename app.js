const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');

const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const flash = require('connect-flash')

const User = require('./models/user');

const adminRoutes = require('./routes/admin');
const employeRoutes = require('./routes/employe');
const managerRoutes = require('./routes/manager')

const methodOverride = require('method-override');

mongoose.connect('mongodb://localhost:27017/HRMS', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("MONGOOES CONNECTION OPEN!!")
    })
    .catch(err => {
        console.log("OH NO MONGOOES ERROR")
        console.log(err)
    })

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
const sessionConfig = {
    secret: 'hronesecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))
app.use(flash())
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));


passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use('/assets', express.static('assets'))
app.use((req, res, next) => {
    res.locals.currentuser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.warning = req.flash('warning')
    next();
})
app.use(methodOverride('_method'));
app.use('/', adminRoutes);
app.use('/', employeRoutes);
app.use('/', managerRoutes);




app.listen(3000, () => {
    console.log("APP is listening!!")
})
