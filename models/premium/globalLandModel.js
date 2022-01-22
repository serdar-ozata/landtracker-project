const landSchema = require("../schemas/landSchema");
const Asset = require("./globalAssetModel");
const Land = Asset.discriminator("Land", landSchema);


module.exports = Land;
