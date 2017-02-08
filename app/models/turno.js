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
	escala: {type: Schema.Types.ObjectId, required: true, ref: 'Escala'},
	jornada: {type: Schema.Types.Mixed, required: true}
},
{
	timestamps: true
});

var turnoModel = mongoose.model('Turno', turnoSchema);

module.exports = turnoModel;

/*
 *
 /*
 * 
 * Estou fazendo um objeto de jornada flexível, dessa forma teremos que controlar a app no frontend para não ter
 * discrepâncias. Exemplo de modelo para jornada semanal: 
   
   jornada: { 
 	{dia: 0, diaAbrev: 'dom', horarios: {}},
 	{dia: 1, diaAbrev: 'seg', horarios: {ent1: 8, sai1, 12, ent2: 13, sai2: 17}},
 	{dia: 2, diaAbrev: 'ter', horarios: {ent1: 8, sai1, 12, ent2: 13, sai2: 17}},
 	{dia: 3, diaAbrev: 'qua', horarios: {ent1: 8, sai1, 12, ent2: 13, sai2: 17}},
 	{dia: 4, diaAbrev: 'qui', horarios: {ent1: 8, sai1, 12, ent2: 13, sai2: 17}},
 	{dia: 5, diaAbrev: 'sex', horarios: {ent1: 8, sai1, 12, ent2: 13, sai2: 17}},
 	{dia: 6, diaAbrev: 'sab', horarios: {ent1: 8, sai1, 12}} 	
   }
 * 
 * Para uma jornada de 12x36h
   jornada: {
   	horarios: {ent1: 8, sai1, 12, ent2: 13, sai2: 17},
   	base: [{
		ano: 2017,
		mes: 0, //0 até 11 para seguir o Javascript Date
		dia: 1 //pode ser 1 ou 2, irá compor os dias a trabalhar nesse mês base
   	}]
   }
	//Assim seria bem mais flexível
   jornada: {
	 array: [
 		{
		horarios: {ent1: 8, sai1, 12, ent2: 13, sai2: 17},
   		anoBase: 2017,
		mesBase: 0, //0 até 11 para seguir o Javascript Date
		diaBase: 1 //pode ser 1 ou 2, irá compor os dias a trabalhar nesse mês base
   		}
	 ]
   }
 
 Essas duas ultimas informações constará nas duas jornadas
 minutosIntervalo: {type: Number, required: true},
 //não estou contando -> minutosEfetivos: {type: Number, required: true} //Horas efetivas trabalhadas em minutos
 *
**/
 
 