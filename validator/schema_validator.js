const Joi = require('@hapi/joi');

const validator = (validatorConfig) => {
    const schema_validator = Joi.object({

        uid: Joi.string().guid().required(),
        conf: Joi.string().pattern(validatorConfig.confPattern).required(),

        m: Joi.object({
            br: Joi.string(),  // browser_name
            os: Joi.string(), // operating_system

            sr: Joi.string().valid(...validatorConfig.authorizedRegions), // server_region
            cq: Joi.number().min(0).max(100), // connection_quality
            u: Joi.object({ 
                        bw: Joi.number(),   // upload bandwidth
                        ab: Joi.number(),   // upload audio_bitrate
                        vb: Joi.number(),   // upload video_bitrate
                        pl: Joi.number()    // upload packet_loss
                    }),

            d: Joi.object({
                        bw: Joi.number().optional().allow(null), // download bandwidth
                        ab: Joi.number(),   // download audio_bitrate
                        vb: Joi.number(),   // download video_bitrate
                        pl: Joi.number()    // download packet_loss
                    }),

            t: Joi.object({
                        ip: Joi.string().ip({       // transport ip
                            version: ['ipv4'],                            
                            cidr: 'forbidden' 
                        }), 
                        p: Joi.number(),            // transport port
                        tp: Joi.string().valid('tcp', 'udp'), // transport type
                        lip: Joi.string().ip({                  // transport local_ip
                            version: ['ipv4'],                          
                            cidr: 'forbidden' 
                        }),
                        lp: Joi.number()                        // transport local_port
                }),
            ts: Joi.number().required()                         // timestamp
        }).min(2).required() 
    });

    return schema_validator;
}


module.exports = validator;