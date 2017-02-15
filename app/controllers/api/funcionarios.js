var Funcionario = require('../../models/funcionario');
var Equipe = require('../../models/equipe');
var Turno = require('../../models/turno');
var Escala = require('../../models/escala');
var Usuario = require('../../models/usuario');
var Apontamento = require('../../models/apontamento');
var moment = require('moment');
var router = require('express').Router();

//=========================================================================
// API para FUNCIONARIOS
//=========================================================================
// get all FUNCIONARIOS
router.get('/', function(req, res) {    
    
    // usando o mongoose Model para buscar todos os funcionários
    Funcionario.find()
    .populate('cargo')
    .populate({
        path: 'turno',
        model: 'Turno',
        populate: [{path: 'escala', model: 'Escala'}]
    })
    .populate('equipes', 'nome')
    .populate('instituicao', 'nome')
    .exec(function(err, funcionarios){

       if(err) {
        return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
       }

       res.json(funcionarios); // return all users in JSON format
    });
});


// cria um funcionário na BD em consultas provenientes de um POST
router.post('/', function(req, res) {

    var _funcionario = req.body;
    console.log("Funcionario para cadastrar no BD: ", _funcionario);

    // create a user, information comes from AJAX request from Angular
    Funcionario.create(_funcionario, function(err, user) {
        
        if (err)
            return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});

        return res.status(200).send({success: true, message: 'Funcionário cadastrado com sucesso.'});
    });

});

//GET 1 func by id
router.get('/:id', function(req, res){

    var idFuncionario = req.params.id;
    
    Funcionario.findOne({_id: idFuncionario})
    .populate('cargo')
    .populate({
        path: 'turno',
        model: 'Turno',
        populate: [{path: 'escala', model: 'Escala'}]
    })
    .populate('equipes')
    .populate('instituicao')
    .exec(function(err, funcionario){
        
        if(err) {
            return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
        }

        return res.json(funcionario);
    });
});

//Update funcionario by id
router.put('/:id', function(req, res){
    
    var idFuncionario = req.params.id;
    
    Funcionario.findOne({_id: idFuncionario}, function(err, funcionario){

        if(err) {
            return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
        }

        funcionario.nome = req.body.nome;
        funcionario.sobrenome = req.body.sobrenome;
        funcionario.dataNascimento = req.body.dataNascimento;
        funcionario.PIS = req.body.PIS;
        funcionario.CPF = req.body.CPF;
        funcionario.matricula = req.body.matricula;
        funcionario.email = req.body.email;
        funcionario.alocacao = req.body.alocacao;
        funcionario.rhponto = req.body.rhponto;
        funcionario.ferias = req.body.ferias;

      //tenta atualizar de fato no BD
      funcionario.save(function(err){
        
        if(err){
          console.log('Erro no save do update', err);
          return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
        }

      });

      //return res.json(funcionario);
      return res.status(200).send({success: true, message: 'Funcionário cadastrado com sucesso.'});
    });
});

//Remove 1 equipe by ID
router.delete('/:id', function(req, res){
    
    var idFuncionario = req.params.id;
    
    Funcionario.remove({_id: idFuncionario}, function(err){
        
        if(err){
          console.log('Erro no delete funcionario', err);
          return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
        }

        return res.status(200).send({success: true, message: 'Funcionário removido com sucesso!'});
    });
});

//##############################################
//Métodos extras, fora do padrão REST
//##############################################

//Get usuario by funcionario
router.get('/:id/usuario', function(req, res){

    var idFuncionario = req.params.id;

    Usuario.findOne({funcionario: idFuncionario})
    .populate('funcionario')
    .exec(function(err, usuario){
        
        if(err) {
            return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
        }

        /*remover por enquanto essa função de verificar a permissão de autorização
    
        if(!config.ensureAuthorized(req.auth, accessLevel)) {
            console.log('usuário não autorizado para instituições');
            return res.status(403).send({success: false, message: 'Usuário não autorizado!'});
        }
        */
        console.log("usuario mongoose: ", usuario);
        return res.json(usuario);
    });
});

//Get apontamento de um funcionário by date range
router.post('/:id/apontamentoRange', function(req, res){

    var funcionarioId = req.params.id;
    var dateApontamento = req.body;
    console.log("dateApontamento: ", dateApontamento);

    var today = moment(dateApontamento.dataInicial).startOf('day');
    var anotherDay = null;
    //var tomorrow = moment(today).add(1, 'days');

    //se não enviar outra data, é pq ele quer o apontamento diário, basta somarmos 1 dia para isso
    if(!dateApontamento.dataFinal)
        anotherDay = moment(today).add(1, 'days');
    else
        anotherDay = moment(dateApontamento.dataFinal).startOf('day');      
    
    console.log('today moment: ', today);
    console.log('anotherDay moment: ', anotherDay);

    Apontamento.find({data: {$gte: today.toDate(),$lt: anotherDay.toDate()}})
    .populate('funcionario')
    .exec(function(err, apontamentos){
        
        if(err) {
            return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
        }

        /*remover por enquanto essa função de verificar a permissão de autorização
    
        if(!config.ensureAuthorized(req.auth, accessLevel)) {
            console.log('usuário não autorizado para instituições');
            return res.status(403).send({success: false, message: 'Usuário não autorizado!'});
        }
        */

        var apontamentosFuncionario = [];
        console.log('apontamentos retornados: ', apontamentos);
        if(apontamentos) {
            //Temos que filtrar para trazer apenas os apontamentos deste usuário nesse período de data
            console.log('tem apontamentos, entrei na função');
            apontamentosFuncionario = apontamentos.filter(function(apontamento){
                console.log('É o apontamento?', apontamento.funcionario._id == funcionarioId);
                return apontamento.funcionario._id == funcionarioId;
            });
        }

        console.log("Apontamentos filtrados mongoose: ", apontamentosFuncionario);
        return res.json(apontamentosFuncionario);
    });
});

module.exports = router;