const express = require('express');
const { Trip, User, Vehicle, Sequelize } = require('../models');
const { Op } = Sequelize;
const { authenticateToken, requireSupervisor, requireRole } = require('../middleware/auth');
const { logAudit } = require('../utils/audit');

const router = express.Router();
router.use(authenticateToken);

// GET /api/trips - Listar viajes
router.get('/', async (req, res) => {
  try {
    const { status, driver_id, vehicle_id, cargo_type, search } = req.query;
    const where = {};
    
    if (status) where.status = status;
    if (driver_id) where.driver_id = driver_id;
    if (vehicle_id) where.vehicle_id = vehicle_id;
    if (cargo_type) where.cargo_type = cargo_type;

    if (search) {
      where[Op.or] = [
        { trip_number: { [Op.iLike]: `%${search}%` } },
        { client_name: { [Op.iLike]: `%${search}%` } },
        { notes: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Si es conductor, solo mostrar sus viajes
    if (req.user.role === 'driver') {
      where.driver_id = req.user.id;
    }

    const trips = await Trip.findAll({
      where,
      include: [
        { model: User, as: 'driver', attributes: ['id', 'first_name', 'last_name'] },
        { model: User, as: 'supervisor', attributes: ['id', 'first_name', 'last_name'] },
        { model: Vehicle, as: 'vehicle', attributes: ['id', 'license_plate', 'brand', 'model'] }
      ],
      order: [['scheduled_start', 'DESC']]
    });

    res.json({ trips });
  } catch (error) {
    console.error('Error obteniendo viajes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/trips - Crear viaje
router.post('/', requireSupervisor, async (req, res) => {
  try {
    const trip = await Trip.create(req.body);

    // Registrar auditoría
    await logAudit({
      userId: req.user.id,
      action: 'CREATE',
      entity: 'Trip',
      entityId: trip.id,
      details: { trip_number: trip.trip_number, status: trip.status },
      req
    });

    res.status(201).json({
      message: 'Viaje creado exitosamente',
      trip
    });
  } catch (error) {
    console.error('Error creando viaje:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;