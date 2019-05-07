/*
* Routing handlers
* */

var _data = require('./data');
var helpers = require('./helper');
var config = require('./config');

var handlers = {};

//path = /users
handlers.users = function(data,callback){
  var acceptableMethod = ['get','post','put','delete'];
  if(acceptableMethod.indexOf(data.method) > -1){
      handlers._users[data.method](data,callback);
  }else
      callback(405);
};

handlers._users = {};

/*
* Html api
* */


handlers.index = function(data,callback){

    if(data.method == 'get'){
        helpers.getTemplate('index',function(err,str){
           if(!err && str){
               callback(200,str,'html');
           } else {
               callback(500,undefined,'html');
           }
        });
    }else{
        callback(405,undefined,'html');
    }
};

/*
*
* json api
* */

handlers._users.get = function(data,callback) {

    var phone = typeof data.queryStrObj.phone == 'string' && data.queryStrObj.phone.trim().length == 10 ? data.queryStrObj.phone : false;
    var token = typeof data.headers.token == 'string' && data.headers.token.trim().length > 0 ? data.headers.token : false;

    handlers._tokens.verifyToken(token,phone,function(isValidToken){
       if(isValidToken){
           _data.read('users',phone,function(err,data){
               if(!err && data){
                   delete data.password
                   callback(200,data);
               }else
                   callback(500,{'Error':'User Not Present.'})
           })
       } else {
           callback(403,{'Error' : 'User Not Authenticate.'})
       }
    });
};

handlers._users.post = function(data,callback) {

    var firstName = typeof data.payload.firstName == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    var lastName = typeof data.payload.lastName == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    var country = typeof data.payload.country == 'string' && data.payload.country.trim().length > 0 ? data.payload.country.trim() : false;
    var phone = typeof data.payload.phone == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
    var password = typeof data.payload.password == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    var tosAgreement = typeof data.payload.tosAgreement == 'boolean' && data.payload.tosAgreement == true ? true : false;

    if(firstName && lastName && phone && country && tosAgreement && password){

        _data.read('users',phone,function(err,data){
            if(err ){

                var hashedPassword = helpers.hashThePassword(password)
                if(hashedPassword){
                    var userObject = {
                        'firstName':firstName,
                        'lastName' : lastName,
                        'phone' : phone,
                        'country' : country,
                        'password' : hashedPassword,
                        'tosAgreement' : tosAgreement
                    }
                    _data.create('users',phone,userObject,function(err){
                        if(err){
                            console.log('Error :',err)
                            callback(500,{'Error':'Could not create new user.'})
                        }else{
                            callback(200)
                        }
                    })
                }else{
                    callback(500,{'Error': 'Could not hash the user password.'})
                }

            }else{
                callback(500,{'Error':'User with this phone Number already Exist.'})
            }
        });
    }else{
        callback(406,{'Error':'Missing required Field'})
    }

};

handlers._users.put = function(data,callback) {

    var phone = typeof data.payload.phone == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone : false;

    //optional field
    var firstName = typeof data.payload.firstName == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    var lastName = typeof data.payload.lastName == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    var password = typeof data.payload.password == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

    var token = typeof data.headers.token == 'string' && data.headers.token.trim().length > 0 ? data.headers.token : false;

    if(firstName || lastName || password){
        handlers._tokens.verifyToken(token,phone,function(isValidToken){
           if(isValidToken){
               _data.read('users',phone,function(err,userData){
                   if(!err && userData){
                       console.log(userData)
                       if(firstName)
                           userData.firstName = firstName;
                       if(lastName)
                           userData.lastName = lastName;
                       if(password)
                           userData.password = helpers.hashThePassword(password)

                       _data.update('users',phone,userData,function(err){
                           if(!err)
                               callback(false)
                           else{
                               console.log(err)
                               callback(500,{'Error':'Could\'t update the User Data.'})
                           }
                       })

                   }else{
                       callback(500,{'Error':'Couldn\'t find the User.'})
                   }
               });
           } else
               callback(403,{'Error':'Not a valid session'})
        });

    }else {
        callback(500, {'Error': 'Missing required fields'})
    }
};

