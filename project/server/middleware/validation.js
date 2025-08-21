const Joi = require('joi');

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        error: 'Validation error', 
        details: error.details.map(detail => detail.message)
      });
    }
    next();
  };
};

// Validation schemas
const schemas = {
  register: Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required(),
    password: Joi.string().min(6).required(),
    userType: Joi.string().valid('parent', 'delivery', 'school', 'caterer').required(),
    // Parent fields
    houseNo: Joi.when('userType', { is: 'parent', then: Joi.string().required() }),
    locationName: Joi.when('userType', { is: 'parent', then: Joi.string().required() }),
    cityName: Joi.when('userType', { is: 'parent', then: Joi.string().required() }),
    address: Joi.when('userType', { is: Joi.valid('parent', 'delivery', 'school', 'caterer'), then: Joi.string().required() }),
    // Delivery fields
    name: Joi.when('userType', { is: 'delivery', then: Joi.string().required() }),
    vehicleType: Joi.when('userType', { is: 'delivery', then: Joi.string().required() }),
    vehicleNumber: Joi.when('userType', { is: 'delivery', then: Joi.string().required() }),
    serviceArea: Joi.when('userType', { is: 'delivery', then: Joi.string().required() }),
    // School fields
    schoolName: Joi.when('userType', { is: 'school', then: Joi.string().required() }),
    schoolId: Joi.when('userType', { is: 'school', then: Joi.string().required() }),
    contactPerson: Joi.when('userType', { is: Joi.valid('school', 'caterer'), then: Joi.string().required() }),
    establishedYear: Joi.when('userType', { is: 'school', then: Joi.number().integer().min(1800).max(new Date().getFullYear()) }),
    classes: Joi.when('userType', { is: 'school', then: Joi.string().required() }),
    // Caterer fields
    businessName: Joi.when('userType', { is: 'caterer', then: Joi.string().required() }),
    contactPersonCaterer: Joi.when('userType', { is: 'caterer', then: Joi.string().required() })
  }),

  login: Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required()
  }),

  addChild: Joi.object({
    name: Joi.string().required(),
    schoolName: Joi.string().required(),
    schoolId: Joi.string().allow(''),
    class: Joi.string().required(),
    age: Joi.number().integer().min(3).max(18),
    allergies: Joi.string().allow(''),
    preferences: Joi.string().allow('')
  }),

  createOrder: Joi.object({
    childId: Joi.string().uuid().required(),
    orderDate: Joi.date().required(),
    deliveryTime: Joi.string().required(),
    specialNotes: Joi.string().allow(''),
    isRecurring: Joi.boolean(),
    recurringDays: Joi.array().items(Joi.string()),
    orderType: Joi.string().valid('home', 'caterer').required(),
    items: Joi.array().items(Joi.object()),
    loyaltyPointsUsed: Joi.number().integer().min(0)
  }),

  createMenuItem: Joi.object({
    name: Joi.string().required(),
    description: Joi.string().allow(''),
    items: Joi.string().required(),
    price: Joi.number().positive().required(),
    category: Joi.string().valid('lunchbox', 'fruit-bowl', 'snack').required(),
    imageUrl: Joi.string().uri().allow(''),
    allergens: Joi.string().allow(''),
    calories: Joi.number().integer().min(0),
    protein: Joi.string().allow(''),
    carbs: Joi.string().allow(''),
    fat: Joi.string().allow(''),
    fiber: Joi.string().allow('')
  })
};

module.exports = { validateRequest, schemas };