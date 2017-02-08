var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Campi = require('./campi');
//mongoose.connect('mongodb://rhpontumadm:123456789@jello.modulusmongo.net:27017/Ohy3tagi');

var setor = mongoose.Schema({
  nome: {type: String, required: true, unique: true},
  descricao: String,
  campus: {type: Schema.Types.ObjectId, required: true, ref: 'Campi'}
},{
	timestamps: true
});

module.exports = mongoose.model('Setor', setor);