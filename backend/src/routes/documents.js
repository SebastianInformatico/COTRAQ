const express = require('express');
const { Document, Vehicle, User } = require('../models');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken);

// GET /api/documents - Listar documentos
router.get('/', async (req, res) => {
  try {
    const { vehicle_id, user_id, type, status } = req.query;
    const where = {};
    
    if (vehicle_id) where.vehicle_id = vehicle_id;
    if (user_id) where.user_id = user_id;
    if (type) where.type = type;
    if (status) where.status = status;

    const documents = await Document.findAll({
      where,
      include: [
        { model: Vehicle, as: 'vehicle', attributes: ['id', 'license_plate', 'brand', 'model'] },
        { model: User, as: 'user', attributes: ['id', 'first_name', 'last_name'] }
      ],
      order: [['updated_at', 'DESC']]
    });

    res.json({ documents });
  } catch (error) {
    console.error('Error obteniendo documentos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;