const jwt = require('jsonwebtoken');
const {json} = require("express");
const {promisify} = require("util");
const crypto = require("crypto");

const User = require("../models/userModel")
const SimpleUser = require("../models/simpleUserModel")
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const Email = require("../utils/mail");

//Inner functions
exports.findResetPassword = async function (req) {
    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
    return User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: {$gt: Date.now()}
    });
}

const signToken = id => {
    return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

const createAndSendToken = function (status, statusCode, user, res, showUser) {
    const token = signToken(user._id);
    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 1000 * 60),
        secure: process.env.NODE_ENV === "production",
        httpOnly: true
    };
    res.cookie("jwt", token, cookieOptions);
    if (showUser)
        res.status(statusCode).json({status, user, token});
    else
        res.status(statusCode).json({status, user, token});
}

//Middlewares

exports.isPremium = function (req, res, next) {
    if (req.user.kind === "Prem")
        next()
    else
        next(new AppError("You are not authorized for this action", 401));
}

exports.logout = function (req, res, next) {
    res.cookie("jwt", "loggedOut", {
        expires: new Date(Date.now() + 100),
        httpOnly: true
    })
    res.status(200).json({message: "logged out"});
}

exports.signup = catchAsync(async function (req, res, next) {

    const newUser = await User.create({
        kind: "Simple",
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm
    });
    const mail = new Email(newUser);
    const token = await newUser.createConfirmationToken();
    const confirmURL = `${req.protocol}://${req.get("host")}/confirm/${token}`;
    mail.sendText(res.__mf("Hey {name}! Use the link below to let us confirm your email address:\n{confirmURL}"),
        {name:newUser.name, confirmURL});
    newUser.save({validateBeforeSave: false});
    res.status(201).json({message: "You're signed up!"});
    //createAndSendToken("You're signed up!", 201, newUser, res, true);
});

exports.login = catchAsync(async (req, res, next) => {
    const {email, password} = req.body;


    if (!email || !password) {
        return next(new AppError('Please provide email and password!', 400));
    }

    const user = await User.findOne({email}).select('+password');
    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('EorP', 401));
    }
    if (user.activated === false)
        return next(new AppError("AcErr", 405));
    createAndSendToken("success", 200, user, res, false);
});

exports.isLoggedIn = catchAsync(async function (req, res, next) {
    const result = await checkToken(req);
    if (result instanceof User) {
        res.status(200).json({m: "success"});
    } else
        res.status(401).json({m: "fail"});
});


exports.protect = catchAsync(async (req, res, next) => {
    const result = await checkToken(req);
    if (result instanceof AppError)
        next(result)
    else if (result instanceof User) {
        req.user = result;
        res.locals.user = result;
        res.locals.url = req.originalUrl;
        next();
    } else
        next(new AppError("There is a problem with your session please login again", 401));
});

const checkToken = (async function (req) {
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
        return new AppError("Please log in", 401);
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user)
        return new AppError("User doesn't exist", 401);
    if (user.changedPasswordAfter(decoded.iat))
        return new AppError("Your password has changed. You have to log in again", 401);
    return user;
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
    if (!req.body.email) return next(new AppError(`Please enter an email`, 400));
    const user = await User.findOne({email: req.body.email});
    if (!user) return next(new AppError(`There is no email named ${req.body.email} in the server`, 404));
    if (user.passwordResetToken && Date.now() < user.passwordResetExpires) {
        return next(new AppError("AlSent", 405));
    }

    const token = await user.createPasswordResetToken();
    await user.save({validateBeforeSave: false});

    const resetURL = `${req.protocol}://${req.get("host")}/resetPassword/${token}`;
    const message = res.__("Hey looks like you forgot your password! Use the address below to reset your password. If you didn't forget" +
        " your password, please ignore this email.\n") +
        resetURL;
    res.status(200).json({status: "success", message: "token sent", token});
    try {
        const mail = new Email(user);
        await mail.sendText(message, "Password Reset");
    } catch (e) {
        user.passwordResetExpires = undefined;
        user.passwordResetToken = undefined;
        console.log(e);
        await user.save({validateBeforeSave: false});
        //return next(new AppError("Couldn't send the email. Try again some other time.", 500));
    }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
    const user = await exports.findResetPassword(req);

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
        return next(new AppError("Incorrect password", 401));
    }
});

exports.saveLand = async function (req, res, next) {
    if (req.isLocal)
        req.user.save({validateModifiedOnly: true});
    else
        req.land.save({validateModifiedOnly: true});
}

exports.confirmEmail = catchAsync(async function (req, res, next) {
    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
    const user = await User.findOneAndUpdate({confirmToken: hashedToken},
        {$unset: {confirmToken: 1}, activated: true});
    if (user) {
        res.redirect(308, "/login?tst=email");
    } else
        next(new AppError("Invalid token", 400));
});
