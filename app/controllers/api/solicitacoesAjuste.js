var SolicitacaoAjuste = require('../../models/solicitacaoAjuste');
var Funcionario = require('../../models/funcionario');
var EventoAbono = require('../../models/eventoAbono');
var Apontamento = require('../../models/apontamento');
var Usuario = require('../../models/usuario');
var Equipe = require('../../models/equipe');
var moment = require('moment');
var router = require('express').Router();
var Async = require('async');
var aws = require('aws-sdk');
var randomString = require('../../../randomString');
var config = require('../../../config');

// aws.config = new aws.Config();
// aws.config.accessKeyId = config.awsAccessKeyId;
// aws.config.secretAccessKey = config.awsSecretAccessKey;
// aws.config.region = config.region;

//=========================================================================
// API para Solicitacoes de Ajuste de Ponto
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
var accessLevel = 4;

//Get ALL solicitacoes de ajuste - tipo 0
router.get('/', function(req, res) {

	SolicitacaoAjuste.find({tipo: 1})
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
  .populate('eventoAbono', 'nome')
  .sort({data: 'asc'})
  .exec(function(err, solicitacoes){
		
		if(err) {
     	return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
  	}
      		
    return res.json(solicitacoes);
	});

});

//Create solicitacao
router.post('/', function(req, res) {

  //console.log("req", req.body);
  var solicitacaoObj = req.body;
  //var dateParametro = solicitacaoObj.date;

  // var dateMom = moment({year: dateParametro.year, month: dateParametro.month,
  //       day: dateParametro.day});
  //solicitacaoObj.data = new Date(dateParametro.year, dateParametro.month, dateParametro.day);
  
  if (solicitacaoObj.date)
    delete solicitacaoObj.date;
  
  if (solicitacaoObj.rawData)
    delete solicitacaoObj.rawData;

  //console.log('solicitacao: ', solicitacaoObj);

  var files = solicitacaoObj.anexo;
  var s3 = new aws.S3();  
  var matches, params, uploadBody, randomSubfolder;
  var savedArray = [];
  console.log("vai tentar salvar no bucket s3");  
  Async.eachSeries(files, function updateObject (obj, done) {
    console.log('vez do ', obj.name);
    randomSubfolder = randomString.generate(20);
    matches = obj.data.match(/data:([A-Za-z-+\/].+);base64,(.+)/);
    if (matches === null || matches.length !== 3) {
      return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
    }
    uploadBody = new Buffer(matches[2], 'base64');
    params = {
      Bucket: config.aws.bucketName,
      Key: obj.matr + '/' + randomSubfolder + '/' + obj.name,
      Body: uploadBody,
      ACL:'public-read'
    };

    savedArray.push({
      name: obj.name,
      key: obj.matr + '/' + randomSubfolder,
      bucket: params.Bucket
    });

    s3.upload(params, done);

  }, function allDone (err) {
      if (err)
        return res.status(500).send({success: false, message: err});
        
      console.log("Todas as imagens carregadas no bucket", savedArray.length);
      //usar o savedArray para preencher os objetos de solicitacaoAJuste.
      //return res.status(200).send({success: true, message: "Solicitação atualizada!"});
      console.log("vai tentar criar a solicitacao na base de dados agora");
      solicitacaoObj.anexo = savedArray;
      SolicitacaoAjuste.create(solicitacaoObj, function(err, solicitacao){
        if(err) {
          console.log('erro post solicitacao: ', err);
          
          if (err.code === 11000) {
            console.log('solicitacao existente!');
            return res.status(500).send({success: false, message: 'Solicitação já existente na base de dados!'});
          }
          
          return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
        }
        
        return res.status(200).send({success: true, message: 'Solicitação cadastrada com sucesso!'});
      });  
    }
  );
});

