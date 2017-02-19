var Apontamento = require('../../models/apontamento');
var Funcionario = require('../../models/funcionario');
var Cargo = require('../../models/cargo');
var Turno = require('../../models/turno');
var Escala = require('../../models/escala');
var moment = require('moment');
var router = require('express').Router();

router.get('/', function(req, res) {

    // usando o mongoose Model para buscar todos os apontamentos
    Apontamento.find()
    .exec(function(err, apontamentos) {

        if(err) {
            return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
        }

        return res.json(apontamentos);
    });
});

router.post('/', function(req, res) {
    
    var apoint = req.body;
    var dataReg = req.body.data;
    console.log("APONTAMENTO: ", apoint);

    Apontamento.create(apoint, function(err, apontamento) {
        
        if(err) {
          console.log('erro post apontamento: ', err);
          return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
        }   

        var dataToSend = {message: 'Registro efetuado com sucesso em ', date: dataReg};
        return res.status(200).send({success: true, obj: dataToSend});
        //return res.json(apontamento);
    });
});

//GET 1 apontamento by id
router.get('/:id', function(req, res){

    var idApontamento = req.params.id;
    console.log("nomeApontamento: ", idApontamento);
    
    Apontamento.findOne({_id: idApontamento})
    .populate('funcionario')
    .exec(function(err, apontamento){
        
        if(err) {
            return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
        }

        /*remover por enquanto essa função de verificar a permissão de autorização
    
        if(!config.ensureAuthorized(req.auth, accessLevel)) {
            console.log('usuário não autorizado para instituições');
            return res.status(403).send({success: false, message: 'Usuário não autorizado!'});
        }
        */
        console.log("Apontamento mongoose: ", apontamento);
        return res.json(apontamento);
    });
});

//Update 1 setor by id
router.put('/:id', function(req, res){
    
    var idApontamento = req.params.id;
    var dataReg = req.body.data;
    
    Apontamento.findOne({_id: idApontamento}, function(err, apontamento){

        if(err) {
            return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
        }

        //apontamento.data = req.body.data;
        apontamento.status = req.body.status;
        apontamento.marcacoes = req.body.marcacoes;//no futuro não poderá atualizar as marcações
        apontamento.marcacoes_invalidadas = req.body.marcacoes_invalidadas;//no futuro não poderá atualizar as marcações
        apontamento.justificativa = req.body.justificativa;
        //apontamento.funcionario = req.body.funcionario; //SÓ PARA TESTES!!!!!!

      //tenta atualizar de fato no BD
      apontamento.save(function(err){
        
        if(err){
          console.log('Erro no save do update', err);
          return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
        }

      });

      var dataToSend = {message: 'Registro efetuado com sucesso em ', date: dataReg};
      return res.status(200).send({success: true, obj: dataToSend});    
      //return res.json(apontamento);
    });
});

//Remove 1 apontamento by ID
router.delete('/:id', function(req, res){
    
    var idApontamento = req.params.id;
    
    Apontamento.remove({_id: idApontamento}, function(err){
        
        if(err){
          console.log('Erro no delete apontamento', err);
          return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
        }

        return res.status(200).send({success: true, message: 'Apontamento removido com sucesso!'});
    });
});

//Get apontamento de todos os funcionarios by date
router.post('/date', function(req, res){

    var dateApontamento = req.body;
    console.log("dateApontamento: ", dateApontamento);

    var today = moment(dateApontamento.dataInicial).startOf('day');
    var tomorrow = moment(today).add(1, 'days');
    
    console.log('today moment: ', today);
    console.log('tomorrow moment: ', tomorrow);

    Apontamento.find({data: {$gte: today.toDate(),$lt: tomorrow.toDate()}})
    .populate('funcionario', 'nome PIS')
    .exec(function(err, apontamentos){
        
        if(err) {
            return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
        }

        console.log("Apontamento mongoose: ", apontamentos);
        return res.json(apontamentos);
    });
});

//Get apontamento de todos os funcionarios by date
router.post('/date/equipe', function(req, res){

    var objDateEquipe = req.body;
    var equipe = objDateEquipe.equipe;

    var today = moment(objDateEquipe.dataInicial).startOf('day');
    var tomorrow = moment(today).add(1, 'days');
    
    console.log('today moment: ', today);
    console.log('tomorrow moment: ', tomorrow);

    Apontamento.find({data: {$gte: today.toDate(),$lt: tomorrow.toDate()}, funcionario: {$in: equipe}})
    .populate('funcionario', 'nome PIS')
    .exec(function(err, apontamentos){
        if(err) {
            return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
        }

        console.log("Apontamento mongoose: ", apontamentos);
        return res.json(apontamentos);
    });
});

/* 
 * Obter apontamentos dentro de um intervalo de datas em relação a data passada por parâmetro ou atual (se nada for passado)
 * @param dias -> Usuário vai passar um intervalo de dias para somar ou subtrair da data atual
 * @param equipe -> array de funcionários que devem ser buscados na pesquisa
 */
router.post('/intervaldate/equipe', function(req, res){

    var objDateEquipe = req.body;
    var dateParametro = objDateEquipe.date;
    var dias = objDateEquipe.dias;
    var equipe = objDateEquipe.equipe;

    var today = dateParametro ? moment(new Date(dateParametro)).startOf('day') : moment(new Date()).startOf('day'); //dia atual
    //today.subtract(18, 'days'); //PARA TESTES!
    //var teste2 = moment(today).add(2, 'days');
    var otherDay = (dias >= 0) ? moment(today).add(dias, 'days') : moment(today).subtract(dias, 'days');
    
    console.log('today moment: ', today);
    //console.log("TESTE 2 OTHER DAY: ", teste2);
    //console.log("TESTE 2 OTHER DAY: ", teste3);
    console.log('other day moment: ', otherDay);

    var queryDate = (dias >= 0) ? {$gte: today.toDate(), $lt: otherDay.toDate()} : {$gte: otherDay.toDate(), $lt: today.toDate()};

    Apontamento.find({data: queryDate, funcionario: {$in: equipe}})
    .populate({
        path: 'funcionario', 
        select: 'nome sobrenome PIS sexoMasculino alocacao',
        model: 'Funcionario',
        populate: [{
          path: 'alocacao.cargo',
          select: 'especificacao nomeFeminino',
          model: 'Cargo'
        },
        {
          path: 'alocacao.turno',
          model: 'Turno',
          populate: [{
            path: 'escala', 
            model: 'Escala'
          }]
        }]      
    })
    .exec(function(err, apontamentos){
        if(err) {
            return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
        }

        console.log("Apontamento dateRange mongoose: ", apontamentos);
        return res.json(apontamentos);
    });
});

//Get current date on server
router.post('/currentDate', function(req, res){

    var currentDate = new Date();
    return res.json({date: currentDate});
});

module.exports = router;