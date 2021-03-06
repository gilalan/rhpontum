var mongoose = require('mongoose');

//mongoose.connect('mongodb://rhpontumadm:123456789@jello.modulusmongo.net:27017/Ohy3tagi');

var perfil = mongoose.Schema({
  nome: {type: String, required: true, unique: true},
  accessLevel: Number
},{
	timestamps: true
});

module.exports = mongoose.model('Perfil', perfil);

//=========================================================================
// API para Perfils
//=========================================================================
/*accessLevel => 
 *{
   0: public,
   1: colaborador,
   2: fiscal,
   3: gestor,
   4: admin 
  }
 */