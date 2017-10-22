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
    .populate('alocacao.cargo', 'especificacao nomeFeminino')
    .populate({
        path: 'alocacao.turno',
        model: 'Turno',
        populate: [{path: 'escala', model: 'Escala'}]
    })
    .populate('alocacao.instituicao', 'nome sigla')
    .exec(function(err, funcionarios){

       if(err) {
        console.log('errorrrrr', err);
        return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
       }

       res.json(funcionarios); // return all users in JSON format
    });
});


// cria um funcionário na BD em consultas provenientes de um POST
router.post('/', function(req, res) {

    var _funcionario = req.body;
    console.log("Funcionario para cadastrar no BD: ", _funcionario);
    _funcionario.alocacao.dataCargo = new Date();
    _funcionario.alocacao.dataTurno = new Date();

    // create a user, information comes from AJAX request from Angular
    Funcionario.create(_funcionario, function(err, user) {
        
        if (err){
            var result = "Ocorreu um erro no processamento.";
            console.log('Erro: ' + err);
            if (err.errmsg.indexOf("email_1") !== -1)
                result = "E-mail já existente na base de dados.";
            if (err.errmsg.indexOf("PIS_1") !== -1)
                result = "PIS já existente na base de dados.";
            if (err.errmsg.indexOf("matricula_1") !== -1)
                result = "Matrícula já existente na base de dados.";
            if (err.errmsg.indexOf("CPF_1") !== -1)
                result = "CPF já existente na base de dados.";

            return res.status(500).send({success: false, message: result, err: err});
        }

        return res.status(200).send({success: true, message: 'Funcionário cadastrado com sucesso.'});
    });

});

//GET 1 func by id
router.get('/:id', function(req, res){

    var idFuncionario = req.params.id;

    Funcionario.findOne({_id: idFuncionario})
    .populate('alocacao.cargo', 'especificacao nomeFeminino')
    .populate({
        path: 'alocacao.turno',
        model: 'Turno',
        populate: [{path: 'escala', model: 'Escala'}]
    })
    .populate('alocacao.instituicao', 'nome sigla')
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
    var _funcionario = req.body;
    
    Funcionario.findOne({_id: idFuncionario}, function(err, funcionario){

        if(err) {
            return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
        }        

        funcionario.nome = _funcionario.nome;
        funcionario.sobrenome = _funcionario.sobrenome;
        funcionario.dataNascimento = _funcionario.dataNascimento;
        funcionario.PIS = _funcionario.PIS;
        funcionario.CPF = _funcionario.CPF;
        funcionario.matricula = _funcionario.matricula;
        funcionario.email = _funcionario.email;
        funcionario.alocacao = _funcionario.alocacao;
        funcionario.rhponto = _funcionario.rhponto;
        funcionario.ferias = _funcionario.ferias;
        funcionario.sexoMasculino = _funcionario.sexoMasculino;
        funcionario.historico = _funcionario.historico;
        funcionario.geoLocalFixo = _funcionario.geoLocalFixo;

      //tenta atualizar de fato no BD
      funcionario.save(function(err){
        
        if(err){
          console.log('Erro no save do update', err);
          return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
        }

        return res.status(200).send({success: true, message: 'Funcionário atualizado com sucesso.'});
      });
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
    .populate('funcionario', 'nome sobrenome email')
    .populate('perfil', 'nome')
    .exec(function(err, usuario){
        
        if(err) {
            return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
        }

        return res.json(usuario);
    });
});

//Get apontamento de um funcionário by date range
router.post('/:id/apontamentoRange', function(req, res){

    var funcionarioId = req.params.id;
    var dateApontamento = req.body;
    console.log("dateApontamento: ", dateApontamento.raw);

    var dateMom = moment({year: dateApontamento.year, month: dateApontamento.month,
        day: dateApontamento.day, hour: dateApontamento.hour, minute: dateApontamento.minute});    

    console.log('dateMom: ', dateMom);
    console.log('dateMom ftd: ', dateMom.format());
    var today = dateMom.startOf('day');
    //var today = moment(dateApontamento.dataInicial).startOf('day');
    var anotherDay = null;
    //var tomorrow = moment(today).add(1, 'days');

    //se não enviar outra data, é pq ele quer o apontamento diário, basta somarmos 1 dia para isso
    if(!dateApontamento.dataFinal)
        
        anotherDay = moment(today).add(1, 'days');

    else {
        
        var dateMomFinal = moment({
            year: dateApontamento.dataFinal.year, 
            month: dateApontamento.dataFinal.month,
            day: dateApontamento.dataFinal.day, 
            hour: dateApontamento.dataFinal.hour, 
            minute: dateApontamento.dataFinal.minute
        });

        anotherDay = moment(dateApontamento.dataFinal).startOf('day');      
    }
    
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

//GET 1 func by PIS
router.get('/pis/:pis', function(req, res){

    var pisFuncionario = req.params.pis;

    Funcionario.findOne({PIS: pisFuncionario})
    .populate('alocacao.cargo', 'especificacao nomeFeminino')
    .populate({
        path: 'alocacao.turno',
        model: 'Turno',
        populate: [{path: 'escala', model: 'Escala'}]
    })
    .populate('alocacao.instituicao', 'nome sigla')
    .exec(function(err, funcionario){
        
        if(err) {
            return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
        }

        return res.json(funcionario);
    });
});

module.exports = router;