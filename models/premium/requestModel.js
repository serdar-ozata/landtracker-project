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
    requestedAt: {
        type: Date,
        default: new Date(Date.now())
    },
    message: {
        type: String,
        maxlength: 50
    }
});

module.exports = mongoose.model("Request", requestSchema);