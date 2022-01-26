const express = require('express');
const router = express.Router();
const path = require("path");
const authController = require("../controllers/authController");
/* GET home page. */

router.post('/signup', function (req, res, next) {
    authController.signup(req, res, next);
});

router.route("/login")
    .post(authController.login)
    .get(function (req, res, next) {
        res.status(200).render("login", {
            title: "Login"
        });
    });
router.get("/logout", authController.logout)
router.get("/static/js/:name", function (req, res, next) {
    res.sendFile(path.resolve(__dirname + `/../public/static/js/${req.params.name}`));
});

router.get("/svgl/:name", function (req, res, next) {
    console.log("here worked")
    res.sendFile(path.resolve(__dirname + `/../public/svg/l/${req.params.name}`));
})
router.get("/svg/:name", function (req, res, next) {
    res.sendFile(path.resolve(__dirname + `/../public/svg/${req.params.name}`));
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
router.route('/forgotPassword')
    .get(function (req, res, next) {
        res.status(203).json({message: "Not implemented"});
    })
    .post(function (req, res, next) {
        authController.forgotPassword(req, res, next);
    });
router.patch("/resetPassword/:token", function (req, res, next) {
    authController.resetPassword(req, res, next);
});
router.get("/loggedIn", authController.isLoggedIn);
router.get('/', function (req, res, next) {
    res.render('index', {title: 'LandTracker'});
});

router.get("/test", function (req, res, next) {
    res.status(200).render("index", {
        title: "Main Page",
        url: req.url
    });
});
module.exports = router;
