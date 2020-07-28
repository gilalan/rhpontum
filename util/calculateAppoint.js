const equipe = require("../app/models/equipe");

function _compareOnlyDates(date1, date2) {

    //como a passagem é por referência, devemos criar uma cópia do objeto
    var d1 = new Date(date1); 
    var d2 = new Date(date2);
    d1.setHours(0,0,0,0);
    d2.setHours(0,0,0,0);

    if (d1.getTime() < d2.getTime())
      return -1;
    else if (d1.getTime() === d2.getTime())
      return 0;
    else
      return 1; 
};

function _checkFeriadoSchema(feriado, equipe){

    const abrangencias = ["Nacional", "Estadual", "Municipal"];
    let flagFeriado = false;

    if (feriado.abrangencia == abrangencias[0]){

      flagFeriado = true;

    } else  if (feriado.abrangencia == abrangencias[1]){
      
      if (equipe.setor.local.estado == feriado.local.estado._id){
        flagFeriado = true;
      }

    } else if (feriado.abrangencia == abrangencias[2]){
      
      if (equipe.setor.local.municipio == feriado.local.municipio._id){
        flagFeriado = true;
      }
    }

    return flagFeriado;
};

function _isFeriado(dataDesejada, feriados, equipe) {
      
    let data = dataDesejada;

    let date = data.getDate();//1 a 31
    let month = data.getMonth();//0 a 11
    let year = data.getFullYear();//
    let flagFeriado = false;
    let feriadoName = "";
    let tempDate;      

    feriados.forEach(function(feriado){
      
      for (let i = 0; i < feriado.array.length; i++) {
        
        tempDate = new Date(feriado.array[i]);
        if (feriado.fixo){
        
          if (tempDate.getMonth() === month && tempDate.getDate() === date){
            flagFeriado = _checkFeriadoSchema(feriado, equipe);
            feriadoName = feriado.nome;
            return feriado;
          }

        } else {//se não é fixo

          if ( (tempDate.getFullYear() === year) && (tempDate.getMonth() === month) && (tempDate.getDate() === date) ){
            flagFeriado = _checkFeriadoSchema(feriado, equipe);
            feriadoName = feriado.nome;
            return feriado;
          }
        }
      }
    });
    return {flag: flagFeriado, name: feriadoName};
};

function _checkFerias(data, objFerias){

    let date = data.getDate();//1 a 31
    let month = data.getMonth()+1;//0 a 11 //add 1 para ficar no padrão humano
    let year = data.getFullYear();//      
    let estaFerias = false;

    if(objFerias){
        objFerias.forEach(function(ferias){
            for (let i = 0; i < ferias.arrayDias.length; i++) {
                if ( (ferias.arrayDias[i].year === year) && (ferias.arrayDias[i].month === month) && (ferias.arrayDias[i].date === date) ){
                    //console.log("Está de ferias!", ferias.arrayDias[i]);
                    estaFerias = true;
                    return estaFerias;
                }
            }
        }); 
    }
    return estaFerias;
};

function _hasFolgaSolicitada() {

};

function _hasLicenca() {

};

function _getDayInArrayJornadaSemanal(dayToCompare, arrayJornadaSemanal) {
      
    let diaRetorno = {};
    arrayJornadaSemanal.forEach(function(objJornadaSemanal){
      if(dayToCompare == objJornadaSemanal.dia){
        diaRetorno = objJornadaSemanal;
        return diaRetorno;
      }
    });
    return diaRetorno;
};

function _converteParaMinutosTotais(hours, mins) {
    return (hours * 60) + mins;
};

