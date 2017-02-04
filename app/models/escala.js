var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var escalaSchema = new Schema(
{
	codigo: {type: Number, required: true, unique: true}, //associar código 1 para semanal e 2 oara 12x36 por ex
	nome: {type: String, required: true, enum: ["Semanal", "12x36h"]},//Ficou feioso pois vou ter que linkar com esses nomes no FrontEnd
	jornada: {type: Schema.Types.Mixed, required: true},
	minutosIntervalo: {type: Number, required: true},
	minutosEfetivos: {type: Number, required: true} //Horas efetivas trabalhadas em minutos
},
{
	timestamps: true
});

var escalaModel = mongoose.model('Escala', escalaSchema);

module.exports = escalaModel;

/*
 * 
 * Estou fazendo um objeto de jornada flexível, dessa forma teremos que controlar a app no frontend para não ter
 * discrepâncias. Exemplo de modelo para jornada semanal: 
 * jornada: { 
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
   	rotina: [{
		ano: 2017,
		mes: 0, //0 até 11 para seguir o Javascript Date
		mesAbrev: 'jan',
		diasTrab: [1, 3, 5, 7, 9, 11, 13, 15, 17...] //dias a trabalhar
   	}]
   }
 *
**/