//Traz apenas 1 solicitacao
router.get('/:id', function(req, res) {

  var idSolicitacaoAjuste = req.params.id;

  SolicitacaoAjuste.findOne({_id: idSolicitacaoAjuste})
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
  .populate('eventoAbono', 'nome')
  .exec(function(err, solicitacao){
    
    if(err) {
      return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
    }        
          
    return res.json(solicitacao);
  });
});

//Atualiza 1 solicitacao
router.put('/:id', function(req, res){

  var idSolicitacaoAjuste = req.params.id;  

  SolicitacaoAjuste.findOne({_id: idSolicitacaoAjuste}, function(err, solicitacao){

    if(err) {
      console.log('Erro no FINDONE: ', err);
      return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
    }

    solicitacao.data = req.body.data;
    solicitacao.funcionario = req.body.funcionario;
    solicitacao.status = req.body.status;
    solicitacao.resposta = req.body.resposta;
    solicitacao.motivo = req.body.motivo;
    solicitacao.anexo = req.body.anexo;
    solicitacao.anterior = req.body.anterior;
    solicitacao.proposto = req.body.proposto;

    //tenta atualizar de fato no BD
    solicitacao.save(function(err){
      
      if(err){
        console.log('Erro no save do update', err);
        return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
      }
    });

    //return res.json(solicitacao);
    return res.status(200).send({success: true, message: 'Solicitação atualizada com sucesso!'});
  });
});

router.delete('/:id', function(req, res){

  var idSolicitacaoAjuste = req.params.id;
  SolicitacaoAjuste.remove({_id: idSolicitacaoAjuste}, function(err){
    if(err){
      console.log('Erro no delete solicitacao', err);
      return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
    }
    return res.status(200).send({success: true, message: 'Solicitação removida com sucesso!'});
  });
});

/*
** Traz as solicitações pendentes de um funcionário em determinada data.
*/
router.post('/data/funcionario', function(req, res){

  var objFuncDate = req.body;
  var dateParametro = objFuncDate.date;
  var dateMom = moment({year: dateParametro.year, month: dateParametro.month,
        day: dateParametro.day});

  var today = dateMom.startOf('day');
  var tomorrow = moment(today).add(1, 'days');

    
  console.log('today moment: ', today);
  console.log('tomorrow moment: ', tomorrow);

  if (dateParametro.finalInclude){
    tomorrow = moment({year: dateParametro.final.year, month: dateParametro.final.month,
        day: dateParametro.final.day});
    tomorrow = moment(tomorrow).add(1, 'days');
  }


  var query = {data: {$gte: today.toDate(),$lt: tomorrow.toDate()}, funcionario: objFuncDate.funcionario._id, status: 0, tipo: 0};

  if (objFuncDate.tipo)
    query = {data: {$gte: today.toDate(),$lt: tomorrow.toDate()}, funcionario: objFuncDate.funcionario._id, status: 0, tipo: objFuncDate.tipo};

  //console.log('query: ', query);
  //status 0 -> pendente
  SolicitacaoAjuste.find(query)
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
  .populate('eventoAbono', 'nome')
  .exec(function(err, solicitacoes){
    
    if(err) {
      return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento: '+err});
    }

    console.log("Solicitacoes mongoose: ", solicitacoes.length);
    return res.json(solicitacoes);
  });
});

