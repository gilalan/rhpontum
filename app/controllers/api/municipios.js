var Municipio = require('../../models/municipio');
var router = require('express').Router();
var config = require('../../../config');

//=========================================================================
// API para municipios
// Passos para cadastrar novos municípios e estados e deixá-los ajustados:
// 1. Cadastrar Estado com UF, sigla_uf e nome_uf seguindo o documento na pasta do Desktop
// 1.1. Deixar array de cidades vazio
// 2. Pegar a lista de municípios no arquivo e fazer um "ctrl + H" para substituir o {" 
// por {"estado": _id, "} e aí continua normalmente a lista, agora com o Estado acoplado a cada municipio
// 2.1. Dar um insert many lá no Insomnia
// 3. Agora vamos preencher o array dos Estados
// 3.1. Pegar o ID do estado gerado e filtrar ele aqui no GET dos municípios
// 3.2. Para filtrar: Municipio.find({'estado': '5a9b679f9f94453bab02b302'}, {'_id': 1})
// 3.3. Dar o get no Insomnia e obter a lista de IDs dos municípios
// 3.4. Dar um update no Estado com as cidades sendo essa lista gerada no 3.3
//=========================================================================

var accessLevel = 4;

//Get ALL municipios
router.get('/', function(req, res) {

	Municipio.find({'estado': '5a9b679f9f94453bab02b302'}, {'_id': 1})
  .exec(function(err, municipios){
		
		if(err) {
     	return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
  	}
      		
    return res.json(municipios);
	});

});

//Create municipio
router.post('/', function(req, res) {

  console.log("req", req.body);

  Municipio.create({
    
    codigo_ibge: req.body.codigo_ibge,
    nome_municipio: req.body.nome_municipio

  }, function(err, municipio){

    if(err) {
      console.log('erro post municipio: ', err);
      
      if (err.code === 11000) {
        console.log('municipio existente!');
        return res.status(500).send({success: false, message: 'municipio já existente na base de dados!'});
      }
      
      return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
    }

    return res.json(municipio);
  });
});

//Traz apenas 1 municipio
router.get('/:id', function(req, res) {

  var idMunicipio = req.params.id;

  Municipio.findOne({_id: idMunicipio}, function(err, municipio){
    
    if(err) {
      return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
    }        
          
    return res.json(municipio);
  });

});

//Atualiza 1 municipio
router.put('/:id', function(req, res){

  var idMunicipio = req.params.id;
  Municipio.findOne({_id: idMunicipio}, function(err, municipio){

    if(err) {
      console.log('Erro no FINDONE: ', err);
      return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
    }
    
    //Atualizar as informacoes provenientes da requisicao
    municipio.nome_municipio = req.body.nome_municipio;
    municipio.codigo_ibge = req.body.codigo_ibge;

    //tenta atualizar de fato no BD
    municipio.save(function(err){
      
      if(err){
        console.log('Erro no save do update', err);
        return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
      }

    });

    //return res.json(municipio);
    return res.status(200).send({success: true, message: 'municipio atualizado com sucesso!'});
  });
});

router.delete('/:id', function(req, res){

  var idMunicipio = req.params.id;
  Municipio.remove({_id: idMunicipio}, function(err){
    if(err){
      console.log('Erro no delete municipio', err);
      return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
    }
    return res.status(200).send({success: true, message: 'municipio removido com sucesso!'});
  });

});

router.post('/insertmany', function(req, res){

  var rMunicipios = req.body;

  Municipio.create(rMunicipios, function(err, municipios){

    if(err) {
      console.log('erro post municipio: ', err);
      
      if (err.code === 11000) {
        console.log('municipio existente!');
        return res.status(500).send({success: false, message: 'municipio já existente na base de dados!'});
      }
      
      return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
    }

    return res.json(municipios);
  });
});

module.exports = router;