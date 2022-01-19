const express = require('express');
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");
const router = express.Router();

router.use(authController.protect);

router.route("/addLand").get(function (req,res,next) {
    res.json(200).json({message: "Nothing to see here"});
}).post(function (req,res,next){
    userController.addLand(req,res,next);
});

router.route("/:landId/addCrop").get(function (req,res,next) {
    res.json(200).json({message: "Nothing to see here"});
}).post(function (req,res,next){
    userController.addCurrentCrop(req,res,next);
});



module.exports = router;
