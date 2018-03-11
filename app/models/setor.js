var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Campi = require('./campi');
var Estado = require('./estado');
var Municipio = require('./municipio');

var setor = mongoose.Schema({
  nome: {type: String, required: true, unique: true},
  descricao: String,
  local: {
	  estado: {type: Schema.Types.ObjectId, ref: 'Estado'},
	  municipio: {type: Schema.Types.ObjectId, ref: 'Municipio'}
  },
  campus: {type: Schema.Types.ObjectId, required: true, ref: 'Campi'}
},{
	timestamps: true
});

module.exports = mongoose.model('Setor', setor);