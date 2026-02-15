const express = require('express');
const { Checklist, ChecklistItem } = require('../models');
const { authenticateToken, requireSupervisor } = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken);

// GET /api/checklists - Listar checklists
router.get('/', async (req, res) => {
  try {
    const { type, cargo_type, vehicle_type, active = 'true' } = req.query;
    const where = {};
    
    if (type) where.type = type;
    if (cargo_type) where.cargo_type = cargo_type;
    if (vehicle_type) where.vehicle_type = vehicle_type;
    if (active !== 'all') where.is_active = active === 'true';

    const checklists = await Checklist.findAll({
      where,
      include: [{
        model: ChecklistItem,
        as: 'items',
        order: [['order_index', 'ASC']]
      }],
      order: [['name', 'ASC']]
    });

    res.json({ checklists });
  } catch (error) {
    console.error('Error obteniendo checklists:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/checklists/:id - Obtener checklist específico
router.get('/:id', async (req, res) => {
  try {
    const checklist = await Checklist.findByPk(req.params.id, {
      include: [{
        model: ChecklistItem,
        as: 'items',
        order: [['order_index', 'ASC']]
      }]
    });

    if (!checklist) {
      return res.status(404).json({ error: 'Checklist no encontrado' });
    }

    res.json({ checklist });
  } catch (error) {
    console.error('Error obteniendo checklist:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/checklists - Crear checklist
router.post('/', requireSupervisor, async (req, res) => {
  try {
    const checklist = await Checklist.create({
      ...req.body,
      created_by: req.user.id
    });

    res.status(201).json({
      message: 'Checklist creado exitosamente',
      checklist
    });
  } catch (error) {
    console.error('Error creando checklist:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;