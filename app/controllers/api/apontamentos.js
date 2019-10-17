var Apontamento = require('../../models/apontamento');
var Funcionario = require('../../models/funcionario');
var Cargo = require('../../models/cargo');
var Turno = require('../../models/turno');
var Escala = require('../../models/escala');
var Feriado = require('../../models/feriado');
var Util = require('../utilService');
var moment = require('moment');
var async = require('async');
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
    //console.log("APONTAMENTO: ", apoint);

    Apontamento.create(apoint, function(err, apontamento) {
        
        if(err) {
          //console.log('erro post apontamento: ', err);
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
    //console.log("nomeApontamento: ", idApontamento);
    
    Apontamento.findOne({_id: idApontamento})
    .populate('funcionario')
    .exec(function(err, apontamento){
        
        if(err) {
            return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
        }

        /*remover por enquanto essa função de verificar a permissão de autorização
    
        if(!config.ensureAuthorized(req.auth, accessLevel)) {
            //console.log('usuário não autorizado para instituições');
            return res.status(403).send({success: false, message: 'Usuário não autorizado!'});
        }
        */
        //console.log("Apontamento mongoose: ", apontamento);
        return res.json(apontamento);
    });
});

//Update 1 appoint by id
router.put('/:id', function(req, res){
    
    var idApontamento = req.params.id;
    var newApontamento = req.body;
    var dataReg = newApontamento.data;
    
    Apontamento.findOne({_id: idApontamento}, function(err, apontamento){

        if(err) {
            return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
        }

        //Se encontrar, 
        apontamento.status = newApontamento.status;
        //Ordenar arrays para não ter erro, as vezes mesmo ordenado no cliente o javascript perde a referencia.        
        sortMarcacoes(newApontamento);
        //console.log("newApontamento: ", newApontamento);
        apontamento.marcacoes = newApontamento.marcacoes;//no futuro não poderá atualizar as marcações
        apontamento.marcacoesFtd = newApontamento.marcacoesFtd;
        apontamento.historico = newApontamento.historico;//no futuro não poderá atualizar as marcações
        apontamento.infoTrabalho = newApontamento.infoTrabalho;
        apontamento.justificativa = newApontamento.justificativa;
        //console.log('a', a); forçando um erro pra testes...

      //tenta atualizar de fato no BD
      apontamento.save(function(err){
        
        if(err){
          //console.log('Erro no save do update', err);
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
          //console.log('Erro no delete apontamento', err);
          return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
        }

        return res.status(200).send({success: true, message: 'Apontamento removido com sucesso!'});
    });
});

//Get todos os apontamentos de um funcionario
router.post('/allbyemployee', function(req, res){

    var funcionario = req.body;
    
    Apontamento.find({funcionario: funcionario._id})
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
    .sort({data: 'asc'})
    .exec(function(err, apontamentos){
        if(err) {
            return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
        }

        console.log("Apontamento dateRange mongoose: ", apontamentos.length);

        //return res.json({apontamentos: apontamentos, firstDate: apontamentos[0].data});
        return res.json(apontamentos);
    });
   
});

//Get apontamento de todos os funcionarios by date
router.post('/date', function(req, res){

    var dateApontamento = req.body;
    //console.log("data pura: ", dateApontamento.raw);
        
    //testes
    var dateMom = moment({year: dateApontamento.year, month: dateApontamento.month,
        day: dateApontamento.day, hour: dateApontamento.hour, minute: dateApontamento.minute});    

    //console.log('#moment date: ', dateMom.format());

    var today = dateMom.startOf('day');//moment(dateApontamento.dataInicial).startOf('day');
    var tomorrow = moment(today).add(1, 'days');
    
    //console.log('today moment: ', today);
    //console.log('tomorrow moment: ', tomorrow);

    Apontamento.find({data: {$gte: today.toDate(),$lt: tomorrow.toDate()}})
    .populate('funcionario', 'nome PIS')
    .exec(function(err, apontamentos){
        
        if(err) {
            return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
        }

        //console.log("Apontamento mongoose: ", apontamentos);
        return res.json(apontamentos);
    });
});

//Get apontamento de todos os funcionarios by DIA (data diária)
router.post('/date/equipe', function(req, res){

    var objDateEquipe = req.body;
    var equipe = objDateEquipe.equipe;

    var dateMom = moment({year: objDateEquipe.date.year, 
        month: objDateEquipe.date.month,
        day: objDateEquipe.date.day, hour: objDateEquipe.date.hour, 
        minute: objDateEquipe.date.minute});    

    //var today = moment(objDateEquipe.date).startOf('day');
    var today = dateMom.startOf('day');
    var tomorrow = moment(today).add(1, 'days');
    
    //console.log('today moment: ', today);
    //console.log('tomorrow moment: ', tomorrow);

    Apontamento.find({data: {$gte: today.toDate(),$lt: tomorrow.toDate()}, funcionario: {$in: equipe}})
    .populate('funcionario', 'nome PIS')
    .exec(function(err, apontamentos){
        if(err) {
            //console.log("erro de apontamento? ", err);
            return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
        }

        //console.log("Apontamento mongoose: ", apontamentos);
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
    ////console.log("Objeto Date Equipe: ", objDateEquipe);
    var dateParametro = objDateEquipe.date;
    var dias = objDateEquipe.dias;
    var equipe = objDateEquipe.equipe;

    ////console.log("data pura: ", dateParametro.raw);

    var dateMom = moment({year: dateParametro.year, month: dateParametro.month,
        day: dateParametro.day, hour: dateParametro.hour, minute: dateParametro.minute});    

    var today = dateParametro ? dateMom.startOf('day') : moment(new Date()).startOf('day'); //dia atual
    //var today = dateParametro ? moment(new Date(dateParametro)).startOf('day') : moment(new Date()).startOf('day'); //dia atual
    
    var otherDay = (dias >= 0) ? moment(today).add(dias, 'days') : moment(today).subtract(dias, 'days');
    
    ////console.log('today moment: ', today);
    ////console.log('other day moment: ', otherDay);

    var queryDate = (dias >= 0) ? {$gte: today.toDate(), $lt: otherDay.toDate()} : {$gte: otherDay.toDate(), $lt: today.toDate()};

    //Para um intervalo de dias, envia mais dados no populate
    if (dias > 1) {

        ////console.log("############# DADOS MULTIPLICADOS");

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
        .sort({data: 'asc'})
        .exec(function(err, apontamentos){
            if(err) {
                return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
            }

            //console.log("Apontamento dateRange mongoose: ", apontamentos.length);
            return res.json(apontamentos);
        });
        
    } else {

        Apontamento.find({data: queryDate, funcionario: {$in: equipe}})
        .populate({
            path: 'funcionario', 
            select: 'nome sobrenome PIS sexoMasculino alocacao',
            model: 'Funcionario'            
        })
        .sort({data: 'asc'})
        .exec(function(err, apontamentos){
            if(err) {
                return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
            }

            return res.json(apontamentos);
        });
    }
});

/*
** Get apontamento de um funcionário dentro do intervalo inicial e final passados
*/
router.post('/intervaldate/funcionario', function(req, res){

    var objDateWorker = req.body;
    var dateParametro = objDateWorker.date;
    var dateFinalParametro = objDateWorker.date.final;
    var funcionario = objDateWorker.funcionario;

    //console.log("data inicial pura: ", dateParametro.raw);
    //console.log("data final pura: ", dateFinalParametro.raw);

    var startDateMom = moment({year: dateParametro.year, month: dateParametro.month,
        day: dateParametro.day, hour: dateParametro.hour, minute: dateParametro.minute});

    var endDateMom = moment({year: dateFinalParametro.year, month: dateFinalParametro.month,
        day: dateFinalParametro.day, hour: dateFinalParametro.hour, minute: dateFinalParametro.minute});

    var firstDay = dateParametro ? startDateMom.startOf('day') : moment(new Date()).startOf('day');
    var lastDay = dateFinalParametro ? endDateMom.startOf('day') : moment(new Date()).startOf('day');
    
    var oneDayMoreLastDay = moment(lastDay).add(1, 'days');

    //console.log('firstDay moment: ', firstDay);
    //console.log('lastDay moment: ', lastDay);
    //console.log('one more day: ', oneDayMoreLastDay);

    
    var queryDate = {$gte: firstDay.toDate(), $lt: oneDayMoreLastDay.toDate()};
    if (dateParametro.finalInclude)
        queryDate = {$gte: firstDay.toDate(), $lte: oneDayMoreLastDay.toDate()};
    

    //var date1 = "2019-02-07T03:00:00Z";
    //var date2 = "2019-02-07T03:00:00Z";
    //var queryDate = {$gte: "2019-02-07T03:00:00Z", $lte: "2019-02-07T03:00:00Z"};
    //console.log("############# Trazendo dados! queryDate: ", queryDate);

    Apontamento.find({data: queryDate, funcionario: funcionario._id ? funcionario._id : funcionario})
    //Apontamento.find({data: {$gte: new ISODate(date1), $lte: new ISODate(date2)}, funcionario: funcionario._id ? funcionario._id : funcionario})
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
    .sort({data: 'asc'})
    .exec(function(err, apontamentos){
        if(err) {
            return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
        }

        //console.log("Apontamento dateRange mongoose: ", apontamentos.length);
        return res.json(apontamentos);
    });
   
});

//modificar apontamento de cada funcionário dentro do intervalo
router.post('/idt/func', function(req, res){
    
    var objDateWorker = req.body;
    var dateParametro = objDateWorker.date;
    var dateFinalParametro = objDateWorker.date.final;
    var funcionario = objDateWorker.funcionario;
    var eventoAbono = objDateWorker.eventoAbono;

    var startDateMom = moment({year: dateParametro.year, month: dateParametro.month,
        day: dateParametro.day, hour: dateParametro.hour, minute: dateParametro.minute});

    var endDateMom = undefined;
    if (dateFinalParametro){        
        endDateMom = moment({year: dateFinalParametro.year, month: dateFinalParametro.month,
            day: dateFinalParametro.day, hour: dateFinalParametro.hour, minute: dateFinalParametro.minute});
    }

    var firstDay = dateParametro ? startDateMom.startOf('day') : moment(new Date()).startOf('day');
    var lastDay = endDateMom ? endDateMom.startOf('day') : moment(new Date(firstDay)).startOf('day');
    
    var oneDayMoreLastDay = moment(lastDay).add(1, 'days');
    
    var queryDate = {$gte: firstDay.toDate(), $lt: oneDayMoreLastDay.toDate()};
    if (dateFinalParametro)
        queryDate = {$gte: firstDay.toDate(), $lte: oneDayMoreLastDay.toDate()};
    
    var strEmpty = "Evento de Abono Excluído";
    console.log("Funcionário: ", funcionario.nome)
    console.log("Período: ", firstDay.toDate());
    console.log("End: ", oneDayMoreLastDay.toDate());
    console.log("Evento de Abono: ", eventoAbono ? eventoAbono.nome : strEmpty);
    var counter = 0;

    Apontamento.find({data: queryDate, funcionario: funcionario._id ? funcionario._id : funcionario})    
    .sort({data: 'asc'})
    .exec(function(err, apontamentos){
        if(err) {
            return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
        }
        console.log("Apontamentos: ", apontamentos.length);
        //return res.status(200).send({success: true, message: "Passou!"});
        async.eachSeries(apontamentos, function updateObject (obj, done, next) {
            console.log("Apontamento: ", obj.data);
            if (obj.status.id == 4){
                counter++;
                if (eventoAbono){
                    Apontamento.update({ _id: obj._id }, 
                        { $set : { "correcao.abono": eventoAbono, 
                        "status.abonoStr": eventoAbono.nome }}, done);
                } else {
                    Apontamento.update({ _id: obj._id }, 
                        { $set : { "correcao": {}, 
                        "status.abonoStr": strEmpty }}, done);
                }                
                //console.log("obj a ser atualizado: ", obj.infoTrabalho);
                //console.log("obj a ser atualizado: ", obj.status);
            } else {
                Apontamento.update({ _id: obj._id }, 
                    { $set : { "correcao": {}}}, done);
            } 
        }, 
        function allDone (err) {
            if (err){
                console.log("Ocorreu um erro ", err);
                return res.status(500).send({success: false, message: err});
            }
            
            console.log("Tudo finalizado na atualizacao");
            return res.status(200).send({success: true, message: "Total atualizado: "+counter});
        });
    });
   
});

router.post('/abonos/func', function(req, res){

    var funcionario = req.body;

    Apontamento.find({"status.id": 4, funcionario: funcionario._id ? funcionario._id : funcionario})
    .sort({data: 'asc'})
    .exec(function(err, apontamentos){
        if(err) {
            return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
        }
        //console.log("Apontamento dateRange mongoose: ", apontamentos.length);
        var _date; 
        var yearMonthMap = {}; 
        if (apontamentos.length > 1){
 
            for (i=0; i<apontamentos.length; i++){
                
                _date = moment(apontamentos[i].data);
                if (!yearMonthMap[_date.year()]){
                    //console.log('-Não tem um ano mapeado, primeira vez');
                    var monthMapTemp = {};
                    monthMapTemp[_date.month()] = [{day: _date.date(),
                        id: apontamentos[i]._id,
                        fullDate: apontamentos[i].data, 
                        abonoStr: apontamentos[i].status.abonoStr}];
                    yearMonthMap[_date.year()] = monthMapTemp;

                } else {//já tem um ano mapeado['2019']
                    //caso não haja esse hash, a gnt inicializa o array de meses nele
                    if (!yearMonthMap[_date.year()][_date.month()]){
                        
                        // console.log('-Não tem um ano e mes mapeados')
                        yearMonthMap[_date.year()][_date.month()] = [{day: _date.date(), 
                            id: apontamentos[i]._id,
                            fullDate: apontamentos[i].data,
                            abonoStr: apontamentos[i].status.abonoStr}];

                    } else {
                        //console.log('#Já tem um pis e data mapeados: ', yearMonthMap[pis][data]);
                        (yearMonthMap[_date.year()][_date.month()]).push({day: _date.date(), 
                            id: apontamentos[i]._id,
                            fullDate: apontamentos[i].data,
                            abonoStr: apontamentos[i].status.abonoStr});
                    }
                }
            }
            return res.json(yearMonthMap);

        } else {
            return res.json(apontamentos);
        }
    });

});

//teste para iterar sobre as equipes e trazer apontamentos de todos os funcionários que a ela pertencem
router.post('/allequipes/estatisticas', function(req, res){

    var equipes = req.body;
    var marcacoesTotais = 0;
    var marcacoesWeb = 0;
    var marcacoesFisicas = 0;

    async.map(equipes, function (equipe, next) {
      // Do a query for each key
      // Apontamento.find({ key: key }, function (err, result) {
      //   // Map the value to the key
      //   next(err, result.value);
      // });
      ////console.log('#######################');
      ////console.log('equipe: ', equipe.nome);


      Apontamento.find({funcionario: {$in: equipe.componentes}})
        .populate({
            path: 'funcionario', 
            select: 'nome sobrenome PIS sexoMasculino alocacao',
            model: 'Funcionario'            
        })
        //.sort({data: 'asc'})
        .exec(function(err, apontamentos){
            if(err) {
                return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
            }

            ////console.log("opa, resultado: ", apontamentos.length);
            for (i = 0; i < apontamentos.length; i++) {

                marcacoesTotais += apontamentos[i].marcacoes.length;
                for (j = 0; j < apontamentos[i].marcacoes.length; j++){
                    ////console.log('marcacao: ', apontamentos[i].marcacoes[j].strHorario);
                    if (apontamentos[i].marcacoes[j].RHWeb)
                        marcacoesWeb++;
                    if (apontamentos[i].marcacoes[j].REP)
                        marcacoesFisicas++;
                }
            }
            next(err, apontamentos.value);
            //return res.json(apontamentos);
        });

       ////console.log('#######################');

    },
    function (err, apontamentos) {
      ////console.log(apontamentos); // [value1, value 2, ...]
        // for (i = 0; i < apontamentos.length; i++) {
        //     //console.log('apontamento de: ', apontamentos[i].funcionario.nome);
        //     //console.log('qtde de marcacoes: ', apontamentos[i].marcacoes.length);
        // }
        //console.log('marcacoesTotais? ', marcacoesTotais);
        //console.log('marcacoesFisicas? ', marcacoesFisicas);
        //console.log('marcacoesWeb? ', marcacoesWeb);
    });

});

//Get current date on server 
//Server está com timezone 0 GMT (0)
router.post('/currentDate', function(req, res){

    var currentDate = new Date(); //Cria com TImeZone 0, que é +3h em relação ao Brasil - Recife (GMT -03)
    var timezone = currentDate.getTimezoneOffset(); //em horas
    console.log('@# antes -  date no server: ', currentDate);
    //console.log('@# antes -  timezone no server: ', timezone);
    //console.log("string: ", currentDate.toUTCString())
    //Se por algum motivo o servidor perder a configuração de Timezone no GMT 0, fazemos as adaptações:
    // if (timezone != 0) {

    // }

    return res.json({date: currentDate, utcStr: currentDate.toUTCString()});
});

router.post('/deletemany', function(req, res){

    var apontamentosParaExcluir = req.body;

    if (apontamentosParaExcluir.length > 0){
        async.eachSeries(apontamentosParaExcluir, function deleteObject (obj, done) {
                  
            console.log("obj a ser deletado: ", obj.fullDate);
            //Apontamento.deleteOne({ _id: obj.id }, done);
            Apontamento.deleteOne({ _id: obj.id }, done);
        }, 
        function allDone (err) {
            if (err)
                return res.status(500).send({success: false, message: err});
            
            console.log("Tudo finalizado no delete");
            return res.status(200).send({success: true, message: "Tudo deletado"});
        });
    } else {
        return res.status(200).send({success: true, message: "Não há apontamentos para deleção"});
    }

});

router.post('/createupdatemany', function(req, res){

    var _apontamentos = req.body;

    Apontamento.insertMany(_apontamentos.novos, function(err, novosApontamentos){

        if(err) {
            console.log('Erro no insertMany: ', err);
            return res.status(500).send({success: false, message: 'Ocorreu um erro no INSERTMANY apontamentos!'});
        }

        async.eachSeries(_apontamentos.antigos, function updateObject (obj, done) {
              
            Apontamento.update({ _id: obj._id }, { $set : { "marcacoes": obj.marcacoes, "marcacoesFtd": obj.marcacoesFtd, 
            "infoTrabalho": obj.infoTrabalho, "status": obj.status, "historico": obj.historico }}, done);
            //console.log("obj a ser atualizado: ", obj.infoTrabalho);
            //console.log("obj a ser atualizado: ", obj.status);
        }, 
        function allDone (err) {
            if (err)
                return res.status(500).send({success: false, message: err});
            
            console.log("Tudo finalizado na atualizacao do INSERT AND UPDATE");
            return res.status(200).send({success: true, message: "Pontos atualizados!"});
        });
    });
    
});

router.post('/adjustRepeated', function(req, res){
    console.log("iniciar correção...");
    Apontamento.find().exec(function(err, apontamentos) {

        if(err) {
            return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
        }
        
        console.log("Apontamentos.length: ", apontamentos.length);

        var repeatedAppoints = [];
        for (var i=0; i<apontamentos.length; i++){
            
            if (checkRepeatedElements(apontamentos[i].marcacoes)){
                repeatedAppoints.push(apontamentos[i]);
            }
            console.log("repeatedAppoints: ", repeatedAppoints);
        }

        return res.json({quantity: apontamentos.length, quantityRep: repeatedAppoints.length});
    });

});

router.post('/adjustRepeatedEmployee', function(req, res){
    var emp = req.body;
    console.log("iniciar correção...", emp.PIS);
    var apontamentosDataToCorrect = [];

    Apontamento.find({'PIS': emp.PIS}).sort({data: 'asc'}).exec(function(err, apontamentos) {

        if(err) {
            return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
        }
        
        console.log("Apontamentos.length: ", apontamentos.length);

        var repeatedAppoints = [];
        var objMarcacoes = {};
        var objNewData = undefined;
       
        for (var i=0; i<apontamentos.length; i++){
            
            objNewData = changeIncorrectTZ(apontamentos[i].data);
            if (objNewData.changed){
                apontamentos[i].data = objNewData.data.toDate();
                apontamentosDataToCorrect.push(apontamentos[i]);
            }

            objMarcacoes = removeRepeatedElements(apontamentos[i].marcacoes);
            if (objMarcacoes.ajusted){
                apontamentos[i].marcacoes = objMarcacoes.array;
                modifyApontamento(apontamentos[i]);
                repeatedAppoints.push(apontamentos[i]);
            }

        }

        console.log("repeatedAppoints: ", repeatedAppoints.length);
        console.log("Apontamentos data para corrigir: ", apontamentosDataToCorrect.length);

        if (apontamentosDataToCorrect.length > 0){
            console.log("Vai corrigir as datas no BANCO primeiro: ");
            async.eachSeries(apontamentosDataToCorrect, function updateObject (obj, done) {
                  
                Apontamento.update({ _id: obj._id }, { $set : { "data": obj.data }}, done);
                
            }, 
            function allDone (err) {
                if (err)
                    return res.status(500).send({success: false, message: err});
                
                console.log("Tudo finalizado na atualizacao da DATA e TImeZone");
                async.eachSeries(repeatedAppoints, function updateObject (obj, done) {
                  
                    Apontamento.update({ _id: obj._id }, { $set : { "marcacoes": obj.marcacoes, "marcacoesFtd": obj.marcacoesFtd, 
                        "infoTrabalho": obj.infoTrabalho, "status": obj.status }}, done);
                    
                }, 
                function allDone (err) {
                    if (err)
                        return res.status(500).send({success: false, message: err});
                        
                    console.log("Tudo finalizado na atualizacao dos apontamentos");
                    //devo fazer a mesma coisa aqui de atualização do que se não tiver pra atualizar... o restante das coisas...

                    return res.json({arrayRep: repeatedAppoints, quantity: apontamentos.length, quantityRep: repeatedAppoints.length});
                });
                //return res.json({arrayRep: repeatedAppoints, quantity: apontamentos.length, quantityRep: repeatedAppoints.length});
            });    
        } else { 

            async.eachSeries(repeatedAppoints, function updateObject (obj, done) {
                  
                Apontamento.update({ _id: obj._id }, { $set : { "marcacoes": obj.marcacoes, "marcacoesFtd": obj.marcacoesFtd, 
                    "infoTrabalho": obj.infoTrabalho, "status": obj.status }}, done);
                
            }, 
            function allDone (err) {
                if (err)
                    return res.status(500).send({success: false, message: err});
                    
                console.log("Tudo finalizado na atualizacao dos apontamentos");
                //devo fazer a mesma coisa aqui de atualização do que se não tiver pra atualizar... o restante das coisas...

                return res.json({arrayRep: repeatedAppoints, quantity: apontamentos.length, quantityRep: repeatedAppoints.length});
            });
            //return res.json({arrayRep: repeatedAppoints, quantity: apontamentos.length, quantityRep: repeatedAppoints.length});

        }
        
    });

});

//Traz os abonos desse funcionario
router.post('/adjustFolgaCompensatoria', function(req, res){
   
    var emp = req.body;
    //console.log("iniciar correção...", emp.PIS);
    var apontamentosDataToCorrect = [];

    Apontamento.find({'PIS': emp.PIS, 'status.id': 4}).sort({data: 'asc'}).exec(function(err, apontamentos) {

        if(err) {
            return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
        }
        
        console.log("Apontamentos.length: ", apontamentos.length);

        return res.json(apontamentos);        
        
    });

});

router.post('/changeAbonoFolgaComp', function(req, res){

    var apontamentos = req.body;

    async.eachSeries(apontamentos, function updateObject (obj, done, next) {
                        
        console.log("Apontamento: ", obj.data);
        Apontamento.update({ _id: obj._id }, { $set : { "infoTrabalho.trabalhados": 0, 
        "status.id": 5, "status.descricao": "Folga Compensatória", "status.abonoStr": ""}}, done);

    }, 
    function allDone (err) {
        if (err){
            console.log("Ocorreu um erro ", err);
            return res.status(500).send({success: false, message: err});
         }

        console.log("Tudo finalizado na atualizacao, remover ferias agora");    
        return res.status(200).send({success: true, message: "Tudo atualizado!"});
    });

});


router.post('/reverterFerias', function(req, res){
    
    var objEmpFerias = req.body;
    //console.log("iniciar reversão...", objEmpFerias.empID);
    var arrayFerias = objEmpFerias.ferias.arrayDias;

    if (arrayFerias.length > 0){
        arrayFerias.sort(
          function (a, b) {
            if (a.year == b.year){
                if (a.month == b.month){
                    if (a.date == b.date)
                        return 0;
                    else if (a.date < b.date)
                        return -1;
                    else
                        return 1;

                } else if (a.month < b.month){
                    return -1;
                } else {
                    return 1;
                }
            } 
            else if (a.year < b.year)
              return -1;
            else 
                return 1;
          } 
        );

        //for (var i=0; i<arrayFerias.length; i++) 
          // console.log("data: ", arrayFerias[i]);

        var startDateMom = undefined;
        var endDateMom = undefined;
        var queryDate = undefined;

        console.log("Array Ferias: ", arrayFerias.length);

        if (arrayFerias.length == 1){
            startDateMom = moment({year: arrayFerias[0].year, month: arrayFerias[0].month-1,
                day: arrayFerias[0].date});
            //console.log("startDateMom: ", startDateMom);
            var firstDay = startDateMom.startOf('day');
            var oneDayMoreLastDay = moment(firstDay).add(1, 'days');
            queryDate = {$gte: firstDay.toDate(), $lt: oneDayMoreLastDay.toDate()};
        }
        else {
            var lastIndex = arrayFerias.length - 1;
            startDateMom = moment({year: arrayFerias[0].year, month: arrayFerias[0].month-1,
                day: arrayFerias[0].date});
            //console.log("startDateMom: ", startDateMom);
            endDateMom = moment({year: arrayFerias[lastIndex].year, month: arrayFerias[lastIndex].month-1,
                day: arrayFerias[lastIndex].date});
            //console.log("endDateMom: ", endDateMom);
            
            var firstDay = startDateMom.startOf('day');
            var lastDay = endDateMom.startOf('day');
            //console.log("FirstDay Query: ", firstDay);
            //console.log("LastDay Query: ", lastDay);
            var oneDayMoreLastDay = moment(lastDay).add(1, 'days');
            queryDate = {$gte: firstDay.toDate(), $lt: oneDayMoreLastDay.toDate()};
        }

        console.log("queryDate: ", queryDate);

        if (queryDate != undefined){

            Apontamento.find({data: queryDate, funcionario: objEmpFerias.employee._id})    
            .sort({data: 'asc'})//depois pode tirar pra melhorar o desempenho...
            .exec(function(err, apontamentos){
                if(err) {
                    return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
                }
                console.log("Apontamentos: ", apontamentos.length);
                //return res.status(200).send({success: true, message: "Trouxe os apontamentos para atualizar!"});
                // for (var i=0; i<apontamentos.length; i++){
                //     console.log("##Apontamento Data: ", apontamentos[i].data);
                //     console.log("##Apontamento InfoTrab: ", apontamentos[i].infoTrabalho);
                //     var itemSearched = _updateInfoTrabalho(objEmpFerias.employee, apontamentos[i]);
                //     console.log("itemSearched: ", itemSearched);
                // }
                // return res.json(apontamentos);
                async.eachSeries(apontamentos, function updateObject (obj, done, next) {
                    
                    console.log("Apontamento: ", obj.data);
                    var itemSearched = _updateInfoTrabalho(objEmpFerias.employee, obj);
                    console.log("itemSearched: ", itemSearched);
                    Apontamento.update({ _id: obj._id }, { $set : { "infoTrabalho.trabalha": itemSearched.trabalha, 
                        "infoTrabalho.aTrabalhar": itemSearched.aTrabalhar, "infoTrabalho.ferias": false }}, done);

                }, 
                function allDone (err) {
                    if (err){
                        console.log("Ocorreu um erro ", err);
                        return res.status(500).send({success: false, message: err});
                    }
                    
                    console.log("Tudo finalizado na atualizacao, remover ferias agora");
                    Funcionario.findOne({_id: objEmpFerias.employee._id})
                    .exec(function(err, funcionario){
                        
                        if(err) {
                            return res.status(500).send({success: false, message: 'Ocorreu um erro na remoção das férias!'});
                        }

                        var newArrayFerias = [];
                        for (var j=0; j<funcionario.ferias.length; j++){
                            if (objEmpFerias.ferias._id != funcionario.ferias[j]._id)
                                newArrayFerias.push(funcionario.ferias[j]);
                        }
                        funcionario.ferias = newArrayFerias;
                        //tenta atualizar de fato no BD
                        funcionario.save(function(err){
                            
                            if(err){
                              console.log('Erro no save do update', err);
                              return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento da atualização e remoção das férias!'});
                            }

                            return res.status(200).send({success: true, message: 'Funcionário atualizado com sucesso.'});
                        });

                        //return res.json(funcionario);
                    });
                    //return res.status(200).send({success: true, message: "Total atualizado: "+counter});
                });
            });
        }
    }

});

router.post('/correctMarcacoesFtd', function(req, res){
    console.log("iniciar correção...");
    var arrayApontamentos = req.body;
    async.eachSeries(arrayApontamentos, function updateObject (obj, done) {
              
        Apontamento.update({ _id: obj._id }, { $set : { "marcacoes": obj.marcacoes, "marcacoesFtd": obj.marcacoesFtd, 
        "infoTrabalho": obj.infoTrabalho, "status": obj.status, "historico": obj.historico }}, done);
        //console.log("obj a ser atualizado: ", obj.infoTrabalho);
        //console.log("obj a ser atualizado: ", obj.status);
    }, 
    function allDone (err) {
        if (err)
            return res.status(500).send({success: false, message: err});
        
        console.log("Tudo finalizado na atualizacao do INSERT AND UPDATE");
        return res.status(200).send({success: true, message: "Pontos atualizados!"});
    });
});

function changeIncorrectTZ(apontamentoData){

    var strUTC = "";
    var newStrUTC = "";
    var momNormal = undefined;
    var momUTC = {};
    var changed = false;

    strUTC = apontamentoData.toUTCString();
    //console.log("String UTC: ", strUTC);
    momNormal = moment(strUTC);
    momUTC = moment.utc(strUTC);
    //console.log( 'Data: ', momNormal);
    //console.log( 'Data TZ: ', momNormal.utcOffset());
    //console.log( 'Data UTC: ', momUTC);
    //console.log( 'Data UTC TZ: ', momUTC.utcOffset());
    if (momNormal.year() == momUTC.year() && momNormal.month() == momUTC.month() && momNormal.date() == momUTC.date()){
        //console.log('Mesma Data em ambos');
    }
    else{
        newStrUTC = "";
        //console.log('####### Erro de Timezone, arrumando:');
        if(strUTC.includes("00:00:00")){
            //console.log("includes T00");
            newStrUTC = strUTC.replace("00:00:00", "03:00:00");
            //console.log("New String UTC: ", newStrUTC);
        }
        else if (strUTC.includes("01:00:00"))
            newStrUTC = strUTC.replace("01:00:00", "03:00:00");
        else if (strUTC.includes("02:00:00"))
            newStrUTC = strUTC.replace("02:00:00", "03:00:00");
        //momNormal = moment([momUTC.year(), momUTC.month(), momUTC.date(), momUTC.hour(), momUTC.minute()]).utcOffset(-180);
        //console.log("New String UTC: ", newStrUTC);
        momNormal = moment(newStrUTC);
        //console.log( 'Nova Data: ', momNormal);
        //console.log( 'Nova Data TZ: ', momNormal.utcOffset());
        //console.log('#######');
    }
    if (!momNormal.isSame(moment(strUTC)))
        changed = true;

    return {changed: changed, data: momNormal};

};

function checkRepeatedElements(marcacoes){

  if (marcacoes.length < 2){
    return false;
  }

  else {
    var keyObj = {};
    var strKey = "";
    for (var j=0; j<marcacoes.length; j++){
      strKey = getRawHours(marcacoes[j].hora, marcacoes[j].minuto);
      if(!keyObj[strKey])
        keyObj[strKey] = 0;
      keyObj[strKey] += 1;
    }
    var hasDupl = false;
    for (var prop in keyObj){
      if (keyObj[prop] >= 2)
        hasDupl = true;
    }

    return hasDupl;
  }

};

function removeRepeatedElements(marcacoes){

  if (marcacoes.length >= 2) {
  
    var keyObj = {};
    var strKey = "";

    for (var j=0; j<marcacoes.length; j++){
        strKey = getRawHours(marcacoes[j].hora, marcacoes[j].minuto);
        if(!keyObj[strKey])
            keyObj[strKey] = {len: 0, marc: marcacoes[j]};
        keyObj[strKey].len += 1;
    }

    var marcacoesRet = new Array();
    var hasDupl = false;
    for (var key in keyObj){
        if (keyObj[key].len >= 2){
            hasDupl = true;
            marcacoesRet.push(keyObj[key].marc);
        }
    }

    return {ajusted: hasDupl, array: marcacoesRet};

  } else {
    return {ajusted: false};
  }

};

function getRawHours(hoursP, minutesP){

    var hours = parseInt(hoursP);
    var minutes = parseInt(minutesP);
    var hoursStr = "";
    var minutesStr = "";

    hoursStr = (hours >= 0 && hours <= 9) ? "0"+hours : ""+hours;           
    minutesStr = (minutes >= 0 && minutes <= 9) ? "0"+minutes : ""+minutes;

    return hoursStr + minutesStr;
};

function modifyApontamento(apontamento){

    var objMarcacoes = Util.reorganizarBatidasPropostas(apontamento.marcacoes);
    apontamento.marcacoes = objMarcacoes.newArray;
    apontamento.marcacoesFtd = objMarcacoes.newArrayFtd;
    console.log('marcacoesFtd: ', apontamento.marcacoesFtd);
    var minTrab = Util.calcularHorasMarcacoesPropostas(apontamento.marcacoes);
    console.log("Minutos Trabalhados: ", minTrab);
    apontamento.infoTrabalho.trabalhados = minTrab;
    Util.setStatus(apontamento);

};

function _updateInfoTrabalho(funcionario, apontamento){

    var turno = funcionario.alocacao.turno;
    var escala = turno.escala;
    var date = new Date(apontamento.data);
    var infoTrabalho = {};        

    var flagFeriado = _isFeriado(date, funcionario.equipe);
    ////console.log('flagFeriado: ', flagFeriado);

      if (escala) {
      
          ////console.log('entrou no if de criar informações extra de Escala');
          var ignoraFeriados = turno.ignoraFeriados;
          var minutos_trabalhados = undefined;
          if (escala.codigo == 1) {//escala tradicional na semana

            var diaTrabalho = _isWorkingDayWeeklyScale(date.getDay(), turno.jornada.array);
            if (diaTrabalho.horarios && !flagFeriado) { //é um dia de trabalho normal

              infoTrabalho.trabalha = true;
              infoTrabalho.aTrabalhar = diaTrabalho.minutosTrabalho;

            } else {

              if (flagFeriado && ignoraFeriados) { //é um feriado mas o turno do colaborador ignora isso
                
                infoTrabalho.trabalha = true;
                infoTrabalho.aTrabalhar = diaTrabalho.minutosTrabalho;

              } else {

                infoTrabalho.trabalha = false;
                infoTrabalho.aTrabalhar = 0;
                
              }
            }

          } else if (escala.codigo == 2) { //escala 12x36

            //dia de trabalho
            if (_isWorkingDayRotationScale(date, new Date(funcionario.alocacao.dataInicioEfetivo))){
              
              infoTrabalho.trabalha = true; 
              infoTrabalho.aTrabalhar = turno.jornada.minutosTrabalho;
              
              if (flagFeriado && !ignoraFeriados){ //é feriado mas o turno do colaborador não ignora
                
                infoTrabalho.trabalha = false; 
                infoTrabalho.aTrabalhar = 0;
              } 

            } else {

                infoTrabalho.trabalha = false; 
                infoTrabalho.aTrabalhar = 0;
            }
          }
      } else {

          return undefined;
      }

      return infoTrabalho;

};

function _isFeriado (data, equipe){

    Feriado.find()
      .populate('local.estado', 'sigla_uf nome_uf')
      .populate('local.municipio', 'estado nome_municipio')
      .exec(function(err, feriados){
            
            if(err) {
                return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});

            var date = data.getDate();//1 a 31
            var month = data.getMonth();//0 a 11
            var year = data.getFullYear();//
            var flagFeriado = false;
            var tempDate;

            feriados.forEach(function(feriado){
            
              for (var i = 0; i < feriado.array.length; i++) {
                
                tempDate = new Date(feriado.array[i]);
                
                if (feriado.fixo){
                
                  if (tempDate.getMonth() === month && tempDate.getDate() === date){
                    // //console.log("É Feriado (fixo)!", tempDate);
                    flagFeriado = _checkFeriadoSchema(feriado, equipe);
                    return feriado;
                  }

                } else {//se não é fixo

                  if ( (tempDate.getFullYear() === year) && (tempDate.getMonth() === month) && (tempDate.getDate() === date) ){
                    //////console.log("É Feriado (variável)!", tempDate);
                    flagFeriado = _checkFeriadoSchema(feriado, equipe);
                    return feriado;
                  }
                }
              }
            });
            // //console.log('FlagFeriado: ', flagFeriado);
            return flagFeriado;//no futuro retornar o flag de Feriado e a descrição do mesmo!
        }        
    });    

};

function _checkFeriadoSchema(feriado, equipe){

    var abrangencias = ["Nacional", "Estadual", "Municipal"];
    var flagFeriado = false;

    if (feriado.abrangencia == abrangencias[0]){

      flagFeriado = true;

    } else  if (feriado.abrangencia == abrangencias[1]){
      
      if (equipe.setor.local.estado == feriado.local.estado._id){
        ////console.log('Feriado Estadual no Estado correto!');
        flagFeriado = true;
      }

    } else if (feriado.abrangencia == abrangencias[2]){
      
      if (equipe.setor.local.municipio == feriado.local.municipio._id){
        ////console.log('No municipio correto!');
        flagFeriado = true;
      }
    }

    return flagFeriado;
};


/*
*
* Não Verifica, mas retorna o dia de trabalho na escala semanal
*
*/
function _isWorkingDayWeeklyScale(dayToCompare, arrayJornadaSemanal) {
    
    var diaRetorno = {};
    arrayJornadaSemanal.forEach(function(objJornadaSemanal){
      if(dayToCompare == objJornadaSemanal.dia){
        diaRetorno = objJornadaSemanal;
        return diaRetorno;
      }
    });
    return diaRetorno;
};

/*
*
* Verifica se é dia de trabalho na escala de revezamento 12x36h 
*
*/
function _isWorkingDayRotationScale (dateToCompare, dataInicioEfetivo) {

    var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
    
    var d1 = angular.copy(dateToCompare); 
    var d2 = angular.copy(dataInicioEfetivo);
    d1.setHours(0,0,0,0);
    d2.setHours(0,0,0,0);

    var diffDays = Math.round(Math.abs((d1.getTime() - d2.getTime())/(oneDay)));
    return (diffDays % 2 == 0) ? true : false;
};

//teste de obter reps
var urlStaticREPFile = 'https://s3-sa-east-1.amazonaws.com/rhponto.rep.file/AFD00009003650006674.txt'; //Agraria01
var request = require('request');
var Readable = require('stream').Readable;
const readline = require('readline');

router.post('/allRepAppoints', function(req, res){

    //console.log('#Iniciando request: ', new Date());
    
    request(urlStaticREPFile, function (error, response, body) {
        
        if (response && response.statusCode === 200){
                        
            // getFeriadosAssync(body, callback).then(v => {
            //return res.json(body);
            // });
            var s = new Readable();
            s.push(body);    // the string you want
            s.push(null);      // indicates end-of-file basically - the end of the stream
            const rl = readline.createInterface({
              input: s//fs.createReadStream(streamData)
            });
            var nsr = "";
            var type = "";
            var data = "";
            var month = "";
            var dataFtd = {};
            var horario = "";
            var horarioFtd = {};
            var pis = "";
            var total = null;
            var objMarcacao = {};
            var pisDateMap = {};
            var hashMapSize = 0;
            var count = 0;
            var countOther = 0;
            rl.on('line', function (line) {

                if(line.charAt(9) === "3"){//posição que indica o tipo de Registro, se for 3 é marcação!
                    
                    nsr = line.substring(0, 9);
                    type = line.substring(9, 10);
                    data = line.substring(10, 18);
                    horario = line.substring(18, 22);
                    horarioFtd.hora = horario.substring(0, 2);
                    horarioFtd.minuto = horario.substring(2, 4);
                    pis = line.substring(22, 34);
                    
                    objMarcacao = {
                        nsr: nsr,
                        hora: horarioFtd.hora,
                        min: horarioFtd.minuto,
                        strHorario: horarioFtd.hora.concat(':', horarioFtd.minuto)
                    }

                    if (!pisDateMap[pis]){//Não tem um pis mapeado, primeira vez'
                        
                        var dateMapTemp = {};
                        dateMapTemp[data] = [objMarcacao];
                        pisDateMap[pis] = dateMapTemp;
                        hashMapSize++;

                    } else {//já tem um pisDateMap['0032']
                        //caso não haja esse hash, a gnt inicializa o array de marcações nele
                        // //console.log('#Já tem um pis mapeado: ', pisDateMap[pis]);
                        if (!pisDateMap[pis][data]){
                            
                            // //console.log('-Não tem um pis e data mapeados', pisDateMap[pis][data]);
                            pisDateMap[pis][data] = [objMarcacao];
                            hashMapSize++;

                        } else {
                            ////console.log('#Já tem um pis e data mapeados: ', pisDateMap[pis][data]);
                            (pisDateMap[pis][data]).push(objMarcacao);
                        }
                    }

                    count++;

                } else {
                    countOther++;
                }

            }).on('close', function(){

                //console.log('Quantidade de marcações: ', count);
                //console.log('Dados que não compõem marcações: ', countOther);
                const orderedPisDateMap = {};
                
                var dateCountPis = [];
                var monthJS;
                itemsProcessed = 0

                for (var pis in pisDateMap){
                    if (pisDateMap.hasOwnProperty(pis)) {
                        //console.log("pis: ", pis);
                        dateCountPis = [];
                        for (var date in pisDateMap[pis]){
                            if (pisDateMap[pis].hasOwnProperty(date)){

                                monthJS = parseInt(date.substring(2,4));
                                dateCountPis.push(new Date(date.substring(4,8), monthJS-1, date.substring(0,2), 0, 0, 0, 0));
                            }
                        }

                        pisDateMap[pis] = dateCountPis.sort(function(a,b){
                          return new Date(b) - new Date(a);
                        });
                    }
                }
                
                return res.json({rawReps: pisDateMap});
                //Agora posso chamar a rotina para navegar no HashMap e criar os apontamentos
                //iterateHashAndSaveDB(pisDateMap, hashMapSize, callback);
            });            

        } else {

            //console.log('Aconteceu um erro na comunicação com o arquivo local do REP, código do erro: ', error);
            return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento: '+error});
            // callback();
        }
    });

    //return res.json({rawReps: count, rawOther: countOther});
});

function sortMarcacoes(newApontamento) {

    newApontamento.marcacoes.sort(
        function (a, b) {
          return a.totalMin - b.totalMin;
    });

    newApontamento.marcacoesFtd.sort(
        function(a, b){//ordena o array de marcaçõesFtd
            return a.localeCompare(b);
    }); 

    if (newApontamento.historico){

        if (newApontamento.historico.length > 0){

            for (var i=0; i < newApontamento.historico.length; i++){

                if (newApontamento.historico[i].marcacoes){
                    if (newApontamento.historico[i].marcacoes.length > 0){
                        newApontamento.historico[i].marcacoes.sort(
                            function (a, b) {
                                return a.totalMin - b.totalMin;
                        });

                         newApontamento.historico[i].marcacoesFtd.sort(
                            function(a, b){//ordena o array de marcaçõesFtd
                                return a.localeCompare(b);
                        }); 
                        for (var k=0; k < newApontamento.historico[i].marcacoes.length; k++){

                            newApontamento.historico[i].marcacoes[k].id = k+1;
                            newApontamento.historico[i].marcacoes[k].descricao = getDescription(k);
                        }   
                    }
                }
            }
        }        
    }

    for (var k=0; k < newApontamento.marcacoes.length; k++){

        newApontamento.marcacoes[k].id = k+1;
        newApontamento.marcacoes[k].descricao = getDescription(k);
    }   

};

function getDescription (index){

    if (index === 0)
        return "ent1";
    else if (index === 1)
        return "sai1";
    else if (index === 2)
        return "ent2";
    else if (index === 3)
        return "sai2";
    else { //verificar quantos pares de entrada/saida já foram adicionados para gerar a descricao
        if (index % 2 === 0) {//se é par
          return "ent" + ( (index/2) + 1);
        } else {
          return "sai" + (Math.floor(index/2) + 1);
        }
     }

};

module.exports = router;