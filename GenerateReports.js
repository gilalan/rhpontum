const database = require('./config/databaseServer');
//const database = require('./config/database');
const Funcionario = require('./app/models/funcionario');
const Apontamento = require('./app/models/apontamento');
const Feriado = require('./app/models/feriado');
const Equipe = require('./app/models/equipe');
const libRHPontum = require('./util/calculateAppoint');
const libPDFReports = require('./util/generateReportPdf');
const moment = require('moment');
const Async = require('async');
const fs = require('fs');
const pdfMake = require('pdfmake');

moment.locale('pt-br');
//Modificar esses dados para gerações dos relatórios
//##########################################
const startDate = "2020-08-01T03:00:00Z";
const endDate = "2020-09-01T03:00:00Z";
// #########################################
const queryDate = {$gte: startDate, $lt: endDate};
const fonts = {
    Roboto: {
        normal: 'public/fonts/roboto-font/fonts/Roboto/roboto-regular-webfont.ttf',
        bold: 'public/fonts/roboto-font/fonts/Roboto/roboto-bold-webfont.ttf',
        italics: 'public/fonts/roboto-font/fonts/Roboto/roboto-italic-webfont.ttf',
        bolditalics: 'public/fonts/roboto-font/fonts/Roboto/roboto-bolditalic-webfont.ttf'
    },
    OpenSans: {
        normal: 'public/fonts/open-sans-font/fonts/OpenSans-Light.ttf',
        bold: 'public/fonts/open-sans-font/fonts/OpenSans-Bold.ttf',
        italics: 'public/fonts/open-sans-font/fonts/OpenSans-Italic.ttf',
        bolditalics: 'public/fonts/open-sans-font/fonts/OpenSans-BoldItalic.ttf'
    },
    Calibri: {
        normal: 'public/fonts/libra-serif-modern/fonts/LibraSerifModern-Regular.otf',
        bold: 'public/fonts/libra-serif-modern/fonts/LibraSerifModern-Bold.otf',
        italics: 'public/fonts/libra-serif-modern/fonts/LibraSerifModern-Italic.otf',
        bolditalics: 'public/fonts/libra-serif-modern/fonts/LibraSerifModern-BoldItalic.otf'
    }
};
var feriados = [];
var equipes = [];
console.log("queryDate: ", moment(startDate).format("MMMM/YYYY"));

function _setEquipesFunc(funcionario) {
    funcionario.equipes = [];
    equipes.forEach(equipe => {
        equipe.componentes.forEach(componente => {
            if (funcionario.matricula == componente.matricula){
                funcionario.equipes.push(equipe);
            }            
        });
    });
}

function getFuncionarios(){
       
    // Funcionario.find({active: true, PIS: ["021270759053", "016596231721", "012913784455"]})
    Funcionario.find({active: true})
    .populate('alocacao.cargo', 'especificacao nomeFeminino')
    .populate({
        path: 'alocacao.turno',
        model: 'Turno',
        populate: [{path: 'escala', model: 'Escala'}]
    })
    .populate('alocacao.instituicao', 'nome sigla')
    .sort({nome: 1, sobrenome: 1})
    .exec((err, funcionarios) => {

        if(err) {
         console.log('errorrrrr', err);        
        }
 
        console.log('- Qtde Funcionarios: ', funcionarios.length);

        Async.eachSeries(funcionarios, function getObjects (componente, done) {
        
            Apontamento.find({data: queryDate, PIS: componente.PIS})
            .populate(['cargo', 'turno', 'instituicao'])
            .exec((err, apontamentos) => {
                if (err) {
                    console.log("erro de laco: ", err);
                }
                if(!err) {
                    //console.log("Funcionario nome: " + componente.nome); 
                    //console.log("Appts: ", apontamentos.length);
                    componente.arrayApontamentos = apontamentos;
                }
                done();
            });
    
        }, function allDone (err) {
            if (err)
                console.log("Erro nas atribuicoes dos aponts aos funcs");
            
            //console.log("Atribuiu os apts aos funcs"); 
            generateReportAllWorkers(funcionarios);           
        });        
    });
}

