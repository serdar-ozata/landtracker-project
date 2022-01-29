const express = require('express');
const router = express.Router({mergeParams: true});
const authController = require("../controllers/authController");
const repositoryController = require("../controllers/repositoryController");
const localRouter = require("./local/localRepositoryRoutes");
const globalRouter = require("./global/globalRepositoryRoutes");


router.route("/")
    .get(authController.protect, repositoryController.show)
    .post(authController.protect, authController.isPremium, repositoryController.addNewRepository)
router.use('/local', localRouter);
router.use('/:repositoryId', globalRouter);
module.exports = router;
