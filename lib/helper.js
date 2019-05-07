/*
* helper module
* */

const crypto = require('crypto');
const config = require('./config');
const fs = require('fs');
const path = require('path');

var helper = {};

// hash the pasword
helper.hashThePassword = function(password){
    if(typeof password == 'string' && password.trim().length > 0 ){
        return crypto.createHmac('sha256',config.secrete).update(password).digest('hex');
    }else{
        return false;
    }
};

//return string to JSON object;
helper.parseJsonToObject = function(str){
    try{
        //console.log('---',str);
        var Obj = JSON.parse(str);
        return Obj;
    }catch(err){
        console.log('Error in Helper API ',err);
        return {};
    }
};

helper.pasrseObjToJSON = function(str){
    try{
        return JSON.stringify(str);
    }catch(err){
        console.log(err);
        return {};
    }
};

helper.generateRandomString = function(strLength){
    var strLen = typeof strLength == 'number' && strLength > 0 ? strLength : false;
    if(strLen){

        var possiblecahracter = 'abcdefghijklmnopqrstuvwxyz0123456789';
        var Str = '';
        for(var i = 0 ; i< strLength ; i++){
            var randomStr = possiblecahracter.charAt(Math.floor(Math.random() * possiblecahracter.length));
            Str += randomStr ;
        }
        return Str;
    }else{
        return false;
    }
};

//get Template

helper.getTemplate = function(templateName,callback){
    templateName = typeof templateName == 'string' && templateName.length > 0? templateName :false;

    if(templateName){
        var templateDir = path.join(__dirname,'./../template/');
        fs.readFile(templateDir+templateName+'.html',function(err,str){
           if(!err && str && str.length > 0){
               console.log('str :',str.toString())
               callback(false,str.toString());
           } else {
               callback('No Template could be found');
           }
        });
    }else{
        callback('Error : A valid template was not mentioned');
    }
};

module.exports = helper;
