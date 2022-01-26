const express = require('express');
const authController = require("../../controllers/authController");
const repositoryController = require("../../controllers/repositoryController");
const userController = require("../../controllers/user/userController");
const premiumController = require("../../controllers/user/premUserController");
const cropRouter = require("../cropRoutes");
const router = express.Router({mergeParams: true});


router.route("/addLand")
    .get(function (req, res, next) {
        res.json(200).json({message: "Nothing to see here"});
    })
    .post(repositoryController.authorizedEdit, function (req, res, next) {
        premiumController.addLand(req, res, next);
    });

router.use("/:landId/crop", cropRouter);
router.route("/:landId")
    .get(userController.attachLand, function (req, res, next) {
        userController.showLand(req, res, next);
    })
    .patch(repositoryController.authorizedEdit, userController.attachLand, function (req, res, next) {
        userController.updateLand(req, res, next);
    })
    .delete(repositoryController.authorizedEdit, function (req, res, next) {
        premiumController.deleteLand(req, res, next);
    });


module.exports = router;