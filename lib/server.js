/*
*  Server Module
* */


const http =  require('http');
const https = require('https');
const url = require('url');
const { StringDecoder } = require('string_decoder');

const config = require('./config');
const lib = require('./data');
const handlers = require('./handlers');
const helpers = require('./helper');

//Declare the Server Object.
var server = {};


//Instatiate the server.
server.httpServer = http.createServer(function(req,res){
    unfiedServer(req,res);
});

server.httpsServer = https.createServer(function(req,res){
    unfiedServer(req,res);
});

//Start the server.
server.httpServer.listen(config.httpPort,function(){
    console.log(` HTTP Server listening at ${config.httpPort} in ${config.envName} Enviroment.`);
});

server.httpsServer.listen(config.httpsPort,function(){
    console.log(` HTTPS Server listening at ${config.httpsPort} in ${config.envName} Enviroment.`);
});

var unfiedServer = function(req,res){

    var parsedUrl  = url.parse(req.url,true);
    var pathName = parsedUrl.pathname;
    var path = pathName.replace(/^\/+|\/+$/g,'');
    var query = parsedUrl.query;
    var method = req.method.toLowerCase();
    var headers = req.headers;
    var sdecoder = new StringDecoder('utf8');
    var buffer = '';
    req.on('data',function(data){
        buffer += sdecoder.write(data);
    });
    req.on('end',function(){
        buffer += sdecoder.end();

        var chooseHandler = typeof server.router[path] !== 'undefined' ? server.router[path] : handlers.notFound;
        var data = {
            'trimmedPath':path,
            'queryStrObj':query,
            'method':method,
            'headers':headers,
            'payload':helpers.parseJsonToObject(buffer)
        };

        console.log('data :',data);

        chooseHandler(data,function(statusCode,payload,contentType){


            var payloadString = '';
            if(contentType == 'json'){
                res.setHeader('Content-Type','application/json');
                payload = typeof payload == 'object' ? payload : {};
                payloadString = JSON.stringify(payload);

            }
            if(contentType == 'html'){
                res.setHeader('Content-Type','text/html');
                payloadString = typeof payload == 'string' ? payload : '';

            }
            statusCode = typeof statusCode == 'number' ? statusCode : 200;
            res.writeHead(statusCode);
            res.end(payloadString);
        });
    });
    req.on('error',function(err){
        console.log('err :',err)
    });

};

server.router = {
    '' : handlers.index,
    'account/create':handlers.accountsCreate,
    'account/edit':handlers.accontsEdit,
    'account/delete':handlers.accountsDeleted,
    'session/create':handlers.sessionCreate,
    'session/deleted':handlers.sessionDeleted,
    'checks/all':handlers.checkList,
    'checks/create':handlers.checkCreate,
    'checks/edit':handlers.checkEdit,
    'ping' : handlers.ping,
    'api/users' : handlers.users,
    'api/tokens':handlers.tokens,
    'api/checks':handlers.checks
};

module.exports = server;