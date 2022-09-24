const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const authController = require("./authController");
exports.addCurrentCrop = catchAsync(async function (req, res, next) {
    if (req.land.currentCrop)
        return next(new AppError("There is already an crop in the farm", 400));
    req.body.harvestedAt = undefined;
    req.land.currentCrop = req.body;
    await authController.saveLand(req, res);
    res.status(200).json(req.land);
});
// Not used since not implemented for now
exports.updateCurrentCrop = catchAsync(async function (req, res, next) {
    await exports.addCurrentCrop(req, res, next);
});

exports.deleteCurrentCrop = catchAsync(async function (req, res, next) {
    req.land.currentCrop = undefined;
    await authController.saveLand(req, res);
    res.status(203).json({message: "Deleted"});
});

exports.moveCurrentCrop = catchAsync(async function (req, res, next) {
    if(!req.land.currentCrop)
        return next(new AppError("No crop is planted at the moment", 400));
    if (req.body.harvestedAt)
        req.land.currentCrop.harvestedAt = req.body.harvestedAt;
    else
        req.land.currentCrop.harvestedAt = new Date(Date.now());
    req.land.previousCrops.push(req.land.currentCrop);
    req.land.currentCrop = undefined;
    await authController.saveLand(req, res);
    res.status(200).json({land: req.land});
});

// Array
exports.addCrop = catchAsync(async function (req, res, next) {
    console.log(req.body);
    req.land.previousCrops.push(req.body);
    await authController.saveLand(req, res);
    res.status(200).json({land: req.land});
});

exports.deleteCrop = catchAsync(async function (req, res, next) {
    const crop = await req.land.previousCrops.id(req.params.cropId).remove();
    await authController.saveLand(req, res);
    res.status(203).json({message: "removed"});
});
//TODO
exports.updateCrop = catchAsync(async function (req, res, next) {
    const crop = await req.land.previousCrops.id(req.params.cropId);
    if (req.body.cropName)
        crop.cropName = req.body.cropName;
    await authController.saveLand(req, res);
    res.status(201).json({message: "success", crop});
});