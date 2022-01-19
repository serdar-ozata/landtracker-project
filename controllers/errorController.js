const AppError = require("../utils/appError");
function handleCastErrorDB(error) {
    console.log(error);
    return new AppError(error._message ,400);
}

function handleDuplicateErrorDB(error) {
    if(error.keyPattern["email"])
        return new AppError("This email is already taken",400);
    return new AppError("Bad Request",400);
}

function handleJsonWebTokenError(error) {
    return new AppError("Invalid token. Please log in again.",401);
}

function handleTokenExpiredError(error) {
    return new AppError("Your session has expired. Please log in again.", 401);
}

module.exports =  function (err, req, res, next) {
    // set locals, only providing error in development
    //res.locals.message = err.message;
    //res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";

    if(err._message && err._message === "User validation failed") err = handleCastErrorDB(err);
    else if(err.code === 11000) err = handleDuplicateErrorDB(err);
    if(err.name === "JsonWebTokenError") err = handleJsonWebTokenError(err);
    if(err.name === "TokenExpiredError") err = handleTokenExpiredError(err);
    if(err.isOperational)
        res.status(err.statusCode).json({status: err.status, message: err.message});
    else{
        console.log(err);
        res.status(505).json({status:"error",message: "unknown server  error"});
    }
}


