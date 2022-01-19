const mongoose = require('mongoose');

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
}, {_id: false});

const farmSchema = new mongoose.Schema({
    currentCrop: cropSchema,
    previousCrops: [cropSchema],
});

module.exports = farmSchema;
