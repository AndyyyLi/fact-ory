const mongoose = require('mongoose');

const factSchema = new mongoose.Schema({
    key: Number,
    fact: String,
    views: Number,
    likes: Number
});

module.exports = mongoose.model('Fact', factSchema);