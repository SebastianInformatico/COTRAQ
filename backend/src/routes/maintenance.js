const express = require('express');
const { Maintenance, Vehicle, User } = require('../models');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken);

// GET /api/maintenance - Listar mantenimientos
router.get('/', async (req, res) => {
  try {
    const { vehicle_id, status, type } = req.query;
    const where = {};
    
    if (vehicle_id) where.vehicle_id = vehicle_id;
    if (status) where.status = status;
    if (type) where.type = type;

    const maintenances = await Maintenance.findAll({
      where,
      include: [
        { model: Vehicle, as: 'vehicle', attributes: ['id', 'license_plate', 'brand', 'model'] },
        { model: User, as: 'mechanic', attributes: ['id', 'first_name', 'last_name'] }
      ],
      order: [['scheduled_date', 'DESC']]
    });

    res.json({ maintenances });
  } catch (error) {
    console.error('Error obteniendo mantenimientos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;