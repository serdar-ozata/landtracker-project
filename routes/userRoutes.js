const express = require('express');
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");
const router = express.Router();


router.use(authController.protect);
router.get('/map', function (req, res, next) {
    res.status(201).json({"message": "I've done it!"});
});

router.patch('/updatePassword', function (req, res, next) {
    authController.updatePassword(req, res, next);
});

router.patch('/updateMe', function (req, res, next) {
    userController.updateMe(req, res, next);
});

module.exports = router;
