const AppError = require("../utils/appError");
const Asset = require("../models/premium/globalAssetModel");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const Repository = require("../models/premium/assetRepositoryModel");
const Request = require("../models/premium/requestModel")
const {Promise} = require("mongoose");
const {promisify} = require("util");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const REPOSITORY_LIMIT = 50;

// Route or middleware functions
exports.attachRepository = catchAsync(async function (req, res, next) {
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }
    if (!token)
        return next(new AppError("Please log in", 401));
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    const user = await User.findOne({
        _id: decoded.id,
        $or: [{canSee: {$in: [mongoose.Types.ObjectId(req.params.repositoryId)]}}
            , {canEdit: {$in: [mongoose.Types.ObjectId(req.params.repositoryId)]}}]
    });
    if (!user)
        return next(new AppError("User doesn't exist", 401));
    if (user.changedPasswordAfter(decoded.iat))
        return next(new AppError("Your password has changed. You have to log in again", 401));
    req.user = user;
    res.locals.user = user;
    res.locals.url = req.originalUrl;
    const repository = await Repository.findById(req.params.repositoryId);
    if (repository) {
        req.repository = repository;
        next();
    } else {
        next(new AppError(`Repository with the id ${req.params.repositoryId} either doesn't 
        exist or you don't have the permission to see it`));
    }
});

exports.authorizedEdit = catchAsync(async function (req, res, next) {
    if (req.repository.canEdit.includes(req.user._id))
        next();
    else
        next(new AppError("You are not authorized for this action", 401))
});
exports.authorizedMax = catchAsync(async function (req, res, next) {
    if (req.repository.owner.toString() === req.user._id.toString()) {
        next();
    } else if (!req.repository.limitOthersAuth && req.repository.canEdit.includes(req.user._id))
        next();
    else
        next(new AppError("You are not authorized for this action", 401))
});

exports.authorizedMaxLocals = catchAsync(async function (req, res, next) {
    if (res.locals.authorizedMax)
        next();
    else
        next(new AppError("You are not authorized for this action", 401))
});

exports.isOwner = catchAsync(async function (req, res, next) {
    if (req.repository.owner.toString() === req.user._id.toString())
        next();
    else
        next(new AppError("You are not authorized for this action", 401))
});

exports.deleteRepository = catchAsync(async function (req, res, next) {
    let promises = [];
    req.repository.canSee.map(userId => {
        promises.push(User.findByIdAndUpdate(userId, {"$pull": {"canSee": req.repository._id}}));
    });
    req.repository.canEdit.map(userId => {
        promises.push(User.findByIdAndUpdate(userId, {"$pull": {"canEdit": req.repository._id}}));
    });
    promises.push(User.findByIdAndUpdate(req.repository.owner, {"$pull": {"canEdit": req.repository._id}}));
    await Promise.all(promises);
    await Asset.deleteMany({repos: req.repository._id});
    await req.repository.delete();
    res.status(200).json({message:"success"});
});

exports.show = catchAsync(async function (req, res, next) {
    if (res.locals.user.kind === "Prem") {
        await res.locals.user.populate("canEdit canSee").execPopulate();
        res.status(200).render("repository", {
            title: "repository"
        });
    } else {
        await res.locals.user.populate("canSee").execPopulate();
        res.status(200).render("repository", {
            title: "repository"
        });
    }
});

exports.getData = catchAsync(async function (req, res, next) {
    res.locals.repository = req.repository;
    res.locals.authorizedMax = (req.repository.owner.toString() === req.user._id.toString()
        || !req.repository.limitOthersAuth && req.repository.canEdit.includes(req.user._id));
    await res.locals.repository.populate("canEdit canSee").execPopulate();
    res.locals.owner = await User.findById(res.locals.repository.owner).select("name email");
    if (!res.locals.owner)
        return next(new AppError("This repository is corrupted. Possible reasons: Owner deleted his account or banned", 400));
    const requestsRaw = await Request.find({to: req.repository._id});
    let promises = [];
    requestsRaw.map(request => {
        promises.push(request.populate("from").execPopulate());
    });
    res.locals.requests = await Promise.all(promises);
    res.render("repository_edit", {
        title: "Edit"
    });
});