function _checkJornadaSemanal(funcionarioAlocacao, dataDesejada) {

  let dataHoje = new Date();
  let dataAtual = dataDesejada;

  let jornadaArray = funcionarioAlocacao.turno.jornada.array; //para ambas as escalas
  let objDay = _getDayInArrayJornadaSemanal(dataAtual.getDay(), jornadaArray);
  
  if (!objDay || !objDay.minutosTrabalho || objDay.minutosTrabalho <= 0) { //Caso 4 - DSR
    
    return {code: "DSR", string: "Descanso Semanal Remunerado", imgUrl: "assets/img/app/todo/bullet-grey-16.png"};

  } else { //Chegando aqui, só pode ser ENI ou Ausente de fato

    var codDate = _compareOnlyDates(dataAtual, dataHoje);

    if (codDate === 0) { //é o próprio dia de hoje
      //HORA ATUAL é menor que ENT1 ? caso sim, sua jornada ainda não começou
      var totalMinutesAtual = _converteParaMinutosTotais(dataHoje.getHours(), dataHoje.getMinutes());
      var ENT1 = objDay.horarios.ent1;      

      if (totalMinutesAtual < ENT1) {
              
        return {code: "ENI", string: "Expediente Não Iniciado", imgUrl: "assets/img/app/todo/bullet-blue.png"};

      } else {
        
        return {code: "AUS", minutosDia: objDay.minutosTrabalho, string: "Ausente", imgUrl: "assets/img/app/todo/mypoint_wrong16.png", saldoDia: objDay.minutosTrabalho};
      }

    } else if (codDate === -1) {//Navegando em dia passado 

      
      return {code: "AUS", minutosDia: objDay.minutosTrabalho, string: "Ausente", imgUrl: "assets/img/app/todo/mypoint_wrong16.png", saldoDia: objDay.minutosTrabalho};

    } else { //Navegando em dias futuros
      
      return {code: "ENI", string: "Expediente Não Iniciado", imgUrl: "assets/img/app/todo/bullet-blue.png"};
    }
  } 
};

function _isWorkingDay(dateToCompare, dataInicioEfetivo) {

    var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
    
    var d1 = new Date(dateToCompare); 
    var d2 = new Date(dataInicioEfetivo);
    d1.setHours(0,0,0,0);
    d2.setHours(0,0,0,0);

    var diffDays = Math.round(Math.abs((d1.getTime() - d2.getTime())/(oneDay)));
    
    return (diffDays % 2 == 0) ? true : false;
};

/*
 * Na Jornada 12x36h não adianta pegar os minutosTrabalho feito na semanal, pois temos que checar se o dia é de trabalho ou folga
 * ELes trabalham dia sim / dia não na prática, temos que saber se esse é o dia SIM ou NÃO...
*/
function _checkJornadaRevezamento(funcionarioAlocacao, dataDesejada) {

  let jornadaArray = funcionarioAlocacao.turno.jornada.array;
  let minutosTrabalho = funcionarioAlocacao.turno.jornada.minutosTrabalho;
  let dataComparacao = dataDesejada;
  let dataHoje = new Date();

  let trabalha = _isWorkingDay(dataComparacao, new Date(funcionarioAlocacao.dataInicioEfetivo));
  
  if (trabalha && jornadaArray.length > 0) { //ele deveria ter trabalhado, ou é ENI ou AUSENCIA

    let ENT1 = jornadaArray[0].horarios.ent1;
    let codDate = _compareOnlyDates(dataComparacao, dataHoje);

    if (codDate === 0) { //é o próprio dia de hoje      
      //HORA ATUAL é menor que ENT1 ? caso sim, sua jornada ainda não começou
      let totalMinutesAtual = _converteParaMinutosTotais(dataHoje.getHours(), dataHoje.getMinutes());      

      if (totalMinutesAtual < ENT1) {
      
        return {code: "ENI", string: "Expediente Não Iniciado", imgUrl: "assets/img/app/todo/bullet-blue.png"};

      } else {
        return {code: "AUS", minutosDia: minutosTrabalho, string: "Ausente", imgUrl: "assets/img/app/todo/mypoint_wrong16.png", saldoDia: funcionarioAlocacao.turno.jornada.minutosTrabalho};
      }
    } else if (codDate === -1) {//Navegando em dia passado 

        return {code: "AUS", minutosDia: minutosTrabalho, string: "Ausente", imgUrl: "assets/img/app/todo/mypoint_wrong16.png", saldoDia: funcionarioAlocacao.turno.jornada.minutosTrabalho};
    } else { //Navegando em dias futuros

      return {code: "ENI", string: "Expediente Não Iniciado", imgUrl: "assets/img/app/todo/bullet-blue.png"};
    }

  } else {

    return {code: "DSR", string: "Descanso Semanal Remunerado", imgUrl: "assets/img/app/todo/bullet-grey-16.png"}; 
  }
};

