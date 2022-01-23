const express = require('express');
const router = express.Router({mergeParams: true});
const landRouter = require("./localLandRoutes");

router.use(function (req, res, next) {
    req.isLocal = true;
    next();
})

router.use("/lands", landRouter);


module.exports = router;