const database = require('./config/database');
//const database = require('./config/databaseServer');
const Funcionario = require('./app/models/funcionario');
const Apontamento = require('./app/models/apontamento');
const Feriado = require('./app/models/feriado');
const Equipe = require('./app/models/equipe');
const RepDB = require('./app/models/rep');
const moment = require('moment');
const Aws = require('aws-sdk');
const Config = require('./config.js');
const Readable = require('stream').Readable;
const readline = require('readline');

const timePeriod = 20 * 60 * 1000;//minuto * segundo * ms
let feriados = [];
let equipes = [];
let funcionarios = [];

moment.locale('pt-br');
process.env.AWS_SDK_LOAD_CONFIG = 1;

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

async function getFuncionarios() {

  try {

    let funcionarios = await Funcionario.find()
    .populate('alocacao.cargo', 'especificacao nomeFeminino')
    .populate({
        path: 'alocacao.turno',
        model: 'Turno',
        populate: [{path: 'escala', model: 'Escala'}]
    })
    .populate('alocacao.instituicao', 'nome sigla')
    .exec();
    
    return funcionarios;

  } catch (err) {
    throw err;
  }

}

async function getReps() {
  try {
    let reps = await RepDB.find().exec();
    
    //console.log(`REPS is ${reps}`);
    return reps;

  } catch (err) {
    throw err;
  }
}

async function getLastNSRProcessed(serial) {
   
  console.log("serial ", serial);
  try {
    let lastNSR = await RepDB.findOne({serial}).exec();
    
    //console.log(`LastNSR for ${serial} is ${lastNSR}`);
    return lastNSR;
  } catch (err) {
    throw err;
  }
}

/*
** Requisita o arquivo .txt com os apontamentos recuperados do REP e armazenados na nuvem 
*/
async function getFilesS3(repObj){
  
  const serial = repObj.serial;
  const lastProcessed = repObj.last_processed; //on AWS
  const lastDate = repObj.last_date; //on DataBase

  const params = {
    Bucket: Config.awsrep.bucketName,
    Key: serial+".txt"//RepS3File    
  };
  
  try {
    const s3 = new Aws.S3();
    const fileAws = await s3.getObject(params).promise();
    
    console.log(`Last Date on DB: ${lastDate}, convertido: ${lastDate.getTime()}`);
    console.log(`Last Date on AWS: ${fileAws.LastModified}, convertido: ${fileAws.LastModified.getTime()}`);
    
    //se tiver desatualizado (data dos arquivos na nuvem sao maiores que a ultima data processada no banco)
    if (fileAws.LastModified.getTime() > lastDate.getTime()){
      
      const s = new Readable();
      s.push(fileAws.Body);    // the string you want
      s.push(null);      // indicates end-of-file basically - the end of the stream
      // console.log('TypeOf: ', fileAws);
      const rl = readline.createInterface({
        input: s//fs.createReadStream(s.toString())
      });
      
      console.log("Vai iniciar a leitura da stream");
  
      //let lastNSRFile = await getLastNSRProcessed(serial);
      //let lastNSRFile = {last_processed: "000033558"};
      const nsrLine = lastProcessed;
      let nsrLastRead = await readLines(rl, nsrLine);
      
      console.log("NSR Last Read: ", nsrLastRead);
      repObj.last_processed = nsrLastRead;
      repObj.last_date = new Date(fileAws.LastModified);
  
      await repObj.save();

    } 

    console.log("#### Terminou a leitura #####");
    
  } 
  catch (err) {
    
    console.log(err);
  }
  
};