/*
* São 6 possíveis casos para ausência:
 * 1- Feriado
 * 2- ENI - Expediente Não Iniciado
 * 3- Folga solicitada e aceita / Licença
 * 4- DSR - Descanso Semanal Remunerado 
 * 5- Ausência de fato
 * 6- Férias!
*/
function _updateAbsenceStatus(funcionario, dataDesejada, feriados) {
    
    let funcionarioAlocacao = funcionario.alocacao;
    let codigoEscala = funcionarioAlocacao.turno.escala.codigo; 
    let ignoraFeriados =  funcionarioAlocacao.turno.ignoraFeriados;
    let equipe = funcionario.equipes[0];
    //if (funcionario.equipes.length > 1)
    let objFeriadoRet = _isFeriado(dataDesejada, feriados, equipe);
    let objFerias = _checkFerias(dataDesejada, funcionario.ferias);
    //console.log('está de férias ?', objFerias);

    if (objFerias){
        
        //console.log("funcionários de férias na data", dataDesejada);
        return {code: "FER", string: "Férias!", imgUrl: "assets/img/app/todo/mypoint_correct16.png", saldoDia: 0};

    } else {

        if (objFeriadoRet.flag && !ignoraFeriados){ //Caso 1 - feriado

        return {code: "FRD", string: objFeriadoRet.name, imgUrl: "assets/img/app/todo/mypoint_correct16.png", saldoDia: 0};//getSaldoDiaFrd(funcionarioAlocacao)};

        } else if (_hasFolgaSolicitada() || _hasLicenca()){ //Caso 3 - Folgas/Licenças

        } else { //Caso 2, 4 ou 5
        
        if (codigoEscala == 1) {
            return _checkJornadaSemanal(funcionarioAlocacao, dataDesejada);
        }

        else if (codigoEscala == 2)
            return _checkJornadaRevezamento(funcionarioAlocacao, dataDesejada);
        }
    }
};

