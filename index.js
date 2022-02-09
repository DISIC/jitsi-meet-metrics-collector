'use strict';

//modules
var express = require('express');
var router = express.Router();
var path = require("path");
const Joi = require('@hapi/joi');


var wrapper = function (routerConfig){
    var metrics = require('./mongodb/jmmcModel')(routerConfig.mongodb);


router.use(express.json()) 

//route to send the file to the client
router.get('/getClient', function (req, res, next) {
    let jmmc_client_path = path.join(__dirname, 'public')+"/jmmc_client.js";
    res.sendFile(jmmc_client_path, function (err) {
        if (err) {
            next(err);
        } else {
            res.status(200).send();
        }
    });
});

//route to which the client send metrics to be stored to mongodb
router.post('/push', async (req, res) => {
    let ts = Date.now(); //creating the timestamp juste before validation with Joi
    req.body.m.ts = ts;  // appending the timestamp to the m (metrics) variable of the object received
    const validation = schema_validator.validate(req.body); // validation receives an object that has value and error (in case of an error)
    let formated_data = validation.value;
    if(validation.error){
        return res.status(400).send(validation.error.details);
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
           return res.status(200).send();
    }
});

const schema_validator = Joi.object({

        uid: Joi.string().guid().required(),
        conf: Joi.string().alphanum().required(),

        m: Joi.object({
            br: Joi.string(),  // browser_name
            os: Joi.string(), // operating_system

            sr: Joi.string().valid("MTE", "RIE", "RIE-EXT", "INTERNET", "INTERNET-RIE"), // server_region
            cq: Joi.number(), // connection_quality
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
                                'ipv6'
                            ],
                            cidr: 'optional'
                        }),
                        p: Joi.string(),
                        tp: Joi.string().valid('tcp', 'udp'),
                        lip: Joi.string().ip({
                            version: [
                                'ipv4',
                                'ipv6'
                            ],
                            cidr: 'optional'
                        }),
                        lp: Joi.string()
                }),
            ts: Joi.date().timestamp().required(),
        })
      
})
    return router;
}
module.exports = wrapper;