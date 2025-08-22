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
    // Common fields for all user types
    doorNo: Joi.string().max(10).optional(),
    address: Joi.string().required(),
    locationName: Joi.string().required(),
    // Parent fields
    houseNo: Joi.when('userType', { is: 'parent', then: Joi.string().max(10).required() }),
    cityName: Joi.when('userType', { is: 'parent', then: Joi.string().max(80).required() }),
    // Delivery fields
    name: Joi.when('userType', { is: 'delivery', then: Joi.string().max(120).required() }),
    vehicleType: Joi.when('userType', { is: 'delivery', then: Joi.string().max(30).required() }),
    vehicleNumber: Joi.when('userType', { is: 'delivery', then: Joi.string().max(20).required() }),
    serviceArea: Joi.when('userType', { is: 'delivery', then: Joi.string().required() }),
    // School fields
    schoolName: Joi.when('userType', { is: 'school', then: Joi.string().max(150).required() }),
    schoolId: Joi.when('userType', { is: 'school', then: Joi.string().max(50).required() }),
    contactPerson: Joi.when('userType', { is: 'school', then: Joi.string().max(100).required() }),
    establishedYear: Joi.when('userType', { is: 'school', then: Joi.string().pattern(/^\d{4}$/).required() }),
    classes: Joi.when('userType', { is: 'school', then: Joi.string().required() }),
    // Caterer fields
    businessName: Joi.when('userType', { is: 'caterer', then: Joi.string().max(150).required() }),
    contactPersonCaterer: Joi.when('userType', { is: 'caterer', then: Joi.string().max(100).required() })
  }),

  login: Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required()
  }),

  addChild: Joi.object({
    name: Joi.string().max(120).required(),
    schoolName: Joi.string().max(150).required(),
    schoolId: Joi.string().allow('').optional(),
    class: Joi.string().max(50).required(),
    age: Joi.number().integer().min(3).max(18).optional(),
    allergies: Joi.string().allow('').optional(),
    preferences: Joi.string().allow('').optional()
  }),

  createOrder: Joi.object({
    childId: Joi.string().uuid().required(),
    orderDate: Joi.date().required(),
    deliveryTime: Joi.string().required(),
    specialNotes: Joi.string().allow('').optional(),
    isRecurring: Joi.boolean().optional(),
    recurringDays: Joi.array().items(Joi.string()).optional(),
    orderType: Joi.string().valid('home', 'caterer').required(),
    items: Joi.array().items(Joi.object()).optional(),
    loyaltyPointsUsed: Joi.number().integer().min(0).optional()
  }),

  createMenuItem: Joi.object({
    name: Joi.string().max(150).required(),
    description: Joi.string().allow('').optional(),
    items: Joi.string().required(),
    price: Joi.number().positive().required(),
    category: Joi.string().valid('lunchbox', 'fruit_bowl', 'other').required(),
    imageUrl: Joi.string().uri().allow('').optional(),
    allergens: Joi.string().allow('').optional(),
    calories: Joi.number().integer().min(0).optional(),
    protein: Joi.string().allow('').optional(),
    carbs: Joi.string().allow('').optional(),
    fat: Joi.string().allow('').optional(),
    fiber: Joi.string().allow('').optional()
  })
};

module.exports = { validateRequest, schemas };