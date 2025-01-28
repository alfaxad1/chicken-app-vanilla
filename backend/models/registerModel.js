const Joi = require("joi");

const schema = Joi.object({
  username: Joi.string().required().min(2),
  password: Joi.string().required().min(8).max(30),
  role: Joi.string().required(),
});

const validate = (req, res, next) => {
  const result = schema.validate(req.body);
  if (result.error) {
    return res.status(400).json({ error: result.error.details[0].message });
  }
  next();
};

module.exports = validate;
