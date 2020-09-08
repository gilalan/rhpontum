const mongoose = require('mongoose');

const repF = mongoose.Schema({
  serial: {type: String, required: true, unique: true},
  local: String,
  last_processed: String,
  last_date: Date
},{
	timestamps: true
});

module.exports = mongoose.model('Rep', repF);