var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Equipe = require('./equipe');
var Instituicao = require('./instituicao');
var Turno = require('./turno');

var funcionarioSchema = new Schema({
	nome: {type: String, required: true},
	dataNascimento: Date,
	PIS: {type: String, required: true, unique: true},
	instituicao: {type: Schema.Types.ObjectId, ref: 'Instituicao'},
	turno: {type: Schema.Types.ObjectId, ref: 'Turno'},
	ferias: [{ano: Number, periodo: [Date]}],
	equipes: [{type: Schema.Types.ObjectId, ref: 'Equipe'}]
},
{
	timestamps: true
}
);

var funcionarioModel = mongoose.model('Funcionario', funcionarioSchema);

module.exports = funcionarioModel;