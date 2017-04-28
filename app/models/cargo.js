var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var cargo = mongoose.Schema({
  especificacao: {type: String, required: true, unique: true},
  nomeFeminino: {type: String, unique: true},
  descricao: String,
  cbo: {type: String, unique: true}
},{
	timestamps: true
});

module.exports = mongoose.model('Cargo', cargo);