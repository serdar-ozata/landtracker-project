const User = require("../../models/userModel")
const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/appError");
const filterObj = require("../../utils/filterObj");
const farmSchema = require("../../models/schemas/farmSchema");
const landSchema = require("../../models/schemas/landSchema");
const realEstateSchema = require("../../models/schemas/realEstateSchema");
const userController = require("./userController");
const authController = require("../authController");

// Land functions

exports.addLand = catchAsync(async function (req, res, next) {
    const user = await User.findById(req.user.id);
    if (!req.body.kind)
        return next(new AppError("Please select a land type", 400));
    const data = userController.createLandData(req.body, next);
    if (!data) return;
    user.assets.push(data);
    await user.save({validateModifiedOnly: true});
    res.status(200).json({user});
});
// Internal function
// const getLand = async function (req, res, next) {
//     const land = await req.user.assets.id(req.params.landId)
//     if (!land)
//         return next(new AppError("Land couldn't be found", 404));
//     return land;
// }

exports.deleteLand = catchAsync(async function (req, res, next) {
    req.user.assets.pull({_id: req.params.landId})
    await req.user.save({validateModifiedOnly: true});
    res.status(200).json({message: "land is removed"});
});

