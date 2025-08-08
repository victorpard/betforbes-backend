import Joi from 'joi';

export const createAffiliateSchema = Joi.object({});
export const convertReferralSchema = Joi.object({
  userId: Joi.string().uuid().required(),
  email: Joi.string().email().required(),
  value: Joi.number().positive().required(),
  referralCode: Joi.string().required(),
});
