const express = require('express');
const authController = require("../../controllers/authController");
const repositoryController = require("../../controllers/repositoryController");
const userController = require("../../controllers/user/userController");
const premiumController = require("../../controllers/user/premUserController");
const cropRouter = require("../cropRoutes");
const router = express.Router({mergeParams: true});


router.route("/")
    .post(repositoryController.authorizedEdit, premiumController.addLand);

router.use("/:landId/crop", cropRouter);
//router.route("/list").get(repositoryController.renderLandList);
router.route("/:landId")
    .get(userController.attachLand, userController.showLand)
    .patch(repositoryController.authorizedEdit, userController.attachLand, userController.updateLand)
    .delete(repositoryController.authorizedEdit, premiumController.deleteLand);


module.exports = router;