var Wit = require('node-wit').Wit;
var uuid = require('node-uuid');
var redis = require("redis");
var async = require('async');
var exports = module.exports = {};

const firstEntityValue = (entities, entity) =>{
    //console.log(entity + "-->");
    //console.log(entities[entity]);
    const val = entities && entities[entity] &&
            Array.isArray(entities[entity]) &&
            entities[entity].length > 0 &&
            entities[entity][0].value
        ;
    if (!val) {
        return null;
    }
    return typeof val === 'object' ? val.value : val;
}

const allEntityValue = (entities, entity) =>{
    //console.log(entity + "-->");
    //console.log(entities[entity]);1
    if (entities && entities[entity] &&
        Array.isArray(entities[entity]) &&
        entities[entity].length > 0) {
        var returnvals = [];
        for (i=0; i<entities[entity].length; i++) {
            returnvals.push(entities[entity][i].value);
        }
        return returnvals;
    }
    return null;
}

function parseIntend(entities, context) {
    var intend = firstEntityValue(entities, 'intend');
    if (intend) {
        context.intend = intend;
    }
}

function parseContacts(entities, context) {
    var contacts = allEntityValue(entities, 'contact');
    if (contacts) {
       var contactsstring="";
        for (i=0; i<contacts.length; i++) {
            contactsstring+=contacts[i] + " ";
        }
        context.contacts = contactsstring;
        context.contactsarray = contacts;
    }
}

function parseAmount(entities, context) {
    var amount = firstEntityValue(entities, 'amount_of_money');
    if (amount) {
        context.amount = amount;
    }
}

function parseMessage(entities, context) {
    var message = firstEntityValue(entities, 'message_subject');
    if (message) {
        context.message = message;
    }
}

function parseService(entities, context) {
    var service = firstEntityValue(entities, 'service');
    if (service) {
        context.service = service;
    }
}

function parseAccount(entities, context) {
    var account = firstEntityValue(entities, 'email');
    if (account) {
        context.account = account;
    }
}
function parseEnabled(entities, context) {
    var enabled = firstEntityValue(entities, 'on_off');
    if (enabled) {
        context.enabled = enabled;
    }
}
var client = null;
//var context0;
var session;
var redisClient = null;

function initBot(mycb, sendBillCB, id) {
    const actions = {
        say(sessionId, context, message, cb) {
            cb();
            mycb(message,id);
        },
        merge(sessionId, context, entities, message, cb) {
            if (context
                && context.intend
                && context.contacts
                && context.amount
                && context.service
                && context.account) {
                parseEnabled(entities, context);
            } else {
                parseIntend(entities, context);
                parseContacts(entities, context);
                parseAmount(entities, context);
                parseMessage(entities, context);
                parseService(entities, context);
                parseAccount(entities, context);
            }
            //console.log(entities);
            //console.log(context);
            cb(context);
        },
        error(sessionId, context, error) {
            //console.log(error.message);
        },
        sendBills(sessionId, context, cb) {
            cb(context);
            console.log("action sendBills");
            sendBillCB(context,id);
        }
    };

    client = new Wit("B2VSXB5KNBO47O5P5ZVOZFVPUXEYKKOB", actions);
    redisClient = redis.createClient(6859, "ec2-54-247-161-36.eu-west-1.compute.amazonaws.com", {no_ready_check: true});
    redisClient.auth("peambnhuh19u6t82r7pv7ldcl7l", function () {
        console.log('Redis client connected');
    });
    redisClient.on('connect', function () {
        console.log('connected');
    });
    session = uuid.v1();
    //context0 = {};
}

exports.deleteRedisCache = function (id, cb) {
    if (redisClient !== null) {
        redisClient.del(id, function (err, reply) {
            console.log("deletes");
            cb(id);
        });
    } else {
        cb(id);
    }
};

exports.runConversation = function (id,text, cb, sendBillCB) {
    async.waterfall([
        function (callback) {
            console.log("init bot");
            initBot(cb,sendBillCB,id);
            callback(null)
        }, function (callback) {
            console.log("get context from redis with key - "+id);
            redisClient.get(id, function(err, reply) {
                if (reply === null) {
                    reply = {};
                } else {
                    reply=JSON.parse(reply);
                }
                callback(null,reply)
            });
        }, function (context0, callback) {
            console.log("runActions with Bot with key - "+ id);
            client.runActions(id, text, context0, function (e, context0) {
                if (e) {
                    console.log('Oops! Got an error: ' + e);
                    return;
                }
                console.log('The session state is now: ' + JSON.stringify(context0));
                callback(null,context0)
            });
        }, function (context0, callback) {
            console.log("set context to redis with key - "+ id);
            redisClient.set(id, JSON.stringify(context0), function(err, reply) {
                callback(null,context0)
            });
        }], function (err, result) {
    });






    /*
     client.runActions(session, 'bill', context0, function (e, context0) {
     if (e) {
     console.log('Oops! Got an error: ' + e);
     return;
     }
     console.log('The session state is now: ' + JSON.stringify(context0));
     client.runActions(session, 'Engin', context0, function (e, context0) {
     if (e) {
     console.log('Oops! Got an error: ' + e);
     return;
     }
     console.log('The session state is now: ' + JSON.stringify(context0));
     client.runActions(session, '50€', context0, function (e, context0) {
     if (e) {
     console.log('Oops! Got an error: ' + e);
     return;
     }
     console.log('The session state is now: ' + JSON.stringify(context0));
     client.runActions(session, 'Paypal', context0, function (e, context0) {
     if (e) {
     console.log('Oops! Got an error: ' + e);
     return;
     }
     console.log('The session state is now: ' + JSON.stringify(context0));
     client.runActions(session, 'ed@ed.de', context0, function (e, context0) {
     if (e) {
     console.log('Oops! Got an error: ' + e);
     return;
     }
     console.log('The session state is now: ' + JSON.stringify(context0));
     client.runActions(session, 'Yes', context0, function (e, context0) {
     if (e) {
     console.log('Oops! Got an error: ' + e);
     return;
     }
     console.log('The session state is now: ' + JSON.stringify(context0));
     });
     });
     });
     });
     });

     });*/
};