handlers._users.delete = function(data,callback) {

    var phone = typeof data.queryStrObj.phone == 'string' && data.queryStrObj.phone.trim().length == 10 ? parseInt(data.queryStrObj.phone) : false;

    _data.read('users',phone,function(err,userData){
        if(!err && userData){
            var token = typeof data.headers.token == 'string' && data.headers.token.trim().length > 0 ? data.headers.token : false;

            handlers._tokens.verifyToken(token,userData.phone,function(isValidToken){
                if(isValidToken){
                    var userChecks = typeof userData.checks == 'object' && userObj.checks instanceof Array ? userObj.checks : [];

                    userChecks.forEach(function(element){
                        if(element){
                            _data.read('checks',element,function (err,data) {
                                if(!err && data){
                                    _data.delete('users',element,function (err) {
                                        if(!err)
                                            callback(200)
                                        else
                                            callback(500,{'Error':'Error in Deleting checks'})
                                    })
                                }else{
                                    callback(500,{'Error':'Error in deleteing checks.'})
                                }
                            })
                        }
                    })
                }else
                    callback(400,{'Error':'Not allowed'})
            })
        }else
            callback(400,{'Error':'No user data found'})
    })
    _data.delete('users',phone,function(err){
        if(!err)
            callback(false)
        else
            callback(500,{'Error': 'Error in deleting the user.'})
    })
};


//path = /tokens
handlers.tokens = function(data,callback){
    var acceptableMethod = ['get','post','put','delete'];
    if(acceptableMethod.indexOf(data.method) > -1){
        handlers._tokens[data.method](data,callback);
    }else
        callback(405);
};

handlers._tokens = {};

handlers._tokens.get = function(data,callback){

    var id = typeof data.queryStrObj.id == 'string' && data.queryStrObj.id.trim().length > 0 ? data.queryStrObj.id.trim() : false;

    if(id){
        _data.read('tokens',id,function(err,tokenData) {
            if(!err && tokenData)
                callback(200,tokenData);
            else
                callback(404,{'Error':'Id not found'});
        });
    }else{
        callback(406,{'Error':'Invalid Tokens'});
    }
};

handlers._tokens.post = function(data,callback){

    var phone = typeof data.payload.phone == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
    var password = typeof data.payload.password == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

    if(phone && password){
        _data.read('users',phone,function(err,data){
           if(!err && data){
               var hashedPasswd = helpers.hashThePassword(password)
               if(data.password == hashedPasswd){

                   var id = helpers.generateRandomString(20);
                   var expires = Date.now() + 1000 * 60 * 60 ;

                   if(id) {
                       var tokenObject = {
                           'id':id,
                           'phone':phone,
                           'expires':expires
                       };

                       _data.create('tokens', id, tokenObject, function (err) {
                           if (!err)
                               callback(false,tokenObject);
                           else
                               callback(500, {'Error': 'Error in creating tokens'});
                       })
                   }else{
                       callback(500,{'Error':'Unable to generate the token.'});
                   }
               }else
                   callback(405,{'Error':'Enter the valid password'});

           } else
               callback(406,{'Error':'Users is not present'});
        });
    }else
        callback(406,{'Error':'Missing required fields'});
};

handlers._tokens.put = function(data,callback){

    var id = typeof data.payload.id == 'string' && data.payload.id.trim().length > 0 ? data.payload.id.trim() : false;
    var extend = typeof data.payload.extend == 'boolean' && data.payload.extend == true ? true : false;

    if(id && extend){
        _data.read('tokens',id,function(err,tokenData){
           if(!err && tokenData){
                if(tokenData.expires > Date.now()){

                    tokenData.expires = Date.now() + 1000 * 60 * 60;

                    _data.update('tokens',id,tokenData,function(err,tokenData){
                        if(!err)
                            callback(200);
                        else
                            callback(500,{'Error':'Couldn\'t Update the token'});
                    });
                }else
                    callback(400,{'Error':'Specified Token already expired.Can\'t extend'})
           } else
               callback(400,{'Error':'Specified Token doesn\'t exist.'})
        });
    }else{
        callback(406,{'Error':'Missing Required field\'s or Invalid field\'s .'})
    }
};

