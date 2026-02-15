const express = require('express');
const { FuelLoad, Vehicle, User, Sequelize } = require('../models');
const { authenticateToken, requireSupervisor, requireRole } = require('../middleware/auth');
const { logAudit } = require('../utils/audit');
const { Op } = Sequelize;

const router = express.Router();
router.use(authenticateToken);

// GET /api/fuel - Listar cargas de combustible
router.get('/', async (req, res) => {
  try {
    const { vehicle_id, driver_id, start_date, end_date, payment_method } = req.query;
    const where = {};
    
    // Filtros básicos
    if (vehicle_id) where.vehicle_id = vehicle_id;
    if (payment_method) where.payment_method = payment_method;
    
    // Filtro por fecha
    if (start_date || end_date) {
      where.date = {};
      if (start_date) where.date[Op.gte] = new Date(start_date);
      if (end_date) where.date[Op.lte] = new Date(end_date);
    }

    // Si es conductor, solo ve sus cargas. Si es supervisor/admin ve todo o filtra
    if (req.user.role === 'driver') {
      where.driver_id = req.user.id;
    } else if (driver_id) {
      where.driver_id = driver_id;
    }

    const { count, rows } = await FuelLoad.findAndCountAll({
      where,
      include: [
        { model: User, as: 'driver', attributes: ['first_name', 'last_name'] },
        { model: Vehicle, as: 'vehicle', attributes: ['license_plate', 'brand', 'model'] }
      ],
      order: [['date', 'DESC']],
      limit: 100 // Límite por defecto para no saturar
    });

    res.json({ count, fuel_loads: rows });
  } catch (error) {
    console.error('Error obteniendo cargas de combustible:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/fuel/stats - Estadísticas de consumo (Admin/Supervisor)
router.get('/stats', requireSupervisor, async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const where = {};
    
    if (start_date && end_date) {
      where.date = { [Op.between]: [new Date(start_date), new Date(end_date)] };
    }

    // Consumo total por vehículo
    const consumptionByVehicle = await FuelLoad.findAll({
      where,
      attributes: [
        'vehicle_id',
        [Sequelize.fn('SUM', Sequelize.col('liters')), 'total_liters'],
        [Sequelize.fn('SUM', Sequelize.col('total_cost')), 'total_cost'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'load_count']
      ],
      group: ['vehicle_id', 'vehicle.id', 'vehicle.license_plate'],
      include: [{ model: Vehicle, as: 'vehicle', attributes: ['license_plate', 'brand', 'model'] }],
      order: [[Sequelize.literal('total_liters'), 'DESC']]
    });

    res.json({ consumptionByVehicle });
  } catch (error) {
    console.error('Error obteniendo estadísticas de combustible:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/fuel - Registrar carga de combustible
router.post('/', async (req, res) => {
  try {
    const { 
      vehicle_id, liters, price_per_liter, odometer, 
      payment_method, fuel_type, full_tank, station_name 
    } = req.body;

    // Validar que el vehículo exista
    const vehicle = await Vehicle.findByPk(vehicle_id);
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehículo no encontrado' });
    }

    const fuelLoad = await FuelLoad.create({
      ...req.body,
      driver_id: req.user.id, // El usuario actual registra la carga
      date: req.body.date || new Date()
    });

    // Auditoría
    await logAudit({
      userId: req.user.id,
      action: 'CREATE',
      entity: 'FuelLoad',
      entityId: fuelLoad.id,
      details: { 
        vehicle: vehicle.license_plate, 
        liters, 
        cost: fuelLoad.total_cost 
      },
      req
    });

    res.status(201).json({
      message: 'Carga de combustible registrada exitosamente',
      fuelLoad
    });
  } catch (error) {
    console.error('Error registrando combustible:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// DELETE /api/fuel/:id - Anular carga (soft delete)
router.delete('/:id', requireSupervisor, async (req, res) => {
  try {
    const fuelLoad = await FuelLoad.findByPk(req.params.id);
    
    if (!fuelLoad) {
      return res.status(404).json({ error: 'Registro no encontrado' });
    }

    await fuelLoad.destroy(); // Soft delete gracias a paranoid: true

    await logAudit({
      userId: req.user.id,
      action: 'DELETE',
      entity: 'FuelLoad',
      entityId: req.params.id,
      details: { reason: 'Anulado por supervisor' },
      req
    });

    res.json({ message: 'Registro de combustible eliminado' });
  } catch (error) {
    console.error('Error eliminando registro:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
