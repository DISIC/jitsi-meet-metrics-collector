'use strict';
//modules
var path = require("path");
const Joi = require('@hapi/joi');


//wrapper is function that returns the route object configured with the passed params
var wrapper = function (routerConfig){

    const schema_validator = Joi.object({

        uid: Joi.string().guid().required(),
        conf: Joi.string().pattern(new RegExp('^(?=(?:[a-zA-Z0-9]*[a-zA-Z]))(?=(?:[a-zA-Z0-9]*[0-9]){3})[a-zA-Z0-9]{10,}$')).required(),

        m: Joi.object({
            br: Joi.string(),  // browser_name
            os: Joi.string(), // operating_system

            sr: Joi.string().valid(...routerConfig.authorizedRegions), // server_region
            cq: Joi.number().min(0).max(100), // connection_quality
            u: Joi.object({ //TODO : ajouter des commentaires pour TOUTES les métriques (commme les métriques ci-dessous)
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
        }).min(2).required() 
    })

    var mongoose = routerConfig.mongoose;
    var metricsSchema = mongoose.Schema(
        {
            conf: String,
            uid: String,
            m: Array
        },
        {collection :'metrics-collector', versionKey: false}
    );
    var jmmcModel =  mongoose.model('metrics-collector', metricsSchema); 

    return async function jmmc (req, res, next){
        console.log(req.url)
        if( req.url === "/getClient"){
            let jmmc_client_path = path.join(__dirname, 'public')+"/jmmc_client.js";
            res.sendFile(jmmc_client_path, function (err) {
                if (err) {
                    next(err);
                }
            }
            );
        }
        if( req.url === "/push"){
            try {
                if(req.body.m) {
                    req.body.m.ts = Math.floor(Date.now() / 1000); ;  // appending the timestamp to the m (metrics) variable of the object received
                    const validation = schema_validator.validate(req.body); // validation receives an object that has value and error (in case of an error)
                    let formated_data = validation.value;
                    // tests for eventual validation errors
                    if(validation.error){
                        return res.status(400).send("valition error ");
                    }
                    // tests for the existance of the br variable
                    if(formated_data.m.br){
                        var newId = routerConfig.mongoose.Types.ObjectId();
                        await jmmcModel.create({
                            _id: newId,
                            conf: formated_data.conf,
                            uid: formated_data.uid,
                            m: [formated_data.m]
                        });
                        //TODO rendre le cookie sécurisé avec le système de JWT cookie session
                        res.cookie('jmmc_objectId', newId, {secure: true, httpOnly: true});
            
                        return res.status(200).send(validation.value);
                    }
                    else{
                        if(req.cookies.jmmc_objectId){ //TODO: effectuer une vérification de sécurité de l'objectId (avec JWT?)
                            await jmmcModel.updateOne(
                                { _id: req.cookies.jmmc_objectId},
                                { $push: { m: formated_data.m}}
                            )
                            
                            return res.status(200).send(validation.value); 
                        }else{
                            return res.status(400).send("invalid jmmc_objectId"); 
                        }
                    }
                    }else{
                        return res.status(400).send("must contains the m variable");
                    }
            }catch (error) {
                console.log(error)
                res.status(500).send("something bad happened");
            }
        }
    }

}

module.exports = wrapper;