router.post('/solicitationappoint', function(req, res){

  var _solicitacao = req.body.solicitacao;
  var _apontamento = req.body.apontamento;
  var isNewApt = req.body.isNew;

  //console.log("_solicitacao: ", req.body);
  //console.log("_solicitacao: ", _solicitacao);

  SolicitacaoAjuste.findOne({_id: _solicitacao._id}, function(err, solicitacao){

    if(err) {
      console.log('Erro no FINDONE: ', err);
      return res.status(500).send({success: false, message: 'Ocorreu um erro no FINDONE da Solicitação!'});
    }

    //solicitacao.funcionario = _solicitacao.funcionario;
    //solicitacao.data = _solicitacao.data;
    solicitacao.resposta = _solicitacao.resposta;
    solicitacao.status = _solicitacao.status;
    //solicitacao.anexo = _solicitacao.anexo;
    //solicitacao.motivo = _solicitacao.motivo;
    //solicitacao.anterior = _solicitacao.anterior;
    //solicitacao.proposto = _solicitacao.proposto;

    //tenta atualizar de fato no BD
    solicitacao.save(function(err){
      
      if(err){
        console.log('Erro no save do update', err);
        return res.status(500).send({success: false, message: 'Ocorreu um erro no save da Solicitação!'});
      }

      if (isNewApt) {

        Apontamento.create(_apontamento, function(err, apontamento) {
        
          if(err) {
            console.log('erro post apontamento: ', err);
            return res.status(500).send({success: false, message: 'Ocorreu um erro na criação do apontamento!'});
          }   
          
          console.log('criou apontamento normalmente');
          return res.status(200).send({success: true, message: 'Atualizações efetuadas com sucesso!'});
          //return res.json(apontamento);
        });

      } else {
        
        Apontamento.findOneAndUpdate({_id: _apontamento._id}, _apontamento, { upsert: false, new: false }, function(err, apontamento){
          if (err){
            console.log('erro ao atualizar apontamento', err);
          }

          console.log('atualizou normalmente');
          return res.status(200).send({success: true, message: 'Atualizações efetuadas com sucesso!'});
        });
      }
    });

    // return res.status(200).send({success: true, message: 'Solicitação atualizada com sucesso!'});
  });
});

router.post('/createsolicitationappoint', function(req, res){

  var _solicitacao = req.body.solicitacao;
  var _apontamento = req.body.apontamento;
  var isNewApt = req.body.isNew;

  //console.log("_solicitacao: ", req.body);
  //console.log("_solicitacao: ", _solicitacao);
  
  var files = _solicitacao.anexo;
  var s3 = new aws.S3();  
  var matches, params, uploadBody, randomSubfolder;
  var savedArray = [];
  console.log("vai tentar salvar no bucket s3");  
  Async.eachSeries(files, function updateObject (obj, done) {
    console.log('vez do ', obj.name);
    randomSubfolder = randomString.generate(20);
    matches = obj.data.match(/data:([A-Za-z-+\/].+);base64,(.+)/);
    if (matches === null || matches.length !== 3) {
      return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
    }
    uploadBody = new Buffer(matches[2], 'base64');
    params = {
      Bucket: config.aws.bucketName,
      Key: obj.matr + '/' + randomSubfolder + '/' + obj.name,
      Body: uploadBody,
      ACL:'public-read'
    };

    savedArray.push({
      name: obj.name,
      key: obj.matr + '/' + randomSubfolder,
      bucket: params.Bucket
    });

    s3.upload(params, done);

  }, function allDone (err) {
      if (err)
        return res.status(500).send({success: false, message: err});
        
      console.log("Todas as imagens carregadas no bucket", savedArray.length);
      //usar o savedArray para preencher os objetos de solicitacaoAJuste.
      //return res.status(200).send({success: true, message: "Solicitação atualizada!"});
      console.log("vai tentar criar a solicitacao na base de dados agora");
      _solicitacao.anexo = savedArray;
      SolicitacaoAjuste.create(_solicitacao, function(err, solicitacao){

        if(err) {
          console.log('Erro no Create: ', err);
          return res.status(500).send({success: false, message: 'Ocorreu um erro no Criar Solicitação!'});
        }

        if (isNewApt) {

          Apontamento.create(_apontamento, function(err, apontamento) {
          
            if(err) {
              console.log('erro post apontamento: ', err);
              return res.status(500).send({success: false, message: 'Ocorreu um erro na criação do apontamento!'});
            }   
            
            console.log('criou apontamento normalmente');
            return res.status(200).send({success: true, message: 'Atualizações efetuadas com sucesso!'});
            //return res.json(apontamento);
          });

        } else {
          
          Apontamento.findOneAndUpdate({_id: _apontamento._id}, _apontamento, { upsert: false, new: false }, function(err, apontamento){
            if (err){
              console.log('erro ao atualizar apontamento', err);
            }

            console.log('Atualizou o objeto, vai tentar carregar os anexos...');
            return res.status(200).send({success: true, message: 'Atualizações efetuadas com sucesso!'});
          });
        }
      });
    }
  );


});

