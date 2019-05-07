/*
* Application Main Module
*
* */

var server = require('./lib/server')

function init(){
    init.server();
}

init.server = function(){
    //Start the http server
    server.httpServer;

    //Start the https server
    server.httpsServer;
}

module.exports = init;