var mongoose = require('mongoose');
var Funcionario = require('./funcionario');
var Schema = mongoose.Schema;

var solicitacaoAjusteSchema = new Schema(
{
	funcionario: {type: Schema.Types.ObjectId, required: true, ref: 'Funcionario'},
	data: {type: Date, required: true}, //Data Pretendida para solicitação
	dataAprovacao: Date,
	status: {type: Number, required: true, enum: [-1, 0, 1]},//Não Aprovada, Pendente ou Aprovada
	anterior: {
		marcacoes: [{
			id: Number, //1, 2, 3, 4 -> sequencial para ordenação
			descricao: String, //ent1, sai1, ent2, sai2, ent3, sai3
			hora: Number,
			minuto: Number,
			segundo: Number,
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
	anexo: { data: Buffer, contentType: String }
},
{
	timestamps: true
},
{ 
	collection : 'solicitacoesAjuste' 
});

var solicitacaoAjusteModel = mongoose.model('SolicitacaoAjuste', solicitacaoAjusteSchema);

module.exports = solicitacaoAjusteModel;