async function readLines(rlFile, nsrLine){
  
  let [activate,nsr,type,dateString,month,horario,pis,hashMapSize] = [false,"","","","","","",0];
  let [dataFtd, horarioFtd, pisDateMap, objMarcacao, total] = [{},{},{},{},null];

  if(!nsrLine){//se nao tiver ultimas NSR processada no BD, tem que ler o arquivo inteiro
    activate = true;
  }

  console.log('Ultima NSR processada: ', nsrLine);
  console.log("Proxima linha esta aqui....");
  //getLastNSRProcessed = calculateSaltNSR(getLastNSRProcessed);
  //console.log('NSR calculada para início da leitura: ', getLastNSRProcessed);
  let count = 0;
  for await (const line of rlFile){
    //console.log("Entrou no For...", nsrLine == line.substring(0, 9));    
    if ( (!activate) && (nsrLine === line.substring(0, 9)) ){
      activate = true; //Vejo tb se é a última linha processada (para nao ter que ficar lendo o arquivo inteiro sempre)
    }
    if(activate && line.charAt(9) === "3"){//posição que indica o tipo de Registro, se for 3 é marcação!
      
      month = "";
      dataFtd = {};
      objMarcacao = {};
      nsr = "" || line.substring(0, 9);
      type = "" || line.substring(9, 10);
      dateString = "" || line.substring(10, 18);
      horario = "" || line.substring(18, 22);
      pis = "" || line.substring(22, 34);
      horarioFtd = {
        hora: horario.substring(0, 2),
        minuto: horario.substring(2, 4)
      };
      total = null;
      count++;

      console.log("Line ", nsr);
      
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
   
      //console.log("#READLINE# - PIS do Funcionário: ", pis);
      let {dateMom, today, tomorrow} = _formatDateMoment(dateString);

      let apontamento = await Apontamento.findOne(
        {data: 
          {$gte: today.toDate(), 
            $lt: tomorrow.toDate()}, 
            PIS: pis
          }).populate('funcionario').exec();
           
      let newDate = new Date(dateMom);
      console.log("-----------------------------------------------------------------------");
      console.log("Batimento no readLine: ", objMarcacao.strHorario);
      await _checkApontamento(apontamento, pis, newDate, objMarcacao);
      console.log("-----------------------------------------------------------------------");
    }
  }

  return nsr;
}

function _formatDateMoment(dateString){
  
  let [day,month,year] = [dateString.substring(0, 2),dateString.substring(2, 4),dateString.substring(4, 8)];
  let monthJS = parseInt(month);
  if (!monthJS)
    return false;

  //particularidade do javascript date (month de 0 a 11)
  let dateMom = moment({year: year, month: monthJS-1,
    day: day, hour: 0, minute: 0});

  console.warn('# Data formatada: ', dateMom.format('DD/MM/YYYY'));

  let today = dateMom.startOf('day');
  let tomorrow = moment(today).add(1, 'days');
  return {dateMom, today, tomorrow};
  //let newDate = new Date(dateObj.ano, monthJS-1, dateObj.dia, 0, 0, 0, 0);

}

/*
 * Verifica o retorno do apontamento, se existir ele pode estar entre 3 categorias:
 * Completo/incompleto (eh um batimento efetuado normalmente via sistema), nesse caso atualizamos;
 * Folga Compensatoria (nesse caso devemos ignorar? eu penso que devemos computar normalmente);
 * Abono (nesse caso eu ignoro os batimentos pq o dia ja foi abonado [vai aparecer as marcacoes mas a contagem eh fixa])
 * Se nao tiver abono a gnt cria um normalmente
*/
async function _checkApontamento(apontamento, pis, newDate, objMarcacao){

  try {
    let funcionario = funcionarios.find(element => {return element.PIS == pis});
    let equipeF = equipes.find(element => {return element.componentes.find(comp => {return comp.PIS == pis}) });
    // let founded = false;
    // equipes.forEach(equipe => {
    //   equipeF = equipe.componentes.find(componente => {return componente.PIS == pis});
    // });
    
    if (!funcionario) {

      console.error("Funcionário não cadastrado! Impossível realizar registros na base de dados.");
      return false;
    }

    if (!equipeF) {
      
      console.log(`Funcionário ${funcionario.nome} ${funcionario.sobrenome} 
      não possui uma equipe associada, impossibilitando o armazenamento dos seus registros na base de dados.`);
      return false;
    }
    
    console.log(`## Funcionario: ${funcionario.nome}, ${funcionario.matricula} , equipe: ${equipeF.nome}`);

    if (apontamento){ 

      console.log(`### Tem Apontamento: ${apontamento.status} e ${apontamento.infoTrabalho}`);
      //Só vamos alterar os apontamentos que não tenham sido já criados por justificativas...
      if (apontamento.status.id != 3){
        let arrayMarcacoes = _createMarcacao(objMarcacao, apontamento.marcacoes);
        apontamento.marcacoes = arrayMarcacoes;
        apontamento.marcacoesFtd = _createMarcacoesFtd(arrayMarcacoes);      
      
        //Para apontamentos abonados
        if (apontamento.status.id != 4) {

          if (apontamento.infoTrabalho) {
            apontamento.infoTrabalho.trabalhados = _getWorkedMinutes(arrayMarcacoes);
          }

          if (apontamento.status.id != 5)
            apontamento.status = _setStatus(arrayMarcacoes, null);
        }
      }               
      console.log(`*** Vai ATUALIZAR o apontamento! ***`);
      //tenta atualizar de fato no BD
      await apontamento.save();

    } else {

      //console.log("Nao tem apontamento nessa data, vai criar");
      let extraInfo = _createExtraInformations(funcionario, newDate, equipeF);
      let arrayMarcacoes = _createMarcacao(objMarcacao, null);

      apontamento = {
        data: _getOnlyDate(newDate),
        status: {id: 1, descricao: 'Incompleto'},
        funcionario: funcionario._id,
        PIS: pis,
        marcacoes: arrayMarcacoes,
        justificativa: '',
        infoTrabalho: extraInfo.infoTrabalho,
        marcacoesFtd: _createMarcacoesFtd(arrayMarcacoes)
      };
      console.log(`+++ Vai criar o apontamento! +++`);
      await Apontamento.create(apontamento);
    }
  }

  catch(err){
    console.log("error: ", err);
  }
  
}

