const mongoose = require('mongoose');

const realEstateSchema = new mongoose.Schema({
    floor: Number,
    type: {
        type: String,
        maxlength: 20,
        required: true
    }
});


module.exports = realEstateSchema;