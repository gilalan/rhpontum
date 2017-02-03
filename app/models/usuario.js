var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Funcionario = require('./funcionario');
var Perfil = require('./perfil');

//mongoose.connect('mongodb://rhpontumadm:123456789@jello.modulusmongo.net:27017/Ohy3tagi');

var usuario = mongoose.Schema({
  email: {type: String, required: true, unique: true},
  senha: {type: String, required: true, select: false},
  funcionario: {type: Schema.Types.ObjectId, ref: 'Funcionario', unique: true},
  perfil: {type: Schema.Types.ObjectId, ref: 'Perfil'}  
},{
	timestamps: true
});

module.exports = mongoose.model('Usuario', usuario);