function _getOnlyDate (date) {
  
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 
        3, 0, 0, 0);
}; 

/*
 * Cria o objeto de infoTrabalho do apontamento
*/
function _createExtraInformations(funcionario, date, equipeF){

  try {

    let [turno, escala, extraInformations, infoTrabalho] = [null,null,{},{}];

    turno = funcionario.alocacao.turno;
    escala = funcionario.alocacao.turno.escala;
    
    let flagFeriado = _isFeriado(date, equipeF);
    console.log("Is feriado? ", flagFeriado);

    if (escala) {
    
      console.log('entrou no if de criar informações extra de Escala');
      const ignoraFeriados = turno.ignoraFeriados;
      let minutos_trabalhados = undefined;
      if (escala.codigo == 1) {//escala tradicional na semana
  
        let diaTrabalho = _isWorkingDayWeeklyScale(date.getDay(), turno.jornada.array);
        if (diaTrabalho.horarios && !flagFeriado) { //é um dia de trabalho normal
  
          infoTrabalho.trabalha = true;
          infoTrabalho.aTrabalhar = diaTrabalho.minutosTrabalho;
          minutos_trabalhados = _getWorkedMinutes(date);
          if (minutos_trabalhados != undefined)
            infoTrabalho.trabalhados = _getWorkedMinutes(date);//só calcula para ciclos pares de batidas
  
        } else {
  
          if (flagFeriado && ignoraFeriados) { //é um feriado mas o turno do colaborador ignora isso
            
            infoTrabalho.trabalha = true;
            infoTrabalho.aTrabalhar = diaTrabalho.minutosTrabalho;
            minutos_trabalhados = _getWorkedMinutes(date);
            if (minutos_trabalhados != undefined)
              infoTrabalho.trabalhados = _getWorkedMinutes(date);//só calcula para ciclos pares de batidas
  
          } else {
  
            infoTrabalho.trabalha = false;
            infoTrabalho.aTrabalhar = 0;
            minutos_trabalhados = _getWorkedMinutes(date);
            if (minutos_trabalhados != undefined)
              infoTrabalho.trabalhados = _getWorkedMinutes(date);//só calcula para ciclos pares de batidas
          }
        }
  
      } else if (escala.codigo == 2) { //escala 12x36
  
        //dia de trabalho
        //console.log('new date from isWorkingDayRotationScale: ', new Date($scope.funcionario.alocacao.dataInicioEfetivo));
        if (_isWorkingDayRotationScale(date, new Date(funcionario.alocacao.dataInicioEfetivo)) && !flagFeriado){
          
          infoTrabalho.trabalha = true; 
          infoTrabalho.aTrabalhar = turno.jornada.minutosTrabalho;
          minutos_trabalhados = _getWorkedMinutes(date);
          if (minutos_trabalhados != undefined)
            infoTrabalho.trabalhados = _getWorkedMinutes(date);
  
        } else {
  
          if (flagFeriado && ignoraFeriados){ //é feriado mas o turno do colaborador ignora
            
            infoTrabalho.trabalha = true; 
            infoTrabalho.aTrabalhar = turno.jornada.minutosTrabalho;
            minutos_trabalhados = _getWorkedMinutes(date);
            if (minutos_trabalhados != undefined)
              infoTrabalho.trabalhados = _getWorkedMinutes(date);              
  
          } else {
           
            infoTrabalho.trabalha = false; 
            infoTrabalho.aTrabalhar = 0;
            minutos_trabalhados = _getWorkedMinutes(date);
            if (minutos_trabalhados != undefined)
              infoTrabalho.trabalhados = _getWorkedMinutes(date);
          }
        }
      }
      
      extraInformations.infoTrabalho = infoTrabalho;
  
    } else {
  
      console.log("Funcionário não possui um turno ou uma escala de trabalho cadastrado(a).");
    }
  
    return extraInformations;

  }

  catch (err){
    console.log("Erro: ", err);
  }

}

