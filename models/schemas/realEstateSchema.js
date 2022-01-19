const mongoose = require('mongoose');

const realEstateSchema = new mongoose.Schema({
    area: Number,
    floor: Number,
    type: String
});


module.exports = realEstateSchema;