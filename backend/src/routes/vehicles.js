const express = require('express');
const { Vehicle, Sequelize } = require('../models');
const { authenticateToken, requireSupervisor } = require('../middleware/auth');
const { logAudit } = require('../utils/audit');
const { Op } = Sequelize;

const router = express.Router();
router.use(authenticateToken);

// GET /api/vehicles - Listar vehículos
router.get('/', async (req, res) => {
  try {
    const { status, type, search } = req.query;
    const where = {};
    
    if (status) where.status = status;
    if (type) where.type = type;
    
    if (search) {
      where[Op.or] = [
        { brand: { [Op.iLike]: `%${search}%` } },
        { model: { [Op.iLike]: `%${search}%` } },
        { license_plate: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const vehicles = await Vehicle.findAll({
      where,
      order: [['license_plate', 'ASC']]
    });

    res.json({ vehicles });
  } catch (error) {
    console.error('Error obteniendo vehículos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/vehicles/available - Vehículos disponibles
router.get('/available', async (req, res) => {
  try {
    const vehicles = await Vehicle.getAvailable();
    res.json({ vehicles });
  } catch (error) {
    console.error('Error obteniendo vehículos disponibles:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/vehicles - Crear vehículo
router.post('/', requireSupervisor, async (req, res) => {
  try {
    const vehicle = await Vehicle.create(req.body);
    
    // Registrar auditoría
    await logAudit({
      userId: req.user.id,
      action: 'CREATE',
      entity: 'Vehicle',
      entityId: vehicle.id,
      details: { license_plate: vehicle.license_plate, type: vehicle.type },
      req
    });

    res.status(201).json({
      message: 'Vehículo creado exitosamente',
      vehicle
    });
  } catch (error) {
    console.error('Error creando vehículo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;