handlers._tokens.delete = function(data,callback){

    var id = typeof data.queryStrObj.id == 'string' && data.queryStrObj.id.trim().length ? data.queryStrObj.id.trim() : false;
    if(id){
        _data.read('tokens',id,function(err,data){
            if(!err && data){
                _data.delete('tokens',id,function(err){
                    if(!err)
                        callback(200)
                    else
                        callback(500,{'Error':'Couldn\'t delete the specified token.'})
                });
            }else{
                callback(400,{'Error':'Couldn\'t find the token.'})
            }
        });
    }else{
        callback(400,{'Error':'Missing Required fields'})
    }
};

handlers._tokens.verifyToken = function(id,phone,callback){

    var id = typeof id == 'string' && id.trim().length > 0 ? id.trim() : false;
    var phone = typeof phone == 'string' && phone.trim().length > 0 ? phone.trim() : false;
    console.log('id,phone',id,phone)
    if(id && phone){
        _data.read('tokens',id,function(err,data){
            if(!err && data){
                console.log('---',data.phone == phone,data.expires > Date.now())

                if(data.phone == phone && data.expires > Date.now()){
                    callback(true);
                }else
                    callback(false);
            }else{
                callback(false);
            }
        })
    }else{
        callback(false);
    }
};

//path = /checks
handlers.checks = function(data,callback){
    var acceptableMethod = ['get','post','put','delete'];
    if(acceptableMethod.indexOf(data.method) > -1){
        handlers._checks[data.method](data,callback);
    }else
        callback(405);
};

handlers._checks = {};

handlers._checks.get = function(data,callback){

    var id = typeof data.queryStrObj.id == 'string' && data.queryStrObj.id.trim().length == 20 ? data.queryStrObj.id.trim() : false;

    if(id){
        _data.read('checks',id,function(err,checkData){
            if(!err && checkData){

                var token = typeof data.headers.token == 'string' && data.headers.token.trim().length > 0 ? data.headers.token : false;

                handlers._tokens.verifyToken(token,checkData.userPhone,function(isValidToken){
                    if(isValidToken){
                        callback(200,checkData)
                    }else{
                        callback(403)
                    }
                })
            }else{
                callback(404)
            }
        });
    }else{
        callback(400,{'Error':'Missing Required fields.'})
    }
};

//Input data
//required data - protocol,url,methods,statusCode,timeoutSecond
//optional none
handlers._checks.post = function(data,callback){

    var protocols = typeof data.payload.protocol == 'string' && ['http','https'].indexOf(data.payload.protocol) > -1 ? data.payload.protocol : false;
    var url = typeof data.payload.url == 'string' && data.payload.url.trim().length > 0 ? data.payload.url.trim() : false;
    var methods = typeof data.payload.methods == 'string' && ['get','put','post','delete'].indexOf(data.payload.methods) > -1 ? data.payload.methods : false;
    var successCode = typeof data.payload.successCode == 'object' && data.payload.successCode instanceof Array ? data.payload.successCode :false;
    var timeoutSeconds = typeof data.payload.timeoutSeconds == 'number' && data.payload.timeoutSeconds > 0 && data.payload.timeoutSeconds <= 5 && data.payload.timeoutSeconds >= 1 && data.payload.timeoutSeconds % 1 === 0 ? data.payload.timeoutSeconds : false;

    if( protocols && url && methods && successCode && timeoutSeconds){

        var token = typeof data.headers.token == 'string' && data.headers.token.trim().length > 0 ? data.headers.token : false;
        _data.read('tokens',token,function(err,tokenData){

            if(!err && tokenData){

                var userPhone = tokenData.phone;

                _data.read('users',userPhone,function(err,userObj){
                   if(!err && userObj){

                       var userChecks = typeof userObj.checks == 'object' && userObj.checks instanceof Array ? userObj.checks : [];

                       if(userChecks.length < config.maxChecks){

                           var checkId = helpers.generateRandomString(20)

                           var checkObj = {
                               'id':checkId,
                               'userPhone' : userPhone,
                               'protocols' : protocols,
                               'url' : url,
                               'methods' : methods,
                               'successCode' : successCode,
                               'timeoutSeconds' : timeoutSeconds
                           }

                           _data.create('checks',checkId,checkObj,function(err){
                               if(!err){

                                   userObj.checks = userChecks
                                   userObj.checks.push(checkId)

                                   _data.update('users',userPhone,userObj,function(err){
                                      if(!err)
                                          callback(200,checkObj)
                                       else
                                           callback(500,{'Error':'Could not update the user object'})
                                   });
                               }else
                                   callback(500,{'Error':'Could not create checks'})
                           })
                       }else{
                           callback(400,{'Error':'the user already has the maximum checks ('+config.maxChecks+')'})
                       }
                   } else{
                       callback(403)
                   }
                });
            }else{
                callback(403)
            }
        });

    }else
        callback(403,{'Error':'Missing required fiels'})

};

