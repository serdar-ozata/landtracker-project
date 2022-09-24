const catchAsync = require("../../utils/catchAsync");
const User = require("../../models/userModel");
const Asset = require("../../models/premium/globalAssetModel");
const Request = require("../../models/premium/requestModel");
const AppError = require("../../utils/appError");
const filterObj = require("../../utils/filterObj");
const {saveLand} = require("../authController");
const convert = require("convert-units");
const appError = require("../../utils/appError");
exports.updateMe = catchAsync(async function (req, res, next) {
    const filteredBody = filterObj(req.body, "name", "areaUnit", "mZoom", "mLocation");
    console.log(filteredBody);
    const user = await User.findByIdAndUpdate(req.user._id, filteredBody, {
        new: true, runValidators: true
    });
    if (user)
        res.status(200).json({message: "User's properties have been changed."});
    else
        next(new AppError("Couldn't find the user", 400));
});

exports.createLandData = function (land, next) {
    let data = {
        kind: land.kind,
        name: land.name,
        location: {
            type: land.markerType,
            coordinates: land.coordinates,
        },
        address: land.address,
        description: land.description,
        value: land.value,
        group: land.group,
        color: land.color,
    };
    try {
        data.area = convert(land.area).from(land.areaUnit).to("m2");
    } catch (e) {
        next(new AppError("Unit conversion error", 400));
        return undefined;
    }

    switch (data.kind) {
        case "Farm Land":
            if (land.currentCrop) {
                land.currentCrop.harvestedAt = undefined;
                data.currentCrop = land.currentCrop;
            }
            break;
        case "Land":
            data.usedFor = land.usedFor;
            break;
        case "Real Estate":
            data.floor = land.floor;
            data.type = land.type;
            break;
        default:
            next(new AppError("Please select a valid land type", 400));
            return undefined;
    }
    return data;
}

exports.showRepositories = catchAsync(async function (req, res, next) {
    let data = [];
    let user;
    if (req.user.kind === "Simple") {
        data.push({
            id: "local", canEdit: true, name: "Local Repository"
        });
        user = req.user;
    } else if (req.user.kind === "Prem") {
        const user = await req.user.populate({
            path: "canEdit canSee",
        });
        user.canEdit.map(repos => {
            data.push({
                id: repos._id, canEdit: true, name: "Editable Repository"
            });
        });

    } else {
        return next(new AppError("There is something wrong with your data, please contact us to solve it.", 400));
    }
    user.canSee.map(repos => {
        data.push({
            id: repos._id, canEdit: false, name: "Editable Repository"
        });
    });
    res.status(200).json({data});
});

const setLocalLand = async function (req) {
    const land = await req.user.assets.id(req.params.landId)
    if (land) req.land = land;
}

const setGlobalLand = async function (req) {
    const land = await Asset.findById(req.params.landId);
    if (land && land.repos.toString() === req.repository._id.toString()) {
        req.land = land;
    }
};

exports.attachLand = catchAsync(async function (req, res, next) {
    if (req.repository) {
        await setGlobalLand(req);
    } else if (req.user.kind === "Simple") {
        await setLocalLand(req);
    } else {
        return next(new AppError("There is a problem with your data. Please contact us to solve it.", 401));
    }
    if (req.land) next();
    else next(new AppError("Land couldn't be found", 404));
});

exports.showLand = catchAsync(async function (req, res, next) {
    res.render("mapList", {assets: res.land});
});


exports.updateLand = catchAsync(async function (req, res, next) {
    const filtered = filterObj(req.body, "location", "name", "group", "description", "value", "currency",
        "area", "usedFor", "floor", "type", "currentCrop", "mZoom", "mLocation");
    if (filtered.area) {
        filtered.area = convert(filtered.land.area).from(req.land.areaUnit).to("m2");
    }
    Object.keys(filtered).forEach(el => {
        req.land[el] = filtered[el];
    });

    // req.land.update(filtered)
    const land = await saveLand(req, res);
    res.status(200).json({
        land
    });
});

exports.showUserData = catchAsync(async function (req, res, next) {
    res.locals.requests = await Request.find({from: req.user._id}).populate("to");
    res.status(200).render("userSettings", {
        title: "user"
    });
});