router.post('/insertAndUpdateMany', function(req, res){

  var _solicitacao = req.body.solicitacao;
  var _apontamentos = req.body.apontamentos;
  var uploaded = req.body.uploaded ? true : false;

  var files = _solicitacao.anexo;
  var s3 = new aws.S3();  
  var matches, params, uploadBody, randomSubfolder;
  var savedArray = [];
  
  if (!uploaded) {

    console.log("vai tentar salvar no bucket s3");  
    Async.eachSeries(files, function updateObject (obj, done) {
      console.log('vez do ', obj.name);
      randomSubfolder = randomString.generate(20);
      matches = obj.data.match(/data:([A-Za-z-+\/].+);base64,(.+)/);
      if (matches === null || matches.length !== 3) {
        return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
      }
      uploadBody = new Buffer(matches[2], 'base64');
      params = {
        Bucket: config.aws.bucketName,
        Key: obj.matr + '/' + randomSubfolder + '/' + obj.name,
        Body: uploadBody,
        ACL:'public-read'
      };

      savedArray.push({
        name: obj.name,
        key: obj.matr + '/' + randomSubfolder,
        bucket: params.Bucket
      });

      s3.upload(params, done);

    }, function allDone (err) {
        if (err)
          return res.status(500).send({success: false, message: err});
          
        console.log("Tudo finalizado na atualizacao da solicitacao", savedArray.length);
        //usar o savedArray para preencher os objetos de solicitacaoAJuste.
        //return res.status(200).send({success: true, message: "Solicitação atualizada!"});
        _solicitacao.anexo = savedArray;
        SolicitacaoAjuste.findOne({_id: _solicitacao._id}, function(err, solicitacao){

          if(err) {
            console.log('Erro no FINDONE: ', err);
            return res.status(500).send({success: false, message: 'Ocorreu um erro no FINDONE da Solicitação!'});
          }

          solicitacao.resposta = _solicitacao.resposta;
          solicitacao.status = _solicitacao.status;
          solicitacao.anexo = _solicitacao.anexo;

          //tenta atualizar de fato no BD
          solicitacao.save(function(err){
            
            if(err){
              console.log('Erro no save do update', err);
              return res.status(500).send({success: false, message: 'Ocorreu um erro no save da Solicitação!'});
            }

            Apontamento.insertMany(_apontamentos.novos, function(err, novosApontamentos){

              if(err) {
                console.log('Erro no FINDONE: ', err);
                return res.status(500).send({success: false, message: 'Ocorreu um erro no FINDONE da Solicitação!'});
              }
            });

            Async.eachSeries(_apontamentos.antigos, function updateObject (obj, done) {
                      
              Apontamento.update({ _id: obj._id }, { $set : { "marcacoes": obj.marcacoes, "marcacoesFtd": obj.marcacoesFtd, 
                "infoTrabalho": obj.infoTrabalho, "status": obj.status }}, done);
                //console.log("obj a ser atualizado: ", obj.infoTrabalho);
                //console.log("obj a ser atualizado: ", obj.status);
              }, function allDone (err) {
                  if (err)
                    return res.status(500).send({success: false, message: err});
                  console.log("Tudo finalizado na atualizacao da solicitacao");
                  return res.status(200).send({success: true, message: "Solicitação atualizada!"});
              });

          });

          //return res.status(200).send({success: true, message: 'Solicitação atualizada com sucesso!'});
        });
      }

    );
  } 
  else {

    SolicitacaoAjuste.findOne({_id: _solicitacao._id}, function(err, solicitacao){

      if(err) {
        console.log('Erro no FINDONE: ', err);
        return res.status(500).send({success: false, message: 'Ocorreu um erro no FINDONE da Solicitação!'});
      }

      solicitacao.resposta = _solicitacao.resposta;
      solicitacao.status = _solicitacao.status;
      solicitacao.anexo = _solicitacao.anexo;

      //tenta atualizar de fato no BD
      solicitacao.save(function(err){
        
        if(err){
          console.log('Erro no save do update', err);
          return res.status(500).send({success: false, message: 'Ocorreu um erro no save da Solicitação!'});
        }

        Apontamento.insertMany(_apontamentos.novos, function(err, novosApontamentos){

          if(err) {
            console.log('Erro no FINDONE: ', err);
            return res.status(500).send({success: false, message: 'Ocorreu um erro no FINDONE da Solicitação!'});
          }
        });

        Async.eachSeries(_apontamentos.antigos, function updateObject (obj, done) {
                  
          Apontamento.update({ _id: obj._id }, { $set : { "marcacoes": obj.marcacoes, "marcacoesFtd": obj.marcacoesFtd, 
            "infoTrabalho": obj.infoTrabalho, "status": obj.status }}, done);
            //console.log("obj a ser atualizado: ", obj.infoTrabalho);
            //console.log("obj a ser atualizado: ", obj.status);
          }, function allDone (err) {
              if (err)
                return res.status(500).send({success: false, message: err});
              console.log("Tudo finalizado na atualizacao da solicitacao");
              return res.status(200).send({success: true, message: "Solicitação atualizada!"});
          });

      });

      //return res.status(200).send({success: true, message: 'Solicitação atualizada com sucesso!'});
    });
  }


});

