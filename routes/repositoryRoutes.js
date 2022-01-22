const express = require('express');
const router = express.Router({mergeParams: true});
const authController = require("../controllers/authController");
const repositoryController = require("../controllers/repositoryController");

router.route("/")
    .get(function (req, res, next) { // sends all repositories that user can see

    })
    .post(authController.isPremium, function (req, res, next) { //Creates a repository

    })
//router.use("/:repositoryId",)
//router.use(, repositoryController.attachRepository);

router.route("/:repositoryId/")
    .get(function (req, res, next) {

    })
    .post(authController.isPremium, function (req, res, next) {

    });


module.exports = router;
