const SimpleUser = require("../../models/simpleUserModel")
const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/appError");
const filterObj = require("../../utils/filterObj");
const farmSchema = require("../../models/schemas/farmSchema");
const landSchema = require("../../models/schemas/landSchema");
const realEstateSchema = require("../../models/schemas/realEstateSchema");

// Land functions

exports.addLand = catchAsync(async function (req, res, next) {
    const user = await SimpleUser.findById(req.user.id);
    if (!req.body.kind)
        return next(new AppError("Please select a land type", 400));
    let data = {
        kind: req.body.kind,
        name: req.body.name,
        location: {
            type: req.body.location.type,
            coordinates: req.body.location.coordinates,
            address: req.body.location.address,
            description: req.body.location.description
        },
        value: req.body.value,
        group: req.body.group,
        area: req.body.area
    };
    switch (data.kind) {
        case "FarmLand":
            break;
        case    "Land":
            data.usedFor = req.body.usedFor;
            break;
        case "Real Estate":
            data.floor = req.body.floor;
            data.type = req.body.type;
            break;
        default:
            return next(new AppError("Please select a valid land type", 400));
    }
    user.assets.push(data);
    await user.save({validateModifiedOnly: true});
    res.status(200).json({user});
});
// Internal function
const getLand = async function (req, res, next) {
    const land = await req.user.assets.id(req.params.landId)
    if (!land)
        return next(new AppError("Land couldn't be found", 404));
    return land;
}


exports.showLand = catchAsync(async function (req, res, next) {
    res.status(202).json({land: await getLand(req, res, next)});
});

exports.updateLand = catchAsync(async function (req, res, next) {
    const land = await getLand(req, res, next);
    const filtered = filterObj(req.body, "location", "name", "group", "value", "currency", "area");
    land.update(filtered)
    const nUser =  await req.user.save({validateModifiedOnly:true});
    res.status(200).json({
       user: nUser
    });
});

exports.deleteLand = catchAsync(async function (req, res, next) {
    req.user.assets.pull({_id: req.params.landId})
    await req.user.save({validateModifiedOnly: true});
    res.status(200).json({message: "land is removed"});
});

//Crop Functions
// Current
exports.addCurrentCrop = catchAsync(async function (req, res, next) {
    const land = await getLand(req, res, next);
    if (land.currentCrop)
        return next(new AppError("There is already an crop in the farm", 400));
    req.body.harvestedAt = undefined;
    land.currentCrop = req.body;
    await req.user.save({validateModifiedOnly: true});
    res.status(200).json({land});
});

exports.updateCurrentCrop = catchAsync(async function (req, res, next) {
    await exports.addCurrentCrop(req, res, next);
});

exports.deleteCurrentCrop = catchAsync(async function (req, res, next) {
    const land = await getLand(req, res, next);
    land.currentCrop = undefined;
    await req.user.save({validateModifiedOnly: true});
    res.status(203).json({message: "Deleted"});
});

exports.moveCurrentCrop = catchAsync(async function (req, res, next) {
    const land = await getLand(req, res, next);
    if (req.body.harvestedAt)
        land.currentCrop.harvestedAt = req.body.harvestedAt;
    else
        land.currentCrop.harvestedAt = new Date(Date.now());
    land.previousCrops.push(land.currentCrop);
    land.currentCrop = undefined;
    const user = await req.user.save({validateModifiedOnly: true});
    res.status(200).json({user});
});

// Array
exports.addCrop = catchAsync(async function (req, res, next) {
    const land = await getLand(req, res, next);
    console.log(land);
    land.previousCrops.push(req.body);
    await req.user.save({validateModifiedOnly: true});
    res.status(200).json({land});
});

exports.deleteCrop = catchAsync(async function (req, res, next) {
    const land = await getLand(req, res, next);
    const crop = await land.previousCrops.id(req.params.cropId).remove();
    await req.user.save({validateModifiedOnly: true});
    res.status(203).json({message: "removed"});
});
//TODO
exports.updateCrop = catchAsync(async function (req, res, next) {
    const land = await getLand(req, res, next);
    const crop = await land.previousCrops.id(req.params.cropId);
    if(req.body.cropName)
        crop.cropName = req.body.cropName;
    await req.user.save({validateModifiedOnly: true});
    res.status(201).json({message: "success", crop});
});