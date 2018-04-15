var exports = module.exports = {};

var Equipe = require('../app/models/equipe');
var Funcionario = require('../app/models/funcionario');
var Cargo = require('../app/models/cargo');
var Turno = require('../app/models/turno');
var Escala = require('../app/models/escala');
var Apontamento = require('../app/models/apontamento');
var Feriado = require('../app/models/feriado');
var fs = require('fs');
var moment = require('moment');
const readline = require('readline');
var feriados = [];
var equipeF = {};
var itemsProcessed = 0;
var feriados = [];

exports.readFile = function(streamData, rFeriados, componentes, arrayPIS){
  
  console.log('vai no readFile');
  feriados = rFeriados;
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
  
  
  const rl = readline.createInterface({
    input: streamData//fs.createReadStream(streamData)
  });
  var count = 0;
  rl.on('line', function (line) {
      
      if(line.charAt(9) === "3"){//posição que indica o tipo de Registro
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

          if (arrayPIS.some(elem => elem == pis)){ //retorna true se encontrar o pis no array dos funcionários enviados
            if (pis == "016000859474")
            	console.log('##encontrou o pis e vai tentar atualizar o apontamento: ', pis);
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
          }  
                    
          //searchDataAssync(nsr, dataFtd, horarioFtd, pis);
      } // só olha o registro de número 3 que é o de MARCAÇÃO DE PONTO
    
  }).on('close', function(){

      //Agora posso chamar a rotina para navegar no HashMap e criar os apontamentos
      iterateHashAndSaveDB(pisDateMap, hashMapSize);
  });
};

function iterateHashAndSaveDB(pisDateMap, hashMapSize){

  var count = 0;
  itemsProcessed = 0

  for (var pis in pisDateMap){
    if (pisDateMap.hasOwnProperty(pis)) {
       count++;
       // console.log("Key is " + pis);
       for (var date in pisDateMap[pis]){
          if (pisDateMap[pis].hasOwnProperty(date)){
            // console.log("sub key is " + date + ", value is " + pisDateMap[pis][date]);
            searchPISAndSaveAppointment(pis, {dia: date.substring(0, 2), 
              mes: date.substring(2, 4), ano: date.substring(4, 8)}, 
              pisDateMap[pis][date]);//.then(v => {

            itemsProcessed++;
            if(itemsProcessed === hashMapSize){
              console.log('itemsProcessed: ', itemsProcessed);
              console.log('## Terminou tudo, chamaria o callback ##');
            }
          }
       }
    }
  }
};

function searchPISAndSaveAppointment(pis, dateObj, marcacoesObj){

  marcacoesObj.sort(function(a, b){//ordena o array de marcações
    return a.total - b.total;
  });

  if (pis == "016000859474")
  	console.log('tentando salvar e atualizar o pis');

  Funcionario.findOne({PIS: pis})
  .populate('alocacao.cargo', 'especificacao nomeFeminino')
  .populate({
    path: 'alocacao.turno',
    model: 'Turno',
    populate: [{path: 'escala', model: 'Escala'}]
  })
  .populate('alocacao.instituicao', 'nome sigla')
  .exec(function(err, funcionario){
      
    if(err) {
      console.log('Erro ao recuperar funcionario na BD. Erro: ', err);
      return false;
    }
    
    if (funcionario && funcionario.PIS){

      Equipe.findOne({componentes: funcionario._id})
      .populate('setor', 'nome local')
      .exec(function(err, equipe){

        if(err) {
            console.log('Erro ao recuperar equipe do funcionario no BD. Erro: ', err);
            return false;
        }
        equipeF = equipe;
        if(!saveOrUpdateAssyncApontamento(dateObj, marcacoesObj, funcionario)){
          console.log('Erro no parsing do mês!');
        }
      });

    } else {

      console.log('Funcionário não encontrado na base, PIS: ', pis);
    }
  });
};

