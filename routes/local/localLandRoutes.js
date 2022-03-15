const express = require('express');
const userController = require("../../controllers/user/userController");
const simpleUserController = require("../../controllers/user/simpleUserController");
const cropRouter = require("../cropRoutes");
const router = express.Router({mergeParams: true});

router.route("/addLand")
    .get(function (req, res, next) {
        res.json(200).json({message: "Nothing to see here"});
    })
    .post(simpleUserController.addLand);

router.use("/:landId/crop", cropRouter);
router.route("/:landId")
    .get(userController.attachLand, userController.showLand)
    .patch(userController.attachLand, userController.updateLand)
    .delete(simpleUserController.deleteLand);


module.exports = router;
