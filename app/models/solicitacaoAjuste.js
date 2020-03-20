var mongoose = require('mongoose');
var Funcionario = require('./funcionario');
var EventoAbono = require('./eventoAbono');
var Schema = mongoose.Schema;

var solicitacaoAjusteSchema = new Schema(
{
	funcionario: {type: Schema.Types.ObjectId, required: true, ref: 'Funcionario'},
	tipo: {type: Number, default: 0}, //0: ajuste, 1: abono
	data: {type: Date, required: true}, //Data Pretendida para solicitação
	resposta: {
		aprovada: {type: Boolean, default: false},
		data: Date,
		gestor: {type: Schema.Types.ObjectId, ref: 'Funcionario'},
		motivo: String
	}, 
	status: {type: Number, required: true, enum: [-1, 0, 1]},//Não Aprovada, Pendente ou Aprovada
	anterior: {
		marcacoes: [{
			id: Number, //1, 2, 3, 4 -> sequencial para ordenação
			descricao: String, //ent1, sai1, ent2, sai2, ent3, sai3
			hora: Number,
			minuto: Number,
			segundo: Number,
			totalMin: Number,
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
		}]
	},
	proposto: {
		marcacoes: [{
			id: Number, //1, 2, 3, 4 -> sequencial para ordenação
			descricao: String, //ent1, sai1, ent2, sai2, ent3, sai3
			hora: Number,
			minuto: Number,
			segundo: Number,
			totalMin: Number,
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
		}]
	},
	motivo: {type: String, required: true}, //motivo da solicitação
	//somente para abono a partir daqui
	dataFinal: {type: Date}, 
	horarioEnviado: {
		inicial: {
			hora: Number, 
			minuto: Number, 
			segundo: Number,
			totalMin: Number,
			horarioFtd: String
		},
		final: {
			hora: Number, 
			minuto: Number, 
			segundo: Number,
			totalMin: Number,
			horarioFtd: String
		},
		diff: Number //totalMinutos de diferença entre inicial e final
	},
	arrayAusAjt: [
		{
			id: Number,
			data: Date,
			totalMin: Number
		}
	],
	eventoAbono: {type: Schema.Types.ObjectId, required: false, ref: 'EventoAbono'},
	afastamento: {type: Boolean, default: false},
	anexo: []
},
{
	timestamps: true
},
{ 
	collection : 'solicitacoesAjuste' 
});

//solicitacaoAjusteSchema.index({ data: 1, funcionario: 1}, { unique: true });

var solicitacaoAjusteModel = mongoose.model('SolicitacaoAjuste', solicitacaoAjusteSchema);

module.exports = solicitacaoAjusteModel;