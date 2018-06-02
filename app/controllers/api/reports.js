var Apontamento = require('../../models/apontamento');
var Funcionario = require('../../models/funcionario');
var Cargo = require('../../models/cargo');
var Turno = require('../../models/turno');
var Escala = require('../../models/escala');
var moment = require('moment');
var router = require('express').Router();
var async = require('async');

//=========================================================================
// API para Relatórios
//=========================================================================
// get Apontamentos de todos os Funcionários classificados por Equipe

router.post('/', function(req, res){

    var objDateWorker = req.body;
    var dateParametro = objDateWorker.date;
    var dateFinalParametro = objDateWorker.date.final;
    var equipe = objDateWorker.equipe;

    console.log("data inicial pura: ", dateParametro.raw);
    console.log("data final pura: ", dateFinalParametro.raw);

    var startDateMom = moment({year: dateParametro.year, month: dateParametro.month,
        day: dateParametro.day, hour: dateParametro.hour, minute: dateParametro.minute});

    var endDateMom = moment({year: dateFinalParametro.year, month: dateFinalParametro.month,
        day: dateFinalParametro.day, hour: dateFinalParametro.hour, minute: dateFinalParametro.minute});

    var firstDay = dateParametro ? startDateMom.startOf('day') : moment(new Date()).startOf('day');
    var lastDay = dateFinalParametro ? endDateMom.startOf('day') : moment(new Date()).startOf('day');

    console.log('firstDay moment: ', firstDay);
    console.log('lastDay moment: ', lastDay);

    var queryDate = {$gte: firstDay.toDate(), $lt: lastDay.toDate()};
    if (dateParametro.finalInclude)
        queryDate = {$gte: firstDay.toDate(), $lte: lastDay.toDate()};

    console.log("############# Trazendo dados!");

    Apontamento.find({data: queryDate, funcionario: {$in: equipe}})
    .populate({
        path: 'funcionario', 
        select: 'nome sobrenome PIS sexoMasculino matricula alocacao',
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
        return res.json(apontamentos);
    });

});

router.post('/updateAppoints', function(req, res){

    var arrayApps = req.body;

    // for (var i = 0; i < arrayApps.length; i++) {
        
    //     Apontamento.update({_id: arrayApps[i]._id}, 
    //         {
    //             $set: {
    //               "infoTrabalho.trabalha": arrayApps[i].trabalha, 
    //               "infoTrabalho.aTrabalhar": arrayApps[i].aTrabalhar
    //             }
    //         },
    //         function(err, count) {
               
    //             if (err) 
    //                 return res.status(500).send({success: false, message: err});
               
    //            // callback(err, count);
    //            console.log('atualizado o apontamento: ', count);
    //     });    
    // }    

    async.eachSeries(arrayApps, function updateObject (obj, done) {
        
        // Model.update(condition, doc, callback)
        //console.log('apontamento? ', obj._id);
        Apontamento.update({ _id: obj._id }, { $set : { "marcacoes": obj.marcacoes, "marcacoesFtd": obj.marcacoesFtd, "infoTrabalho.trabalha": obj.trabalha, "infoTrabalho.trabalhados": obj.trabalhados, "infoTrabalho.aTrabalhar": obj.aTrabalhar }}, done);

    }, function allDone (err) {
        if (err)
            return res.status(500).send({success: false, message: err});

        return res.status(200).send({success: true, message: "tudo atualizado!"});
    });
    
});

router.post('/setFeriasAppoints', function(req, res){

    var arrayApps = req.body;

    async.eachSeries(arrayApps, function updateObject (obj, done) {
        
        Apontamento.update({ _id: obj._id }, { $set : { "infoTrabalho.trabalha": obj.trabalha, "infoTrabalho.aTrabalhar": obj.aTrabalhar, "infoTrabalho.ferias": obj.estaFerias }}, done);

    }, function allDone (err) {
        if (err)
            return res.status(500).send({success: false, message: err});
        
        return res.status(200).send({success: true, message: "tudo atualizado!"});
    });
    
});

// router.post('/', function(req, res) {    
   
//    	var objDateWorker = req.body;
//     var dateParametro = objDateWorker.date;
//     var dateFinalParametro = objDateWorker.date.final;
    
//     console.log("data inicial pura: ", dateParametro.raw);
//     console.log("data final pura: ", dateFinalParametro.raw);

//     var startDateMom = moment({year: dateParametro.year, month: dateParametro.month,
//         day: dateParametro.day, hour: dateParametro.hour, minute: dateParametro.minute});

//     var endDateMom = moment({year: dateFinalParametro.year, month: dateFinalParametro.month,
//         day: dateFinalParametro.day, hour: dateFinalParametro.hour, minute: dateFinalParametro.minute});

//     var firstDay = dateParametro ? startDateMom.startOf('day') : moment(new Date()).startOf('day');
//     var lastDay = dateFinalParametro ? endDateMom.startOf('day') : moment(new Date()).startOf('day');
    
//     console.log('firstDay moment: ', firstDay);
//     console.log('lastDay moment: ', lastDay);

//     var queryDate = {$gte: firstDay.toDate(), $lt: lastDay.toDate()};
//     if (dateParametro.finalInclude)
//         queryDate = {$gte: firstDay.toDate(), $lte: lastDay.toDate()};

//    	var funcionariosApontamentos = [];
//     //var cursor = Funcionario.find({ occupation: /host/ }).cursor();
//     var cursorFunc = Funcionario.find({active: true}).populate('alocacao.cargo').cursor();
// 	cursorFunc.on('data', function(func) {
// 	  // Called once for every funcionario
//       //console.log('funcionário cursor:', func.nome);
//       var arrayApontamentosFunc = [];
// 	  var cursorApontamentos = Apontamento.find({data: queryDate, funcionario: func._id}).cursor();
      
//       cursorApontamentos.on('data', function(appoint) {
//         arrayApontamentosFunc.push(appoint);
//       });

//       cursorApontamentos.on('close', function() {
//         funcionariosApontamentos.push({
//             funcionario: func,
//             apps: arrayApontamentosFunc
//         });
//       });

// 	});
// 	cursorFunc.on('close', function() {
// 	    // Called when done
//         console.log('close cursor', funcionariosApontamentos.length);
//         return res.json(funcionariosApontamentos);
//     });
// });


// cria um funcionário na BD em consultas provenientes de um POST
//router.post('/', function(req, res) {

module.exports = router;