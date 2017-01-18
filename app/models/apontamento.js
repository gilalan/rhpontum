var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var apontamentoSchema = new Schema(
{
	data: Date,
	status: {
		id: Number,
		descricao: {type: String, enum: ['Correto', 'Incompleto', 'Errado', 'Justificado']}
	},
	funcionario: Schema.Types.ObjectId,
	marcacoes: [Date],
	justificativa: String
},
{
	timestamps: true
});

var apontamentoModel = mongoose.model('Apontamento', apontamentoSchema);

module.exports = apontamentoModel;