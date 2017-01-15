var mongoose = require('mongoose');


module.exports = mongoose.model('User', {
    name : String,
    lastname : String,
    birthdate: Date,
    pis: String,
    rg: String,
    updated: { type: Date, default: Date.now }
});