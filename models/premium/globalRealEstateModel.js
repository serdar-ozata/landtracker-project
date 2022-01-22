const realEstateSchema = require("../schemas/realEstateSchema");
const Asset = require("./globalAssetModel");
const RealEstate = Asset.discriminator("RealEstate", realEstateSchema);


module.exports = RealEstate;
