var mongoose = require('mongoose');

//mongoose.connect('mongodb://rhpontumadm:123456789@jello.modulusmongo.net:27017/Ohy3tagi');

var instituicao = mongoose.Schema({
  nome: {type: String, required: true, unique: true},
  sigla: String,
  enderecos: Array
},{
	timestamps: true
});

module.exports = mongoose.model('Instituicao', instituicao);