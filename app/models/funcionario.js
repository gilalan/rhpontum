var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var funcionarioSchema = new Schema({
	nome: String,
	dataNascimento: Date,
	PIS: String,
	escalaTrabalho: {
		jornada: {
			entrada: Date,
			intervalo: Date,
			voltaIntervalo: Date,
			saida: Date
		},
		horasIntervalo: Number,
		horasTrabalho: Number
	},
	apontamentos: [Schema.Types.ObjectId],
	equipes: [Schema.Types.ObjectId]	
},
{
	timestamps: true
}
);

var funcionarioModel = mongoose.model('Funcionario', funcionarioSchema);

module.exports = funcionarioModel;