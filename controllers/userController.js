const User = require("../models/userModel")
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const farmSchema = require("../models/schemas/farmSchema");
const landSchema = require("../models/schemas/landSchema");
const realEstateSchema = require("../models/schemas/realEstateSchema");

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
};

exports.updateMe = catchAsync(async function (req, res, next) {
    const filteredBody = filterObj(req.body, "name");

    const user = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true,
        runValidators: true
    });
    if (user)
        res.status(200).json({message: "User's properties have been changed."});
    else
        next(new AppError("Couldn't find the user", 400));
});

exports.addLand = catchAsync(async function (req, res, next) {
    const user = await User.findById(req.user.id);
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
    res.status(202).json({user});
});

exports.addCurrentCrop = catchAsync(async function (req, res, next) {
    const land = await req.user.assets.id(req.params.landId)
    if(land.currentCrop)
        return next(new AppError("There is already an crop in the farm", 400));
    req.body.harvestedAt = undefined;
    land.currentCrop = req.body;
    await req.user.save({validateModifiedOnly: true});
    res.status(200).json({land});
});