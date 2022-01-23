const mongoose = require("mongoose");
const farmSchema = require("../schemas/farmSchema");
const landSchema = require("../schemas/landSchema");
const realEstateSchema = require("../schemas/realEstateSchema");
const abstractAssetSchema = require("../schemas/abstractAssetSchema");


const assetReposSchema = new mongoose.Schema({
    landCount: {
        type: "Number",
        default: 0
    },
    name: {
        type: String,
        maxlength: 20,
        min: 1,
        default: "Public Repository"
    },
    limitOthersAuth: { // limits what people in "canEdit" can do
      type: Boolean,
      default: true
    },
    owner: {
        type: mongoose.Schema.ObjectId,
        required: true
    },
    canEdit: {
        type: [mongoose.Schema.ObjectId],
        ref: "User"
    },
    canSee: {
        type: [mongoose.Schema.ObjectId],
        ref: "User"
    }
})

const AssetRepository = mongoose.model("AssetRepository", assetReposSchema);
module.exports = AssetRepository;
