const mongoose = require('mongoose');
const validator = require('validator');
const farmSchema = require("../schemas/farmSchema");
const landSchema = require("../schemas/landSchema");
const realEstateSchema = require("../schemas/realEstateSchema");
const modelController = require("../../controllers/modelController");

const globalAssetSchema = new mongoose.Schema({
        repos: {
            type: mongoose.Schema.ObjectId,
            required: true,
            index: true,
        },
        location: {
            type: {
                type: String,
                default: "Point",
                enum: ["Point", "Polygon"]
            },
            coordinates: [Number],
        },
        address: {
            type: String,
            maxlength: 100,
            required: true,
        },
        description: {
            type: String,
            maxlength: 100,
        },
        name: {
            type: String,
            required: true,
            index: "text"
        },
        group: {
            type: String,
            default: "None"
        },
        value: {
            type: Number,
            min: 0
        },
        currency: {
            type: String,
            enum: ["CAD", "EUR", "GBP", "JPY", "RMB", "TRY", "USD"],
            default: "USD"
        },
        area: {
            type: Number,
            min: 0
        },
        color: {
            type: String,
            validate: {
                validator: function (el) {
                    return validator.isHexColor(el)
                },
                message: "Invalid Color"
            },
        }
    },
    {discriminatorKey: 'kind'});
globalAssetSchema.pre("save", modelController.validateAssetCords);

module.exports = mongoose.model("Asset", globalAssetSchema);
