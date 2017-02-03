var Funcionario = require('../../models/funcionario');
var Equipe = require('../../models/equipe');
var Usuario = require('../../models/usuario');
var Apontamento = require('../../models/apontamento');
var moment = require('moment');
var router = require('express').Router();

//=========================================================================
// API para FUNCIONARIOS
//=========================================================================
// get all FUNCIONARIOS
router.get('/', function(req, res) {

    if (req.auth) {
      if (req.auth.email)
        console.log('usuário já logado: ' + req.auth.email);
        if (req.auth.role){

            console.log('role: ' + req.auth.role);
            //forçando um erro para um novo usuário criado com os roles
            if (req.auth.role === 'ROLE_USER'){//na verdade esse é admin
                //teria q checar o nível de acesso da rota pra saber se ele é permitido visualizar
                console.log("Usuário com ROLE não autorizado example!");
                //res.status(403).send({ success: false, message: 'Não Autorizado!' });
            }
        }

    } else {
        console.log('usuário não logado');
        //res.status(403).send({ success: false, message: 'Não Autorizado!' });
        //403 - forbidden - proibido de acessar
    }
    // usando o mongoose Model para buscar todos os funcionários
    Funcionario.find()
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

    // create a user, information comes from AJAX request from Angular
    Funcionario.create({
        nome : req.body.nome,
        PIS: req.body.PIS,
        dataNascimento: req.body.dataNascimento,
        instituicao: req.body.instituicao,
        equipes: req.body.equipes
    }, function(err, user) {
        
        if (err)
            return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});

        // get and return all funcs - não funciona sem essa parte, o post é um get porém envia informações
        // ele precisa responder com algo
        /*Funcionario.find(function(err, funcionarios) {
            if (err)
                res.send(err)
            res.json(funcionarios);
        });*/

        return res.status(200).send({success: true, message: 'Funcionário cadastrado com sucesso.'});
    });

});

//GET 1 func by id
router.get('/:id', function(req, res){

    var idFuncionario = req.params.id;
    
    Funcionario.findOne({_id: idFuncionario})
    .populate('equipes')
    .populate('instituicao')
    .exec(function(err, funcionario){
        
        if(err) {
            return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
        }

        /*remover por enquanto essa função de verificar a permissão de autorização
    
        if(!config.ensureAuthorized(req.auth, accessLevel)) {
            console.log('usuário não autorizado para instituições');
            return res.status(403).send({success: false, message: 'Usuário não autorizado!'});
        }
        */
        
        return res.json(funcionario);
    });
});

//Update 1 setor by id
router.put('/:id', function(req, res){
    
    var idFuncionario = req.params.id;
    
    Funcionario.findOne({_id: idFuncionario}, function(err, funcionario){

        if(err) {
            return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
        }

        /*remover por enquanto essa função de verificar a permissão de autorização
    
        if(!config.ensureAuthorized(req.auth, accessLevel)) {
            console.log('usuário não autorizado para instituições');
            return res.status(403).send({success: false, message: 'Usuário não autorizado!'});
        }
        */

        funcionario.nome = req.body.nome;
        funcionario.PIS = req.body.PIS;
        funcionario.dataNascimento = req.body.dataNascimento;
        funcionario.instituicao = req.body.instituicao;
        funcionario.equipes = req.body.equipes;

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