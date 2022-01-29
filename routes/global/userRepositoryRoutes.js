const express = require("express");
const router = express.Router({mergeParams: true});
const repositoryController = require("../../controllers/repositoryController");

router.use(repositoryController.authorizedMax);
router.route("/edit/admin")
    .post(repositoryController.isOwner, repositoryController.makeAdmin);

router.route("/std")
    .post(repositoryController.upgradeToEdit)
    .delete(repositoryController.kickUser);
router.route("/edit")
    .post(repositoryController.isOwner, repositoryController.downgradeToView)
    .delete(repositoryController.isOwner, repositoryController.kickUser)

module.exports = router;