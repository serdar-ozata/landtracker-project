const catchAsync = require("../utils/catchAsync");
const authController = require("./authController");

exports.renderSignup = catchAsync(async function(req,res,next) {
    res.status(200).render("signup", {
        title: res.__("Sign Up")
    });
});

exports.renderLogin = catchAsync(async function(req,res,next){
    if(req.query.tst === "email"){
        res.locals.emailConfirm = true;
    }
    res.status(200).render("login", {
        title: res.__("Login")
    });
});


exports.renderHome = catchAsync(async function(req,res,next){
    res.render('index', {title: 'Land Tracker'});
});

exports.renderForgotPassword = catchAsync(async function(req,res,next){
    res.render("forgotPassword", {title: res.__("Forgot Password")});
});

exports.renderResetPassword = catchAsync(async function(req,res,next){
    const user = await authController.findResetPassword(req);
    if(user)
        res.render("resetPassword", {title: res.__("Reset Password")});
    else
        res.status(404).json({message: "This token is either expired or invalid"});
});