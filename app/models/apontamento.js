var mongoose = require('mongoose');
var Funcionario = require('./funcionario');
var Schema = mongoose.Schema;

var apontamentoSchema = new Schema(
{
	data: {type: Date, required: true},
	funcionario: {type: Schema.Types.ObjectId, ref: 'Funcionario', required: true},
	status: {
		id: Number, //Poderia ter o método no qual foi criado o ponto, se foi batida do usuário ou manualmente pelo Gestor/Fiscal (manual tem q ser justificado)
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
	saldoDiario: Number, //saldo do dia em minutos, negativo ou positivo, sempre atualizado nas batidas PARES, 2a batida, 4a batida, 6a batida por aí em diante
	justificativa: String,
	infoTrabalho: {
		trabalha: Boolean,
		aTrabalhar: Number, //em minutos?
		trabalhados: Number //em minutos?		
	},
	infoTurno: {
		isFlexivel: Boolean,
		intervaloFlexivel: Boolean,
		ignoraFeriados: Boolean, //Normalmente se aplica apenas aos turnos com escala 12x36h
		tolerancia: Number, //caso não seja flexível, tem que aplicar essa tolerancia
		escala: {type: Schema.Types.Mixed},
		jornada: {type: Schema.Types.Mixed}
	},
	marcacoesFtd: [{
		id: Number,
		marcacao: String
	}]
},
{
	timestamps: true
});

apontamentoSchema.index({ data: 1, funcionario: 1}, { unique: true });

var apontamentoModel = mongoose.model('Apontamento', apontamentoSchema);

module.exports = apontamentoModel;