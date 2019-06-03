var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var eventoAbonoSchema = new Schema(
{
	nome: {type: String, required: true, unique: true}	
},
{
	timestamps: true
});

var eventoAbonoModel = mongoose.model('EventoAbono', eventoAbonoSchema);

module.exports = eventoAbonoModel;