const database = require('./config/database');
const Funcionario = require('./app/models/funcionario');
const Apontamento = require('./app/models/apontamento');
const Feriado = require('./app/models/feriado');
const Equipe = require('./app/models/equipe');
const libRHPontum = require('./util/calculateAppoint');
const libPDFReports = require('./util/generateReportPdf');
const fs = require('fs');
const moment = require('moment');
const http = require('http');
//const request = require('request');
const Async = require('async');
const Aws = require('aws-sdk');
const Config = require('./config.js');
const path = require('path');

const Readable = require('stream').Readable;
const readline = require('readline');
const timePeriod = 5 * 60 * 1000;//minuto * segundo * ms
var feriados = [];
var itemsProcessed = 0;
var requestCount = 0;

const urlStaticREPFileArray = [
  'https://s3-sa-east-1.amazonaws.com/rhponto.rep.file/AFD00009003650006843.txt',
  'https://s3-sa-east-1.amazonaws.com/rhponto.rep.file/AFD00009003650006848.txt',
  'https://s3-sa-east-1.amazonaws.com/rhponto.rep.file/AFD00009003650006815.txt',
  'https://s3-sa-east-1.amazonaws.com/rhponto.rep.file/AFD00009003650006797.txt',
  'https://s3-sa-east-1.amazonaws.com/rhponto.rep.file/AFD00009003650006774.txt',
  'https://s3-sa-east-1.amazonaws.com/rhponto.rep.file/AFD00009003650006689.txt'
];
const pathCreateFile = path.resolve("file_reps", "file.txt");
const RepS3File = 'arquivo_teste.txt';
const REPLocalFile = 'REPLast/AGR1_AFD00009003650006774.txt';
const urlStaticREPFile = 'https://s3-sa-east-1.amazonaws.com/rhponto.rep.file/AFD00009003650006774.txt'; //Juazeiro
moment.locale('pt-br');
process.env.AWS_SDK_LOAD_CONFIG = 1;

console.log("Path ", pathCreateFile);

process.on('uncaughtException', function(err) {
	console.log('process on - uncaughtException', err);
});

async function getFeriados() {
    
  try {
      
    let feriados = await Feriado.find().exec();
    //console.log("Qtde Feriados: ", feriados.length);
    return feriados;        

  } catch (err) {
    throw err;
  }
}

async function getEquipes() {

  try {
    let equipes = await Equipe.find()
    .populate('setor')
    .populate(
      {
        path: 'componentes',
        select: 'nome sobrenome PIS matricula',
        model: 'Funcionario'
      })
    .exec();
    //console.log("Qtde Equipes: ", equipes.length);
    return equipes;
  } catch (err) {
    throw err;
  }
}

/*
** Requisita o arquivo .txt com os apontamentos recuperados do REP e armazenados na nuvem 
*/
async function getFilesS3(){
           
  const params = {
    Bucket: Config.awsrep.bucketName,
    Key: RepS3File    
  };
  
  try {
    const s3 = new Aws.S3();
    const file = fs.createWriteStream(pathCreateFile);
    const fileAws = await s3.getObject(params).promise();
   
    //console.log(`Length: ${fileAws.ContentLength}`);
    const s = new Readable();
    s.push(fileAws.Body);    // the string you want
    s.push(null);      // indicates end-of-file basically - the end of the stream
    //console.log('S: ', s);
    const rl = readline.createInterface({
      input: s//fs.createReadStream(streamData)
    });
    let count = 0;
    console.log("Vai iniciar a leitura da stream");
    for await (const line of rl) {
      console.log(line);
      count++;
    }
    console.log(`Foram lidas ${count} linhas.`);
   
  } 
  catch (err) {
    
    console.log(err);
  }
  
};

//NEW CODE!!!
// function waitTimePeriod(){
//   setTimeout(function(){
//     getFileRequest(waitTimePeriod);
//   }, timePeriod);
// }

// getFileRequest(waitTimePeriod);

async function start(){
  
  // feriados = await getFeriados();
  // console.log("Feriados: ", feriados.length);
  // equipes = await getEquipes();
  // console.log("Equipes: ", equipes.length);
  // equipes.forEach(equipe => {
  //     console.log("Nome Eq: ", equipe.nome);
  //     equipe.componentes.forEach(componente => {
  //         console.log("Comp: ", componente);
  //     });
  // });
  console.log("Iniciou chamada");
  await getFilesS3();
  console.log("Terminou execução");
}

start();