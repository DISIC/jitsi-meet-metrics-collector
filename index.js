'use strict';
//modules
var uaParser = require("ua-parser-js")
var path = require("path");
var fs = require("fs");

var validator = require("./validator/schema_validator");
var jmmcModel_initializer = require("./schema/jmmcModel_intializer");

function ip2int(ip) {
    return ip.split('.').reduce(function(ipInt, octet) { return (ipInt<<8) + parseInt(octet, 10)}, 0) >>> 0;
}

//wrapper is function that returns the route object configured with the passed params
var wrapper = function (config){

    var schema_validator = validator({authorizedRegions: config.authorizedRegions, confPattern: config.confPattern});
    var jmmcModel = jmmcModel_initializer({Mongoose: config.mongoose, jmmcCollection: config.jmmcCollection});

    return async function jmmc (req, res, next){
        if( req.url === "/push" && req.method === 'POST'){
            try {
                if(req.body.m) {
                    req.body.m.ts = Math.floor(Date.now() / 1000);  // appending the timestamp to the m (metrics) variable of the object received
                    const validation = schema_validator.validate(req.body, { abortEarly: false }); // validation receives an object that has value and error (in case of an error)
                    let formated_data = validation.value;

                    if(validation.error && (validation.error.details[0].path[0] == 'uid' || validation.error.details[0].path[0] == 'conf')){
                        return res.status(400).send("valition error ");
                    }
                    // tests for eventual validation errors
                    if(validation.error){
                        for(let i = 0; i < validation.error.details.length; i++){
                            if(validation.error.details[i].path[1] != 'u' && validation.error.details[i].path[1] != 'd' && validation.error.details[i].path[1] != 't'){
                                delete formated_data.m[`${validation.error.details[i].path[1]}`];
                            }else{
                                delete formated_data.m[`${validation.error.details[i].path[1]}`][`${validation.error.details[i].path[2]}`];
                            }
                            // objectError[validation.error.details[i].path[0]] = validation.error.details[i].path[0];
                        }

                        if(formated_data.m.hasOwnProperty('u') && Object.keys(formated_data.m.u).length === 0){
                            delete formated_data.m.u;
                        }

                        if(formated_data.m.hasOwnProperty('d') && Object.keys(formated_data.m.d).length === 0){
                            delete formated_data.m.d;
                        }

                        if(formated_data.m.hasOwnProperty('t') && Object.keys(formated_data.m.t).length === 0){
                            delete formated_data.m.t;
                        }  
                        
                        if(Object.keys(formated_data.m).length < 2){
                            return res.status(400).send("m must have 2 fields");
                        } 
                    }

                    // tests for the existence of the br variable. If true it means new sessions
                    if(formated_data.m.br){
                        // formated_data.m.ts = Math.floor(Date.now() / 1000);
                        var newId = config.mongoose.Types.ObjectId();
                        await jmmcModel.create({
                            _id: newId,
                            conf: formated_data.conf,
                            uid: formated_data.uid,
                            m: [{
                                ts: formated_data.m.ts,
                                br: uaParser(req.headers["user-agent"]).browser.name + " " + uaParser(req.headers["user-agent"]).browser.major, 
                                os: uaParser(req.headers["user-agent"]).os.name + " " +uaParser(req.headers["user-agent"]).os.version,
                                pid: formated_data.m.pid,
                                t: {rip: ip2int(req.ip)} // Add the request IP address in the first metrics element
                            }]
                        });
                        //the cookie is signed with a secret
                        res.cookie('jmmc_objectId', newId, {secure: true, signed: true, httpOnly: true, sameSite: 'None'});
                        validation.value.jmmc_objectId = newId
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
                return res.status(500).send("something bad happened");
            }
        }else if( req.url === "/getClient" && req.method === 'GET'){
            fs.readFile(path.join(__dirname, 'public/jmmc_client.js'), "utf8", (err, jmmc_client_content) => {
                if(err){
                    return res.status(500);
                }
                else{
                    jmmc_client_content = jmmc_client_content.replace('JMMC_PUSH_URL', config.pushURL); //Replace JMMC_PUSH_URL with the push url
                    return res.set('Content-Type', 'application/javascript').send(jmmc_client_content);
                }
             });
        }else{
            return res.status(400).send({error:"Bad URL or request method."});
        }
    }
}

module.exports = wrapper;
