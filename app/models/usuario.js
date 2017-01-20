var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//mongoose.connect('mongodb://rhpontumadm:123456789@jello.modulusmongo.net:27017/Ohy3tagi');

var usuario = mongoose.Schema({
  email: {type: String, required: true, unique: true},
  senha: {type: String, required: true, select: false},
  funcionario: Schema.Types.ObjectId,
  perfil: Schema.Types.ObjectId
},{
	timestamps: true
});

module.exports = mongoose.model('Usuario', usuario);