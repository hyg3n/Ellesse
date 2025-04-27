// controllers/providerDashboardController.js
const {
    getNextBookingForProvider,
    getPendingRequestsForProvider,
    getEarningsSummaryForProvider,
  } = require('../models/providerDashboardModel');
  
  exports.getDashboard = async (req, res) => {
    const providerId = req.user.id;
    try {
      const comingUpNext      = await getNextBookingForProvider(providerId);
      const pendingRequests   = await getPendingRequestsForProvider(providerId);
      const earnings          = await getEarningsSummaryForProvider(providerId);
      res.json({ comingUpNext, pendingRequests, earnings });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  };
  