exports.upgradeToEdit = catchAsync(async function (req, res, next) {
    const exist = req.repository.canSee.includes(req.params.userId);
    if (exist) {
        const user = await User.findById(req.params.userId);
        if (user.kind !== "Prem")
            return next(new AppError("This user cannot be promoted to editer.", 400));
        user.canSee.pull(req.repository._id);
        user.canEdit.push(req.repository._id);
        req.repository.canEdit.push(req.params.userId);
        req.repository.canSee.pull(req.params.userId);
        const pr = req.repository.save();
        const pr2 = user.save({validateModifiedOnly: true});
        await Promise.all([pr, pr2]);
        res.status(200).json({message: "success"});
    } else
        next(new AppError("User doesn't exist", 400));
});
exports.downgradeToView = catchAsync(async function (req, res, next) {
    const exist = req.repository.canEdit.includes(req.params.userId);
    if (exist) {
        const user = await User.findById(req.params.userId);
        req.repository.canSee.push(req.params.userId);
        req.repository.canEdit.pull(req.params.userId);
        user.canEdit.pull(req.params.userId);
        user.canSee.push(req.params.userId);
        const pr = req.repository.save();
        const pr2 = user.save();
        await Promise.all([pr, pr2]);
        res.status(200).json({message: "success"});
    } else
        next(new AppError("User doesn't exist", 400));
});

exports.kickUser = catchAsync(async function (req, res, next) {
    if (req.baseUrl.includes("edit")) {
        req.repository.canEdit.pull(req.params.userId);
    } else {
        req.repository.canSee.pull(req.params.userId);
    }
    await req.repository.save();
    res.status(200).json({message: "success"});
});
exports.makeAdmin = catchAsync(async function (req, res, next) {
    //res.status(501);
    if(!req.repository.canEdit.includes(req.params.userId)){
        return new AppError("This user cannot be upgraded!", 400);
    }
    req.repository.canEdit.push(req.repository.owner);
    req.repository.owner = req.params.userId;
    req.repository.canEdit.pull(req.params.userId);
    await req.repository.save();
    res.status(200).json({message:"success"});
});

// Unused
// exports.getDataLocal = catchAsync(async function (req, res, next) {
//     res.locals.repository = {
//         name: "Local Repository",
//         landCount: req.user.assets.length,
//         canSee: {
//             length: 0
//         },
//         canEdit: {
//             length: 0
//         },
//         owner: req.user._id
//     }
//     res.render("repository_edit", {
//         title: "edit"
//     })
// })

exports.updateSettings = catchAsync(async function (req, res, next) {
    if (req.body.name)
        req.repository.name = req.body.name;
    if (req.body.description)
        req.repository.description = req.body.description;
    if (req.body.privacy)
        req.repository.privacy = req.body.privacy;
    await req.repository.save();
    res.status(200).json({message: "success"});
});
exports.updateHighSettings = catchAsync(async function (req, res, next) {
    if (req.body.auth !== undefined)
        req.repository.limitOthersAuth = !req.body.auth;
    await req.repository.save();
    res.status(200).json({message: "success"});
});

exports.addNewRepository = catchAsync(async function (req, res, next) {
    if(req.user.canEdit.length > REPOSITORY_LIMIT) return next(new AppError("Reached limit", 405));
    const repository = await exports.createRepository({
        name: req.body.name,
        description: req.body.description,
        privacy: req.body.privacy,
        owner: req.user._id
    });
    if (repository) {
        req.user.canEdit.push(repository._id);
        await req.user.save({validateBeforeSave: false});
        res.status(200).json({message: "success"});
    } else {
        next(new AppError("Could not be able to create new repository", 500));
    }
});

exports.leave = catchAsync(async function (req, res, next) {
    if (req.user._id.toString() === req.repository.owner.toString())
        return new AppError("You cannot leave from your own repository.", 400);
    if (req.user.canSee.includes(req.repository._id)) {
        req.user.canSee.pull(req.repository._id);
        req.repository.canSee.pull(req.user._id);
    } else if (req.user.canEdit.includes(req.repository._id)) {
        req.repository.canEdit.pull(req.user._id);
        req.user.canEdit.pull(req.repository._id);
    } else {
        return new AppError("You are not in this repository", 400);
    }
    await Promise.all([req.user.save({validateBeforeSave: false}), req.repository.save({validateBeforeSave: false})])
    res.status(200).json({});
});

// Other functions
exports.createRepository = async function (data) {
    try {
        return await Repository.create(data);
    } catch (e) {
        return undefined;
    }
}