function saveOrUpdateAssyncApontamento(dateObj, marcacoesObj, funcionario){

    var funcionario = funcionario;
    var pis = funcionario.PIS;
    //console.log('saveOrUpdateAssyncApontamento para o funcionario: ', funcionario.nome.concat(' ', funcionario.sobrenome));
    var monthJS = parseInt(dateObj.mes);
    if (!monthJS)
        return false;

    var appError = '';
    //particularidade do javascript date (month de 0 a 11)
    var dateMom = moment({year: dateObj.ano, month: monthJS-1,
        day: dateObj.dia, hour: 0, minute: 0});

    //console.log('#moment date: ', dateMom.format());

    var today = dateMom.startOf('day');//moment(dateApontamento.dataInicial).startOf('day');
    var tomorrow = moment(today).add(1, 'days');
    
    //console.log('today moment: ', today);
    //console.log('tomorrow moment: ', tomorrow);

    var newDate = new Date(dateObj.ano, monthJS-1, dateObj.dia, 0, 0, 0, 0);
    if (pis == "016000859474")
  		console.log('newDate ', newDate);

    if (isValidDate(newDate, new Date(funcionario.alocacao.dataAdmissao))) {
        
        Apontamento.findOne({data: {$gte: today.toDate(),$lt: tomorrow.toDate()}, PIS: pis})
        .populate('funcionario', 'nome PIS')
        .exec(function(err, apontamento){
            
            if(err) {
                console.log('Erro ao recuperar apontamento, pis: ', pis);
                console.log(err);
                appError = err;
                return appError;
            }

            if (!apontamento) {
                
                var arrayMarcacoes = createMarcacoes(marcacoesObj, newDate, null);
                //console.log('## Criando apontamento com a data: ', newDate);
                var extraInfo = createExtraInfo(funcionario, newDate, arrayMarcacoes);

                if (extraInfo) {

                    var apontamento = {
                        data: getOnlyDate(newDate),
                        status: setStatus(arrayMarcacoes, null),
                        funcionario: funcionario._id,
                        PIS: pis,
                        marcacoes: arrayMarcacoes,
                        justificativa: '',
                        infoTrabalho: extraInfo.infoTrabalho,
                        marcacoesFtd: createMarcacoesFtd(arrayMarcacoes)
                    };
                    console.log('## Vai criar o apontamento: ', apontamento.data);
                    Apontamento.create(apontamento, function(err, appoint) {
                
                        if(err) {
                          console.log('erro post apontamento: ', err);
                        }   
                        else {
                          console.log('Apontamento criado com sucesso!. id: ', appoint._id);
                        }
                        
                    });

                } else {

                    console.log('Não pôde cadastrar o apontamento pois o funcionário não tem turno/escala configurados.');
                }

            } 
            // else { //já tem apontamento, vamos atualizá-lo

            //     var arrayMarcacoes = createMarcacoes(marcacoesObj, newDate, apontamento.marcacoes);
            //     //console.log('## Atualizando apontamento com a data: ', newDate);
            //     if (apontamento.infoTrabalho) {
            //         apontamento.infoTrabalho.trabalhados = getWorkedMinutes(arrayMarcacoes);
            //     }
            //     apontamento.marcacoes = arrayMarcacoes;
            //     apontamento.marcacoesFtd = createMarcacoesFtd(arrayMarcacoes);
            //     apontamento.status = setStatus(arrayMarcacoes, null);
                
            //     //tenta atualizar de fato no BD
            //     apontamento.save(function(err){
                    
            //       if(err)
            //         console.log('Erro no save do update de apontamento', err);
            //       // else 
            //       console.log('## Apontamento atualizado com sucesso', newDate);
            //       return true;

            //     });
            // }

        });

    } else {

        console.log('Não criou o apontamento pois a data é inválida (antes da data de admissão ou maior que a data corrente).', newDate);
        return false;
    }
            
};

