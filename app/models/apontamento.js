var mongoose = require('mongoose');
var Funcionario = require('./funcionario');
var Schema = mongoose.Schema;

var apontamentoSchema = new Schema(
{
	data: {type: Date, required: true},
	status: {
		id: Number,
		descricao: {type: String, enum: ["Correto", "Incompleto", "Errado", "Justificado"]}
	},
	marcacoes: [{
		id: Number, //1, 2, 3, 4 -> sequencial para ordenação
		descricao: String, //ent1, sai1, ent2, sai2, ent3, sai3
		hora: Number,
		minuto: Number,
		segundo: Number,
		gerada: {
			created_at: Date,
			aprovadaPor: {type: Schema.Types.ObjectId, ref: 'Funcionario'},
			justificativa: String
		}
	}],
	marcacoes_invalidadas: [{
		hora: Number,
		minuto: Number,
		segundo: Number,
		gerada: {
			created_at: Date,
			aprovadaPor: {type: Schema.Types.ObjectId, ref: 'Funcionario'},
			justificativa: String
		},
		motivo: String
	}],
	funcionario: {type: Schema.Types.ObjectId, ref: 'Funcionario'},
	saldoDiario: Number, //saldo do dia em minutos, negativo ou positivo, sempre atualizado nas batidas PARES, 2a batida, 4a batida, 6a batida por aí em diante
	justificativa: String
},
{
	timestamps: true
});

apontamentoSchema.index({ data: 1, funcionario: 1}, { unique: true });

var apontamentoModel = mongoose.model('Apontamento', apontamentoSchema);

module.exports = apontamentoModel;