const Asset = require("./globalAssetModel");
const mongoose = require("mongoose");
const RealEstate = Asset.discriminator("Real Estate", new mongoose.Schema({
    area: Number,
    floor: Number,
    type: String
}));


module.exports = RealEstate;