/*
** Cria o Objeto de Marcações padronizado para a base de dados
** Arg1: marcacoesObj - são as marcações provenientes do arquivo txt do REP
** Arg2: date - é a data do registro provenient tb do arquivo txt do REP
** Arg3: marcacoesOriginais - são as marcações já efetuadas e recuperadas no BD
*/
function createMarcacoes(marcacoesObj, date, marcacoesOriginais){

    //novo array de marcações que será retornado
    var marcacoes = [];
    var marcacao = {};

    if (!marcacoesOriginais) {

        for (var i=0; i<marcacoesObj.length; i++){
            
            marcacao = {}; //'reseta' p não sobrar resquícios da última
            marcacao = {
                id: getId(marcacoes),
                descricao: getDescricao(marcacoes),
                hora: parseInt(marcacoesObj[i].hora),
                minuto: parseInt(marcacoesObj[i].min),
                segundo: 0,
                totalMin: (parseInt(marcacoesObj[i].hora) * 60) + parseInt(marcacoesObj[i].min),
                strHorario: marcacoesObj[i].strHorario,
                tzOffset: 180,
                RHWeb: false,
                REP: true,
                NSR: marcacoesObj[i].nsr,
                motivo: '',
                gerada: {}
            };

            marcacoes.push(marcacao);
        }
        
    } else {

        var inseridaREP = false;
        var abort = false;
        var indexIgualHorario = -1;
        //console.log('#atualização, marcações recebidas size: ', marcacoesOriginais.length);
        marcacoes = marcacoesOriginais.slice();//copia o array

        for (var i=0; i<marcacoesObj.length; i++){

            inseridaREP = false;
            abort = false;
            indexIgualHorario = -1;
            marcacao = {}; //'reseta' p não sobrar resquícios da última
            //console.log('marcaçõesObj - NSR: ', marcacoesObj[i].nsr);
            //console.log('marcaçõesObj - Horario: ', marcacoesObj[i].strHorario);
            for(var j=0; j < marcacoesOriginais.length && !abort; j++){
                //console.log('Originais - NSR: ', marcacoesOriginais[j].NSR);
                //console.log('Originais - Horario: ', marcacoesOriginais[j].strHorario);
                if(marcacoesObj[i].nsr == marcacoesOriginais[j].NSR) {
                    inseridaREP = true;
                    abort = true;
                }

                if(marcacoesObj[i].strHorario == marcacoesOriginais[j].strHorario) {
                    indexIgualHorario = j;
                    abort = true;
                }
            }
            //vai criar uma nova marcação a ser inserida no BD.
            if (!inseridaREP && (indexIgualHorario == -1) ){
                //console.log('Não é marcacao repetida, vai criar um obj de marcacao novo');
                marcacao = {
                    id: getId(marcacoes),
                    descricao: getDescricao(marcacoes),
                    hora: parseInt(marcacoesObj[i].hora),
                    minuto: parseInt(marcacoesObj[i].min),
                    segundo: 0,
                    totalMin: (parseInt(marcacoesObj[i].hora) * 60) + parseInt(marcacoesObj[i].min),
                    strHorario: marcacoesObj[i].strHorario,
                    tzOffset: 180,
                    RHWeb: false,
                    REP: true,
                    NSR: marcacoesObj[i].nsr,
                    motivo: '',
                    gerada: {}
                };
            }

            //para não ficar com marcações repetidas de horário na WEB e REP (espertinhospodem fazer isso)
            if (!inseridaREP && (indexIgualHorario != -1)) {
                
                console.log('caso raro em que a marcacao web e do REP tiveram mesmo horário');
                marcacoes[indexIgualHorario].NSR = marcacoesObj[i].nsr;
            }
            
            //console.log('antes de dar push, valor da marcacao: ', marcacao);
            //para não inserir marcações vazias...            
            if (marcacao.id){
                //console.log('vai dar push no array');
                marcacoes.push(marcacao);
            }

        }
    }
    //console.log('vai retornar o seguinte array de marcacoes: ', marcacoes);
    return marcacoes;
};

function createMarcacoesFtd(arrayMarcacoes){

    var marcacoesFtd = [];
    for(var i=0; i<arrayMarcacoes.length; i++){
        marcacoesFtd.push( arrayMarcacoes[i].strHorario );
    }
    return marcacoesFtd;
};

