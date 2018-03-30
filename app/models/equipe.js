var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Funcionario = require('./funcionario');
var Setor = require('./setor');


var equipe = mongoose.Schema({
  nome: {type: String, required: true, unique: true},
  gestor: {type: Schema.Types.ObjectId, required: true, ref: 'Funcionario'},
  fiscal: {type: Schema.Types.ObjectId, required: true, ref: 'Funcionario'},
  setor: {type: Schema.Types.ObjectId, required: true, ref: 'Setor'},
  componentes: [{type: Schema.Types.ObjectId, ref: 'Funcionario'}]  
},{
	timestamps: true
});

module.exports = mongoose.model('Equipe', equipe);