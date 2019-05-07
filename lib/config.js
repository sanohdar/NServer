/*
* Configuration file for the application
* */

var enviroments = {};

enviroments.staging = {
    'httpPort' : 3000,
    'httpsPort' : 3001,
    'envName' : 'Staging',
    'secrete' : 'thisIsASecrete',
    'maxChecks':5
};

enviroments.production = {
    'httpPort' : 5000,
    'httpsPort' : 5001,
    'envName' : 'Production',
    'secrete' : 'thisIsASecrete',
    'maxChecks':5
};

var currentEnv = typeof process.env.NODE_ENV == 'string' ? process.env.NODE_ENV : '';

var exportEnv = typeof enviroments[currentEnv] == 'object' ? enviroments[currentEnv] : enviroments.staging

module.exports = exportEnv;