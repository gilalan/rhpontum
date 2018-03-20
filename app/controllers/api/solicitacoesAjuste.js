var SolicitacaoAjuste = require('../../models/solicitacaoAjuste');
var Funcionario = require('../../models/funcionario');
var Apontamento = require('../../models/apontamento');
var moment = require('moment');
var router = require('express').Router();
var config = require('../../../config');

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

//Get ALL solicitacoes
router.get('/', function(req, res) {

	SolicitacaoAjuste.find()
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
  .exec(function(err, solicitacoes){
		
		if(err) {
     	return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
  	}
      		
    return res.json(solicitacoes);
	});

});

//Create solicitacao
router.post('/', function(req, res) {

  console.log("req", req.body);
  var solicitacaoObj = req.body;
  //var dateParametro = solicitacaoObj.date;

  // var dateMom = moment({year: dateParametro.year, month: dateParametro.month,
  //       day: dateParametro.day});
  //solicitacaoObj.data = new Date(dateParametro.year, dateParametro.month, dateParametro.day);
  
  if (solicitacaoObj.date)
    delete solicitacaoObj.date;
  
  if (solicitacaoObj.rawData)
    delete solicitacaoObj.rawData;

  console.log('solicitacao: ', solicitacaoObj);

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

  //status 0 -> pendente
  SolicitacaoAjuste.find({data: {$gte: today.toDate(),$lt: tomorrow.toDate()}, funcionario: objFuncDate.funcionario._id, status: 0})
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

  SolicitacaoAjuste.findOne({_id: _solicitacao._id}, function(err, solicitacao){

    if(err) {
      console.log('Erro no FINDONE: ', err);
      return res.status(500).send({success: false, message: 'Ocorreu um erro no FINDONE da Solicitação!'});
    }

    solicitacao.funcionario = _solicitacao.funcionario;
    solicitacao.data = _solicitacao.data;
    solicitacao.resposta = _solicitacao.resposta;
    solicitacao.status = _solicitacao.status;
    solicitacao.motivo = _solicitacao.motivo;
    solicitacao.anexo = _solicitacao.anexo;
    solicitacao.anterior = _solicitacao.anterior;
    solicitacao.proposto = _solicitacao.proposto;

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
  .sort({data: 'asc'})
  .exec(function(err, solicitacoes){
    
    if(err) {
      return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
    }
          
    return res.json(solicitacoes);
  });
});

module.exports = router;