const express = require('express');
const authController = require('../controllers/authController');
const { authenticateToken, validateRequest } = require('../middleware/auth');
const Joi = require('joi');

const router = express.Router();

// Esquemas de validación
const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  first_name: Joi.string().min(1).max(50).required(),
  last_name: Joi.string().min(1).max(50).required(),
  role: Joi.string().valid('admin', 'supervisor', 'driver', 'mechanic').optional()
});

const loginSchema = Joi.object({
  login: Joi.string().required(),
  password: Joi.string().required()
});

const refreshSchema = Joi.object({
  refreshToken: Joi.string().required()
});

const updateProfileSchema = Joi.object({
  first_name: Joi.string().min(1).max(50).optional(),
  last_name: Joi.string().min(1).max(50).optional(),
  phone: Joi.string().pattern(/^[+]?[\d\s\-\(\)]+$/).optional().allow(''),
  email: Joi.string().email().optional(),
  emergency_contact_name: Joi.string().max(100).optional().allow(''),
  emergency_contact_phone: Joi.string().pattern(/^[+]?[\d\s\-\(\)]+$/).optional().allow(''),
  address: Joi.string().optional().allow('')
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required()
});

// === RUTAS PÚBLICAS ===

// POST /api/auth/register - Registro de usuario
router.post('/register', validateRequest(registerSchema), authController.register);

// POST /api/auth/login - Login de usuario
router.post('/login', validateRequest(loginSchema), authController.login);

// POST /api/auth/refresh - Renovar token
router.post('/refresh', validateRequest(refreshSchema), authController.refresh);

// === RUTAS PROTEGIDAS ===

// GET /api/auth/profile - Obtener perfil del usuario actual
router.get('/profile', authenticateToken, authController.getProfile);

// PUT /api/auth/profile - Actualizar perfil del usuario actual
router.put('/profile', 
  authenticateToken, 
  validateRequest(updateProfileSchema), 
  authController.updateProfile
);

// POST /api/auth/change-password - Cambiar contraseña
router.post('/change-password', 
  authenticateToken, 
  validateRequest(changePasswordSchema), 
  authController.changePassword
);

// POST /api/auth/logout - Logout de usuario
router.post('/logout', authenticateToken, authController.logout);

// === RUTAS DE UTILIDAD ===

// GET /api/auth/verify - Verificar si el token es válido
router.get('/verify', authenticateToken, (req, res) => {
  res.json({
    valid: true,
    user: {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role,
      full_name: req.user.getFullName()
    }
  });
});

// GET /api/auth/roles - Obtener roles disponibles (para forms)
router.get('/roles', (req, res) => {
  res.json({
    roles: [
      { value: 'admin', label: 'Administrador', description: 'Acceso completo al sistema' },
      { value: 'supervisor', label: 'Supervisor', description: 'Supervisa operaciones y reportes' },
      { value: 'driver', label: 'Conductor', description: 'Realiza transportes y checklists' },
      { value: 'mechanic', label: 'Mecánico', description: 'Mantenimiento de vehículos' }
    ]
  });
});

// Manejo de errores específicos para rutas de auth
router.use((error, req, res, next) => {
  console.error('Error en ruta de autenticación:', error);
  
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Error de validación',
      details: error.message
    });
  }
  
  if (error.code === '23505') { // Postgres unique violation
    return res.status(400).json({
      error: 'Datos duplicados',
      details: 'Username o email ya están en uso'
    });
  }
  
  res.status(500).json({
    error: 'Error interno del servidor',
    details: process.env.NODE_ENV === 'production' ? 'Error inesperado' : error.message
  });
});

module.exports = router;