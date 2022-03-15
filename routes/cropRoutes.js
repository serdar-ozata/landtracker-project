const express = require('express');
const cropController = require("../controllers/cropController");
const userController = require("../controllers/user/userController");
const router = express.Router({mergeParams: true});

router.use(userController.attachLand)

router.route("/current")
    .post(cropController.addCurrentCrop)
    .patch(cropController.updateCurrentCrop)
    .put(cropController.moveCurrentCrop)
    .delete(cropController.deleteCurrentCrop);


router.route("/")
    .get(function (req, res, next) {
        res.json(200).json({message: "Nothing to see here"});
    })
    .post(cropController.addCrop);

router.route("/:cropId")
    .delete(cropController.deleteCrop)
    .patch(cropController.updateCrop);


module.exports = router;