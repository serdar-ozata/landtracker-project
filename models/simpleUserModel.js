const User = require("./userModel");
const mongoose = require("mongoose");
const farmSchema = require("./schemas/farmSchema");
const landSchema = require("./schemas/landSchema");
const realEstateSchema = require("./schemas/realEstateSchema");
const abstractAssetSchema = require("./schemas/abstractAssetSchema");
const assetRepositoryModel = require("./premium/assetRepositoryModel");
const simpleUserSchema = new mongoose.Schema({
    assets: {type:[abstractAssetSchema],default: []}
});

simpleUserSchema.path("assets").discriminator("Farm Land", farmSchema);
simpleUserSchema.path("assets").discriminator("Land", landSchema);
simpleUserSchema.path("assets").discriminator("Real Estate", realEstateSchema);
const SimpleUser = User.discriminator("Simple", simpleUserSchema);
module.exports = SimpleUser;