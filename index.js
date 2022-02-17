'use strict';

//modules
var express = require('express');
var router = express.Router();
var path = require("path");
const Joi = require('@hapi/joi');

//wrapper is function that returns the route object configured with the passed params
var wrapper = function (routerConfig){

var mongooseConnection = require('./mongodb/mongooseConnection')(routerConfig.mongodb)
var metrics = require('./mongodb/jmmcModel')(mongooseConnection);


//route to send the javascript client file
router.get('/getClient', function (req, res, next) {
    let jmmc_client_path = path.join(__dirname, 'public')+"/jmmc_client.js";
    res.sendFile(jmmc_client_path, function (err) {
        if (err) {
            next(err);
        }
    });
});

//route to which the client sends metrics to be stored in mongodb
router.post('/push', async (req, res) => {
    let ts =  Math.floor(Date.now() / 1000); //creating the timestamp just before validation with Joi
    if(req.body.m) {
       req.body.m.ts = ts;  // appending the timestamp to the m (metrics) variable of the object received 
    }
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

// validates the modified request body if it has the required form
const schema_validator = Joi.object({

        uid: Joi.string().guid().required(),
        conf: Joi.string().pattern(new RegExp('^(?=(?:[a-zA-Z0-9]*[a-zA-Z]))(?=(?:[a-zA-Z0-9]*[0-9]){3})[a-zA-Z0-9]{10,}$')).required()
        ,

        m: Joi.object({
            br: Joi.string(),  // browser_name
            os: Joi.string(), // operating_system

            sr: Joi.string().valid(...routerConfig.authorizedRegions), // server_region
            cq: Joi.number().min(0).max(100), // connection_quality
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
                            version: ['ipv4'],                            
                            cidr: 'forbidden' 
                        }),
                        p: Joi.number(), 
                        tp: Joi.string().valid('tcp', 'udp'),
                        lip: Joi.string().ip({
                            version: ['ipv4'],                          
                            cidr: 'forbidden' 
                        }),
                        lp: Joi.number() 
                }),
            ts: Joi.number().required()
        }).min(2) 
})
    return router;
}

module.exports = wrapper;