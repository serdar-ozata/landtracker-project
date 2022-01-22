const catchAsync = require("../../utils/catchAsync");
const SimpleUser = require("../../models/simpleUserModel");
const AppError = require("../../utils/appError");
const filterObj = require("../../utils/filterObj");

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