const express = require('express');
const { AuditLog, User, Sequelize } = require('../models');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { Op } = Sequelize;

const router = express.Router();
router.use(authenticateToken);
router.use(requireAdmin); // Solo accesible por administradores

// GET /api/audit - Listar logs de auditoría
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, search, action, entity, user_id, start_date, end_date } = req.query;
    
    const where = {};
    
    if (action) where.action = action;
    if (entity) where.entity = entity;
    if (user_id) where.user_id = user_id;
    
    // Filtrar por fecha
    if (start_date || end_date) {
      where.createdAt = {};
      if (start_date) where.createdAt[Op.gte] = new Date(start_date);
      if (end_date) where.createdAt[Op.lte] = new Date(end_date);
    }
    
    // Búsqueda general en detalles o entidades
    if (search) {
      where[Op.or] = [
        { entity_id: { [Op.iLike]: `%${search}%` } },
        Sequelize.literal(`CAST("details" AS TEXT) ILIKE '%${search}%'`)
      ];
    }
    
    const offset = (page - 1) * limit;

    const { count, rows } = await AuditLog.findAndCountAll({
      where,
      include: [
        { 
          model: User, 
          as: 'user',
          attributes: ['id', 'first_name', 'last_name', 'role']
        }
      ],
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      logs: rows,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(count / limit),
        total_logs: count,
        per_page: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Error obteniendo logs de auditoría:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/audit/stats - Estadísticas rápidas de actividad
router.get('/stats', async (req, res) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.setHours(0,0,0,0));
    
    // Contar acciones de hoy
    const todayActions = await AuditLog.count({
      where: {
        createdAt: { [Op.gte]: startOfDay }
      }
    });

    // Top usuarios activos (últimos 7 días)
    const activeUsers = await AuditLog.findAll({
      attributes: [
        'user_id',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'action_count']
      ],
      where: {
        createdAt: { 
          [Op.gte]: new Date(new Date() - 7 * 24 * 60 * 60 * 1000) 
        }
      },
      group: ['user_id', 'user.id', 'user.first_name', 'user.last_name'],
      include: [{ model: User, as: 'user', attributes: ['first_name', 'last_name'] }],
      order: [[Sequelize.literal('action_count'), 'DESC']],
      limit: 5
    });

    res.json({
      today_actions: todayActions,
      top_users: activeUsers
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
