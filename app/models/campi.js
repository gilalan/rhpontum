var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Instituicao = require('./instituicao');

//mongoose.connect('mongodb://rhpontumadm:123456789@jello.modulusmongo.net:27017/Ohy3tagi');

var campi = mongoose.Schema({
  nome: {type: String, required: true, unique: true},
  endereco: Schema.Types.Mixed,
  area: Number,
  projetos: Array,
  instituicao: {type: Schema.Types.ObjectId, required: true, ref: 'Instituicao'}
},{
	timestamps: true
});

module.exports = mongoose.model('Campi', campi);