//Database configuration =================
var database = require('./config/database');

//const errorLog = require('./util/logger').errorlog;
//const successLog = require('./util/logger').successlog;
var Funcionario = require('./app/models/funcionario');
var Apontamento = require('./app/models/apontamento');
var Feriado = require('./app/models/feriado');
var Equipe = require('./app/models/equipe');
var fs = require('fs');
var moment = require('moment');
var http = require('http');
var request = require('request');
var async = require('async');

/* Usando o serviço S3 da Amazon: */
//JUAZEIRO: AFD00009003650006843
//PETROLINA: AFD00009003650006848
//FAUNA: AFD00009003650006815
//FLORA: AFD00009003650006797
//AGRARIA01 (FAZENDA?): AFD00009003650006774
//AGRARIA02 (FAZENDA?): AFD00009003650006689
var urlStaticREPFileArray = [
    'https://s3-sa-east-1.amazonaws.com/rhponto.rep.file/AFD00009003650006843.txt',
    'https://s3-sa-east-1.amazonaws.com/rhponto.rep.file/AFD00009003650006848.txt',
    'https://s3-sa-east-1.amazonaws.com/rhponto.rep.file/AFD00009003650006815.txt',
    'https://s3-sa-east-1.amazonaws.com/rhponto.rep.file/AFD00009003650006797.txt',
    'https://s3-sa-east-1.amazonaws.com/rhponto.rep.file/AFD00009003650006774.txt',
    'https://s3-sa-east-1.amazonaws.com/rhponto.rep.file/AFD00009003650006689.txt'
];

var arrayTeste = ['https://s3-sa-east-1.amazonaws.com/rhponto.rep.file/arquivo_teste.txt',
    					'https://s3-sa-east-1.amazonaws.com/rhponto.rep.file/arquivo_teste2.txt',
    					'https://s3-sa-east-1.amazonaws.com/rhponto.rep.file/arquivo_teste3.txt'];

var requestCount = 0;


process.on('uncaughtException', function(err) {
	console.log('process on - uncaughtException', err);
});

/*
* Realizar o pedido assincrono de cada arquivo no array
*/
// function sequentialRequests(count, i){
  	
//   	if (i == undefined) {i = 0};
//   	if (i >= count) {return};
  
// 	request(urlStaticREPFileArray[i], function (error, response, body) {
//     //var reqID = JSON.parse(body).headers['Request-Id']
//     if (response && response.statusCode === 200){
                        
//         console.log("request: ", urlStaticREPFileArray[i]);
//         console.log("responseStatusCode: ", response.statusCode);

//     } else {

//         console.log("error: ", error);
//         //callback();
//     }
//     sequentialRequests(count, ++i);
//   });
// };

function getFeriadosAssync(){

    Feriado.find(function(err, feriados){
        
        console.log('Entrou no feriado.find: ', feriados.length);

        if(err) 
            console.log('Erro ao obter lista de feriados');
        
        else {
        	// SEQUENTIAL REQUESTS
			// Have to try a little bit
			//var promisse = sequentialRequests(urlStaticREPFileArray.length);
			//promisse.allDone(function(){console.log("funcionou a promisse")});
			main();
        }

    });
};


function getDataFromBucket(obj) {
    
    // Return new promise 
    return new Promise(function(resolve, reject) {
    	// Do async job
        request.get(obj, function(err, resp, body) {
            if (err) {
                reject(err);
            } else {
            	console.log('arquivo: ', obj);
            	console.log('last-mod: ', resp.headers['last-modified']);
            	var stream = new Readable();
		        stream.push(body);    // the string you want
		        stream.push(null);      // indicates end-of-file basically - the end of the stream
                resolve({lastMod: resp.headers['last-modified'], data: stream});
            }
        })
    })

};

function main() {
    
    //Requests
    var promise0 = getDataFromBucket(arrayTeste[0]);
    var promise1 = getDataFromBucket(arrayTeste[1]);
    var promise2 = getDataFromBucket(arrayTeste[2]);
    //var promise0 = getDataFromBucket(arrayTeste[3]);
    //var promise0 = getDataFromBucket(arrayTeste[4]);
    //var promise0 = getDataFromBucket(arrayTeste[5]);

	Promise.all([promise0, promise1, promise2]).then(function(values) {
	  console.log("Vai ler os arquivos: ");
	  var readPromises = [];
	  for (var i = 0; i < values.length; i++) {
	  	var readPromise = readFile(values[i]);
	  }
	});
};

function readFile(streamData, callback){
    
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

    var getLastNSRProcessed = getLastRowProcessed().trim();

    if (!getLastNSRProcessed)
        activate = true;
    
    successLog.info('Ultima NSR processada: ', getLastNSRProcessed);
    getLastNSRProcessed = calculateSaltNSR(getLastNSRProcessed);
    successLog.info('NSR calculada para início da leitura: ', getLastNSRProcessed);
    // successLog.info('Hora do readFile!');

    const rl = readline.createInterface({
      input: streamData//fs.createReadStream(streamData)
    });
    var count = 0;
    rl.on('line', function (line) {
        //successLog.info("NSR: ", typeof line.substring(0,9));
        if (getLastNSRProcessed === line.substring(0, 9)){
            // successLog.info('Encontrou , ativando busca ');
            activate = true;
        }
        if(activate && line.charAt(9) === "3"){//posição que indica o tipo de Registro, se for 3 é marcação! Vejo tb se é a última linha processada (para nao ter que ficar lendo o arquivo inteiro sempre)
            //console.log('line: ', line);
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
            // dataFtd.day = data.substring(0, 2);
            //month = data.substring(2, 4);
            //console.log('month string: ', month);
            // dataFtd.month = parseInt(month);
            //console.log('month parseInt: ', dataFtd.month);
            // dataFtd.year = data.substring(4, 8);
            horario = line.substring(18, 22);
            horarioFtd.hora = horario.substring(0, 2);
            horarioFtd.minuto = horario.substring(2, 4);
            pis = line.substring(22, 34);
            
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
                //console.log('-Não tem um pis mapeado, primeira vez');
                var dateMapTemp = {};
                dateMapTemp[data] = [objMarcacao];
                pisDateMap[pis] = dateMapTemp;
                hashMapSize++;

            } else {//já tem um pisDateMap['0032']
                //caso não haja esse hash, a gnt inicializa o array de marcações nele
                if (!pisDateMap[pis][data]){
                    
                    // console.log('-Não tem um pis e data mapeados', pisDateMap[pis][data]);
                    pisDateMap[pis][data] = [objMarcacao];
                    hashMapSize++;

                } else {
                    //console.log('#Já tem um pis e data mapeados: ', pisDateMap[pis][data]);
                    (pisDateMap[pis][data]).push(objMarcacao);
                }
            }
            //searchDataAssync(nsr, dataFtd, horarioFtd, pis);
        } // só olha o registro de número 3 que é o de MARCAÇÃO DE PONTO
      
    }).on('close', function(){

        // successLog.info('Quantidade de marcações: ', count);
        // successLog.info('hashMapSize: ', hashMapSize);
        saveLastRowProcessed(nsr);
        //Agora posso chamar a rotina para navegar no HashMap e criar os apontamentos
        iterateHashAndSaveDB(pisDateMap, hashMapSize, callback);
    });
};

getFeriadosAssync();