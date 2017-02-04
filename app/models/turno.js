var mongoose = require('mongoose');
var Escala = require('./escala');
var Schema = mongoose.Schema;

var turnoSchema = new Schema(
{
	codigo: {type: Number, required: true, unique: true},
	descricao: {type: String, required: true},
	isFlexivel: Boolean,
	intervaloFlexivel: Boolean,
	ignoraFeriados: Boolean, //Normalmente se aplica apenas aos turnos com escala 12x36h
	tolerancia: Number, //caso não seja flexível, tem que aplicar essa tolerancia
	escala: {type: Schema.Types.ObjectId, required: true, ref: 'Escala'}
},
{
	timestamps: true
});

var turnoModel = mongoose.model('Turno', turnoSchema);

module.exports = turnoModel;