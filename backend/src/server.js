const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const db = require('./models');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const vehicleRoutes = require('./routes/vehicles');
const checklistRoutes = require('./routes/checklists');
const tripRoutes = require('./routes/trips');
const maintenanceRoutes = require('./routes/maintenance');
const documentRoutes = require('./routes/documents');
const shiftRoutes = require('./routes/shifts');
const photoRoutes = require('./routes/photos');
const auditRoutes = require('./routes/audit');
const fuelRoutes = require('./routes/fuel');
const traceabilityRoutes = require('./routes/traceability');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware de seguridad
app.use(helmet());
app.use(cors({
  origin: function(origin, callback) {
    // Permitir requests sin origen (como Postman o Server-to-Server)
    if (!origin) return callback(null, true);
    
    // Permitir cualquier localhost en desarrollo para evitar problemas de CORS
    if (origin.startsWith('http://localhost:') || origin.startsWith('exp://') || origin.startsWith('http://192.168.')) {
      return callback(null, true);
    }
    
    // Permitir el frontend configurado explícitamente
    if (origin === process.env.FRONTEND_URL) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // límite de 100 requests por IP
});
app.use('/api/', limiter);

// Middleware de logging
app.use(morgan('combined'));

// Parseo de JSON y URL-encoded
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Servir archivos estáticos (fotos/documentos)
app.use('/uploads', express.static('uploads'));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/checklists', checklistRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/shifts', shiftRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/fuel', fuelRoutes);
app.use('/api/traceability', traceabilityRoutes);

// Ruta por defecto
app.get('/', (req, res) => {
  res.json({
    message: 'S.C.O.T.A. - Sistema de Control Operativo para Transporte Acuícola',
    version: '1.0.0',
    status: 'Activo',
    endpoints: {
      health: '/health',
      api: '/api/*',
      docs: '/api-docs'
    }
  });
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Error de validación',
      details: err.message
    });
  }
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'No autorizado',
      details: 'Token inválido o expirado'
    });
  }
  
  res.status(500).json({
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'production' ? 'Algo salió mal' : err.message
  });
});

// Middleware para rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.originalUrl,
    method: req.method
  });
});

// Inicializar base de datos y servidor
async function startServer() {
  try {
    // Sincronizar modelos con la base de datos
    await db.sequelize.authenticate();
    console.log('✅ Conexión a PostgreSQL establecida correctamente.');
    
    // En desarrollo, sincronizar esquema
    if (process.env.NODE_ENV === 'development') {
      await db.sequelize.sync({ alter: true });
      console.log('✅ Modelos sincronizados con la base de datos.');
    }
    
    app.listen(PORT, () => {
      console.log(`🚀 Servidor S.C.O.T.A. corriendo en puerto ${PORT}`);
      console.log(`📊 Panel de administración: http://localhost:${PORT}`);
      console.log(`🔧 Health check: http://localhost:${PORT}/health`);
      console.log(`🌐 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    });
    
  } catch (error) {
    console.error('❌ Error al inicializar el servidor:', error);
    process.exit(1);
  }
}

// Manejo de cierre graceful
process.on('SIGINT', async () => {
  console.log('\n🔄 Cerrando servidor gracefulmente...');
  await db.sequelize.close();
  console.log('✅ Conexiones cerradas.');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🔄 SIGTERM recibido, cerrando servidor...');
  await db.sequelize.close();
  process.exit(0);
});

startServer();