handlers._checks.put = function(data,callback){

    var id = typeof data.payload.id == 'string' && data.payload.id.trim().length > 0 ? data.payload.id.trim() : false;

    var protocols = typeof data.payload.protocol == 'string' && ['http','https'].indexOf(data.payload.protocol) > -1 ? data.payload.protocol : false;
    var url = typeof data.payload.url == 'string' && data.payload.url.trim().length > 0 ? data.payload.url.trim() : false;
    var methods = typeof data.payload.methods == 'string' && ['get','put','post','delete'].indexOf(data.payload.methods) > -1 ? data.payload.methods : false;
    var successCode = typeof data.payload.successCode == 'object' && data.payload.successCode instanceof Array ? data.payload.successCode :false;
    var timeoutSeconds = typeof data.payload.timeoutSeconds == 'number' && data.payload.timeoutSeconds > 0 && data.payload.timeoutSeconds <= 5 && data.payload.timeoutSeconds >= 1 && data.payload.timeoutSeconds % 1 === 0 ? data.payload.timeoutSeconds : false;

    if(id){
        _data.read('checks',id,function(err,checkData){
            if(!err && checkData){

                var token = typeof data.headers.token == 'string' && data.headers.token.trim().length > 0 ? data.headers.token : false;

                handlers._tokens.verifyToken(token,checkData.userPhone,function(isValidToken){
                  if(isValidToken){
                      if(protocols || successCode || methods || url || timeoutSeconds){
                          if(protocols)
                              checkData.protocols = protocols
                          if(methods)
                              checkData.methods = methods
                          if(url)
                              checkData.url = url
                          if(successCode)
                              checkData.successCode = successCode
                          if(timeoutSeconds)
                              checkData.timeoutSeconds = timeoutSeconds

                          _data.update('checks',id,checkData,function(err){
                              if(!err)
                                  callback(200,checkData)
                              else
                                  callback(500,{'Error':'Unable to update checks'})
                          })
                      }
                  }  else
                      callback(404,{'Error':'Invalid user'})
                })
            } else
                callback(403)
        });
    }else
        callback(403,{'Error':'Missing Required field'})
};

handlers._checks.delete = function(data,callback){
    var id = typeof data.queryStrObj.id == 'string' && data.queryStrObj.id.trim().length == 20 ? data.queryStrObj.id.trim() : false;

    if(id){
        _data.read('checks',id,function(err,checkData){
            if(!err && checkData){

                var token = typeof data.headers.token == 'string' && data.headers.token.trim().length > 0 ? data.headers.token : false;

                handlers._tokens.verifyToken(token,checkData.userPhone,function(isValidToken){
                    if(isValidToken){
                        _data.delete('checks',id,function(err){
                            if(!err){
                                _data.read('users',checkData.userPhone,function(err,userData){
                                   if(!err && userData){
                                       var position = userData.checks.indexOf(id)
                                        if( position > -1){
                                            userData.checks.splice(position,1)
                                            _data.update('users',userData.phone,function(err,updatedData){
                                               if(!err && updatedData){
                                                   callback(200,updatedData)
                                               } else{
                                                   callback(500,{'Error':'Can\'t update the User data'})
                                               }
                                            });
                                        }else
                                            callback(500,{'Error':'No Checks Present.'})
                                   } else
                                       callback(500,{'Error':'Unable to get the User Data'})
                                });
                            }else{

                            }
                        })
                    }callback(406,{'Error':'Invalid user.'})
                })
            }else
                callback(403,{'Error':'Checks not present to delete'})
        });
    }else
        callback(400,{'Error':'Required missing fields'})
};

//demo
handlers.ping = function(data,callback){

    callback(200,{'ping':'pong'});
};

// Not found handler
handlers.notFound = function(data,callback){

    callback(404);
};

module.exports = handlers;