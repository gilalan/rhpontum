var Turno = require('../../models/turno');
var router = require('express').Router();
var config = require('../../../config');

//=========================================================================
// API para Turnos
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

//Get ALL turnos
router.get('/', function(req, res) {

	Turno.find()
  .populate('escala', 'codigo nome')
  .exec(function(err, turnos){
		
		if(err) {
     	return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
  	}
      		
    return res.json(turnos);
	});

});

//Create turno
router.post('/', function(req, res) {

  console.log("req", req.body);
  var turnoObj = req.body;

  Turno.create(turnoObj, function(err, turno){

    if(err) {
      console.log('erro post turno: ', err);
      
      if (err.code === 11000) {
        console.log('turno existente!');
        return res.status(500).send({success: false, message: 'Turno já existente na base de dados!'});
      }
      
      return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
    }

    Turno.findOne({_id: turno._id})
    .populate('escala', 'codigo')
    .exec(function(err, nTurno){

      if (err)
        return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});

      return res.status(200).send({success: true, message: 'Turno cadastrado com sucesso! Prossiga com o preenchimento da jornada', turno: nTurno});
    });
  });
});

//Traz apenas 1 turno
router.get('/:id', function(req, res) {

  var idTurno = req.params.id;

  Turno.findOne({_id: idTurno})
  .populate('escala', 'codigo nome')
  .exec(function(err, turno){
    
    if(err) {
      return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
    }        
          
    return res.json(turno);
  });

});

//Atualiza 1 turno
router.put('/:id', function(req, res){

  var idTurno = req.params.id;  

  Turno.findOne({_id: idTurno}, function(err, turno){

    if(err) {
      console.log('Erro no FINDONE: ', err);
      return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
    }

    turno.codigo = req.body.codigo;
    turno.descricao = req.body.descricao;
    turno.isFlexivel = req.body.isFlexivel;
    turno.intervaloFlexivel = req.body.intervaloFlexivel;
    turno.ignoraFeriados = req.body.ignoraFeriados;
    turno.tolerancia = req.body.tolerancia;
    turno.jornada = req.body.jornada;

    //tenta atualizar de fato no BD
    turno.save(function(err){
      
      if(err){
        console.log('Erro no save do update', err);
        return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
      }


    });

    //return res.json(turno);
    return res.status(200).send({success: true, message: 'Turno atualizado com sucesso!'});
  });
});

router.delete('/:id', function(req, res){

  var idTurno = req.params.id;
  Turno.remove({_id: idTurno}, function(err){
    if(err){
      console.log('Erro no delete turno', err);
      return res.status(500).send({success: false, message: 'Ocorreu um erro no processamento!'});
    }
    return res.status(200).send({success: true, message: 'Turno removido com sucesso!'});
  });

});

module.exports = router;