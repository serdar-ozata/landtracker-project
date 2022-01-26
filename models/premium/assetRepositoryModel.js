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
    description: {
        type: String,
        maxlength: 100,
        min: 0,
        default: "Not Provided"
    },
    limitOthersAuth: { // limits what people in "canEdit" can do
        type: Boolean,
        default: true
    },
    owner: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: "User"
    },
    canEdit: {
        type: [mongoose.Schema.ObjectId],
        ref: "User"
    },
    canSee: {
        type: [mongoose.Schema.ObjectId],
        ref: "User"
    },
    privacy: {
        type: String,
        enum: ["Private", "Public", "Invite"],
        default: ["Invite"]
    }
})
assetReposSchema.methods.changeLandCount = async function (i) {
    this.landCount = this.landCount + i;
    await this.save();
}

const AssetRepository = mongoose.model("AssetRepository", assetReposSchema);
module.exports = AssetRepository;
