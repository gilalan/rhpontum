var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var escalaSchema = new Schema(
{
	codigo: {type: Number, required: true, unique: true}, //associar código 1 para semanal e 2 oara 12x36 por ex
	nome: {type: String, required: true, enum: ["Semanal", "12x36h"]}//Ficou feioso pois vou ter que linkar com esses nomes no FrontEnd
},
{
	timestamps: true
});

var escalaModel = mongoose.model('Escala', escalaSchema);

module.exports = escalaModel;