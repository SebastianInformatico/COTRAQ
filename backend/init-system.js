const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const db = require('./src/models');

async function initSystem() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await db.sequelize.authenticate();
    console.log('✅ Conexión establecida.');

    console.log('🗑️  Limpiando base de datos anterior...');
    // force: true elimina las tablas y las vuelve a crear
    await db.sequelize.sync({ force: true });
    console.log('✅ Base de datos recreada (Tablas vacías).');

    console.log('👤 Creando usuario Administrador...');
    
    // NOTA: No hasheamos la contraseña aquí porque el modelo User tiene un hook
    // 'beforeCreate' que se encarga de hacerlo automáticamente.
    // Si la hasheamos aquí, se guardará hasheada dos veces.
    
    await db.User.create({
      id: uuidv4(),
      username: 'admin',
      email: 'admin@cotraq.com',
      password: 'admin123',
      first_name: 'Administrador',
      last_name: 'Sistema',
      role: 'admin',
      employee_id: 'ADM001',
      phone: '+56900000000',
      is_active: true
    });
    
    console.log('✅ Usuario Admin creado: admin@cotraq.com / admin123');
    console.log('🚀 Sistema listo para usar con datos reales.');

  } catch (error) {
    console.error('❌ Error inicializando el sistema:', error);
  } finally {
    await db.sequelize.close();
  }
}

initSystem();