//Traz um cabeçalho de informações com o horário do funcionário em questão
const getInfoHorario = (funcionario) => {

    let infoHorario = [];
    let weekFullDays = ["Domingo","Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
    let jornada;
    let escala = funcionario.alocacao.turno.escala;
    let dia = null;
    let itemHorario = {};
    let flagRepetido = false;
    let itemRepetido = null;

    if (escala && escala.codigo == 1) { //jornada semanal

    jornada = funcionario.alocacao.turno.jornada;
    //console.log("jornadada: ", jornada);
    if (jornada && jornada.array){
      jornada.array.sort(function (a, b) { //ordena por segurança
        if (a.dia > b.dia) {
          return 1;
        }
        if (a.dia < b.dia) {
          return -1;
        }
        // a must be equal to b
        return 0;
      });
      for (var i=0; i<jornada.array.length; i++){
        itemHorario = {};
        flagRepetido = false;
        dia = jornada.array[i].dia;
        itemHorario.dia = weekFullDays[dia];
        if (!jornada.array[i].horarios){
          itemHorario.horario = "Descanso Semanal Remunerado";
          itemHorario.minTrabalho = 0;
          infoHorario.folgas == null ? infoHorario.folgas = [dia] : infoHorario.folgas.push(dia);
        }
        else {
          itemHorario.horario = jornada.array[i].horarioFtd.replace(/\//g, " às ");
          itemHorario.minTrabalho = jornada.array[i].minutosTrabalho;
        }
        for (var j=0; j<infoHorario.length; j++){
          if (infoHorario[j].horario == itemHorario.horario){
            flagRepetido = true;
            itemRepetido = infoHorario[j];
          }
        }
        if (!flagRepetido)
          infoHorario.push(itemHorario);
        else
          itemRepetido.dia = itemRepetido.dia.concat(",", itemHorario.dia);
      }
    }

    } else if (escala && escala.codigo == 2){

    jornada = funcionario.alocacao.turno.jornada;
    if (jornada.array.length == 1){
      if (jornada.array[0].horarios){
        itemHorario.dia = "Revezamento 12 x 36h (dia sim, dia não)";
        itemHorario.horario = jornada.array[0].horarioFtd.replace(/\//g, " às ");
        itemHorario.minTrabalho = jornada.minutosTrabalho;
        infoHorario.push(itemHorario);
      }
    }
    }

    infoHorario.sort(function (a, b) { //ordena para deixar os DSR por último
        if (a.horario.includes("Descanso")) {
        return 1;
        }
        else {
        return -1;
        }
        // a must be equal to b
        return 0;
    });

    //condensar linhas com mesmo horário
    var arrayStrRep = null;
    for (var i=0; i<infoHorario.length; i++){

        arrayStrRep = infoHorario[i].dia.split(',');
        if (arrayStrRep.length == 2)
        infoHorario[i].dia = arrayStrRep[0].concat(" e ", arrayStrRep[1]);
        else if (arrayStrRep.length > 2)
        infoHorario[i].dia = arrayStrRep[0].concat(" à ", arrayStrRep[arrayStrRep.length-1]);        
    }

    return infoHorario;
};

const converteParaHoraMinutoSeparados = (totalMinutes) => {
      
    var hours = Math.floor(totalMinutes/60);
    var minutes = totalMinutes % 60;

    var hoursStr = "";
    var minutesStr = "";

    hoursStr = (hours >= 0 && hours <= 9) ? "0"+hours : ""+hours;           
    minutesStr = (minutes >= 0 && minutes <= 9) ? "0"+minutes : ""+minutes;

    return {hora: hoursStr, minuto: minutesStr};
};

const getApontamentoFromSpecificDate = (apontamentosSemanais, dataAtual) => {

    var apontamentoByDate = null;

    for (var i=0; i<apontamentosSemanais.length; i++){

      if (_compareOnlyDates(dataAtual, new Date(apontamentosSemanais[i].data)) == 0) {

        apontamentoByDate = apontamentosSemanais[i];
      }
    }

    return apontamentoByDate;
};

const addOrSubtractDays = (date, interval) => {
    
    date = new Date(date);
    date.setHours(0,0,0,0);

    return new Date(date.getTime() + (interval*864e5));
};

/*
** Vai retornar um objeto com duas variáveis
** A variável esFinal possui apenas a 1a entrada e a última saída
** A variável arrayEntSai possui 1 objeto para cada batida, esse objeto informa por extenso 
** qual a entrada/saída junto com o valor da hora:minuto referente à batida. Ex.: descricao: 1a Entrada, horario: 08:05
*/
const getEntradasSaidas = (apontamentoF) => {
  
    var esFinal = "";
    var esTodas = "";
    
    apontamentoF.marcacoesFtd.sort(function(a, b){//ordena o array de marcaçõesFtd
      return a > b;
    });

    var length = apontamentoF.marcacoesFtd.length;

    if (length == 1) {
      esFinal = apontamentoF.marcacoesFtd[0];
      esTodas = esFinal;
    }

    else if (length > 1){ //pego a primeira e a última        
      
      esFinal = apontamentoF.marcacoesFtd[0] + " - " + apontamentoF.marcacoesFtd[length - 1];
      
      for (var i=0; i<length; i++){
        esTodas += apontamentoF.marcacoesFtd[i];
        if(i != length-1)
          esTodas += ", ";
      }
    }

    var itemDescricaoHorario = {};
    var strDescricao = "";
    var mapObj = {
      ent: "Entrada ",
      sai: "Saída "
    };
    var arrayEntSai = [];
    var totalMinutes = 0;
    var objHoraMinuto = {};
    for (var i=0; i<apontamentoF.marcacoes.length; i++){

      itemDescricaoHorario = {};
      strDescricao = "";
      strDescricao = apontamentoF.marcacoes[i].descricao;
      itemDescricaoHorario.id = apontamentoF.marcacoes[i].id;
      itemDescricaoHorario.tzOffset = apontamentoF.marcacoes[i].tzOffset;
      itemDescricaoHorario.RHWeb = apontamentoF.marcacoes[i].RHWeb;
      itemDescricaoHorario.REP = apontamentoF.marcacoes[i].REP;
      itemDescricaoHorario.hora = apontamentoF.marcacoes[i].hora;
      itemDescricaoHorario.minuto = apontamentoF.marcacoes[i].minuto;
      itemDescricaoHorario.rDescricao = strDescricao;
      itemDescricaoHorario.descricao = strDescricao.replace(/ent|sai/gi, function(matched){return mapObj[matched]});
      totalMinutes = (apontamentoF.marcacoes[i].hora * 60) + apontamentoF.marcacoes[i].minuto;
      objHoraMinuto = converteParaHoraMinutoSeparados(totalMinutes);
      itemDescricaoHorario.horario = objHoraMinuto.hora + ":" + objHoraMinuto.minuto;
      arrayEntSai.push(itemDescricaoHorario);
    }

    var objetoEntradasSaidas = {
      arrayEntSai: arrayEntSai,
      esFinal: esFinal,
      esTodas: esTodas
    };
    return objetoEntradasSaidas;  
};

const getSaldoPresente = (apontamento) => {
    
    var saldoDia = apontamento.infoTrabalho.trabalhados - apontamento.infoTrabalho.aTrabalhar;
    var sinalFlag = '-';
    var saldoFlag = false;

    if (saldoDia >= 0){
    saldoFlag = true;
    sinalFlag = '';
    }

    var saldoDiarioFormatado = converteParaHoraMinutoSeparados(Math.abs(saldoDia));

    var objBHDiario = {
        trabalha: apontamento.infoTrabalho.trabalha,
        ferias: apontamento.infoTrabalho.ferias,
        saldoDiario: saldoDia,
        horasFtd: sinalFlag + saldoDiarioFormatado.hora + ':' + saldoDiarioFormatado.minuto,
        horasPosit: saldoFlag,
        horasNegat: !saldoFlag
    };

    return objBHDiario;

};

const setInfoAusencia = (apontamento, currentDate, funcionarioParam, feriados) => {

    var saldoFlag = false;
    var sinalFlag = '-';
    var saldoDiarioFormatado = {};

    //pode não ter expediente iniciado, ser feriado, estar atrasado, de folga ou faltante mesmo
    var expedienteObj = _updateAbsenceStatus(funcionarioParam, currentDate, feriados);


    apontamento.ocorrencia.statusCodeString = expedienteObj.code;
    apontamento.ocorrencia.minutosDevidos = expedienteObj.minutosDia;
    apontamento.ocorrencia.statusString = expedienteObj.string;
    apontamento.ocorrencia.statusImgUrl = expedienteObj.imgUrl;

    if (expedienteObj.code == "FER"){

      saldoFlag = true;
      sinalFlag = '';
      saldoDiarioFormatado = converteParaHoraMinutoSeparados(Math.abs(expedienteObj.saldoDia));
      apontamento.observacao = expedienteObj.string;
      apontamento.saldo.horasPosit = saldoFlag;
      apontamento.saldo.horasNegat = !saldoFlag;

    } else if (expedienteObj.code == "FRD"){
      saldoFlag = true;
      sinalFlag = '';
      saldoDiarioFormatado = converteParaHoraMinutoSeparados(Math.abs(expedienteObj.saldoDia));
      apontamento.observacao = expedienteObj.string;
      apontamento.saldo.horasPosit = saldoFlag;
      apontamento.saldo.horasNegat = !saldoFlag;

    } else if (expedienteObj.code == "ENI") {

      saldoFlag = true;
      sinalFlag = '';
      saldoDiarioFormatado = {hora: '-', minuto: '-'};
      apontamento.observacao = expedienteObj.string;
      apontamento.saldo.horasPosit = saldoFlag;
      apontamento.saldo.horasNegat = saldoFlag;

    } else if (expedienteObj.code == "DSR") {

      saldoFlag = true;
      sinalFlag = '';
      saldoDiarioFormatado = {hora: '-', minuto: '-'};
      apontamento.observacao = expedienteObj.string;
      apontamento.saldo.horasPosit = saldoFlag;
      apontamento.saldo.horasNegat = saldoFlag;

    } else if (expedienteObj.code == "AUS") {
      
      saldoDiarioFormatado = converteParaHoraMinutoSeparados(Math.abs(expedienteObj.saldoDia));
      apontamento.observacao = "Falta";
      apontamento.saldo.horasPosit = saldoFlag;
      apontamento.saldo.horasNegat = !saldoFlag;
    }

    apontamento.saldo.horasFtd = sinalFlag + saldoDiarioFormatado.hora + ':' + saldoDiarioFormatado.minuto;
    // apontamento.saldo = {
    //   horasFtd: sinalFlag + saldoDiarioFormatado.hora + ':' + saldoDiarioFormatado.minuto,
    //   horasPosit: saldoFlag,
    //   horasNegat: !saldoFlag
    // };
};


module.exports = {

    getInfoHorario,
    converteParaHoraMinutoSeparados,
    getApontamentoFromSpecificDate,
    addOrSubtractDays,
    getEntradasSaidas,
    getSaldoPresente,
    setInfoAusencia,

}