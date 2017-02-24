var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Instituicao = require('./instituicao');
var Turno = require('./turno');
var Cargo = require('./cargo');

var funcionarioSchema = new Schema({
	nome: {type: String, required: true},
	sobrenome: {type: String, required: true},
	dataNascimento: Date,
	CPF: {type: String, required: true, unique: true},
	PIS: {type: String, required: true, unique: true},
	matricula: {type: String, unique: true},
	email: {type: String, unique: true},
	alocacao: {
		dataAdmissao: {type: Date, required: true},
		dataInicioEfetivo: Date, //é usada apenas na escala 12x36h
		cargo: {type: Schema.Types.ObjectId, ref: 'Cargo', required: true},
		turno: {type: Schema.Types.ObjectId, ref: 'Turno', required: true},
		instituicao: {type: Schema.Types.ObjectId, ref: 'Instituicao', required: true},
		gestor: {type: Boolean}
	},
	rhponto: {type: Boolean, required: true}, //usa o sistema caso TRUE, usa relogio de ponto caso FALSE
	sexoMasculino: {type: Boolean, required: true},
	ferias: [{ano: Number, periodo: [Date]}]
},
{
	timestamps: true
}
);

var funcionarioModel = mongoose.model('Funcionario', funcionarioSchema);

module.exports = funcionarioModel;