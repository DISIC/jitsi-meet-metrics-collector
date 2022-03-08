'use strict';
//modules
var path = require("path");
var validator = require("./validator/schema_validator");
var jmmcModel_initializer = require("./schema/jmmcModel_intializer");


//wrapper is function that returns the route object configured with the passed params
var wrapper = function (config){

    var schema_validator = validator({authorizedRegions: config.authorizedRegions, confPattern: config.confPattern});
    var jmmcModel = jmmcModel_initializer({Mongoose: config.mongoose, jmmcCollection: config.jmmcCollection});

    return async function jmmc (req, res, next){
        if( req.url === "/push" && req.method === 'POST'){
            try {
                if(req.body.m) {
                    req.body.m.ts = Math.floor(Date.now() / 1000); ;  // appending the timestamp to the m (metrics) variable of the object received
                    const validation = schema_validator.validate(req.body); // validation receives an object that has value and error (in case of an error)
                    let formated_data = validation.value;
                    // tests for eventual validation errors
                    if(validation.error){
                        return res.status(400).send("valition error ");
                    }
                    // tests for the existence of the br variable. If true it means new sessions
                    if(formated_data.m.br){
                        var newId = config.mongoose.Types.ObjectId();
                        await jmmcModel.create({
                            _id: newId,
                            conf: formated_data.conf,
                            uid: formated_data.uid,
                            m: [formated_data.m]
                        });
                        //the cookie is signed with a secret
                        res.cookie('jmmc_objectId', newId, {secure: true, signed: true, httpOnly: true});
            
                        return res.status(200).send(validation.value);
                    }
                    else{
                        if(req.signedCookies["jmmc_objectId"]){ 
                            await jmmcModel.updateOne(
                                { _id: req.signedCookies["jmmc_objectId"]},
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
                return res.status(500).send("something bad happened");
            }
        }else if( req.url === "/getClient" && req.method === 'GET'){
                let jmmc_client_path = path.join(__dirname, 'public')+"/jmmc_client.js";
                return res.sendFile(jmmc_client_path, function (err) {
                        if (err) {
                            next(err);
                        }
                    }
                );
        }else{
            return res.status(400).send("invalid url");
        }
    }

}

module.exports = wrapper;