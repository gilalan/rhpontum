var mongoose = require('mongoose');
var Funcionario = require('./funcionario');
var Schema = mongoose.Schema;

var apontamentoSchema = new Schema(
{
	data: {type: Date, required: true},
	funcionario: {type: Schema.Types.ObjectId, ref: 'Funcionario', required: true},
	PIS: {type: String, required: true},
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
		totalMin: Number, //Total em minutos dessa batida (vai de 0 até 1439)(00:00 às 23:59)
		strHorario: String,
		tzOffset: Number, //representa a diferença entre a hora universal UTC e a hora local
		RHWeb: Boolean, //indica se a batida foi proveniente da WEB 
		REP: Boolean, //indica se a batida foi de um REP físico (se essa e a de cima são falsas, ela foi gerada)
		NSR: String, //Número Sequencial de Registros - vem do REP
		desconsiderada: {type: Boolean, default: false},
		reconvertida: {type: Boolean, default: false},
		motivo: String,
		gerada: {
			created_at: Date			
		}
	}],
	historico: [{
		id: Number,
		marcacoes: [{
			id: Number, //1, 2, 3, 4 -> sequencial para ordenação
			descricao: String, //ent1, sai1, ent2, sai2, ent3, sai3
			hora: Number,
			minuto: Number,
			segundo: Number,
			totalMin: Number, //Total em minutos dessa batida (vai de 0 até 1439)(00:00 às 23:59)
			strHorario: String,
			tzOffset: Number, //representa a diferença entre a hora universal UTC e a hora local
			RHWeb: Boolean, //indica se a batida foi proveniente da WEB 
			REP: Boolean, //indica se a batida foi de um REP físico (se essa e a de cima são falsas, ela foi gerada)
			NSR: String, //Número Sequencial de Registros - vem do REP
			desconsiderada: {type: Boolean, default: false},
			reconvertida: {type: Boolean, default: false},
			motivo: String,
			gerada: {
				created_at: Date			
			}
		}],
		infoTrabalho: {
			trabalha: Boolean,
			aTrabalhar: Number, //em minutos?
			trabalhados: Number //em minutos?
		},
		marcacoesFtd: [String],
		justificativa: String,
		gerencial: {
			dataAlteracao: Date,
			gestor: {
				nome: String,
				sobrenome: String,
				email: String,
				PIS: String
			}
		}
	}],
	justificativa: String,//talvez não precise aqui
	infoTrabalho: {
		trabalha: Boolean,
		ferias: {type: Boolean, default: false},
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