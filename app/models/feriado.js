var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var feriadoSchema = new Schema(
{
	nome: {type: String, required: true, unique: true},
	data: {type: Date, required: true, unique: true},
	fixo: {type: Boolean, required: true}
},
{
	timestamps: true
});

var feriadoModel = mongoose.model('Feriado', feriadoSchema);

module.exports = feriadoModel;