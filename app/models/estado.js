var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Municipio = require('./municipio');

var estadoSchema = new Schema(
{
	uf: {type: Number, required: true, unique: true},
	sigla_uf: {type: String, required: true, unique: true},
	nome_uf: {type: String, required: true, unique: true},
	cidades: [{type: Schema.Types.ObjectId, ref: 'Municipio', required: true}]
},
{
	timestamps: true
});

var estadoModel = mongoose.model('Estado', estadoSchema);

module.exports = estadoModel;