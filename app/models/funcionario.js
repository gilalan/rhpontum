var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Instituicao = require('./instituicao');
var Turno = require('./turno');
var Cargo = require('./cargo');

var funcionarioSchema = new Schema({
	nome: {type: String, required: true},
	sobrenome: {type: String, required: true},
	dataNascimento: Date,
	CPF: {type: String, required: true, unique: false},
	PIS: {type: String, required: true, unique: false},
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
		gestor: {type: Boolean},
		fiscal: {type: Boolean}
	},
	historico: {
		turnos: [{
			id: Number, 
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
			id: Number, 
			vigencia: {
				inicio: Date,
				fim: Date
			},
			especificacao: String,
			nomeFeminino: String,
			descricao: String,
			cbo: String
		}],
		emails: [String],
		datasAdmissao: [Date],
		datasDemissao: [Date]
	},
	rhponto: {type: Boolean, required: true}, //usa o sistema caso TRUE, usa relogio de ponto caso FALSE
	sexoMasculino: {type: Boolean, required: true},
	ferias: [{
				qtdeDias: Number,
				arrayDias: [{date: Number, month: Number, year: Number}],
				periodo: {dataInicial: Number, dataFinal: Number, mesInicial: Number, mesFinal: Number, anoInicial: Number, anoFinal: Number},
				comentario: String,
				cadastradoPor: {_id: String, email: String}
			}],
	localTrabalho: String, //o ideal seria eu ter uma entidade (local de trabalho) mas não da tempo
	geoLocalFixo: {
		latitude: Number,
		longitude: Number
	},
	active: {type: Boolean, default: true}
},
{
	timestamps: true
}
);

funcionarioSchema.index({ CPF: 1, matricula: 1}, { unique: true });

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