function isValidDate(dateApontamento, dataAdmissao){

    var currentDate = new Date();//Cuidado com a diferença de timezone do servidor

    //se a data do apontamento for antes da admissão, não pode cadastrar
    if (compareOnlyDates(new Date(dateApontamento), new Date(dataAdmissao)) == -1)
        return false;

    //se a data do apontamento for maior que a data de hoje tb não pode cadastras
    if (compareOnlyDates(new Date(currentDate), new Date(dateApontamento)) == -1)
        return false;

    //os demais estão ok
    return true;
};

function getId (array) {
  return (array.length + 1);
};

function getDescricao (array){
  
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

function getOnlyDate (date) {
  
  var data = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 
        0, 0, 0, 0);
  //data.setHours(0,0,0,0); //essa data é importante zerar os segundos para que não tenha inconsistência na base
  //console.log("date depois: ", data);
  return data;
}; 

function createExtraInfo(funcionario, date, arrayMarcacoes){

  var turno = null;
  var escala = null;
  var extraInformations = {};
  var infoTrabalho = {};

  if (funcionario)
    if (funcionario.alocacao)
      if (funcionario.alocacao.turno){
        turno = funcionario.alocacao.turno;
        if (funcionario.alocacao.turno.escala)
          escala = funcionario.alocacao.turno.escala;
      }
  
  var flagFeriado = isFeriado(date);
  
  if (escala) {
    
    //console.log('entrou no if de criar informações extra de Escala');
    var ignoraFeriados = turno.ignoraFeriados;
    infoTrabalho.trabalhados = getWorkedMinutes(arrayMarcacoes);

    if (escala.codigo == 1) {//escala tradicional na semana
      var diaTrabalho = isWorkingDayWeeklyScale(date.getDay(), turno.jornada.array);
      if (diaTrabalho.horarios && !flagFeriado) { //é um dia de trabalho normal

        infoTrabalho.trabalha = true;
        infoTrabalho.aTrabalhar = diaTrabalho.minutosTrabalho;        

      } else {

        if (flagFeriado && ignoraFeriados) { //é um feriado mas o turno do colaborador ignora isso
          
          infoTrabalho.trabalha = true;
          infoTrabalho.aTrabalhar = diaTrabalho.minutosTrabalho;         

        } else {

          infoTrabalho.trabalha = false;
          infoTrabalho.aTrabalhar = 0;          
        }
      }
    } else if (escala.codigo == 2){ //escala de revezamento 12x36h

      //dia de trabalho
      if (isWorkingDayRotationScale(date, new Date(funcionario.alocacao.dataInicioEfetivo)) && !flagFeriado){
        
        infoTrabalho.trabalha = true; 
        infoTrabalho.aTrabalhar = turno.jornada.minutosTrabalho;

      } else {

        if (flagFeriado && ignoraFeriados){ //é feriado mas o turno do colaborador ignora
          
          infoTrabalho.trabalha = true; 
          infoTrabalho.aTrabalhar = turno.jornada.minutosTrabalho;

        } else {
         
          infoTrabalho.trabalha = false; 
          infoTrabalho.aTrabalhar = 0;
        }
      }
    }

    extraInformations.infoTrabalho = infoTrabalho;
    return extraInformations;

  } else {

    console.log("Funcionário não possui um turno ou uma escala de trabalho cadastrado(a).");
    return undefined;
  }

};

function isFeriado(dataDesejada) {
      
  var data = dataDesejada;

  console.log('Data Desejada: ', data);
  //console.log('Setor.local: ', $scope.equipe);

  var date = data.getDate();//1 a 31
  var month = data.getMonth();//0 a 11
  var year = data.getFullYear();//
  var flagFeriado = false;
  var tempDate;      

  feriados.forEach(function(feriado){
    
    //console.log('feriado atual: ', feriado);        

    for (var i = 0; i < feriado.array.length; i++) {
      
      tempDate = new Date(feriado.array[i]);
      if (feriado.fixo){
      
        if (tempDate.getMonth() === month && tempDate.getDate() === date){
          console.log("É Feriado (fixo)!", tempDate);
          flagFeriado = checkFeriadoSchema(feriado);
          return feriado;
        }

      } else {//se não é fixo

        if ( (tempDate.getFullYear() === year) && (tempDate.getMonth() === month) && (tempDate.getDate() === date) ){
          console.log("É Feriado (variável)!", tempDate);
          flagFeriado = checkFeriadoSchema(feriado);
          return feriado;
        }
      }
    }
  });
  console.log('FlagFeriado: ', flagFeriado);
  return flagFeriado;//no futuro retornar o flag de Feriado e a descrição do mesmo!
};

