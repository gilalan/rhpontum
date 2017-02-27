var mongoose = require('mongoose');
var Funcionario = require('./funcionario');
var Schema = mongoose.Schema;

var solicitacaoSchema = new Schema(
{
	descricao: {type: String, required: true},
	funcionario: {type: Schema.Types.ObjectId, required: true, ref: 'Funcionario'},
	data: {type: Date, required: true}, //Data Pretendida para solicitação
	identificacao: {
		tipo: {type: Number, required: true, enum: [0, 1, 2, 3]}, //Folga, Férias...
		descricao: {type: String, enum: ["Folga", "Férias", "Falta Justificada", "Correção"]},
		novasMarcacoes: [{
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
		}]
	},
	status: {type: Number, required: true, enum: [-1, 0, 1]},//Não Aprovada, Pendente ou Aprovada
	dataAprovacao: Date,
	anexo: { data: Buffer, contentType: String }
},
{
	timestamps: true
},
{ 
	collection : 'Solicitacoes' 
});

var solicitacaoModel = mongoose.model('Solicitacao', solicitacaoSchema);

module.exports = solicitacaoModel;