const express = require('express');
const repositoryController = require("../../controllers/repositoryController");
const landRouter = require("./globalLandRoutes");
const router = express.Router({mergeParams: true});


router.use(repositoryController.attachRepository);

router.route("/")
    .get(async function (req, res, next) {
        res.status(200).json({
            repository: await req.repository.populate("canEdit canSee owner")
        });
    })
    .delete(repositoryController.isOwner, function (req, res, next) {
        repositoryController.deleteRepository(res, req, next);
    });

router.route("/permission").get(function (req, res, next) {

}).post(function (req, res, next) {

}).delete(function (req, res, next) {

});

router.route("/edit").get(repositoryController.getData)
router.use("/lands", landRouter);
module.exports = router;