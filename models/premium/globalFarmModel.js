const Asset = require("./globalAssetModel");
const mongoose = require("mongoose");

const cropSchema = new mongoose.Schema({
    plantedAt: {
        type: Date,
        required: true,
    },
    harvestedAt: Date,
    cropName: {
        type: String,
        required: true
    },
    cost: Number,
    revenue: Number
});

const Farm = Asset.discriminator("Farm Land", new mongoose.Schema({
    currentCrop: cropSchema,
    previousCrops: [cropSchema],
}));


module.exports = Farm;