function checkFeriadoSchema(feriado){

  var abrangencias = ["Nacional", "Estadual", "Municipal"];
  var flagFeriado = false;

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
};

/*
*
* Não Verifica, mas retorna o dia de trabalho na escala semanal
*
*/
function isWorkingDayWeeklyScale(dayToCompare, arrayJornadaSemanal) {
  
  var diaRetorno = {};
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
function isWorkingDayRotationScale(dateToCompare, dataInicioEfetivo) {

  var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
  
  //var d1 = new Date();//angular.copy(dateToCompare); 
  //var d2 = ;//angular.copy(dataInicioEfetivo);
  //d1.setHours(0,0,0,0);
  //d2.setHours(0,0,0,0);
  var d1 = new Date(dateToCompare.getFullYear(), dateToCompare.getMonth(), 
    dateToCompare.getDate(), 0, 0, 0, 0);
  var d2 = new Date(dataInicioEfetivo.getFullYear(), dataInicioEfetivo.getMonth(), 
    dataInicioEfetivo.getDate(), 0, 0, 0, 0);

  var diffDays = Math.round(Math.abs((d1.getTime() - d2.getTime())/(oneDay)));
  //////console.log("diffDays: ", diffDays);
  
  return (diffDays % 2 == 0) ? true : false;
};

/*
* De acordo com a atual batida do funcionário, calcula as horas trabalhadas
* Número ímpar de batidas não garante cálculo correto
*/
function getWorkedMinutes(arrayMarcacoes) {
  
  //console.log('Get Worked Minutes #remodeled!!');
  //primeira marcação, retorna 0
  if (arrayMarcacoes.length <= 1){
    return 0;

  } else {
    
    var minutosTrabalhados = 0;

    for (var i=0; i < arrayMarcacoes.length-1; i=i+2){
      //console.log('index: ', i);
      // console.log('marcacoes[i+1]: ', arrayMarcacoes[i+1].strHorario);
      // console.log('marcacoes[i]: ', arrayMarcacoes[i].strHorario);
      // console.log('saldo parcial: ', (arrayMarcacoes[i+1].totalMin - arrayMarcacoes[i].totalMin));
      minutosTrabalhados += (arrayMarcacoes[i+1].totalMin - arrayMarcacoes[i].totalMin);
      //console.log('minutosTrabalhados atualizado: ', minutosTrabalhados);
    }
    
    return minutosTrabalhados;
  } 
    
};

function converteParaMarcacaoString(hours, minutes, separator) {

  var hoursStr = "";
  var minutesStr = "";

  hoursStr = (hours >= 0 && hours <= 9) ? "0"+hours : ""+hours;           
  minutesStr = (minutes >= 0 && minutes <= 9) ? "0"+minutes : ""+minutes;

  return (separator) ? hoursStr+separator+minutesStr : hoursStr+minutesStr;
};

function setStatus(arrayMarcacoes, justificativa) {
  
  var status = {};

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

function compareOnlyDates(date1, date2) {

  //como a passagem é por referência, devemos criar uma cópia do objeto
  var d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate(), 
    0, 0, 0, 0); 
  var d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate(), 
    0, 0, 0, 0);

  //console.log('date1 time', d1.getTime());
  //console.log('date2 time', d2.getTime());

  if (d1.getTime() < d2.getTime())
    return -1;
  else if (d1.getTime() === d2.getTime())
    return 0;
  else
    return 1; 
};