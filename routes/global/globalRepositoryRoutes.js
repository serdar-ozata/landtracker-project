const express = require('express');
const repositoryController = require("../../controllers/repositoryController");
const landRouter = require("./globalLandRoutes");
const router = express.Router({mergeParams: true});


router.use(repositoryController.attachRepository);

router.route("/permission").get(function (req, res, next) {

}).post(function (req, res, next) {

}).delete(function (req, res, next) {

})

router.use("/lands", landRouter);
module.exports = router;