var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Funcionario = require('./funcionario');
var Setor = require('./setor');

//mongoose.connect('mongodb://rhpontumadm:123456789@jello.modulusmongo.net:27017/Ohy3tagi');

var equipe = mongoose.Schema({
  nome: {type: String, required: true, unique: true},
  componentes: [{type: Schema.Types.ObjectId, ref: 'Funcionario'}],
  gestor: {type: Schema.Types.ObjectId, required: true, ref: 'Funcionario'},
  setor: {type: Schema.Types.ObjectId, required: true, ref: 'Setor'}
},{
	timestamps: true
});

module.exports = mongoose.model('Equipe', equipe);