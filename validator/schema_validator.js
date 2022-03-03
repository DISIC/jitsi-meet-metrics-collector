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
    });

    return schema_validator;
}


module.exports = validator;