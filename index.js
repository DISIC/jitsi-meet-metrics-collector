'use strict';

//modules
var express = require('express');
var router = express.Router();
var path = require("path");
const Joi = require('@hapi/joi');

//TODO: Ajouter un commentaire ici pour décrire ce que fait ce wrapper
var wrapper = function (routerConfig){

var metrics = require('./mongodb/jmmcModel')(routerConfig.mongodb);


router.use(express.json()) //FIXME : est-ce néceassaire de le mettre ici ? ça fait pas doublon avec app.use dans appTest? 

//route to send the javascript client file
router.get('/getClient', function (req, res, next) {
    let jmmc_client_path = path.join(__dirname, 'public')+"/jmmc_client.js";
    res.sendFile(jmmc_client_path, function (err) {
        if (err) {
            next(err);
        } else {
            res.status(200).send(); //FIXME: le client reçoit le fichier mais l'application essaie de lui envoyer une réponse 200 après. Il ne faut pas faire de traitement après l'envoie du fichier
        }
    });
});

//route to which the client sends metrics to be stored in mongodb
router.post('/push', async (req, res) => {
    let ts = Date.now(); //creating the timestamp just before validation with Joi
    //FIXME: ajouter un check pour savoir si "m" existe avant de lui donner ts 
    req.body.m.ts = ts;  // appending the timestamp to the m (metrics) variable of the object received
    const validation = schema_validator.validate(req.body); // validation receives an object that has value and error (in case of an error)
    let formated_data = validation.value;
    if(validation.error || Object.keys(formated_data.m).length <= 1){  //FIXME: pour la deuxième validation, il est possible d'ajouter joi.object({}).min(2); directement dans joi, ça évite de faire cette vérification. Il minimum deux objets dans m
        return res.status(401).send();
    }else{
            await metrics.updateOne({"conf": formated_data["conf"]},
            [
                {
                    "$set": {
                        "uid": formated_data["uid"],
                        "umetrics": formated_data["m"]
                    }
                },
                {
                    "$set": {
                        "new-user": {
                            "$eq": [
                                {
                                    "$filter": {
                                        "input": {
                                            "$cond": [
                                                "$users",
                                                "$users",
                                                []
                                            ]
                                        },
                                        "as": "u",
                                        "cond": {
                                            "$eq": [
                                                "$$u.uid",
                                                "$uid"
                                            ]
                                        }
                                    }
                                },
                                []
                            ]
                        }
                    }
                },
                {
                    "$set": {
                        "users": {
                            "$cond": [
                                "$new-user",
                                {
                                    "$concatArrays": [
                                        {
                                            "$cond": [
                                                {"$isArray": ["$users"]},
                                                "$users",
                                                []
                                            ]
                                        },
                                        [
                                            {
                                                "uid": "$uid",
                                                "sessions": [["$umetrics"]]
                                            }
                                        ]
                                    ]
                                },
                                {
                                    "$map": {
                                        "input": "$users",
                                        "as": "u",
                                        "in": {
                                            "$cond": [
                                                {
                                                    "$eq": ["$$u.uid", "$uid"]
                                                },
                                                {
                                                    "$mergeObjects": [
                                                        "$$u",
                                                        {
                                                            "sessions": {
                                                                "$cond": [
                                                                    {
                                                                        "$eq": [
                                                                            {
                                                                                "$type": "$umetrics.br"
                                                                            },
                                                                            "string"
                                                                        ]
                                                                    },
                                                                    {
                                                                        "$concatArrays":
                                                                            [
                                                                                "$$u.sessions",[["$umetrics"]]
                                                                            ]
                                                                    },
                                                                    {
                                                                        "$concatArrays":
                                                                            [
                                                                                {
                                                                                    "$slice": [
                                                                                        "$$u.sessions",
                                                                                        {
                                                                                            "$subtract": [
                                                                                                {"$size": "$$u.sessions"},
                                                                                                1
                                                                                            ]
                                                                                        }
                                                                                    ]
                                                                                },
                                                                                [
                                                                                    {
                                                                                        "$concatArrays":
                                                                                            [
                                                                                                {"$last": "$$u.sessions"},
                                                                                                ["$umetrics"]
                                                                                            ]
                                                                                    }
                                                                                ]
                                                                            ]
                                                                    }
                                                                ]
                                                            }
                                                        }
                                                    ]
                                                },
                                                "$$u"
                                            ]
                                        }
                                    }
                                }
                            ]
                        }
                    }
                },
                {
                    "$unset":
                        ["uid", "umetrics", "new-user"]
                }
            ]
            ,{upsert: true}
        );
           return res.status(200).send(formated_data);
    }
});

//TODO: ajouter un commentaire pour décrire ce que fait cet objet
const schema_validator = Joi.object({

        uid: Joi.string().guid().required(),
        conf: Joi.string().alphanum().required(), //TODO: à faire plus tard => il faut que le nom de la conf respecte la regex

        m: Joi.object({
            br: Joi.string(),  // browser_name
            os: Joi.string(), // operating_system

            sr: Joi.string().valid("MTE", "RIE", "RIE-EXT", "INTERNET", "INTERNET-RIE"), // server_region //TODO : à rendre paramètrable via la config
            cq: Joi.number(), // connection_quality //TODO : ajouter entre 0 et 100
            u: Joi.object({
                        bw: Joi.number(),
                        ab: Joi.number(),
                        vb: Joi.number(),
                        pl: Joi.number()
                    }),

            d: Joi.object({
                        bw: Joi.number().optional().allow(null),
                        ab: Joi.number(),
                        vb: Joi.number(),
                        pl: Joi.number()
                    }),

            t: Joi.object({
                        ip: Joi.string().ip({
                            version: [
                                'ipv4',
                                'ipv6' //FIXME: pas la peine d'avoir ipv6 car on n'en fait pas ou bien le rendre configurable
                            ],
                            cidr: 'optional' //FIXME: il ne faut pas accepter le format cidr
                        }),
                        p: Joi.string(), //FIXME: le port doit être number
                        tp: Joi.string().valid('tcp', 'udp'),
                        lip: Joi.string().ip({
                            version: [
                                'ipv4',
                                'ipv6'//FIXME: pas la peine d'avoir ipv6 car on n'en fait pas ou bien le rendre configurable
                            ],
                            cidr: 'optional' //FIXME: il ne faut pas accepter le format cidr
                        }),
                        lp: Joi.string() //FIXME: local IP doit être un number
                }),
            ts: Joi.date().timestamp().required() //FIXME : remplacer par number
        })
      
})
    return router;
}

module.exports = wrapper;