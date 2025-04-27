// controllers/usersController.js
const { getUserById, updateUserById } = require('../models/usersModel');

async function getProfile(req, res, next) {
  try {
    const user = await getUserById(req.user.id);
    res.json(user);
  } catch (err) {
    next(err);
  }
}

async function updateProfile(req, res, next) {
  try {
    // only allow these four
    const { name, email, phone_number, address } = req.body;
    const updated = await updateUserById(req.user.id, {
      name, email, phone_number, address
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

module.exports = { getProfile, updateProfile };
