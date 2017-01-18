var mongoose = require('mongoose');

//mongoose.connect('mongodb://rhpontumadm:123456789@jello.modulusmongo.net:27017/Ohy3tagi');

var usuario = mongoose.Schema({
  email: {type: String, required: true, unique: true},
  senha: {type: String, required: true, select: false}
},{
	timestamps: true
});

module.exports = mongoose.model('Usuario', usuario);