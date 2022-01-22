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


// Other functions
exports.createRepository = catchAsync(async function (ownerId) {
    const repos = await Repository.create({
        owner: ownerId
    });
    console.log(repos)
    return repos;
});
