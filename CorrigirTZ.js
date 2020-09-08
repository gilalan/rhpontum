const database = require('./config/databaseServer');
const Funcionario = require('./app/models/funcionario');
const Apontamento = require('./app/models/apontamento');

const libRHPontum = require('./util/calculateAppoint');
const libPDFReports = require('./util/generateReportPdf');
const moment = require('moment');
const Config = require('./config.js');
const path = require('path');
let funcionarios = [];
let blackListPIS = [];
//let blackListPIS = ["012768043089", "016009751420", "016226021722", "016022194289", "016413052695", "013043724452", 
//"016094136668", "012757010451", "013774208459", "000111222333", "016553309540", "021040074180", "016598432090", 
//"016597862318", "021040073052", "020095665298"];

moment.locale('pt-br');

Date.prototype.addHours = function(h) {
  this.setTime(this.getTime() + (h*60*60*1000));
  return this;
}

function _getIncorrectAppoints(apontamentos) {

  let incorrectApts = [];
  let isoStrDate, strTz, newStrTz = "";
  apontamentos.forEach(apont => {    
    strTz = ""; 
    newStrTz = "";
    isoStrDate = apont.data.toISOString();
    strTz = isoStrDate.substr(isoStrDate.indexOf('T')+1, 2);    
    if (strTz == "00" || strTz == "01" || strTz == "02") {
      //console.log("Errada: ", apont.data);
      newStrTz = isoStrDate.substring(0, isoStrDate.indexOf('T')+1) + "03" + isoStrDate.substr(isoStrDate.indexOf('T')+3);
      apont.data = new Date(newStrTz); 
      incorrectApts.push(apont);
    }
  });
  return incorrectApts;
}

async function getFuncionarios() {

  try {

    let funcionarios = await Funcionario.find({'active': true}).exec();
    //let funcionarios = await Funcionario.find({'PIS': '013196538450'}).exec();
    
    return funcionarios;

  } catch (err) {
    throw err;
  }

}

async function getInfo(funcionario){

  try{

    let apontamentos = await Apontamento.find(
    {
      PIS: funcionario.PIS
    }).populate('funcionario').sort({'data': -1}).exec();
    
    console.log("=================================================");
    console.log(`Apontamentos do Funcionario ${funcionario.nome}, ${funcionario.PIS}: , ${apontamentos.length}`);
    let apontamentosToUpdate = _getIncorrectAppoints(apontamentos);
    console.log(`A corrigir: ${apontamentosToUpdate.length}`);
    
    let count = 0;
    let countProgress = [Math.ceil(0.25*apontamentosToUpdate.length), Math.ceil(0.5*apontamentosToUpdate.length), 
      Math.ceil(0.75*apontamentosToUpdate.length), apontamentosToUpdate.length];
    
    for await (let apontamento of apontamentosToUpdate){
      
      //newDate = apontamento.data.addHours(10);      
      count++;      
      await Apontamento.update({ _id: apontamento._id }, { $set : { "data": apontamento.data }});
      if (countProgress.includes(count))
        console.log(`${Math.ceil(100 * (count/apontamentosToUpdate.length))}% concluido...`);
    } 
    // apontamentosToUpdate.forEach(apont => {    
    //   console.log(apont.data);
    // });  

    console.log("Terminou o processamento");
    console.log("=================================================");
    console.log(" ");

    //let firstApontamentos = apontamentos.slice(0, 25);
  }

  catch (err) {
    
    console.log(err);
  }

}

async function start(){
  
  try{

    console.log("$$$$$$$$$$$$$$$$ BASE DE DADOS $$$$$$$$$$$$$$$");
    funcionarios = await getFuncionarios();
    console.log(`No de funcionarios: ${funcionarios.length}`);
    console.log("$$$$$$$$$$$$$$$$ FIM BASE DE DADOS $$$$$$$$$$$$$$$");
    
    console.log("############# Iniciou chamada #############");
    let countFunc = 0;
    for await (const funcObj of funcionarios){
      //if ( !blackListPIS.includes(funcObj.PIS) ){
      countFunc++;
      console.log(`+++++ Funcionario ${countFunc} de ${funcionarios.length} +++++`)
      await getInfo(funcObj);
      //}
    }
    
    console.log("############# Terminou execução #############");
  }

  catch (err) {
    
    console.log(err);
  }
}

start();