const User = require("../userModel");
const mongoose = require("mongoose");
const farmSchema = require("../schemas/farmSchema");
const landSchema = require("../schemas/landSchema");
const realEstateSchema = require("../schemas/realEstateSchema");
const abstractAssetSchema = require("../schemas/abstractAssetSchema");
const AppError = require("../../utils/appError");


const premiumUserSchema = new mongoose.Schema({
    canEdit: {
        type: [mongoose.Schema.ObjectId],
        ref: "AssetRepository",
    }
});

// premiumUserSchema.pre("findOneAndUpdate", function (next) {
//    if(this.canEdit.length < REPOSITORY_LIMIT){
//        next();
//    } else {
//        next(new AppError("Reached limit", 405));
//    }
// });

const PremiumUser = User.discriminator("Prem", premiumUserSchema);
module.exports = PremiumUser;