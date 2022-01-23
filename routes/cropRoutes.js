const express = require('express');
const cropController = require("../controllers/cropController");
const userController = require("../controllers/user/userController");
const router = express.Router({mergeParams: true});

router.use(userController.attachLand)

router.route("/current")
    .post(function (req, res, next) {
        cropController.addCurrentCrop(req, res, next);
    })
    .patch(function (req, res, next) {
        cropController.updateCurrentCrop(req, res, next);
    })
    .put(function (req, res, next) {
        cropController.moveCurrentCrop(req, res, next);
    })
    .delete(function (req, res, next) {
        cropController.deleteCurrentCrop(req, res, next);
    });


router.route("/")
    .get(function (req, res, next) {
        res.json(200).json({message: "Nothing to see here"});
    })
    .post(function (req, res, next) {
        cropController.addCrop(req, res, next);
    });

router.route("/:cropId")
    .delete(function (req, res, next) {
        cropController.deleteCrop(req, res, next);
    })
    .patch(function (req, res, next) {
        cropController.updateCrop(req, res, next);
    });


module.exports = router;