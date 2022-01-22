const mongoose = require('mongoose');
const validator = require('validator');
const farmSchema = require("../schemas/farmSchema");
const landSchema = require("../schemas/landSchema");
const realEstateSchema = require("../schemas/realEstateSchema");

const globalAssetSchema = new mongoose.Schema({
        repos: {
            type: mongoose.Schema.ObjectId,
            required : true,
            index: true
        } ,
        location: {
            type: {
                type: String,
                default: "Point",
                enum: ["Point", "Polygon"]
            },
            coordinates: [Number],
            address: String,
            description: String
        },
        name: {
            type: String,
            required: true,
            unique: true,
            index: "text"
        },
        group: {
            type: String,
            default: "None"
        },
        value: {
            Number,
            min: 0
        },
        currency: {
            type: String,
            enum: ["Dollar", "Euro", "Turkish Lira"],
            default: "Dollar"
        },
        area: {
            type: Number,
            min: 0
        }
    },
    {discriminatorKey: 'kind'});
module.exports = mongoose.model("Asset", globalAssetSchema);
