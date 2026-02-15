const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { logAudit } = require('../utils/audit');

const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      username: user.username, 
      role: user.role,
      email: user.email 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
  );
};

const authController = {
  // Registro de usuario
  async register(req, res) {
    try {
      const { username, email, password, first_name, last_name, role = 'driver' } = req.body;

      // Verificar si el usuario ya existe
      const existingUser = await User.findOne({
        where: {
          $or: [{ username }, { email }]
        }
      });

      if (existingUser) {
        return res.status(400).json({
          error: 'Usuario ya existe',
          details: 'Username o email ya están en uso'
        });
      }

      // Crear nuevo usuario
      const user = await User.create({
        username,
        email,
        password,
        first_name,
        last_name,
        role
      });

      // Generar tokens
      const token = generateToken(user);
      const refreshToken = generateRefreshToken(user);

      // Registrar acción en auditoría
      await logAudit({
        userId: user.id,
        action: 'REGISTER',
        entity: 'User',
        entityId: user.id,
        details: { role: user.role, email: user.email },
        req: null // req no disponible aquí o no necesario para registro inicial
      });

      res.status(201).json({
        message: 'Usuario creado exitosamente',
        user: user.toJSON(),
        token,
        refreshToken
      });

    } catch (error) {
      console.error('Error en registro:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        details: error.message
      });
    }
  },

  // Login de usuario
  async login(req, res) {
    try {
      console.log('Login attempt payload:', req.body);
      const { login, password } = req.body;

      if (!login || !password) {
        return res.status(400).json({
          error: 'Campos requeridos',
          details: 'Username/email y contraseña son obligatorios'
        });
      }

      // Buscar usuario por credenciales
      const user = await User.findByCredentials(login, password);

      if (!user) {
        // Debugging login failure
        console.log(`Failed login attempt for: ${login}`);
        
        return res.status(401).json({
          error: 'Credenciales inválidas',
          details: 'Username/email o contraseña incorrectos'
        });
      }

      // Actualizar último login
      user.last_login = new Date();
      await user.save();

      // Registrar auditoría de login
      await logAudit({
        userId: user.id,
        action: 'LOGIN',
        entity: 'User',
        entityId: user.id,
        details: { role: user.role, login_method: login.includes('@') ? 'email' : 'username' },
        req
      });

      // Generar tokens
      const token = generateToken(user);
      const refreshToken = generateRefreshToken(user);

      res.json({
        message: 'Login exitoso',
        user: user.toJSON(),
        token,
        refreshToken
      });

    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        details: error.message
      });
    }
  },

  // Refresh token
  async refresh(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          error: 'Token requerido',
          details: 'Refresh token es obligatorio'
        });
      }

      // Verificar refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      
      if (decoded.type !== 'refresh') {
        return res.status(401).json({
          error: 'Token inválido',
          details: 'Tipo de token incorrecto'
        });
      }

      // Buscar usuario
      const user = await User.findByPk(decoded.id);
      
      if (!user || !user.is_active) {
        return res.status(401).json({
          error: 'Usuario no encontrado',
          details: 'Usuario inválido o inactivo'
        });
      }

      // Generar nuevo token
      const newToken = generateToken(user);
      const newRefreshToken = generateRefreshToken(user);

      res.json({
        message: 'Token renovado',
        token: newToken,
        refreshToken: newRefreshToken
      });

    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          error: 'Token inválido',
          details: 'Refresh token no es válido'
        });
      }

      console.error('Error renovando token:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        details: error.message
      });
    }
  },

  // Obtener perfil del usuario actual
  async getProfile(req, res) {
    try {
      const user = await User.findByPk(req.user.id, {
        attributes: { exclude: ['password'] }
      });

      if (!user) {
        return res.status(404).json({
          error: 'Usuario no encontrado'
        });
      }

      res.json({
        user: user.toJSON()
      });

    } catch (error) {
      console.error('Error obteniendo perfil:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        details: error.message
      });
    }
  },

  // Actualizar perfil
  async updateProfile(req, res) {
    try {
      const { first_name, last_name, phone, email, emergency_contact_name, emergency_contact_phone, address } = req.body;
      
      const user = await User.findByPk(req.user.id);
      
      if (!user) {
        return res.status(404).json({
          error: 'Usuario no encontrado'
        });
      }

      // Verificar email único si se está cambiando
      if (email && email !== user.email) {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
          return res.status(400).json({
            error: 'Email ya en uso',
            details: 'Este email ya está registrado'
          });
        }
      }

      // Actualizar campos
      await user.update({
        first_name: first_name || user.first_name,
        last_name: last_name || user.last_name,
        phone: phone || user.phone,
        email: email || user.email,
        emergency_contact_name: emergency_contact_name || user.emergency_contact_name,
        emergency_contact_phone: emergency_contact_phone || user.emergency_contact_phone,
        address: address || user.address
      });

      res.json({
        message: 'Perfil actualizado exitosamente',
        user: user.toJSON()
      });

    } catch (error) {
      console.error('Error actualizando perfil:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        details: error.message
      });
    }
  },

  // Cambiar contraseña
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          error: 'Campos requeridos',
          details: 'Contraseña actual y nueva son obligatorias'
        });
      }

      const user = await User.findByPk(req.user.id);
      
      // Verificar contraseña actual
      const isValidPassword = await user.validatePassword(currentPassword);
      
      if (!isValidPassword) {
        return res.status(400).json({
          error: 'Contraseña incorrecta',
          details: 'La contraseña actual no es correcta'
        });
      }

      // Actualizar contraseña
      user.password = newPassword;
      await user.save();

      res.json({
        message: 'Contraseña actualizada exitosamente'
      });

    } catch (error) {
      console.error('Error cambiando contraseña:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        details: error.message
      });
    }
  },

  // Logout (para invalidar tokens si se implementa blacklist)
  async logout(req, res) {
    try {
      // Aquí podrías agregar el token a una blacklist
      // Por ahora, simplemente confirmamos el logout
      
      res.json({
        message: 'Logout exitoso'
      });

    } catch (error) {
      console.error('Error en logout:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        details: error.message
      });
    }
  }
};

module.exports = authController;