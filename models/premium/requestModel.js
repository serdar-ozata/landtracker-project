const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema({
    from: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: "User",
        index: true
    },
    to: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: "AssetRepository",
        index: true
    },
    requestedAt: Date
});

module.exports = mongoose.model("Request", requestSchema);