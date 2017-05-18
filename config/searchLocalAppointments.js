var http = require('http');
var request = require('request');
var urlStaticREPFile = 'https://docs.google.com/uc?export=download&id=0B2GW7fQUvA47SEJZOFZvdzhqTms';

var cron = function(callback, startTime, interval, threshold) {
    console.log('teste cron');
};

var getFile = function() {

    http.get('https://docs.google.com/uc?export=download&id=0B2GW7fQUvA47SEJZOFZvdzhqTms', (res) => {
    const { statusCode } = res;
    const contentType = res.headers['content-type'];

    let error;
    if (statusCode !== 200) {
      error = new Error(`Request Failed.\n` +
                        `Status Code: ${statusCode}`);
    } else if (!/^application\/txt/.test(contentType)) {
      error = new Error(`Invalid content-type.\n` +
                          `Expected application/txt but received ${contentType}`);
    }
    if (error) {
      console.error(error.message);
      // consume response data to free up memory
      res.resume();
      return;
    }
      
    res.setEncoding('utf8');
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    // res.on('end', () => {
    //   try {
    //     const parsedData = JSON.parse(rawData);
    //     console.log(parsedData);
    //   } catch (e) {
    //     console.error(e.message);
    //   }
    // });
    }).on('error', (e) => {
      console.error(`Got error: ${e.message}`);
    });
};

/*
** Requisita o arquivo .txt com os apontamentos recuperados do REP e armazenados na nuvem 
*/
var getFileRequest = function(){

    request(urlStaticREPFile, function (error, response, body) {
        //console.log('error:', error); // Print the error if one occurred 
        //console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received 
        //console.log('body:', body); // Print the HTML for the Google homepage. 
        if (response && response.statusCode === 200){

            console.log('body: ', body);

        } else {

            console.log('Aconteceu um erro na comunicação com o arquivo local do REP, código do erro: ', error);
        }
    });
};

module.exports = {
    periodicallySearch: cron,
    //getREPFile: getFile
    getREPFile: getFileRequest
};