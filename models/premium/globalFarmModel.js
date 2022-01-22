const farmSchema = require("../schemas/farmSchema");
const Asset = require("./globalAssetModel");
const Farm = Asset.discriminator("Farm", farmSchema);


module.exports = Farm;
