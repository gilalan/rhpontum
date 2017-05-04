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
        apontamento.marcacoesFtd = req.body.marcacoesFtd;
        apontamento.marcacoes_invalidadas = req.body.marcacoes_invalidadas;//no futuro não poderá atualizar as marcações
        apontamento.infoTrabalho = req.body.infoTrabalho;
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
    console.log("data pura: ", dateApontamento.dataInicial);
    console.log('dateTimezone: ', dateApontamento.tzOffset);//em minutos
    
    //testes
    var dateN = new Date(dateApontamento.dataInicial);
    var dateO = new Date(dateApontamento.year, dateApontamento.month-1, dateApontamento.day, 
        dateApontamento.hour, dateApontamento.minute, 0, 0);
    
    var dateMom = moment(dateApontamento.dataInicial);
    var dateMomO = moment({year: dateApontamento.year, month: dateApontamento.month-1,
        day: dateApontamento.day, hour: dateApontamento.hour, minute: dateApontamento.minute});
    //var localMoment = moment();
    //var utcMoment = moment.utc();
    ///var utcDateM = new Date(utcMoment.format());
    //var newDateMom = dateMom.subtract(dateApontamento.tzOffset, 'minutes');
    
    console.log('data construída através da pura: ', dateN);
    console.log('data construída separadamente: ', dateO);
    console.log("data pura criada pelo moment: ", dateMom.format());
    console.log("data pura criada pelo moment: ", dateMomO.format());
    // console.log("localMomentValueof: ", localMoment.format());
    // console.log('utcMoment: ', utcMoment.format());
    // console.log('UtcDateMoment: ', utcDateM);
    // console.log('subtraindo o tzOffset da data passada: ', newDateMom.format());

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

//Get apontamento de todos os funcionarios by DIA (data diária)
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
            console.log("erro de apontamento? ", err);
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

    console.log('dateParametro: ', dateParametro);
    console.log('dateParametro com moment: ', moment(new Date(dateParametro)));
    var today = dateParametro ? moment(new Date(dateParametro)).startOf('day') : moment(new Date()).startOf('day'); //dia atual
    //today.subtract(18, 'days'); //PARA TESTES!
    //var teste2 = moment(today).add(2, 'days');
    var otherDay = (dias >= 0) ? moment(today).add(dias, 'days') : moment(today).subtract(dias, 'days');
    
    console.log('today moment: ', today);
    //console.log("TESTE 2 OTHER DAY: ", teste2);
    //console.log("TESTE 2 OTHER DAY: ", teste3);
    console.log('other day moment: ', otherDay);

    var queryDate = (dias >= 0) ? {$gte: today.toDate(), $lt: otherDay.toDate()} : {$gte: otherDay.toDate(), $lt: today.toDate()};

    //Para um intervalo de dias, envia mais dados no populate
    if (dias > 1) {

        console.log("############# DADOS MULTIPLICADOS");

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

            console.log("Apontamento dateRange mongoose: ", apontamentos.length);
            return res.json(apontamentos);
        });
        
    } else {

        console.log("################ Dados simplificados...");

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

            console.log("Apontamento dateRange mongoose: ", apontamentos.length);
            return res.json(apontamentos);
        });
    }
});

//itera sobre uma equipe e traz os apontamentos deles, depois devolve a equipe com cada componente tendo esse apontamento acoplado em uma propriedade
//seria algo do tipo funcionario.apontamentos = [apontamentos];
//USAR CURSOR DEIXOU MTO LENTO A REQUISICAO!!!
router.post('/teste', function(req, res){

    var objDateEquipe = req.body;
    var dateParametro = objDateEquipe.date;
    var dias = objDateEquipe.dias;
    var equipe = objDateEquipe.equipe; 

    var today = dateParametro ? moment(new Date(dateParametro)).startOf('day') : moment(new Date()).startOf('day'); //dia atual
    var otherDay = (dias >= 0) ? moment(today).add(dias, 'days') : moment(today).subtract(dias, 'days');
    var funcionariosApontamentos = equipe;

    console.log('today moment: ', today);
    console.log('other day moment: ', otherDay);

    var queryDate = (dias >= 0) ? {$gte: today.toDate(), $lt: otherDay.toDate()} : {$gte: otherDay.toDate(), $lt: today.toDate()};

    if (equipe) {
        
        //equipe.forEach(function(componente){
          //  console.log("componente: ", componente);
          const cursor = 
            Apontamento.find({funcionario: {$in: equipe}, data: queryDate})
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
            }).cursor();

            cursor.on('data', function(apontamento) {
              //console.log(apontamento.data);
              //console.log(apontamento.funcionario.nome);
              equipe.forEach(function(componente){
                //console.log("componente: ", componente.nome);
                if (componente._id == apontamento.funcionario._id){
                  //  console.log("encontrou um componente com o id do funcionário");
                    if (!componente.apontamentos)
                        componente.apontamentos = [];

                    componente.apontamentos.push(apontamento);
                    //console.log("componente.apontamentos array: ", componente.apontamentos.length);
                }
              });
            });

            cursor.on('end', function(){
                return res.json(equipe);
            });

            // next(cursor.next);

            // function next(promise) {
            //   promise.then(apontamento => {
            //     if (apontamento) {
            //       console.log(apontamento);
            //       next(cursor.next());
            //     }
            //   })
            // }
            
            //return res.json(equipe);

            // cursor.next().then(function(apontamento){

            //     if (!apontamento) {
            //         console.log("Não encontrou apontamento!");
            //         return res.status(500).send({success: false, message: 'Não foi encontrado apontamento!!'});
            //     }
                
            //     console.log("Apontamento dateRange mongoose: ", apontamento.data);
            //     console.log("Apontamento dateRange mongoose: ", apontamento.funcionario.nome);

            //     equipe.forEach(function(componente){
            //         console.log("componente: ", componente.nome);
            //         if (componente._id == apontamento.funcionario._id){
            //             console.log("encontrou um componente com o id do funcionário");
            //             if (!componente.apontamentos)
            //                 componente.apontamentos = [];

            //             componente.apontamentos.push(apontamento);
            //             console.log("componente.apontamentos array: ", componente.apontamentos.length);
            //         }
            //     });
            // });
            //.exec(function(err, cursor){
                
                // if(err) {
                //     console.log("Err: ", err);
                //     return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
                // }

                // cursor.each(function(error, apontamento){

                //     if(error) {
                //         console.log("Error: ", error);
                //         return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
                //     }
                    
                // });
                //return res.json(equipe);                
           // });
       // });

        //return res.json(funcionariosApontamentos);
    }
});

//Get current date on server 
//Tem que subtrair -3h do Timezone, pois o server está com timeozne 0
router.post('/currentDate', function(req, res){

    var currentDate = new Date(); //Cria com TImeZone +3h em relação ao Brasil
    //var timezone = currentDate.getTimezoneOffset(); //em horas
    //ao invés de retornar a data com uma string completa, vou retornar ela em partes
    //lá no cliente eu reconstruo sem precisar dar um new Date() e pegar a hora local
    console.log('@# antes -  date no server: ', currentDate);
    console.log('@# UTC Date: ', currentDate.toUTCString());
    console.log('@# antes -  timezone no server: ', currentDate.getTimezoneOffset());
    //currentDate.setTime( currentDate.getTime() - currentDate.getTimezoneOffset()*60*1000 );
    //console.log('@# depois -  date no server: ', currentDate);
    //console.log('@# depois -  timezone no server: ', currentDate.getTimezoneOffset());

    return res.json({date: currentDate});
});

module.exports = router;