const AppError = require("../utils/appError");
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

//Land functions

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
