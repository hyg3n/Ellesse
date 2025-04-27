// controllers/providerOnboardingController.js
const { validationResult } = require('express-validator');
const {
  addProviderServicesForUser,
} = require('../models/providerServicesModel');
const { issueAccessToken } = require('../utils/jwt');   // ← helper that signs a fresh token

exports.becomeProvider = async (req, res) => {
  // validate body
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const userId   = req.user.id;        // set by auth middleware
  const services = req.body.services;

  try {
    // write to DB (adds role + provider_services rows)
    await addProviderServicesForUser(userId, services);

    // sign a NEW access token that now contains role "user,provider"
    const token = await issueAccessToken(userId);

    return res.status(200).json({
      message: 'You are now a provider!',
      token,                         
    });
  } catch (err) {
    console.error('becomeProvider error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};
