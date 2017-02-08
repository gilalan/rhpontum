var Campi = require('../../models/campi');
var Setor = require('../../models/setor');
var router = require('express').Router();
var config = require('../../../config');

//=========================================================================
// API para Campi (Campi é o plural de Campus, estranho mas é em latim)
// Ficou meio confusa a nomenclatura no projeto
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
var accessLevel = 3;

router.get('/', function(req, res) {

  console.log("Get ALL CAMPI: ", req.params);

	Campi.find()
  .populate('instituicao')
  .exec(function(err, campusList){
		
		if(err) {
    	return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
  	}

  	/*remover por enquanto essa função de verificar a permissão de autorização
  	
  	if(!config.ensureAuthorized(req.auth, accessLevel)) {
  		console.log('usuário não autorizado para instituições');
  		return res.status(403).send({success: false, message: 'Usuário não autorizado!'});
  	}
  	*/

    //console.log("Instituição: ", instituicao);
    //var inst = ObjectId(""+);
	  return res.json(campusList);
  });
});

router.post('/', function(req, res) {

  console.log("req", req.body);

  Campi.create({
    
    nome: req.body.nome,
    endereco: req.body.endereco,
    area: req.body.area,
    projetos: req.body.projetos,
    instituicao: req.body.instituicao

  }, function(err, instituicao){

    if(err) {
      console.log('erro post campi: ', err);
      return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
    }

    /*remover por enquanto essa função de verificar a permissão de autorização
    if(!config.ensureAuthorized(req.auth, accessLevel)) {
      console.log('usuário não autorizado para instituições');
      return res.status(403).send({success: false, message: 'Usuário não autorizado!'});
    }
    */
      
    return res.json(instituicao);
  });
});

// Obtendo um campus através do ID fornecido (GET padrão RESTFUL)
router.get('/:id', function(req, res){

  var idCampus = req.params.id;
  console.log("idCampus: ", idCampus);
  
  Campi.findOne({_id: idCampus}, function(err, campus){
    
    if(err) {
        return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
      }

      /*remover por enquanto essa função de verificar a permissão de autorização
    
      if(!config.ensureAuthorized(req.auth, accessLevel)) {
        console.log('usuário não autorizado para instituições');
        return res.status(403).send({success: false, message: 'Usuário não autorizado!'});
      }
      */
    console.log("campus mongoose: ", campus);
    return res.json(campus);
  });

});

//Atualiza 1 campus
router.put('/:id', function(req, res){

  var idCampus = req.params.id;
  Campi.findOne({_id: idCampus}, function(err, campus){

    if(err) {
      console.log('Erro no FINDONE: ', err);
      return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
    }

    /*remover por enquanto essa função de verificar a permissão de autorização
    
    if(!config.ensureAuthorized(req.auth, accessLevel)) {
      console.log('usuário não autorizado para instituições');
      return res.status(403).send({success: false, message: 'Usuário não autorizado!'});
    }
    */
    //Atualizar as informacoes provenientes da requisicao
    //TEMOS QUE VALIDAR PARA NAO TER QUE TESTAR SE CADA CAMPO VEIO VAZIO
    campus.nome = req.body.nome;
    campus.endereco = req.body.endereco;
    campus.area = req.body.area;
    campus.instituicao = req.body.instituicao;
    if (req.body.projetos) 
      campus.projetos = req.body.projetos;
    
    //tenta atualizar de fato no BD
    campus.save(function(err){
      
      if(err){
        console.log('Erro no save do update', err);
        return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
      }

    });

    return res.json(campus);
  });
});

router.delete('/:id', function(req, res){

  var idCampus = req.params.id;
  Campi.remove({_id: idCampus}, function(err){
    if(err){
      console.log('Erro no delete instituicao', err);
      return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
    }
    return res.status(200).send({success: true, message: 'Instituição removida com sucesso!'});
  });
});

router.get('/:id/setores', function(req, res){

  var idCampus = req.params.id;

  console.log('idCampus', idCampus);
  Setor.find({campus: idCampus})
  .exec(function(err, setores){
      
      if(err) {
          return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
      }

      /*remover por enquanto essa função de verificar a permissão de autorização
  
      if(!config.ensureAuthorized(req.auth, accessLevel)) {
          console.log('usuário não autorizado para instituições');
          return res.status(403).send({success: false, message: 'Usuário não autorizado!'});
      }
      */
      console.log("setores mongoose: ", setores);
      return res.json(setores);
  });
});

module.exports = router;