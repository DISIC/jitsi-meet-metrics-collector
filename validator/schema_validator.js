const Joi = require('@hapi/joi');

const validator = (validatorConfig) => {
    const schema_validator = Joi.object({

        uid: Joi.string().guid().required(),
        conf: Joi.string().pattern(validatorConfig.confPattern).required(),

        m: Joi.object({
            br: // browser_name
            Joi.string(),  
            os: // operating_system
            Joi.string(), 
            sr: // server_region
            Joi.string().valid(...validatorConfig.authorizedRegions),
            cq: // connection_quality
            Joi.number().min(0).max(100), 
            u: // upload metrics
            Joi.object({ 
                bw: // upload bandwidth
                Joi.number(),   
                ab: // upload audio_bitrate
                Joi.number(),   
                vb: // upload video_bitrate
                Joi.number(),   
                pl: // upload packet_loss
                Joi.number()    
            }),
            d: //download metrics
            Joi.object({
                bw: // download bandwidth
                Joi.number().optional().allow(null), 
                ab: // download audio_bitrate
                Joi.number(),   
                vb: // download video_bitrate
                Joi.number(),   
                pl: // download packet_loss
                Joi.number()    
            }),
            t: // transport metrics
            Joi.object({ 
                ip: // transport ip
                Joi.string().ip({       
                    version: ['ipv4'],                            
                    cidr: 'forbidden' 
                }), 
                p: // transport port
                Joi.number(),            
                tp: // transport type
                Joi.string().valid('tcp', 'udp'), 
                lip: // transport local_ip
                Joi.string().ip({                  
                    version: ['ipv4'],                          
                    cidr: 'forbidden' 
                }),
                rip: // transport local_ip
                Joi.string().ip({                  
                    version: ['ipv4'],                          
                    cidr: 'forbidden' 
                }),
                lp: // transport local_port
                Joi.number()                        
            }),
            ts: //timestamp
            Joi.number().required()
        }).min(2).required()
    });
    return schema_validator;
}


module.exports = validator;