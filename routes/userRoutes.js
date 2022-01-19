const express = require('express');
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");
const path = require("path");
const router = express.Router();


router.use(authController.protect);
router.get('/map', function (req, res, next) {
    res.status(201).sendFile(path.resolve(__dirname + '/../public/map.html'))
});

router.patch('/updatePassword', function (req, res, next) {
    authController.updatePassword(req, res, next);
});

router.patch('/updateMe', function (req, res, next) {
    userController.updateMe(req, res, next);
});

module.exports = router;
