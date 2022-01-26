const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema({
    from: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: "User"
    },
    to: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: "AssetRepository"
    },
    requestedAt: Date
});