const Joi = require('joi')

module.exports = {

    validatation4signup: (req, res, next) => {
        let schema = Joi.object().keys({
            email: Joi.string().email().required(),
            name: Joi.string().required(),
            phone: Joi.number(),
            password: Joi.string().required()
        });

        let { error } = schema.validate(req.body);
        if (error) {
            res.status(400).json({
                error: error.details[0].message
            });
        } else {
            next();
        }
    },

    validatation4login: (req, res, next) => {
        let schema = Joi.object().keys({
            email: Joi.string().email().required(),
            password: Joi.string().required()
        });

        let { error } = schema.validate(req.body);
        if (error) {
            res.status(400).json({
                error: error.details[0].message
            });
        } else {
            next();
        }
    },
    
}