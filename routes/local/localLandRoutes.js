const express = require('express');
const userController = require("../../controllers/user/userController");
const simpleUserController = require("../../controllers/user/simpleUserController");
const cropRouter = require("../cropRoutes");
const router = express.Router({mergeParams: true});

router.route("/addLand")
    .get(function (req, res, next) {
        res.json(200).json({message: "Nothing to see here"});
    })
    .post(function (req, res, next) {
        simpleUserController.addLand(req, res, next);
    });

router.use("/:landId/crop", cropRouter);
router.route("/:landId")
    .get(userController.attachLand, function (req, res, next) {
        userController.showLand(req, res, next);
    })
    .patch(userController.attachLand, function (req, res, next) {
        userController.updateLand(req, res, next);
    })
    .delete(function (req, res, next) {
        simpleUserController.deleteLand(req, res, next);
    });


module.exports = router;
