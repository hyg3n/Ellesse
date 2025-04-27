// controllers/providerServicesController.js
const {
    getServicesByUser,
    updateServiceById,
    deleteServiceById,
  } = require('../models/providerServicesModel');
  
  exports.listServices = async (req, res) => {
    try {
      const userId = req.user.id;
      const services = await getServicesByUser(userId);
      res.json({ services });
    } catch (err) {
      console.error('Error listing services:', err);
      res.status(500).json({ error: 'Server error' });
    }
  };
  
  exports.updateService = async (req, res) => {
    try {
      const { id } = req.params;
      const { price, experience, availability } = req.body;
      const updated = await updateServiceById(
        Number(id),
        { price, experience, availability }
      );
      if (!updated) return res.status(404).json({ error: 'Not found' });
      res.json({ service: updated });
    } catch (err) {
      console.error('Error updating service:', err);
      res.status(500).json({ error: 'Server error' });
    }
  };
  
  exports.deleteService = async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await deleteServiceById(Number(id));
      if (!deleted) return res.status(404).json({ error: 'Not found' });
      res.json({ success: true });
    } catch (err) {
      console.error('Error deleting service:', err);
      res.status(500).json({ error: 'Server error' });
    }
  };
  