const request = require('request');
const Readable = require('stream').Readable;
const readline = require('readline');
const timePeriod = 1 * 60 * 1000; //1 minuto

const urlAd = 'https://s3-sa-east-1.amazonaws.com/rhponto.rep.file/arquivo_teste.txt';
const arrayUrls = [
  'https://s3-sa-east-1.amazonaws.com/rhponto.rep.file/arquivo_teste.txt',
  'https://s3-sa-east-1.amazonaws.com/rhponto.rep.file/arquivo_teste2.txt'
];
const baseUrl = 'http://52.89.212.253:8080/api/feriados';
const repUrl = 'http://52.89.212.253:8080/api/reps';

var apontamentos = [];
var reps = [];
var currentRepSerial = "AFD00009003650006843"; //usando estático por enquanto

function getFileRequest(urlAd){
  console.log("Get File Function");
  return new Promise((resolve, reject) => {
    request(urlAd, function (err, response, body) {
      // in addition to parsing the value, deal with possible errors
      if (err) return err;
      try {
        // JSON.parse() can throw an exception if not valid JSON
        resolve(body);
      } catch(e) {
        reject(e);
      }
    });
  });  
};

function httpRequest(url){
  return new Promise((resolve, reject) => {
    request(url, { json: true }, (err, res, body) => {
      if (err) { return console.log(err); }
      try {
        // JSON.parse() can throw an exception if not valid JSON
        resolve(body);
      } catch(e) {
        reject(e);
      }      
    });
  });
  
};

function getLastRowProcessed(){
  //var text = fs.readFileSync(REPLocalFile, 'UTF-8');
  // var repObj = {};
  // for (var i=0; i<reps.length; i++){
  //   if (reps[i].serial == currentRepSerial){
  //     repObj = reps[i];
  //     break;
  //   }
  // }
  // return repObj;
  return " ";
};

function readFile(body) {
  
  var s = new Readable();
  s.push(body);    // the string you want
  s.push(null);    // indicates end-of-file basically - the end of the stream
  const rl = readline.createInterface({
    input: s//fs.createReadStream(streamData)
  });

  var activate = false;
  var nsr = "";
  var type = "";
  var data = "";
  var month = "";
  var dataFtd = {};
  var horario = "";
  var horarioFtd = {};
  var pis = "";
  var total = null;
  var pisDateMap = {};
  var objMarcacao = {};
  var hashMapSize = 0;
  var count = 0;
  var getLastNSRProcessed = getLastRowProcessed().trim();
    
  if (!getLastNSRProcessed)
      activate = true;

  console.log('Ultima NSR processada: ', getLastNSRProcessed);
  console.log("Vai iniciar a leitura do arquivo...");
  return new Promise((resolve, reject) => {    
    rl.on('line', function (line) {
      // if(activate && line.charAt(9) === "3"){
      if(line.charAt(9) === "3"){
        nsr = "";
        type = "";
        data = "";
        month = "";
        dataFtd = {};
        horario = "";
        horarioFtd = {};
        objMarcacao = {};
        pis = "";
        total = null;
        count++;
        nsr = line.substring(0, 9);
        type = line.substring(9, 10);
        data = line.substring(10, 18);
        horario = line.substring(18, 22);
        horarioFtd.hora = horario.substring(0, 2);
        horarioFtd.minuto = horario.substring(2, 4);
        pis = line.substring(22, 34);
        //console.log(data + ", " + horarioFtd.hora + ":" + horarioFtd.minuto);
        //organizar em um HashMap na memória antes de armazenar efetiv. no BD
        objMarcacao = {
          nsr: nsr,
          hora: horarioFtd.hora,
          min: horarioFtd.minuto,
          strHorario: horarioFtd.hora.concat(':', horarioFtd.minuto)
        }
        
        total = (parseInt(objMarcacao.hora) * 60) + parseInt(objMarcacao.min);
        
        if (total || total == 0)
          objMarcacao.total = total;
        else
          objMarcacao.erro = true;


        if (!pisDateMap[pis]){
          var dateMapTemp = {};
          dateMapTemp[data] = [objMarcacao];
          pisDateMap[pis] = dateMapTemp;
          hashMapSize++;

        } else {//já tem um pisDateMap['0032']
          if (!pisDateMap[pis][data]){
            pisDateMap[pis][data] = [objMarcacao];
            hashMapSize++;

          } else {
            (pisDateMap[pis][data]).push(objMarcacao);
          }
        }
      }
    }).on('close', function(){

      console.log("Terminou a leitura!!!");
      //Agora posso chamar a rotina para navegar no HashMap e criar os apontamentos
      //iterateHashAndSaveDB(pisDateMap, hashMapSize, callback);
      resolve(pisDateMap);
    });    
  });
  
};

function getEmployees(objPisDate){
  console.log(objPisDate);
};

async function init(callback){
  
  console.log("Init");
  console.log("HttpRequest");
  apontamentos = [];
  var feriados = await httpRequest(baseUrl);
  if(feriados.length)
    console.log("Qtde Feriados: ", feriados.length);
  //reps = await httpRequest(repUrl);
  //if(reps)
    //console.log("Lista de REPs:", reps);
  console.log("Laço para o request dos Arquivos.");
  for (var i=0; i<arrayUrls.length; i++){
    var v = await getFileRequest(arrayUrls[i]).then(v => {
      console.log("Arquivo " + i);      
      return v;
    });
    //console.log(v);
    var objPisDate = await readFile(v);
    getEmployees(objPisDate);
    //console.log("Objeto Pis Date: ", objPisDate);
  }  
  console.log("End");
  callback();
};

//NEW CODE!!!
function waitTimePeriod(){
  setTimeout(function(){
    init(waitTimePeriod);
  }, timePeriod);
}

init(waitTimePeriod);