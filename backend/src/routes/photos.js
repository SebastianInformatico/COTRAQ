const express = require('express');
const { Photo, Trip, Vehicle, User } = require('../models');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken);

// GET /api/photos - Listar fotos
router.get('/', async (req, res) => {
  try {
    const { trip_id, vehicle_id, type, is_verified } = req.query;
    const where = {};
    
    if (trip_id) where.trip_id = trip_id;
    if (vehicle_id) where.vehicle_id = vehicle_id;
    if (type) where.type = type;
    if (is_verified !== undefined) where.is_verified = is_verified === 'true';

    const photos = await Photo.findAll({
      where,
      include: [
        { model: Trip, as: 'trip', attributes: ['id', 'trip_number'] },
        { model: Vehicle, as: 'vehicle', attributes: ['id', 'license_plate'] },
        { model: User, as: 'taken_by_user', attributes: ['id', 'first_name', 'last_name'] }
      ],
      order: [['taken_at', 'DESC']]
    });

    res.json({ photos });
  } catch (error) {
    console.error('Error obteniendo fotos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;