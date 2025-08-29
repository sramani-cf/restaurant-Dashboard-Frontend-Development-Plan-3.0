const Joi = require('joi');

// Password validation requirements
const passwordSchema = Joi.string()
  .min(8)
  .max(128)
  .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]'))
  .messages({
    'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character',
    'string.min': 'Password must be at least 8 characters long',
    'string.max': 'Password must be no more than 128 characters long',
  });

const emailSchema = Joi.string()
  .email()
  .max(255)
  .required()
  .messages({
    'string.email': 'Please provide a valid email address',
    'string.max': 'Email must be no more than 255 characters long',
  });

// User registration schema
const userRegister = Joi.object({
  email: emailSchema,
  password: passwordSchema.required(),
  firstName: Joi.string().trim().min(1).max(100).required().messages({
    'string.min': 'First name is required',
    'string.max': 'First name must be no more than 100 characters long',
  }),
  lastName: Joi.string().trim().min(1).max(100).required().messages({
    'string.min': 'Last name is required',
    'string.max': 'Last name must be no more than 100 characters long',
  }),
  phone: Joi.string().trim().max(20).optional().allow(null, '').messages({
    'string.max': 'Phone number must be no more than 20 characters long',
  }),
  username: Joi.string().trim().min(3).max(30).optional().allow(null, '').messages({
    'string.min': 'Username must be at least 3 characters long',
    'string.max': 'Username must be no more than 30 characters long',
  }),
});

// User login schema
const userLogin = Joi.object({
  email: emailSchema,
  password: Joi.string().required().messages({
    'any.required': 'Password is required',
  }),
});

// Change password schema
const changePassword = Joi.object({
  currentPassword: Joi.string().required().messages({
    'any.required': 'Current password is required',
  }),
  newPassword: passwordSchema.required(),
});

// Update profile schema
const updateProfile = Joi.object({
  firstName: Joi.string().trim().min(1).max(100).optional().messages({
    'string.min': 'First name cannot be empty',
    'string.max': 'First name must be no more than 100 characters long',
  }),
  lastName: Joi.string().trim().min(1).max(100).optional().messages({
    'string.min': 'Last name cannot be empty',
    'string.max': 'Last name must be no more than 100 characters long',
  }),
  phone: Joi.string().trim().max(20).optional().allow(null, '').messages({
    'string.max': 'Phone number must be no more than 20 characters long',
  }),
  username: Joi.string().trim().min(3).max(30).optional().allow(null, '').messages({
    'string.min': 'Username must be at least 3 characters long',
    'string.max': 'Username must be no more than 30 characters long',
  }),
});

// Refresh token schema
const refreshToken = Joi.object({
  refreshToken: Joi.string().required().messages({
    'any.required': 'Refresh token is required',
  }),
});

// Forgot password schema
const forgotPassword = Joi.object({
  email: emailSchema,
});

// Reset password schema
const resetPassword = Joi.object({
  token: Joi.string().required().messages({
    'any.required': 'Reset token is required',
  }),
  newPassword: passwordSchema.required(),
});

module.exports = {
  userRegister,
  userLogin,
  changePassword,
  updateProfile,
  refreshToken,
  forgotPassword,
  resetPassword,
};