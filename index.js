'use strict';

//modules
var express = require('express');
var router = express.Router();
var path = require("path");
const Joi = require('@hapi/joi');

//wrapper is function that returns the route object configured with the passed params
var wrapper = function (routerConfig){

var mongooseConnection = require('./mongodb/mongooseConnection')(routerConfig.mongodb)
var metrics = require('./mongodb/jmmcModel')(mongooseConnection); //FIXME le nom de la variable doit être un peu plus explicite


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
    //TODO: ajouter try catch 
    let ts =  Math.floor(Date.now() / 1000); //creating the timestamp just before validation with Joi
    if(req.body.m) { //FIXME améliorer cette condition en ajoutant else
       req.body.m.ts = ts;  // appending the timestamp to the m (metrics) variable of the object received 
    }
    const validation = schema_validator.validate(req.body); // validation receives an object that has value and error (in case of an error)
    let formated_data = validation.value;
    //FIXME il faudra rendre ses conditions plus propores
    if(validation.error){//FIXME ce test ne fonctionne pas quand on envoie un objet qui contient que conf et uid
        return res.status(400).send();
    }
    if(formated_data.m.br){
        var newId = mongooseConnection.Types.ObjectId();
        await metrics.create({
            _id: newId,
            conf: formated_data.conf,
            uid: formated_data.uid,
            metrics: [formated_data.m]
        });
        //FIXME remplacer le nom du cookie par jmmc_sessionID pour éviter les confusions
        //TODO rendre le cookie sécurisé avec le système de JWT
        res.cookie('objectId', newId, {secure: true, httpOnly: true});

        //TODO c'est plus propre de renvoyer l'objet que tu as reçu et pas une réponse vide + c'est utile pour les tests unitaires
        return res.status(200).send();
    }
    else{
        if(req.cookies.objectId){ //TODO: effectuer une vérification de sécurité de l'objectId (avec JWT?)
            await metrics.updateOne(
                { _id: req.cookies.objectId},
                { $push: { metrics: formated_data.m}}
            )
            
            return res.status(200).send(); //TODO c'est plus propre de renvoyer l'objet que tu as reçu et pas une réponse vide + c'est utile pour les tests unitaires
        }else{
            return res.status(400).send(); //TODO c'est plus propre d'envoyer des messages d'erreur
        }
    }
});

// validates the modified request body if it has the required form
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
        }).min(2) 
})
    return router;
}

module.exports = wrapper;