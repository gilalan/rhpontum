var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Estado = require('./estado');

var municipioSchema = new Schema(
{
	codigo_ibge: {type: Number, required: true, unique: true},
	nome_municipio: {type: String, required: true},
	estado: {type: Schema.Types.ObjectId, required: true, ref: 'Estado'}
},
{
	timestamps: true
});

var municipioModel = mongoose.model('Municipio', municipioSchema);

module.exports = municipioModel;