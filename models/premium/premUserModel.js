const User = require("../userModel");
const mongoose = require("mongoose");
const farmSchema = require("../schemas/farmSchema");
const landSchema = require("../schemas/landSchema");
const realEstateSchema = require("../schemas/realEstateSchema");
const abstractAssetSchema = require("../schemas/abstractAssetSchema");

const premiumUserSchema = new mongoose.Schema({
    canEdit: {
        type: [mongoose.Schema.ObjectId],
        ref: "AssetRepository"
    }
});

const PremiumUser = User.discriminator("Prem", premiumUserSchema);
module.exports = PremiumUser;