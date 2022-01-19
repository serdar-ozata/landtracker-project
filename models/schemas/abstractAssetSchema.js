const mongoose = require('mongoose');
const validator = require('validator');

const abstractAssetSchema = new mongoose.Schema({
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
/*abstractAssetSchema.pre("save", function (next) {
    if (this.isModified("name") || this.isNew) {
        this.name = this.name.replace(/ /g,"_");
    }
    next();
});*/
module.exports = abstractAssetSchema;
