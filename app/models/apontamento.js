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
	marcacoes: [{ //registradas no horário local (o TZOffset ajuda a calcular a hora universal se precisar)
		id: Number, //1, 2, 3, 4 -> sequencial para ordenação
		descricao: String, //ent1, sai1, ent2, sai2, ent3, sai3
		hora: Number,
		minuto: Number,
		segundo: Number,
		tzoffset: Number, //representa a diferença entre a hora universal UTC e a hora local
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
	justificativa: String,
	infoTrabalho: {
		trabalha: Boolean,
		aTrabalhar: Number, //em minutos?
		trabalhados: Number //em minutos?		
	},
	marcacoesFtd: [String]
},
{
	timestamps: true
});

apontamentoSchema.index({ data: 1, funcionario: 1}, { unique: true });

var apontamentoModel = mongoose.model('Apontamento', apontamentoSchema);

module.exports = apontamentoModel;