function _isFeriado(date, equipeF){

  console.log('Data Desejada: ', date);
  const dateJS = new Date(date);
  const day = dateJS.getDate();//1 a 31
  const month = dateJS.getMonth();//0 a 11
  const year = dateJS.getFullYear();//
  let flagFeriado = false;
  let tempDate;      

  feriados.forEach(function(feriado){
    
    for (let i = 0; i < feriado.array.length; i++) {
      
      tempDate = new Date(feriado.array[i]);
      if (feriado.fixo){
      
        if (tempDate.getMonth() === month && tempDate.getDate() === day){
          console.log("É Feriado (fixo)!", tempDate);
          flagFeriado = _checkFeriadoSchema(feriado, equipeF);
          return feriado;
        }

      } else {//se não é fixo

        if ( (tempDate.getFullYear() === year) && (tempDate.getMonth() === month) && (tempDate.getDate() === day) ){
          console.log("É Feriado (variável)!", tempDate);
          flagFeriado = _checkFeriadoSchema(feriado, equipeF);
          return feriado;
        }
      }
    }
  });
  return flagFeriado;//no futuro retornar o flag de Feriado e a descrição do mesmo!
}

function _checkFeriadoSchema(feriado, equipeF){

  const abrangencias = ["Nacional", "Estadual", "Municipal"];
  let flagFeriado = false;

  if (feriado.abrangencia == abrangencias[0]){

    console.log('Feriado Nacional!');
    flagFeriado = true;

  } else  if (feriado.abrangencia == abrangencias[1]){
    
    console.log('Feriado Estadual!');
    if (equipeF.setor.local.estado == feriado.local.estado._id){
      console.log('Feriado Estadual no Estado correto!');
      flagFeriado = true;
    }

  } else if (feriado.abrangencia == abrangencias[2]){
    
    console.log('Feriado Municipal!');
    if (equipeF.setor.local.municipio == feriado.local.municipio._id){
      console.log('No municipio correto!');
      flagFeriado = true;
    }
  }

  return flagFeriado;
}

function _isWorkingDayWeeklyScale(dayToCompare, arrayJornadaSemanal) {
  
  let diaRetorno = {};
  arrayJornadaSemanal.forEach(function(objJornadaSemanal){
    if(dayToCompare == objJornadaSemanal.dia){
      diaRetorno = objJornadaSemanal;
      return diaRetorno;
    }
  });
  ////console.log("DIA RETORNO NO getDayInArrayJornadaSemanal: ", diaRetorno);
  return diaRetorno;
};