function generateReportAllWorkers(funcionarios){
    
    let interval = 1;
    let retVal = [];
    let current = new Date(startDate);
    let endDateLocal = new Date(endDate);
    let gerados = funcionarios.length;
    let zerados = 0;

    funcionarios.forEach(componente => {
                
        _setEquipesFunc(componente);
        componente.name = `${componente.nome} ${componente.sobrenome}`;
        componente.cargo = componente.sexoMasculino ? componente.alocacao.cargo.especificacao : componente.alocacao.cargo.nomeFeminino;
        // console.log(`Nome: ${componente.name}, Apts: ${componente.arrayApontamentos.length}, QtEq: ${componente.equipes.length}`);
        
        if (componente.equipes.length <= 0){
            gerados--;
            return; 
        }
        
        if (componente.arrayApontamentos.length == 0)
            zerados++;
        else
            console.log(`Nome: ${componente.name}, Apts: ${componente.arrayApontamentos.length}, QtEq: ${componente.equipes.length}`);

        current = new Date(startDate);
        endDateLocal = new Date(endDate);
        //Como o último dia é o primeiro (01) do outro mês, a gnt corta ele aqui... (usuário não precisa saber se mes é 30/31)        
        endDateLocal = libRHPontum.addOrSubtractDays(endDateLocal, -1);
        retVal = [];
        
        let ferias = componente.ferias;

        let itemApontamento = {};
        let i = 0;
        let apontamentoF = null;
        let objEntradasSaidas = {};
        let saldoFinalPositivo = 0;
        let saldoFinalNegativo = 0;
        let diasTrabalho = componente.arrayApontamentos.length;
        let diasParaTrabalhar = 0;
        let minTrabalhados = 0;
        let minParaTrabalhar = 0;
        
        while (current <= endDateLocal) {//navegar no período solicitado

            itemApontamento = {};
            objEntradasSaidas = {};
            apontamentoF = libRHPontum.getApontamentoFromSpecificDate(componente.arrayApontamentos, current);
            itemApontamento.order = i;
            itemApontamento.rawDate = new Date(current);
            //itemApontamento.data = moment(new Date(current)).format("EEE dd MMM");
            itemApontamento.dataReport = moment(new Date(current)).format("DD/ddd");
            itemApontamento.date = itemApontamento.dataReport;
            //console.log(itemApontamento.dataReport);

            if (apontamentoF){ //se tiver apontamento já tem os dados de horas trabalhadas
            
                //console.log('apontamentoF #: ', apontamentoF.marcacoesFtd);
                objEntradasSaidas = libRHPontum.getEntradasSaidas(apontamentoF);
                itemApontamento.hasPoint = true;
                itemApontamento.entradaSaidaFinal = objEntradasSaidas.esFinal;
                itemApontamento.entradasSaidasTodas = objEntradasSaidas.esTodas;
                itemApontamento.arrayEntSai = objEntradasSaidas.arrayEntSai;
                //na função getSaldoPresente temos as horas a trabalhar e trabalhadas
                itemApontamento.saldo = libRHPontum.getSaldoPresente(apontamentoF);
                if (itemApontamento.saldo.saldoDiario > 0) {
                    saldoFinalPositivo += itemApontamento.saldo.saldoDiario;
                } else {
                    saldoFinalNegativo -= itemApontamento.saldo.saldoDiario;
                }

                if (!apontamentoF.infoTrabalho.ferias){ //se era um dia de trabalho de fato, incrementa a variável
                    //talvez devessemos fazer um tratamento diferenciado para quando não for o dia de trabalho
                    //tem que ver se precisaria contar mais horas (horas extras e tals)
                    diasParaTrabalhar++;
                    minTrabalhados += apontamentoF.infoTrabalho.trabalhados;
                    minParaTrabalhar += apontamentoF.infoTrabalho.aTrabalhar;
                }

                if (apontamentoF.infoTrabalho.ferias)
                    itemApontamento.observacao = "Férias";
                else if (apontamentoF.status.id > 0) //Se for Incompleto, Erro ou Justificado...
                    itemApontamento.observacao = apontamentoF.status.descricao;

            } else { //se não tiver apontamento tem que verificar qual o motivo (falta, feriado, folga, férias?)

                itemApontamento.hasPoint = false;
                itemApontamento.entradaSaidaFinal = "-";
                itemApontamento.arrayEntSai = [];
                itemApontamento.ocorrencia = {};
                itemApontamento.saldo = {};
                //itemApontamento.observacao = "Sem Batidas";
                libRHPontum.setInfoAusencia(itemApontamento, current, componente, feriados); 

                if (itemApontamento.ocorrencia.statusCodeString == "AUS"){ //Ausente quando deveria ter trabalhado
                    diasParaTrabalhar++;
                    saldoFinalNegativo -= -itemApontamento.ocorrencia.minutosDevidos;
                    minParaTrabalhar += itemApontamento.ocorrencia.minutosDevidos;
                    //colocar o saldo negativo faltante do dia para exibição no Relatório de Espelho de Ponto
                    const devido = libRHPontum.converteParaHoraMinutoSeparados(itemApontamento.ocorrencia.minutosDevidos);
                    itemApontamento.saldo = {
                        horasNegat: true,
                        horasFtd: '-' + devido.hora + ':' + devido.minuto
                    };
                } else if (itemApontamento.ocorrencia.statusCodeString == "FER"){ //de férias, nada deve ser contabilizado

                }
            }

            retVal.push(itemApontamento);
            current = libRHPontum.addOrSubtractDays(current, interval);
            i++;
        } //FIM WHILE

        let minTrabalhadosTot = libRHPontum.converteParaHoraMinutoSeparados(minTrabalhados);
        let minParaTrabalharTot = libRHPontum.converteParaHoraMinutoSeparados(minParaTrabalhar);
        let minutosTrabalhadosFtd = minTrabalhadosTot.hora + ':' + minTrabalhadosTot.minuto;
        let minutosParaTrabalharFtd = minParaTrabalharTot.hora + ':' + minParaTrabalharTot.minuto;
        
        let sfPos = libRHPontum.converteParaHoraMinutoSeparados(saldoFinalPositivo);
        var sfNeg = libRHPontum.converteParaHoraMinutoSeparados(saldoFinalNegativo);
        var diff = saldoFinalPositivo - saldoFinalNegativo;
        var sfTot = libRHPontum.converteParaHoraMinutoSeparados(Math.abs(diff));
        
        let saldoFinalPositivoFtd = sfPos.hora + ':' + sfPos.minuto;
        let saldoFinalNegativoFtd = sfNeg.hora + ':' + sfNeg.minuto;
        let saldoFinalMesFtd = (diff < 0) ? '-' + sfTot.hora + ':' + sfTot.minuto :  sfTot.hora + ':' + sfTot.minuto;
        
        retVal.sort(function (a, b) {
            if (a.order > b.order) {
                return 1;
            }
            if (a.order < b.order) {
                return -1;
            }
            // a must be equal to b
            return 0;
        });
        
        const objFuncReport = {
            func: componente,
            periodo: moment(startDate).format("MMMM / YYYY"),
            arrayRepts: retVal,
            totais: {
                aTrabalhar: minutosParaTrabalharFtd,
                trabalhados: minutosTrabalhadosFtd,
                saldoPositivo: saldoFinalPositivoFtd,
                saldoNegativo: saldoFinalNegativoFtd,
                saldoFinal: saldoFinalMesFtd
            }
        };
        
        //return objFuncReport;
        createPDF(objFuncReport);
    });

    console.log(`Qtde de PDFs gerados: ${gerados}. Qtde de Espelhos Vazios: ${zerados}`);
    console.log("### Fim do Processamento ##");
}

function createPDF(objFuncReport){
    
    const {func, periodo, arrayRepts, totais} = objFuncReport;    
    let horario = libRHPontum.getInfoHorario(func);

    const dd = libPDFReports.gerarEspelhoPonto(func, horario, periodo, arrayRepts, totais);
    dd.footer = function(currentPage, pageCount) { 
        return { 
          text: currentPage.toString() + ' de ' + pageCount, 
          alignment: 'right', 
          margin: [20, 0] 
        }; 
    };

    let printer = new pdfMake(fonts);
    //let printer = new pdfMake();
    let pdfName = `./pdfs_gerados/${func.equipes[0].nome}_${func.name}-${func.matricula}.pdf`;
    const pdfDoc = printer.createPdfKitDocument(dd);
    pdfDoc.pipe(fs.createWriteStream(pdfName));
    pdfDoc.end();
}

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

async function start(){
    
    feriados = await getFeriados();
    equipes = await getEquipes();
    // equipes.forEach(equipe => {
    //     console.log("Nome Eq: ", equipe.nome);
    //     equipe.componentes.forEach(componente => {
    //         console.log("Comp: ", componente);
    //     });
    // });
    getFuncionarios();
}

start();