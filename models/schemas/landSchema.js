const mongoose = require('mongoose');

const landSchema = new mongoose.Schema({
    usedFor: String
});

module.exports = landSchema;