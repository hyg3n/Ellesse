// routes/payments.js
const express = require("express");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const authenticate = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/create-payment-intent", authenticate, async (req, res, next) => {
  try {
    const { amount } = req.body; // amount in pence
    const pi = await stripe.paymentIntents.create({
      amount,
      currency: "gbp",
      capture_method: "manual",
    });
    res.json({
      clientSecret: pi.client_secret,
      paymentIntentId: pi.id,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
