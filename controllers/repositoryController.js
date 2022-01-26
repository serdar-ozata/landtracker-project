const AppError = require("../utils/appError");
const Asset = require("../models/premium/globalAssetModel");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const Repository = require("../models/premium/assetRepositoryModel");

// Route or middleware functions
exports.attachRepository = catchAsync(async function (req, res, next) {
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
    if (req.repository.owner === req.user._id) {
        next();
    } else if (req.repository.limitOthersAuth && req.repository.canEdit.includes(req.user._id))
        next();
    else
        next(new AppError("You are not authorized for this action", 401))
});

exports.isOwner = catchAsync(async function (req, res, next) {
    if (req.repository.owner === req.user._id)
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
});

exports.show = catchAsync(async function (req, res, next) {
    if (res.locals.user.kind === "Prem") {
        await res.locals.user.populate("canEdit canSee").execPopulate();
        res.status(200).render("repository", {
            title: "repository"
        });
    } else {
        await res.locals.user.populate("canSee");
        res.status(200).render("repository", {
            title: "repository"
        });
    }
});

exports.getData = catchAsync(async function (req, res, next) {
    res.locals.repository = req.repository;
    await res.locals.repository.populate("canEdit canSee").execPopulate();
    res.locals.owner = await User.findById(res.locals.repository.owner).select("name email");
    if(!res.locals.owner)
        return next(new AppError("This repository is corrupted. Possible reasons: Owner deleted his account or is banned", 400))
    res.render("repository_edit", {
        title: "edit"
    })
});

// Unused
exports.getDataLocal = catchAsync(async function (req, res, next) {
    res.locals.repository = {
        name: "Local Repository",
        landCount: req.user.assets.length,
        canSee: {
            length: 0
        },
        canEdit: {
            length: 0
        },
        owner: req.user._id
    }
    res.render("repository_edit", {
        title: "edit"
    })
})

// Other functions
exports.createRepository = async function (ownerId) {
    try {
        return await Repository.create({
            owner: ownerId
        });
    } catch (e) {
        return undefined;
    }
}
