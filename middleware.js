const { request } = require("express");

module.exports.isLoggedIn = (req, res, next) => {

    if (!req.isAuthenticated()) {
        return res.redirect('/login')
    }
    next();

}

module.exports.isAdmin = (req, res, next) => {
    const { role } = req.user
    if (role !== "Admin") {
        return res.redirect('/login')
    }
    next();
}

module.exports.isManager = (req, res, next) => {
    const { role } = req.user;
    if (role !== "Manager") {
        return res.redirect('/login')
    }
    next();
}