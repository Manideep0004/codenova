const Joi = require('joi');

const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(128).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const submissionSchema = Joi.object({
  languageId: Joi.number().integer().positive().required(),
  code: Joi.string().min(1).required(),
  stdin: Joi.string().allow('').optional()
});

const updateRoleSchema = Joi.object({
  roleId: Joi.number().integer().valid(1, 2).required()
});

const validateBody = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const errorDetails = error.details.map(detail => detail.message);
      return res.status(400).json({ error: 'Validation failed', details: errorDetails });
    }
    next();
  };
};

module.exports = {
  validateBody,
  registerSchema,
  loginSchema,
  submissionSchema,
  updateRoleSchema
};