/*
*
* Verifica se é dia de trabalho na escala de revezamento 12x36h 
*
*/
function _isWorkingDayRotationScale(dateToCompare, dataInicioEfetivo) {

  let oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
  
  //var d1 = new Date();//angular.copy(dateToCompare); 
  //var d2 = ;//angular.copy(dataInicioEfetivo);
  //d1.setHours(0,0,0,0);
  //d2.setHours(0,0,0,0);
  let d1 = new Date(dateToCompare.getFullYear(), dateToCompare.getMonth(), 
    dateToCompare.getDate(), 0, 0, 0, 0);
  let d2 = new Date(dataInicioEfetivo.getFullYear(), dataInicioEfetivo.getMonth(), 
    dataInicioEfetivo.getDate(), 0, 0, 0, 0);

  let diffDays = Math.round(Math.abs((d1.getTime() - d2.getTime())/(oneDay)));
  //////console.log("diffDays: ", diffDays);
  
  return (diffDays % 2 == 0) ? true : false;
};

/*
* De acordo com a atual batida do funcionário, calcula as horas trabalhadas
* Número ímpar de batidas não garante cálculo correto
*/
function _getWorkedMinutes(arrayMarcacoes) {
  
  //successLog.info('Get Worked Minutes #remodeled!!');
  if (arrayMarcacoes.length <= 1){
    return 0;

  } else {
    
    let minutosTrabalhados = 0;

    for (let i=0; i < arrayMarcacoes.length-1; i=i+2){
      minutosTrabalhados += (arrayMarcacoes[i+1].totalMin - arrayMarcacoes[i].totalMin);
    }
    
    return minutosTrabalhados;
  }     
};

/*
** Cria o Objeto de Marcações padronizado para a base de dados
** Arg1: marcacaoObj - A marcação a ser inserida proveniente do arquivo txt do REP
** Arg2: marcacoesOriginais - são as marcações já efetuadas e recuperadas no BD
*/
function _createMarcacao(marcacaoObj, marcacoesOriginais){

  let marcacoes = [];
  let marcacao = {};

  if (!marcacoesOriginais) {

    marcacao = {}; //'reseta' p não sobrar resquícios da última
    marcacao = {
      id: 1,
      descricao: "ent1",
      hora: parseInt(marcacaoObj.hora),
      minuto: parseInt(marcacaoObj.min),
      segundo: 0,
      totalMin: (parseInt(marcacaoObj.hora) * 60) + parseInt(marcacaoObj.min),
      strHorario: marcacaoObj.strHorario,
      tzOffset: 180,
      RHWeb: false,
      REP: true,
      NSR: marcacaoObj.nsr,
      motivo: '',
      gerada: {}
    };

    marcacoes.push(marcacao);

  } else {

    let [inseridaREP,abort,indexIgualHorario] = [false,false,-1];
    marcacoes = marcacoesOriginais.slice();//copia o array

    inseridaREP = false;
    abort = false;
    indexIgualHorario = -1;
    marcacao = {}; //'reseta' p não sobrar resquícios da última
    for(let j=0; j < marcacoesOriginais.length && !abort; j++){
      //successLog.info('Originais - NSR: ', marcacoesOriginais[j].NSR);
      //successLog.info('Originais - Horario: ', marcacoesOriginais[j].strHorario);
      if(marcacaoObj.nsr == marcacoesOriginais[j].NSR) {
        inseridaREP = true;
        abort = true;
      }

      if(marcacaoObj.strHorario == marcacoesOriginais[j].strHorario) {
        indexIgualHorario = j;
        abort = true;
      }
    }
    //vai criar uma nova marcação a ser inserida no BD.
    if (!inseridaREP && (indexIgualHorario == -1) ){
      //successLog.info('Não é marcacao repetida, vai criar um obj de marcacao novo');
      marcacao = {
        id: undefined,
        descricao: undefined,
        hora: parseInt(marcacaoObj.hora),
        minuto: parseInt(marcacaoObj.min),
        segundo: 0,
        totalMin: (parseInt(marcacaoObj.hora) * 60) + parseInt(marcacaoObj.min),
        strHorario: marcacaoObj.strHorario,
        tzOffset: 180,
        RHWeb: false,
        REP: true,
        NSR: marcacaoObj.nsr,
        motivo: '',
        gerada: {}
      };
      marcacoes.push(marcacao);
      marcacoes.sort( (a,b) => { return a.strHorario.localeCompare(b.strHorario)} );
      _reorganizarBatimentos(marcacoes);
    }

    //para não ficar com marcações repetidas de horário na WEB e REP (evita marcacoes repetidas)
    if (!inseridaREP && (indexIgualHorario > -1)) {
      console.log('caso raro em que a marcacao web e do REP tiveram mesmo horário', marcacaoObj.nsr);
      //marcacoes[indexIgualHorario].NSR = marcacaoObj.nsr;
    }    
    
  }
  //successLog.info('vai retornar o seguinte array de marcacoes: ', marcacoes);
  return marcacoes;
}

