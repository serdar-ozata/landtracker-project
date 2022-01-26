const catchAsync = require("../../utils/catchAsync");
const SimpleUser = require("../../models/simpleUserModel");
const Asset = require("../../models/premium/globalAssetModel");
const AppError = require("../../utils/appError");
const filterObj = require("../../utils/filterObj");
const {saveLand} = require("../authController");

exports.updateMe = catchAsync(async function (req, res, next) {
    const filteredBody = filterObj(req.body, "name");

    const user = await SimpleUser.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true,
        runValidators: true
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
            type: land.location.type,
            coordinates: land.location.coordinates,
            address: land.location.address,
            description: land.location.description
        },
        value: land.value,
        group: land.group,
        area: land.area
    };
    switch (data.kind) {
        case "Farm Land":
            break;
        case    "Land":
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
            id: "local",
            canEdit: true,
            name: "Local Repository"
        });
        user = req.user;
    } else if (req.user.kind === "Prem") {
        const user = await req.user.populate({
            path: "canEdit canSee",
        });
        user.canEdit.map(repos => {
            data.push({
                id: repos._id,
                canEdit: true,
                name: "Editable Repository"
            });
        });

    } else {
        return next(new AppError("There is something wrong with your data, please contact us to solve it.", 400));
    }
    user.canSee.map(repos => {
        data.push({
            id: repos._id,
            canEdit: false,
            name: "Editable Repository"
        });
    });
    res.status(200).json({data});
});

const setLocalLand = async function (req) {
    const land = await req.user.assets.id(req.params.landId)
    if (land)
        req.land = land;
}

const setGlobalLand = async function (req) {
    const land = await Asset.findById(req.params.landId);
    if (land && land.repos && land.repos === req.repository._id) {
        req.land = land;
    }
};

exports.attachLand = catchAsync(async function (req, res, next) {
    if (req.repository) {
        await setGlobalLand(req);
    } else if (req.user.kind === "Simple") {
        await setLocalLand(req);
    } else {
        return next("There is a problem with your data. Please contact us to solve it.", 401);
    }
    if (req.land) next();
    else next(new AppError("Land couldn't be found", 404));
});

exports.showLand = catchAsync(async function (req, res, next) {
    res.status(200).json({land: req.land});
});

exports.updateLand = catchAsync(async function (req, res, next) {
    const filtered = filterObj(req.body, "location", "name", "group", "value", "currency", "area");
    req.land.update(filtered)
    const land = await saveLand(req, res, next);
    res.status(200).json({
        land
    });
});
