const jwt = require('jsonwebtoken');
const {json} = require("express");
const {promisify} = require("util");
const crypto = require("crypto");

const User = require("../models/userModel")
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const sendEmail = require("../utils/mail");

const signToken = id => {
    return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

const createAndSendToken = function (status, statusCode, user, res, showUser) {
    const token = signToken(user._id);
    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 1000 * 60),
        secure: process.env.NODE_ENV !== "production",
        httpOnly: true
    };
    res.cookie("jwt", token, cookieOptions);
    if (showUser)
        res.status(statusCode).json({status, user, token});
    else
        res.status(statusCode).json({status, user, token});
}

exports.signup = catchAsync(async function (req, res, next) {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm
    });
    const token = signToken(newUser._id);
    createAndSendToken("You're signed up!", 201, newUser, res, true);
});

exports.login = catchAsync(async (req, res, next) => {
    const {email, password} = req.body;

    // 1) Check if email and password exist
    if (!email || !password) {
        return next(new AppError('Please provide email and password!', 400));
    }
    // 2) Check if user exists && password is correct
    const user = await User.findOne({email}).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect email or password', 401));
    };
    // 3) If everything ok, send token to client
    createAndSendToken("You're logged in", 200, user, res, false);
    //const token = signToken(user._id);
    //const cookieOptions = {
        // expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 1000 * 60),
        // secure: process.env.NODE_ENV !== "production",
        //    httpOnly: true
    //};


});

exports.protect = catchAsync(async (req, res, next) => {
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
    const user = await User.findById(decoded.id);
    if (!user)
        return next(new AppError("User doesn't exist", 401));
    //Console log !
    console.log(decoded.iat);
    if (user.changedPasswordAfter(decoded.iat))
        return next(new AppError("Your password has changed. You have to log in again", 401));
    req.user = user;
    next();
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
    if (!req.body.email) return next(new AppError(`Please enter an email`), 400);
    const user = await User.findOne({email: req.body.email});
    if (!user) return next(new AppError(`There is no email named ${req.body.email} in the server`));
    const token = await user.createPasswordResetToken();
    await user.save({validateBeforeSave: false});

    const resetURL = `${req.protocol}://${req.get("host")}/resetPassword/${token}`;
    const message = "Hey looks like you forgot your password! Use the address below to reset your password. If you didn't forget" +
        " your password, please ignore this email.\n" +
        resetURL;
    try {
        await sendEmail({
            email: user.email,
            subject: "Password reset (valid for 10 min)",
            text: message
        });
    } catch (e) {
        user.passwordResetExpires = undefined;
        user.passwordResetToken = undefined;
        await user.save({validateBeforeSave: false});
        return next(new AppError("Couldn't send the email. Try again some other time.", 500));
    }
    res.status(200).json({status: "success", message: "token sent", token});
});
exports.resetPassword = catchAsync(async (req, res, next) => {
    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: {$gt: Date.now()}
    });
    if (!user)
        return next(new AppError("This token is invalid for you to reset your password", 400));
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    res.status(200).json({status: "success", message: "Your password has been successfully changed"});
});

exports.updatePassword = catchAsync(async function (req, res, next) {
    const user = await User.findById(req.user.id).select("+password");
    if (req.body.oldPassword && await req.user.correctPassword(req.body.oldPassword, user.password)) {
        user.password = req.body.password;
        user.passwordConfirm = req.body.passwordConfirm;
        await user.save();
        createAndSendToken("Your password has been successfully changed", 200, user, res, false);
    } else {
        return next(new AppError("Incorrect password, please try again.", 400));
    }
});