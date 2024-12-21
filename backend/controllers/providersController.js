const { getProvidersByService } = require("../models/providersModel");
const { validationResult } = require("express-validator");

const getProviders = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { service } = req.query;

  try {
    const providers = await getProvidersByService(service);
    res.json(providers);
  } catch (error) {
    console.error("Error fetching providers:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  getProviders,
};
