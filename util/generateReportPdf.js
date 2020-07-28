//Módulo para geração do layout do PDF
const moment = require('moment');  
moment.locale('pt-br');

function getCompanyInfo(title){
    
    let emiDate = moment().format("L, HH:mm");

    let cInfo = {
      table: {
        headerRows: 1,
        widths: ['*', 'auto'],
        body: [
          [ 
            {text: title, style: 'headerI', border: [true, true, false, true] }, 
            {text: 'Emissão: '+emiDate, style: 'rigPeq', border: [false, true, true, true]} 
          ],
          [
            {text: 'Soll Serviços Obras e Locações LTDA\nAvenida Professor Andrade Bezerra, 1523, Salgadinho, Olinda - PE, 53110-110', border: [true, false, false, true]},
            {text: 'CNPJ: 00.323.090/0001-51', style: 'rigPeq', border: [false, false, true, true]}
          ]
        ]  
      }
    };

    return cInfo;
};

function createEmployeeInfo(employeeInfo){

    let empInfo = {
       table: {
        headerRows: 1,
        widths: [424,150,200],
        body: [
          [
            {text: 'Nome: '+employeeInfo.name+' \n Cargo: '+employeeInfo.cargo, border: [true, false, false, false]},
            {text: 'Matrícula: '+employeeInfo.matricula+' \n Equipe: '+employeeInfo.equipes[0].nome, border: [false, false, false, false]},
            {text: 'PIS: '+employeeInfo.PIS+' \n Instituição: Univasf', border: [false, false, true, false], alignment: 'right'}
          ]
        ]  
      } 
    };

    return empInfo;
};

function createEmployeeInfoComHorario(employees){

    let employeeInfo = employees[0];
    let arrayBody = [];

    arrayBody.push([{text: 'Nome: '+employeeInfo.name, border: [true, false, false, false]}, 
                {text: 'Matrícula: '+employeeInfo.matricula, border: [false, false, false, false]},
                {text: 'PIS: '+employeeInfo.PIS, border: [false, false, true, false], alignment: 'right'}
              ]);

    arrayBody.push([
                {text: 'Nome: '+employeeInfo.name, border: [true, false, false, false]},
                {text: 'Matrícula: '+employeeInfo.matricula, border: [false, false, false, false]},
                {text: 'PIS: '+employeeInfo.PIS, border: [false, false, true, false], alignment: 'right'}
              ]);	              

    let empInfo = {
        table: {
            headerRows: 1,
            widths: [424,150,200],
            body: arrayBody  
          } 
    };

    return empInfo;
};

function createWorkJourney(employeeWorkJourney, periodo){

    let daysArray = [];
    let hoursArray = [];
    
    for (let i=0; i<employeeWorkJourney.length; i++){

      daysArray.push({text: employeeWorkJourney[i].dia, style: 'normalText'});
      hoursArray.push(employeeWorkJourney[i].horario);
    }

    let workJInfo = {
       table: {
        headerRows: 1,
        widths: [80, '*', 130],
        body: [
          [
            {text: 'Jornada de Trabalho: ', bold: true, border: [true, true, false, true]},
            {
                table: {
                    headerRows: 2,
                    body: [
                        daysArray,
                        hoursArray
                    ]
                },
                layout: 'lightHorizontalLines'
            },
            {text: 'Período: ' + periodo}
          ]
        ]  
      } 
    };

    return workJInfo;
};

function createAppointHeader(){
    
    let appHeader = {
       table: {
        headerRows: 2,
        widths: [30,344,261,130],
        body: [
          [
            {text: '\nDia', bold: true, rowSpan: 2, border: [true, false, false, true]},
            {text: 'Batimentos efetuados', bold: true, alignment: 'center', border: [true, false, false, true]},
            {text: '\nObservação', bold: true, alignment: 'center', rowSpan: 2, border: [true, false, true, true]},
            {text: 'Saldo de Horas', bold: true, alignment: 'center', border: [true, false, true, true]}
          ],
          [
            {},
            {table: {
                body: [
                        [
                         {text: 'ENT1', bold: false, margin: [5, 0], border: []}, 
                         {text: 'SAI1', bold: false, margin: [5, 0], border:[true]}, 
                         {text: 'ENT2', bold: false, margin: [5, 0], border:[true]}, 
                         {text: 'SAI2', bold: false, margin: [5, 0], border:[true]}, 
                         {text: 'ENT3', bold: false, margin: [5, 0], border:[true]}, 
                         {text: 'SAI3', bold: false, margin: [5, 0], border:[true]}, 
                         {text: 'ENT4', bold: false, margin: [5, 0], border:[true]}, 
                         {text: 'SAI4', bold: false, margin: [5, 0], border:[true]},
                         {text: 'ENT5', bold: false, margin: [5, 0], border:[true]}, 
                         {text: 'SAI5', bold: false, margin: [5, 0], border:[true]}
                        ]
                    ]
                }
            },
            {text: 'Observação', border: [true, false, true, true]},
            {table: {
                    widths: [55, 65],
                    body: [
                        [{text: 'Crédito', bold: false, border:[], alignment: 'center'}, 
                         {text: 'Débito', bold: false, border:[true], alignment: 'center'}]
                    ]
                }
            }
          ]
        ]
      } 
    };

    return appHeader;
};

