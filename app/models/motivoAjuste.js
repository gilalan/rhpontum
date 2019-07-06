var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var motivoAjusteSchema = new Schema(
{
	nome: {type: String, required: true, unique: true}	
},
{
	timestamps: true
});

var motivoAjusteModel = mongoose.model('MotivoAjuste', motivoAjusteSchema);

module.exports = motivoAjusteModel;