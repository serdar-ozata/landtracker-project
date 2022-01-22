const express = require('express');
const simpleUserController = require("../controllers/user/simpleUserController");
const router = express.Router({mergeParams: true});


router.route("/current")
    .post(function (req, res, next) {
        switch (req.user.kind) {
            case "Simple":
                simpleUserController.addCurrentCrop(req, res, next);
                break;
            case "Prem":
                res.status(501).json({
                    message: "Not implemented"
                });
                break;
            default:
                res.status(500).json({
                    message: "Unable to perform any actions for this user type."
                });
                break;
        }
    })
    .patch(function (req, res, next) {
        simpleUserController.updateCurrentCrop(req, res, next);
    })
    .put(function (req, res, next) {
        simpleUserController.moveCurrentCrop(req, res, next);
    })
    .delete(function (req, res, next) {
        simpleUserController.deleteCurrentCrop(req, res, next);
    });


router.route("/")
    .get(function (req, res, next) {
        res.json(200).json({message: "Nothing to see here"});
    })
    .post(function (req, res, next) {
        simpleUserController.addCrop(req, res, next);
    });

router.route("/:cropId")
    .delete(function (req, res, next) {
        simpleUserController.deleteCrop(req, res, next);
    })
    .patch(function (req, res, next) {
        simpleUserController.updateCrop(req, res, next);
    });


module.exports = router;