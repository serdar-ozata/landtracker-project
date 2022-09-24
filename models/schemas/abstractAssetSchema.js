const mongoose = require('mongoose');
const validator = require('validator');
const modelController = require("../../controllers/modelController");
const abstractAssetSchema = new mongoose.Schema({
        location: {
            type: {
                type: String,
                default: "Point",
                enum: ["Point", "Polygon"]
            },
            coordinates: [Number],
        },
        name: {
            type: String,
            maxlength: 20,
            minlength: 3,
            required: true,
            index: "text"
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
        }
    },
    {discriminatorKey: 'kind'});
/*abstractAssetSchema.pre("save", function (next) {
    if (this.isModified("name") || this.isNew) {
        this.name = this.name.replace(/ /g,"_");
    }
    next();
});*/


abstractAssetSchema.pre("save", modelController.validateAssetCords);
module.exports = abstractAssetSchema;