router.post('/createAndUpdateMany', function(req, res){

  var _solicitacao = req.body.solicitacao;
  var _apontamentos = req.body.apontamentos;

  var files = _solicitacao.anexo;
  var s3 = new aws.S3();  
  var matches, params, uploadBody, randomSubfolder;
  var savedArray = [];
  console.log("vai tentar salvar no bucket s3");  
  Async.eachSeries(files, function updateObject (obj, done) {
    console.log('vez do ', obj.name);
    randomSubfolder = randomString.generate(20);
    matches = obj.data.match(/data:([A-Za-z-+\/].+);base64,(.+)/);
    if (matches === null || matches.length !== 3) {
      return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
    }
    uploadBody = new Buffer(matches[2], 'base64');
    params = {
      Bucket: config.aws.bucketName,
      Key: obj.matr + '/' + randomSubfolder + '/' + obj.name,
      Body: uploadBody,
      ACL:'public-read'
    };

    savedArray.push({
      name: obj.name,
      key: obj.matr + '/' + randomSubfolder,
      bucket: params.Bucket
    });

    s3.upload(params, done);

  }, function allDone (err) {
      if (err)
        return res.status(500).send({success: false, message: err});
        
      console.log("Tudo finalizado no envio dos arquivos, vai cadastrar solicitacao", savedArray.length);
      //usar o savedArray para preencher os objetos de solicitacaoAJuste.
      //return res.status(200).send({success: true, message: "Solicitação atualizada!"});
      _solicitacao.anexo = savedArray;
      SolicitacaoAjuste.create(_solicitacao, function(err, solicitacao){

        if(err) {
          console.log('Erro no FINDONE: ', err);
          return res.status(500).send({success: false, message: 'Ocorreu um erro no FINDONE da Solicitação!'});
        }

        Apontamento.insertMany(_apontamentos.novos, function(err, novosApontamentos){

          if(err) {
            console.log('Erro no FINDONE: ', err);
            return res.status(500).send({success: false, message: 'Ocorreu um erro no FINDONE da Solicitação!'});
          }
        });

        Async.eachSeries(_apontamentos.antigos, function updateObject (obj, done) {
                  
          Apontamento.update({ _id: obj._id }, { $set : { "marcacoes": obj.marcacoes, "marcacoesFtd": obj.marcacoesFtd, 
            "infoTrabalho": obj.infoTrabalho, "status": obj.status, "historico": obj.historico }}, done);
            //console.log("obj a ser atualizado: ", obj.infoTrabalho);
            //console.log("obj a ser atualizado: ", obj.status);
          }, function allDone (err) {
              if (err)
                return res.status(500).send({success: false, message: err});
              console.log("Tudo finalizado na atualizacao da solicitacao");
              return res.status(200).send({success: true, message: "Solicitação atualizada!"});
          });

        });
    }
  );

});