function createAppointBody(appointsArray, totaisFtd){

    let rowsArrayBody = [];
    let arrayEntSaidas = [];
    let staticArrayEntSaidas = ['-', '-', '-','-', '-', '-','-', '-', '-', '-'];
    let maxIndexArray = 0;
    //console.log('appointsArray: ', appointsArray);
    //console.log('totaisFtd: ', totaisFtd);
    
    for (let i=0; i<appointsArray.length; i++){

        arrayEntSaidas = [];
        maxIndexArray = 0;
        staticArrayEntSaidas = ['-', '-', '-','-', '-', '-','-', '-', '-', '-'];

        if (appointsArray[i].hasPoint){
            arrayEntSaidas = appointsArray[i].entradasSaidasTodas.split(',');
        
            if (arrayEntSaidas.length <= staticArrayEntSaidas.length)
                maxIndexArray = arrayEntSaidas.length;
            else 
                maxIndexArray = staticArrayEntSaidas.length;

            for (let j=0; j<maxIndexArray; j++){
                staticArrayEntSaidas[j] = arrayEntSaidas[j];
            }
        }

        let observ = appointsArray[i].observacao ? appointsArray[i].observacao : "-";
        
        let saldoP = '00:00';
        let saldoN = '00:00';
        //console.log('order: ', i);
        //console.log('appointsArray: ', appointsArray[i]);
        if (appointsArray[i].saldo){

            if (appointsArray[i].saldo.horasPosit){
                saldoP = appointsArray[i].saldo.horasFtd;
            }

            if (appointsArray[i].saldo.horasNegat){
                saldoN = appointsArray[i].saldo.horasFtd;
            }
        }

        rowsArrayBody.push([
            {text: appointsArray[i].date, border: [true, false, false, true]},
            {text: staticArrayEntSaidas[0], border: [true, false, false, true], alignment: 'center'},
            {text: staticArrayEntSaidas[1], border: [false, false, false, true], alignment: 'center'},
            {text: staticArrayEntSaidas[2], border: [false, false, false, true], alignment: 'center'},
            {text: staticArrayEntSaidas[3], border: [false, false, false, true], alignment: 'center'},
            {text: staticArrayEntSaidas[4], border: [false, false, false, true], alignment: 'center'},
            {text: staticArrayEntSaidas[5], border: [false, false, false, true], alignment: 'center'},
            {text: staticArrayEntSaidas[6], border: [false, false, false, true], alignment: 'center'},
            {text: staticArrayEntSaidas[7], border: [false, false, false, true], alignment: 'center'},
            {text: staticArrayEntSaidas[8], border: [false, false, false, true], alignment: 'center'},
            {text: staticArrayEntSaidas[9], border: [false, false, false, true], alignment: 'center'},
            {text: observ, alignment: 'center', border: [true, false, true, true]},
            {text: saldoP, alignment: 'center', border: [true, false, true, true]},
            {text: saldoN, alignment: 'center', border: [true, false, true, true]}
        ]);

    }

    rowsArrayBody.push([
        {text: '', border: [true, false, false, true]},
        {text: '', border: [false, false, false, true], alignment: 'center'},
        {text: '', border: [false, false, false, true], alignment: 'center'},
        {text: '', border: [false, false, false, true], alignment: 'center'},
        {text: '', border: [false, false, false, true], alignment: 'center'},
        {text: '', border: [false, false, false, true], alignment: 'center'},
        {text: '', border: [false, false, false, true], alignment: 'center'},
        {text: '', border: [false, false, false, true], alignment: 'center'},
        {text: '', border: [false, false, false, true], alignment: 'center'},
        {text: '', border: [false, false, false, true], alignment: 'center'},
        {text: '', border: [false, false, false, true], alignment: 'center'},
        {text: 'Totais:', bold: true, alignment: 'right', border: [false, false, true, true]},
        {text: totaisFtd.saldoPositivo, alignment: 'center', border: [true, false, true, true]},
        {text: totaisFtd.saldoNegativo, alignment: 'center', border: [true, false, true, true]}
    ]);

    //console.log('rowsArrayBody: ', rowsArrayBody);

    let appBody = {
        style: 'textoMenor',
        table: {
            headerRows: 0,
            widths: [30, 30, 30, 23, 25, 25, 25, 27, 30, 25, 23, 261, 61, 60],
             // body: [
          //     line1
          //   ]
              body: rowsArrayBody
        }
    };

    return appBody;	    
};

