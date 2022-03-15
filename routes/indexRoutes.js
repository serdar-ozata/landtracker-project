const express = require('express');
const router = express.Router();
const path = require("path");
const authController = require("../controllers/authController");
const indexController = require("../controllers/indexController");
/* GET home page. */

router.post('/signupJSON', authController.signup);

router.route("/signup")
    .get(indexController.renderSignup)
    .post(authController.signup);

router.route("/login")
    .post(authController.login)
    .get(indexController.renderLogin);

router.post("/logout", authController.logout)
router.get("/static/js/:name", function (req, res, next) {
    res.sendFile(path.resolve(__dirname + `/../public/static/js/${req.params.name}`));
});

router.get("/svgl/:name", function (req, res, next) {
    res.sendFile(path.resolve(__dirname + `/../public/svg/l/${req.params.name}`));
})
router.get("/svg/:name", function (req, res, next) {
    res.sendFile(path.resolve(__dirname + `/../public/svg/${req.params.name}`));
})
router.get("/bundle.js.map", function (req, res, next) {
    res.sendFile(path.resolve(__dirname + `/../public/javascripts/bundle.js.map`));
})
router.get("/static/css/:name", function (req, res, next) {
    res.sendFile(path.resolve(__dirname + `/../public/static/css/${req.params.name}`));
})
router.get("/images/:name", function (req, res, next) {
    res.sendFile(path.resolve(__dirname + `/../public/images/${req.params.name}`));
})
router.get("/css/:name", function (req, res, next) {
    res.sendFile(path.resolve(__dirname + `/../public/stylesheets/${req.params.name}`));
});
router.get("/js/:name", function (req, res, next) {
    res.sendFile(path.resolve(__dirname + `/../public/javascripts/${req.params.name}`));
})
router.route("/confirm/:token")
    .get(authController.confirmEmail);

router.route('/forgotPassword')
    .get(indexController.renderForgotPassword)
    .post(authController.forgotPassword);

router.route("/resetPassword/:token")
    .get(indexController.renderResetPassword)
    .patch(authController.resetPassword);

router.get("/loggedIn", authController.isLoggedIn);

router.get('/', indexController.renderHome);

module.exports = router;
