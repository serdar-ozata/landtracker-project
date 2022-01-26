const express = require('express');
const router = express.Router({mergeParams: true});
const landRouter = require("./localLandRoutes");
const repositoryController = require("../../controllers/repositoryController")

router.use(function (req, res, next) {
    req.isLocal = true;
    next();
});

//router.route("/edit").get(repositoryController.getDataLocal)

router.use("/lands", landRouter);


module.exports = router;