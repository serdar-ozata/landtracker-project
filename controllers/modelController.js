const appError = require("../utils/appError");


exports.validateAssetCords = function (next) {
    if (this.location.type !== "Point") return next();
    if (this.location.coordinates.length !== 2) return next(new appError("Point type must have exactly 2 cords", 400));
    for (let i = 0; i < 2; i++) {
        if (this.location.coordinates[i] === null) {
            return next(new appError("Invalid cord", 400));
        }
    }
    next();
}