function getSaldoMes(totaisFtd){

    var rowSaldo = {
        table: {
            headerRows: 1,
            widths: ['*'],
            body: [
              [
                {
                 text: 'Horas a Trabalhar: ' + totaisFtd.aTrabalhar + ' | Horas Trabalhadas: ' + totaisFtd.trabalhados + ' | Saldo do Mês: ' + totaisFtd.saldoFinal, 
                 bold: true, 
                 alignment: 'right', 
                 border: [true, false, true, true]
                 }
              ]
            ]  
        }   
    };

    return rowSaldo;
};

function createSignature(){

    var signature = {   
        table: {
            headerRows: 1,
            widths: ['*', 'auto'],
            body: [
              [
                {text: 'Confirmo a frequência      ____/____/________', margin: [50, 5, 20, 0], border: [true, false, false, true]},
                {
                    border: [false, false, true, true],
                    stack: [
                    {text: '____________________________________________________________________________', style: 'rigPeq', margin: [20, 5, 50, 0], border: [false, false, false, false]},
                    {text: 'Assinatura', margin: [125,0], style: 'rigPeq'},
                  ]
                }
              ]
            ]  
        }   
    };

    return signature;
};

function createStylesEspelhoPonto(){

    let styles = {
        normalText: {
            fontSize: 7,
            bold: true,
            margin: 0
        },
        simpleText: {
            fontSize: 7,
            bold: false,
            margin: 0
        },
        headerI: {
            fontSize: 10,
            bold: true,
            margin: [0, 2, 0, 2],
            alignment: 'center'
        },
        rigPeq: {
            fontSize: 7,
            margin: [0, 2, 0, 2]
        },
        textoMenor: {
            fontSize: 6
        }
    };

    return styles;
};

const gerarEspelhoPonto = (employeeInfo, employeeWorkJourney, periodo, appointsArray, totaisFtd) => {

    var contentArray = [];
    contentArray.push(getCompanyInfo('ESPELHO DE PONTO'));
    contentArray.push(createEmployeeInfo(employeeInfo));
    contentArray.push(createWorkJourney(employeeWorkJourney, periodo));
    contentArray.push(createAppointHeader());
    contentArray.push(createAppointBody(appointsArray, totaisFtd));
    contentArray.push(getSaldoMes(totaisFtd));
    contentArray.push(createSignature());

    var docDefinition = {
        pageSize: 'A4',
        pageOrientation: 'landscape',
        pageMargins: [ 20, 10 ],
        styles: createStylesEspelhoPonto(),
        defaultStyle: {
            font: "Calibri",
            fontSize: 7,
            margin: 0,
            color: 'black'
        },        
        content: contentArray
      };

      return docDefinition;
};

const gerarRelatorioFuncionariosHorarios = (employees) => {
    
    var contentArray = [];
    contentArray.push(getCompanyInfo('RELATORIO DE FUNCIONARIOS COM HORARIOS'));
    contentArray.push(createEmployeeInfoComHorario(employees));

    var docDefinition = {
        pageSize: 'A4',
        pageOrientation: 'landscape',
        pageMargins: [ 20, 10 ],
        styles: createStylesEspelhoPonto(),
        defaultStyle: {
            fontSize: 10,
            margin: 0,
            color: 'black'
        },
        content: contentArray
      };

      return docDefinition;	
};

module.exports = {
    gerarEspelhoPonto,
}