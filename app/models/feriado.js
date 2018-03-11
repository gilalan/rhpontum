var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Estado = require('./estado');
var Municipio = require('./municipio');

var feriadoSchema = new Schema(
{
	nome: {type: String, required: true, unique: true},
	data: {
		inicio: {type: Date, required: true, unique: true},
		fim: {type: Date}
	},
	array: [Date],
	abrangencia: {type: String, required: true, enum: ["Nacional", "Estadual", "Municipal"]},
	local: {
		estado: {type: Schema.Types.ObjectId, ref: 'Estado'},
		municipio: {type: Schema.Types.ObjectId, ref: 'Municipio'}
	},
	ftdString: String,
	fixo: {type: Boolean, required: true}
},
{
	timestamps: true
});

var feriadoModel = mongoose.model('Feriado', feriadoSchema);

module.exports = feriadoModel;