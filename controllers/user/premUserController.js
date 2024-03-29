const SimpleUser = require("../../models/simpleUserModel");
const PremUser = require("../../models/premium/premUserModel");
const repositoryController = require("../repositoryController");
const Asset = require("../../models/premium/globalAssetModel");
const Farm = require("../../models/premium/globalFarmModel");
const Land = require("../../models/premium/globalLandModel");
const RealEstate = require("../../models/premium/globalRealEstateModel");
const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/appError");
const userController = require("./userController");
const User = require("../../models/userModel");
exports.upgradeUser = catchAsync(async function (req, res, next) {
    let promises = [];
    const repository = await repositoryController.createRepository({
        owner: req.user._id,
        landCount: req.user.assets.length
    });
    if (!repository)
        return next(new AppError("Unable the create repository, try again later", 500));
    req.user.assets.map(land => { // Error handler is not implemented
        let nLand = userController.createLandData(land, next);
        if (nLand.kind === "Farm Land") {
            nLand.currentCrop = land.currentCrop;
            nLand.previousCrops = land.previousCrops;
        }
        if (!nLand) return; // there are some edge cases unhandled
        promises.push(Asset.create([
            {
                ...nLand,
                repos: repository._id
            }], {}
        ));
    });
    const user = await SimpleUser.findById(req.user._id).select("+password");
    const results = await Promise.all(promises);
    await SimpleUser.findByIdAndDelete(req.user._id);
    const nUser = await PremUser.create([{
        kind: "Prem",
        name: user.name,
        email: user.email,
        password: user.password,
        passwordChangedAt: user.passwordChangedAt,
        passwordResetToken: user.passwordResetToken,
        passwordResetExpires: user.passwordResetExpires,
        canSee: user.canSee,
        canEdit: [repository._id],
        _id: req.user._id,
        activated: true,
    }], {validateBeforeSave: false});
    res.status(201).json({
        results,
        nUser
    });
});

exports.addLand = catchAsync(async function (req, res, next) {
    const data = userController.createLandData(req.body, next);
    // if (!data) return new AppError("No valid data has been sent by user", 400);
    if (!data) return
    data.repos = req.repository._id;
    const land = await Asset.create(data);
    const pr = await req.repository.changeLandCount(1);
    res.status(200).json({message: "Added"});
});

exports.deleteLand = catchAsync(async function (req, res, next) {
    await Asset.findByIdAndDelete(req.params._id);
    await req.repository.changeLandCount(-1);
    res.status(200).json({message: "Deleted"});
});
