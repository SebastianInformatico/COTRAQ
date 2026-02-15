const express = require('express');
const { User, Trip, FuelLoad, Sequelize } = require('../models');
const { authenticateToken, requireAdmin, requireSupervisor, requireSameUserOrAdmin } = require('../middleware/auth');
const { logAudit } = require('../utils/audit');
const { Op } = Sequelize;

const router = express.Router();

// Aplicar autenticación a todas las rutas
router.use(authenticateToken);

// GET /api/users - Listar usuarios (admin/supervisor)
router.get('/', requireSupervisor, async (req, res) => {
  try {
    const { role, active = 'true', page = 1, limit = 10, search } = req.query;
    
    const where = {};
    
    if (role) where.role = role;
    if (active !== 'all') where.is_active = active === 'true';
    
    if (search) {
      where[Op.or] = [
        { first_name: { [Op.iLike]: `%${search}%` } },
        { last_name: { [Op.iLike]: `%${search}%` } },
        { username: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const offset = (page - 1) * limit;
    
    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      limit: parseInt(limit),
      offset,
      order: [['first_name', 'ASC'], ['last_name', 'ASC']]
    });

    res.json({
      users: rows,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(count / limit),
        total_users: count,
        per_page: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/users/drivers - Listar conductores activos
router.get('/drivers', async (req, res) => {
  try {
    const drivers = await User.getActiveDrivers();
    
    res.json({
      drivers: drivers.map(driver => ({
        id: driver.id,
        name: driver.getFullName(),
        username: driver.username,
        phone: driver.phone,
        license_number: driver.license_number,
        license_expiry: driver.license_expiry,
        is_license_expired: driver.isLicenseExpired()
      }))
    });

  } catch (error) {
    console.error('Error obteniendo conductores:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/users/:id - Obtener usuario específico
router.get('/:id', requireSameUserOrAdmin, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ user: user.toJSON() });

  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/users - Crear nuevo usuario (admin)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const {
      username, email, password, first_name, last_name, role,
      phone, license_number, license_expiry, employee_id
    } = req.body;

    const user = await User.create({
      username,
      email,
      password,
      first_name,
      last_name,
      role,
      phone,
      license_number,
      license_expiry,
      employee_id
    });

    // Auditoría
    await logAudit({
      userId: req.user.id,
      action: 'CREATE',
      entity: 'User',
      entityId: user.id,
      details: { username: user.username, role: user.role },
      req
    });

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      user: user.toJSON()
    });

  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        error: 'Datos duplicados',
        details: 'Username, email o ID de empleado ya están en uso'
      });
    }

    console.error('Error creando usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PUT /api/users/:id - Actualizar usuario
router.put('/:id', requireSameUserOrAdmin, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Solo admin puede cambiar roles
    if (req.body.role && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Sin permisos',
        details: 'Solo administradores pueden cambiar roles'
      });
    }

    // Solo admin o supervisor pueden activar/desactivar usuarios
    if (req.body.is_active !== undefined && !['admin', 'supervisor'].includes(req.user.role)) {
      return res.status(403).json({
        error: 'Sin permisos',
        details: 'Solo administradores y supervisores pueden activar/desactivar usuarios'
      });
    }

    const allowedFields = [
      'first_name', 'last_name', 'phone', 'email', 'license_number',
      'license_expiry', 'employee_id', 'emergency_contact_name',
      'emergency_contact_phone', 'address', 'notes'
    ];

    // Admin puede cambiar campos adicionales
    if (req.user.role === 'admin') {
      allowedFields.push('role', 'is_active', 'username');
    }

    const updateData = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    await user.update(updateData);

    // Auditoría
    await logAudit({
      userId: req.user.id,
      action: 'UPDATE',
      entity: 'User',
      entityId: user.id,
      details: updateData,
      req
    });

    res.json({
      message: 'Usuario actualizado exitosamente',
      user: user.toJSON()
    });

  } catch (error) {
    console.error('Error actualizando usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// DELETE /api/users/:id - Desactivar usuario (soft delete)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (user.id === req.user.id) {
      return res.status(400).json({
        error: 'Acción no permitida',
        details: 'No puedes desactivar tu propia cuenta'
      });
    }

    await user.update({ is_active: false });

    res.json({ message: 'Usuario desactivado exitosamente' });

  } catch (error) {
    console.error('Error desactivando usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// DELETE /api/users/:id - Eliminar usuario (Soft delete)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // No se puede eliminar a uno mismo
    if (user.id === req.user.id) {
      return res.status(400).json({ error: 'No puedes eliminarte a ti mismo' });
    }

    await user.destroy(); // Soft delete

    // Auditoría
    await logAudit({
      userId: req.user.id,
      action: 'DELETE',
      entity: 'User',
      entityId: user.id,
      details: { username: user.username, role: user.role, reason: 'Eliminado por admin' },
      req
    });

    res.json({ message: 'Usuario eliminado exitosamente' });

  } catch (error) {
    console.error('Error eliminando usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/users/:id/stats - Estadísticas del usuario
router.get('/:id/stats', requireSameUserOrAdmin, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Estadísticas según el rol
    const stats = {
      user_id: user.id,
      name: user.getFullName(),
      role: user.role,
      active_since: user.createdAt,
    };

    if (user.role === 'driver') {
      // 1. Viajes Completados
      const completedTrips = await Trip.count({
        where: {
          driver_id: user.id,
          status: 'completed'
        }
      });

      // 2. Kilómetros Recorridos (Suma de distance_km)
      const totalDistance = await Trip.sum('distance_km', {
        where: {
          driver_id: user.id,
          status: 'completed'
        }
      });

      // 3. Viajes del mes actual
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0,0,0,0);
      
      const monthlyTrips = await Trip.count({
        where: {
          driver_id: user.id,
          scheduled_start: { [Op.gte]: startOfMonth }
        }
      });

      // 4. Eficiencia de Combustible (simple)
      // Buscar cargas de combustible del último mes
      const fuelLoads = await FuelLoad.findAll({
        where: {
          driver_id: user.id,
          date: { [Op.gte]: startOfMonth }
        },
        attributes: [
          [Sequelize.fn('SUM', Sequelize.col('liters')), 'total_liters'],
          [Sequelize.fn('SUM', Sequelize.col('total_cost')), 'total_cost']
        ]
      });

      stats.driver_stats = {
        total_trips: completedTrips,
        total_km: totalDistance || 0,
        monthly_trips: monthlyTrips,
        monthly_fuel: {
          liters: fuelLoads[0]?.dataValues.total_liters || 0,
          cost: fuelLoads[0]?.dataValues.total_cost || 0
        }
      };
    }

    res.json(stats);
      last_login: user.last_login,
      // Agregar más estadísticas según sea necesario
    };

    res.json({ stats });

  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;