var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Instituicao = require('./instituicao');
var Turno = require('./turno');
var Cargo = require('./cargo');

var funcionarioSchema = new Schema({
	nome: {type: String, required: true},
	sobrenome: {type: String, required: true},
	dataNascimento: Date,
	CPF: {type: String, required: true, unique: true},
	PIS: {type: String, required: true, unique: true},
	matricula: {type: String, unique: true},
	email: {type: String, unique: true},
	alocacao: {
		dataAdmissao: {type: Date, required: true},
		dataInicioEfetivo: Date, //é usada apenas na escala 12x36h
		cargo: {type: Schema.Types.ObjectId, ref: 'Cargo', required: true},
		dataCargo: Date,
		turno: {type: Schema.Types.ObjectId, ref: 'Turno', required: true},
		dataTurno: Date,
		instituicao: {type: Schema.Types.ObjectId, ref: 'Instituicao', required: true},
		gestor: {type: Boolean}
	},
	historico: {
		turnos: [{
			id: {type: Number, unique: true}, 
			vigencia: {
				inicio: Date,
				fim: Date
			},
			isFlexivel: Boolean, 
			intervaloFlexivel: Boolean,
			ignoraFeriados: Boolean,
			tolerancia: Number,
			jornada: Schema.Types.Mixed,
			escala: Schema.Types.Mixed
		}],
		cargos: [{
			id: {type: Number, unique: true}, 
			vigencia: {
				inicio: Date,
				fim: Date
			},
			especificacao: String,
			nomeFeminino: String,
			descricao: String,
			cbo: String
		}],
		emails: [String]
	},
	rhponto: {type: Boolean, required: true}, //usa o sistema caso TRUE, usa relogio de ponto caso FALSE
	sexoMasculino: {type: Boolean, required: true},
	ferias: [{ano: Number, periodo: [Date]}]
},
{
	timestamps: true
}
);

var funcionarioModel = mongoose.model('Funcionario', funcionarioSchema);

module.exports = funcionarioModel;

/*
* o historico é para armazenar, por exemplo, campos passados que podem alterar o significado de alguns dados
* o campo de turno é um bom exemplo, pois se o usuário modificar o turno atual, isso quebraria
* os cálculos passados. Imagine que ele está no turno semanal normal (8h diárias, 5x na semana)
* e é alterado para o turno com escala 12x36. Os dias já trabalhados ficariam inconsistentes com 
* o novo foormato de turno, pois agora ele trabalha dia sim/dia não 12h seguidas e antes eram 8h diárias.
* o historico iria conter algo do tipo:
* 
*/