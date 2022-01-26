const express = require('express');
const router = express.Router({mergeParams: true});
const authController = require("../controllers/authController");
const repositoryController = require("../controllers/repositoryController");
const localRouter = require("./local/localRepositoryRoutes");
const globalRouter = require("./global/globalRepositoryRoutes");

router.use(authController.protect);

router.route("/").get(repositoryController.show)
    .post(authController.isPremium, async function (req, res, next) { //Creates a repository
        const repos = await repositoryController.createRepository(req.user._id);
    })
router.use('/local', localRouter);
router.use('/:repositoryId', globalRouter);
module.exports = router;
