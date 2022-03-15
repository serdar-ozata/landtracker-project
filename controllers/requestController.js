const catchAsync = require("../utils/catchAsync");
const Request = require("../models/premium/requestModel");
const Repository = require("../models/premium/assetRepositoryModel");
const User = require("../models/userModel");
const AppError = require("../utils/appError");
const {request} = require("express");
const {Promise} = require("mongoose");

const SEE_LIMIT = 4;

//User functions
exports.delete = catchAsync(async function (req, res, next) {
    await req.request.delete();
    res.status(200).json({message: "deleted"});
});

exports.validateUser = catchAsync(async function (req, res, next) {
    req.request = await Request.findById(req.params.permId);
    if (!req.request)
        return next(new AppError("Request is either deleted or you don't have access to it"), 401);
    if (req.request.from.toString() === req.user._id.toString())
        next();
    else
        next(new AppError("You are unauthorized for this action"), 401);
});

exports.send = catchAsync(async function (req, res, next) {
    if(req.user.canSee > SEE_LIMIT) return next(new AppError("Reached limit", 405));
    const result = await req.user.sendRequest(req.params.repoId, req.body.message);
    if (result === "pending")
        res.status(200).json({message: "Sent"})
    else if (result === "accepted")
        res.status(200).json({message: "Accepted"})
    else
        next(result);
});

// Repository functions
exports.reject = catchAsync(async function (req, res, next) {
    await req.request.delete();
    res.status(200).json({message: "deleted"});
});

exports.validateRepository = catchAsync(async function (req, res, next) {
    req.request = await Request.findById(req.params.permId);
    if (!req.request)
        next(new AppError("Request is either deleted or you don't have access to it", 401));
    if (req.request.to.toString() === req.repository._id.toString())
        next();
    else
        next(new AppError("You are unauthorized for this action", 401));
});

exports.accept = catchAsync(async function (req, res, next) {
    const user = await User.findById(req.request.from);
    if (user) {
        req.repository.canSee.push(user._id);
        user.canSee.push(req.request.to);
        const pr = user.save({validateModifiedOnly: true});
        const pr2 = req.repository.save({validateModifiedOnly: true});
        const pr3 = req.request.delete();
        await Promise.all([pr, pr2, pr3]);
        res.status(200).json({
            message: "accepted",
            user
        })
    } else {
        next(new AppError("This user no longer exists!", 400));
    }
});

