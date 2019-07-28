var Apontamento = require('../models/apontamento');
var Funcionario = require('../models/funcionario');
var Feriado = require('../models/feriado');
var Cargo = require('../models/cargo');
var Turno = require('../models/turno');
var Escala = require('../models/escala');
/*
*
* Calcula a qtde de minutos trabalhados dentro de um array de batimentos.
* Ex.: [08:00, 12:00, 14:00, 18:00] -> return 8h * 60 = 480 min
*
*/
exports.calcularHorasMarcacoesPropostas = function(marcacoesArray){

  var minutosTrabalhados = 0;
  var lengthMarcacoes = marcacoesArray.length;
  var parcial1 = 0;
  var parcial2 = 0;

  if (lengthMarcacoes >= 2){
    for (var i=0; i < lengthMarcacoes-1; i=i+2){
      parcial1 = marcacoesArray[i+1].hora*60 + marcacoesArray[i+1].minuto;
      parcial2 = marcacoesArray[i].hora*60 + marcacoesArray[i].minuto;
      minutosTrabalhados += parcial1 - parcial2;
    }  
  }
  
  return minutosTrabalhados;
};

/*
*
* Ordena o array de marcações 
*
*/
exports.reorganizarBatidasPropostas = function(newArrayES){
  
  if (newArrayES.length > 0){

    if (newArrayES[0].strHorario)
      newArrayES.sort( function(a,b){ return a.strHorario.localeCompare(b.strHorario)} );
    else if (newArrayES[0].totalMin){
      newArrayES.sort(
        function (a, b) {
          if (a.totalMin < b.totalMin)
            return -1;
          if (a.totalMin > b.totalMin)
            return 1;
          return 0;
        } 
      );
    } else {
      newArrayES.sort(
        function (a, b) {
          if ( (a.hora*60 + b.minuto) < (b.hora*60 + b.minuto) )
            return -1;
          if ( (a.hora*60 + b.minuto) > (b.hora*60 + b.minuto) )
            return 1;
          return 0;
        } 
      );
    }

    //começando o index com 1.
    for (var i=1; i<=newArrayES.length; i++){
      newArrayES[i-1].id = i;
      if (i == 1){
        newArrayES[i-1].descricao = "ent1";
        newArrayES[i-1].rDescricao = "Entrada 1";
      } 
      else {
        if (i % 2 === 0){ //se for par é uma saída
          newArrayES[i-1].descricao = "sai"+( (i/2) );
          newArrayES[i-1].rDescricao = "Saída "+( (i/2) );
        } else { //ímpar é uma entrada
          newArrayES[i-1].descricao = "ent"+(Math.floor(i/2) + 1);
          newArrayES[i-1].rDescricao = "Entrada "+(Math.floor(i/2) + 1);
        }
      }
    }
  }  

  var newArrayESFtd = [];
  for (var j=0; j<newArrayES.length; j++){
    newArrayESFtd.push(newArrayES[j].strHorario);
  }

  return {newArray: newArrayES, newArrayFtd: newArrayESFtd};
};

exports.setStatus = function(apontamento) {

  var size = apontamento.marcacoes.length;
  if (size % 2 == 0) {//se for par, entendo que as marcações estão 'completas'
    if (apontamento.historico.length < 1){
      apontamento.status = {
        id: 0,
        descricao: "Correto"
      };
    } else {
      if (apontamento.status.abonoStr){
        if (!apontamento.status.justificativaStr || apontamento.status.justificativaStr == ""){
          apontamento.status = {
            id: 4,
            descricao: "Abonado"
          };
        }
      } else {
        if (!apontamento.status.abonoStr || apontamento.status.abonoStr == ""){
          apontamento.status = {
            id: 3,
            descricao: "Justificado"
          };
        }
      }
    }
  } else {
    apontamento.status = {
      id: 1,
      descricao: "Incompleto"
    }
  }
};