function _getDescricao (array){
  
  if (array.length === 0)
    return "ent1";
  else if (array.length === 1)
    return "sai1";
  else if (array.length === 2)
    return "ent2";
  else if (array.length === 3)
    return "sai2";
  else { //verificar quantos pares de entrada/saida já foram adicionados para gerar a descricao
    if (array.length % 2 === 0) {//se é par
      return "ent" + ( (array.length/2) + 1);
    } else {
      return "sai" + (Math.floor(array.length/2) + 1);
    }
  }
};

function _reorganizarBatimentos(newArrayES){
  
  for (let i=1; i<=newArrayES.length; i++){
    newArrayES[i-1].id = i;
    if (i == 1)
      newArrayES[i-1].descricao = "ent1";     
    else {
      if (i % 2 === 0) //se for par é uma saída
        newArrayES[i-1].descricao = "sai"+( (i/2) );
      else  //ímpar é uma entrada
        newArrayES[i-1].descricao = "ent"+(Math.floor(i/2) + 1);      
    }
  }

};

function _createMarcacoesFtd(arrayMarcacoes){

  let marcacoesFtd = [];
  for(let i=0; i<arrayMarcacoes.length; i++){
    marcacoesFtd.push( arrayMarcacoes[i].strHorario );
  }
  return marcacoesFtd;
};

function _setStatus(arrayMarcacoes, justificativa) {
  
  let status = {};

  if ( !justificativa ) {//se não possui justificativa
    
    if (arrayMarcacoes.length % 2 == 0){ //se for par, entendo que as marcações estão 'completas'
      status = {
        id: 0,
        descricao: "Correto"
      };
    } else {
      status = {
        id: 1,
        descricao: "Incompleto"
      };
    }

  } else {
    
    if (arrayMarcacoes.length % 2 == 0){ //se for par, entendo que as marcações estão 'completas'
      status = {
        id: 3,
        descricao: "Justificado"
      };
    } else {
      status = {
        id: 2,
        descricao: "Errado"
      };
    }    
  }

  return status;
};

async function start(){
  
  console.log("INICIO DA REQUISICAO: ", new Date());
  feriados = await getFeriados();
  console.log("$$$$$$$$$$$$$$$$ BASE DE DADOS $$$$$$$$$$$$$$$");
  console.log(`No de feriados: ${feriados.length}`);
  equipes = await getEquipes();
  console.log(`No de equipes: ${equipes.length}`);
  funcionarios = await getFuncionarios();
  console.log(`No de funcionarios: ${funcionarios.length}`);
  console.log(`Vai obter os REPs...`);
  console.log("$$$$$$$$$$$$$$$$ FIM BASE DE DADOS $$$$$$$$$$$$$$$");
  reps = await getReps();
  // let reps = [
  //   {
  //     "_id": "5da9f78f1c9d440000252ff0",
  //     "serial": "arquivo_teste2",
  //     "local": "Inexistente",
  //     "last_processed": "000006982"
  //   },
  // ];
  // let reps = [
  //   {
  //     "_id": "5da9fe781c9d440000837485",
  //     "serial": "AFD00009003650006815",
  //     "local": "Fauna",
  //     "last_processed": "000033558"
  //   }
  // ];
  console.log("############# Iniciou chamada #############");

  for await (const repObj of reps){
    console.log(`================ BEG SERIAL: ${repObj.serial} (${repObj.local}) ================`);
    await getFilesS3(repObj);
    console.log(`================ END SERIAL: ${repObj.serial} (${repObj.local}) ================`);
  }
  
  console.log("############# Terminou execução #############");
}

//NEW CODE!!!
// function waitTimePeriod(){
//   setTimeout(async() => {
//     start(waitTimePeriod);
//   }, timePeriod);
// }

// start(waitTimePeriod);

start();
setInterval(start, timePeriod);
