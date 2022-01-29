const express = require('express');
const repositoryController = require("../../controllers/repositoryController");
const requestController = require("../../controllers/requestController");
const landRouter = require("./globalLandRoutes");
const userRepositoryRouter = require("./userRepositoryRoutes");
const {request} = require("express");
const router = express.Router({mergeParams: true});


router.use(repositoryController.attachRepository);
router.use("/user/:userId", userRepositoryRouter)
router.route("/")
    .get(async function (req, res, next) {
        res.status(200).json({
            repository: await req.repository.populate("canEdit canSee owner")
        });
    })
    .delete(repositoryController.isOwner, repositoryController.deleteRepository);

router.route("/permission/:permId")
    .post(repositoryController.authorizedMax, requestController.validateRepository, requestController.accept)
    .delete(repositoryController.authorizedMax, requestController.validateRepository, requestController.reject);

router.route("/edit/auth").patch(repositoryController.isOwner, repositoryController.updateHighSettings)

router.route("/edit")
    .get(repositoryController.getData)
    .patch(repositoryController.authorizedMax, repositoryController.updateSettings)
router.use("/lands", landRouter);
module.exports = router;