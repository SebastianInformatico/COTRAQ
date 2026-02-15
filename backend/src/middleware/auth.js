const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Middleware para verificar token JWT
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: 'Token requerido',
        details: 'Token de autenticación es obligatorio'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Buscar usuario en la base de datos
    const user = await User.findByPk(decoded.id);
    
    if (!user || !user.is_active) {
      return res.status(401).json({
        error: 'Usuario no válido',
        details: 'Usuario no encontrado o inactivo'
      });
    }

    req.user = user;
    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({
        error: 'Token inválido',
        details: 'El token proporcionado no es válido'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({
        error: 'Token expirado',
        details: 'El token ha expirado, por favor inicia sesión nuevamente'
      });
    }

    console.error('Error en autenticación:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      details: error.message
    });
  }
};

// Middleware para verificar roles
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'No autenticado',
        details: 'Debe estar autenticado para acceder a este recurso'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Permisos insuficientes',
        details: `Se requiere uno de los siguientes roles: ${roles.join(', ')}`
      });
    }

    next();
  };
};

// Middleware para verificar si es admin
const requireAdmin = requireRole('admin');

// Middleware para verificar si es admin o supervisor
const requireSupervisor = requireRole('admin', 'supervisor');

// Middleware para verificar si es el mismo usuario o tiene permisos
const requireSameUserOrAdmin = (req, res, next) => {
  const targetUserId = req.params.userId || req.params.id;
  
  if (!req.user) {
    return res.status(401).json({
      error: 'No autenticado',
      details: 'Debe estar autenticado para acceder a este recurso'
    });
  }

  // Admin puede acceder a cualquier usuario
  if (req.user.role === 'admin') {
    return next();
  }

  // Supervisor puede acceder a conductores
  if (req.user.role === 'supervisor') {
    // Aquí podrías agregar lógica adicional para verificar
    // que el supervisor puede ver este usuario específico
    return next();
  }

  // Usuario solo puede acceder a su propia información
  if (req.user.id === targetUserId) {
    return next();
  }

  return res.status(403).json({
    error: 'Permisos insuficientes',
    details: 'No tienes permisos para acceder a esta información'
  });
};

// Middleware para logging de requests autenticados
const logAuthenticatedRequest = (req, res, next) => {
  if (req.user) {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Usuario: ${req.user.username} (${req.user.role})`);
  }
  next();
};

// Middleware para validar formato de datos
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        error: 'Datos inválidos',
        details: error.details.map(detail => detail.message).join(', ')
      });
    }
    
    next();
  };
};

module.exports = {
  authenticateToken,
  requireRole,
  requireAdmin,
  requireSupervisor,
  requireSameUserOrAdmin,
  logAuthenticatedRequest,
  validateRequest
};