/*
* Library for Storing the data. CRUD operation
*
* */

const fs = require('fs');
const path = require('path');
const helpers = require('./helper');

//container for the module

var lib = {};

//resolve base directory
lib.baseDir = path.join(__dirname,'/../.data/');

// write the data

lib.create = function(dir, file , data, callback){

    fs.open(lib.baseDir+dir+'/'+file+'.json','wx',function(err,fd){
       if(!err && fd){
           var dataString = JSON.stringify(data);
           fs.writeFile(lib.baseDir+dir+'/'+file+'.json',dataString,function(err){
              if(!err){
                  fs.close(fd,function(err){
                      if(err)
                          callback('Error in closing the file');
                      else
                          callback(false);
                  })
              }else{
                  callback('Error in Writinf new File')
              }
           });
       } else{
           callback('Error in creating a new file, File may already exist.')
       }
    });
};

lib.read = function(dir,file,callback){

    fs.readFile(lib.baseDir+dir+'/'+file+'.json','utf8',function(err,data){
        if(!err && data){
            var parseData = helpers.parseJsonToObject(data);
            callback(false,parseData);
        }else
            callback(err,data);
    });
};

lib.update = function(dir,file,data,callback){

    fs.open(lib.baseDir+dir+'/'+file+'.json','r+',function(err,fd){
        if(!err && fd){
            var dataString = JSON.stringify(data);
            fs.truncate(fd,function (err) {
                fs.writeFile(lib.baseDir+dir+'/'+file+'.json',dataString,function(err){
                    if(!err){
                        fs.close(fd,function(err){
                            if(!err)
                                callback(false);
                            else
                                callbcak('Error in closing the File');
                        });
                    }else{
                        callback('Error in Updating the file.');
                    }
                });
            });
        }else{
            callback('Error in Opening the file.');
        }
    });
};

lib.delete = function(dir,file,callback){

    fs.unlink(lib.baseDir+dir+'/'+file+'.json',function(err){
        if(!err)
            callback(false);
        else
            callback('Error in deletion of file.');
    });
};

module.exports = lib;