const express = require('express');
const { Shift, User } = require('../models');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken);

// GET /api/shifts - Listar turnos
router.get('/', async (req, res) => {
  try {
    const { user_id, shift_date, status } = req.query;
    const where = {};
    
    if (user_id) where.user_id = user_id;
    if (shift_date) where.shift_date = shift_date;
    if (status) where.status = status;

    // Si es conductor, solo mostrar sus turnos
    if (req.user.role === 'driver') {
      where.user_id = req.user.id;
    }

    const shifts = await Shift.findAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'first_name', 'last_name'] }
      ],
      order: [['shift_date', 'DESC'], ['scheduled_start', 'ASC']]
    });

    res.json({ shifts });
  } catch (error) {
    console.error('Error obteniendo turnos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;