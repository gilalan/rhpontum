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
   //Um array com os 7 dias da semana para o horário semanal

    "jornada": {
      "array": [
        {
          "dia": 0,
          "diaAbrev": "Dom",
          "viradaTurno": ""
        },
        {
          "dia": 1,
          "diaAbrev": "Seg",
          "horarios": {
            "ent1": 480,
            "sai1": 720,
            "ent2": 840,
            "sai2": 1080
          },
          "minutosTrabalho": 480, (soma as horas de trabalho a partir do horário acima)
          "viradaTurno": 0
        },
        {
          "dia": 2,
          "diaAbrev": "Ter",
          "horarios": {
            "ent1": 480,
            "sai1": 720,
            "ent2": 840,
            "sai2": 1080
          },
          "viradaTurno": 0
        },
        {
          "dia": 3,
          "diaAbrev": "Qua",
          "horarios": {
            "ent1": 480,
            "sai1": 720,
            "ent2": 840,
            "sai2": 1080
          },
          "viradaTurno": 0
        },
        {
          "dia": 4,
          "diaAbrev": "Qui",
          "horarios": {
            "ent1": 480,
            "sai1": 720,
            "ent2": 840,
            "sai2": 1080
          },
          "viradaTurno": 0
        },
        {
          "dia": 5,
          "diaAbrev": "Sex",
          "horarios": {
            "ent1": 480,
            "sai1": 720,
            "ent2": 840,
            "sai2": 1080
          },
          "viradaTurno": 0
        },
        {
          "dia": 6,
          "diaAbrev": "Sáb",
          "horarios": {
            "ent1": 480,
            "sai1": 720
          },
          "viradaTurno": 0
        }
      ],
      "minutosIntervalo": 120
    },
    "escala": {
      "_id": "589649a492266b6eeffd7782",
      "codigo": 1,
      "nome": "Semanal"
    },
 * 
 * Para uma jornada de 12x36h
 //Um array com apenas 1 objeto para o horário 12x36
   "jornada": {
      "array": [
        {
          "horarios": {
	        "ent1": 360,
	        "sai1": 720,
	        "ent2": 720,
	        "sai2": 1080
	      },
	        "viradaTurno": 0
	      	}
      ],
      "minutosIntervalo": 0,
      "minutosTrabalho": 720
    },
    "escala": {
      "_id": "589649a892266b6eeffd7783",
      "codigo": 2,
      "nome": "12x36h"
    }
 
 Essas duas ultimas informações constará nas duas jornadas
 minutosIntervalo: {type: Number, required: true},
 //não estou contando -> minutosEfetivos: {type: Number, required: true} //Horas efetivas trabalhadas em minutos
 *
**/
 
 