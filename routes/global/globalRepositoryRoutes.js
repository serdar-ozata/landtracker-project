const express = require('express');
const repositoryController = require("../../controllers/repositoryController");
const requestController = require("../../controllers/requestController");
const landRouter = require("./globalLandRoutes");
const userRepositoryRouter = require("./userRepositoryRoutes");
const router = express.Router({mergeParams: true});


router.use(repositoryController.attachRepository);
router.use("/user/:userId", userRepositoryRouter)
// router.route("/")
//     .get(async function (req, res, next) {
//         res.status(200).json({
//             repository: await req.repository.populate("canEdit canSee owner")
//         });
//     })
//     .delete(repositoryController.leave);

router.route("/permission/:permId")
    .post(repositoryController.authorizedMax, requestController.validateRepository, requestController.accept)
    .delete(repositoryController.authorizedMax, requestController.validateRepository, requestController.reject);

router.route("/edit/auth")
    .patch(repositoryController.isOwner, repositoryController.updateHighSettings)
    .delete(repositoryController.isOwner, repositoryController.deleteRepository)

router.route("/edit")
    .get(repositoryController.getRepositoryData)
    .patch(repositoryController.authorizedMax, repositoryController.updateSettings)

router.use("/lands", landRouter);

router.use(repositoryController.attachBaseUrl);

router.route("/map")
    .get(repositoryController.attachGlobalLands, repositoryController.convertUnits, repositoryController.renderMap);

router.route("/")
    .get(repositoryController.attachGlobalLands, repositoryController.convertUnits, repositoryController.renderLandList)
    .delete(repositoryController.leave);

module.exports = router;