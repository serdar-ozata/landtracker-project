const Asset = require("./globalAssetModel");
const mongoose = require("mongoose");
const Land = Asset.discriminator("Land", new mongoose.Schema({
    usedFor: String
}));


module.exports = Land;