router.post('/getbystatus', function(req, res){

  var objStatus = req.body;

  SolicitacaoAjuste.find({status: objStatus.status})
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
  .populate('eventoAbono', 'nome')
  .sort({data: 'asc'})
  .exec(function(err, solicitacoes){
    
    if(err) {
      return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
    }
          
    return res.json(solicitacoes);
  });
});

router.post('/getbyteams', function(req, res){

  var obj = req.body;

  SolicitacaoAjuste.find({status: obj.status, funcionario: {$in: obj.employees}})
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
  .populate('eventoAbono', 'nome')
  .sort({data: 'asc'})
  .exec(function(err, solicitacoes){
    
    if(err) {
      return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
    }
          
    return res.json(solicitacoes);
  });
});

router.post('/getbycomponents', function(req, res){

  var obj = req.body;
  var idUsuario = obj.userId;

  Usuario.findOne({_id: idUsuario})
  .populate('perfil')
  .populate({
      path: 'funcionario', 
      select: 'nome sobrenome email PIS sexoMasculino alocacao',
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
  .exec(function(err, usuario){
    
    if(err) {
      return res.status(500).send({success: false, message: 'Ocorreu um erro na obtenção do Usuário no Banco de Dados!'});
    }        
    //console.log("usuário retornado no get único: ", usuario.funcionario.nome);      

    var query = {};
    var func = usuario.funcionario;
    if (func.alocacao.gestor)
      query = {gestor: func._id};
    else if (func.alocacao.fiscal)
      query = {fiscal: func._id};


    Equipe.find(query)
    //.populate('gestor', 'nome')
    //.populate('setor', 'nome descricao')
    .sort({nome: 'asc'})
    .populate({
      path: 'componentes',
      select: 'nome sobrenome PIS matricula sexoMasculino alocacao active',
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
    .populate('setor', 'nome local')
    .exec(function(err, equipes){
      
      if(err) {
        return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
      }
      
      console.log("Qtde de Equipes trazidas: ", equipes.length);
      var allEmployees = [];
      for (var i=0; i < equipes.length; i++) {
        for (var j=0; j < equipes[i].componentes.length; j++) {
          if (equipes[i].componentes[j].active === true){
            allEmployees.push(equipes[i].componentes[j]);  
          }
        }
      }
      console.log("Qtde de employees nas equipes: ", allEmployees.length);

      SolicitacaoAjuste.find({status: obj.status, funcionario: {$in: allEmployees}})
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
      .populate('eventoAbono', 'nome')
      .sort({data: 'asc'})
      .exec(function(err, solicitacoes){
        
        if(err) {
          return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
        }
              
        return res.json(solicitacoes);
      });
      //return res.json(equipes);
    });
    //return res.json(usuario);
  });
});

router.post('/uploadImage', function(req, res){
  var obj = req.body;
  //console.log("obj recebido: ", obj);
  var files = obj.array;
  var s3 = new aws.S3();  
  var matches, params, uploadBody, randomSubfolder;
  var savedArray = [];
  console.log("vai tentar salvar no bucket s3");  
  Async.eachSeries(files, function updateObject (obj, done) {
    console.log('vez do ', obj.name);
    randomSubfolder = randomString.generate(20);
    matches = obj.data.match(/data:([A-Za-z-+\/].+);base64,(.+)/);
    if (matches === null || matches.length !== 3) {
      return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
    }
    uploadBody = new Buffer(matches[2], 'base64');
    params = {
      Bucket: config.aws.bucketName,
      Key: obj.matr + '/' + randomSubfolder + '/' + obj.name,
      Body: uploadBody,
      ACL:'public-read'
    };

    savedArray.push({
      name: obj.name,
      key: obj.matr + '/' + randomSubfolder,
      bucket: params.Bucket
    });

    s3.upload(params, done);

  }, function allDone (err) {
      if (err)
        return res.status(500).send({success: false, message: err});
        
      console.log("Tudo finalizado na atualizacao da solicitacao", savedArray.length);
      //usar o savedArray para preencher os objetos de solicitacaoAJuste.
      return res.status(200).send({success: true, message: "Solicitação atualizada!"});
    }
  );

  /*
  var folder = //"teste";//randomString.generate(20); // I guess I do this because when the user downloads the file it will have the original file name.
  var uploadName = "gilliTeste.png";

  //var matches = files.match(/data:([A-Za-z-+\/].+);base64,(.+)/); //não sei oq é isso
  
  var matches = files[0].data.match(/data:([A-Za-z-+\/].+);base64,(.+)/); //não sei oq é isso

  if (matches === null || matches.length !== 3) {
    return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
  }

  var uploadBody = new Buffer(matches[2], 'base64');

  var params = {
    Bucket: config.aws.bucketName,
    Key: folder + '/' + uploadName,//req.body.uploadName,
    Body: uploadBody,
    ACL:'public-read'
  };
  console.log("vai tentar salvar no bucket s3");  

  s3.putObject(params, function(err, data) {
    if (err)
      console.log(err)
    else {
      console.log("Successfully uploaded data to csk3-uploads/" + folder + '/' + uploadName);
      return res.json({
        name: uploadName,
        bucket: config.aws.bucketName,
        key: folder
      });
    }
   }); 
   */

});

//Get Apontamentos + Solicitações que existam para um dado funcionário num período de datas.
router.post('/getallbyemployee', function(req, res){

    var objDateWorker = req.body;
    var dateParametro = objDateWorker.date;
    var dateFinalParametro = objDateWorker.date.final;
    var funcionario = objDateWorker.funcionario;

    var startDateMom = moment({year: dateParametro.year, month: dateParametro.month,
        day: dateParametro.day, hour: dateParametro.hour, minute: dateParametro.minute});

    var endDateMom = moment({year: dateFinalParametro.year, month: dateFinalParametro.month,
        day: dateFinalParametro.day, hour: dateFinalParametro.hour, minute: dateFinalParametro.minute});

    var firstDay = dateParametro ? startDateMom.startOf('day') : moment(new Date()).startOf('day');
    var lastDay = dateFinalParametro ? endDateMom.startOf('day') : moment(new Date()).startOf('day');
    
    var oneDayMoreLastDay = moment(lastDay).add(1, 'days');
    
    var queryDate = {$gte: firstDay.toDate(), $lt: oneDayMoreLastDay.toDate()};
    if (dateParametro.finalInclude)
        queryDate = {$gte: firstDay.toDate(), $lte: oneDayMoreLastDay.toDate()};
    

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

        var query = {data: {$gte: firstDay.toDate(), $lt: oneDayMoreLastDay.toDate()}, funcionario: funcionario._id, status: 0};
        if (objDateWorker.tipo)
          query = {data: {$gte: firstDay.toDate(), $lt: oneDayMoreLastDay.toDate()}, funcionario: funcionario._id, status: 0, tipo: objDateWorker.tipo};

        //console.log('query: ', query);
        //status 0 -> pendente
        SolicitacaoAjuste.find(query)
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
        .populate('eventoAbono', 'nome')
        .exec(function(err, solicitacoes){
          
          if(err) {
            return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento: '+err});
          }

          console.log("Solicitacoes mongoose: ", solicitacoes.length);
          return res.json({apontamentos: apontamentos, solicitacoes: solicitacoes});
        });

        //return res.json(apontamentos);
    });
   
});

module.exports = router;