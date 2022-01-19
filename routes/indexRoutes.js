const express = require('express');
const router = express.Router();
const path = require("path");
const authController = require("../controllers/authController");
/* GET home page. */

router.post('/signup', function (req, res, next) {
    authController.signup(req, res, next);
});

router.post('/login', function (req, res, next) {
    authController.login(req, res, next);
});
router.route('/forgotPassword')
    .get(function (req, res, next) {
        res.status(203).json({message: "Not implemented"});
    })
    .post(function (req, res, next) {
        authController.forgotPassword(req, res, next);
    });
router.patch("/resetPassword/:token", function (req,res,next) {
    authController.resetPassword(req,res,next);
});
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Express'});
});

module.exports = router;
