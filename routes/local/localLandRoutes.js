const express = require('express');
const authController = require("../../controllers/authController");
const userController = require("../../controllers/user/simpleUserController");
const cropRouter = require("../cropRoutes");
const router = express.Router({mergeParams: true});

router.route("/addLand")
    .get(function (req, res, next) {
        res.json(200).json({message: "Nothing to see here"});
    })
    .post(function (req, res, next) {
        userController.addLand(req, res, next);
    });

router.use("/:landId/crop", cropRouter);
router.route("/:landId")
    .get(function (req, res, next) {
        userController.showLand(req, res, next);
    })
    .patch(function (req, res, next) {
        userController.updateLand(req, res, next);
    })
    .delete(function (req, res, next) {
        userController.deleteLand(req, res, next);
    });


module.exports = router;
