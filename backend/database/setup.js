const { Client } = require('pg');
require('dotenv').config();

const createDatabase = async () => {
  // Conectar a PostgreSQL como administrador
  const adminClient = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'scota2024',
    database: 'postgres' // Base de datos por defecto para operaciones administrativas
  });

  try {
    await adminClient.connect();
    console.log('✅ Conectado a PostgreSQL como administrador');

    const dbName = process.env.DB_NAME || 'scota_development';
    
    // Verificar si la base de datos existe
    const checkDbQuery = `
      SELECT 1 FROM pg_database WHERE datname = $1
    `;
    
    const dbExists = await adminClient.query(checkDbQuery, [dbName]);
    
    if (dbExists.rows.length === 0) {
      // Crear la base de datos
      console.log(`🏗  Creando base de datos: ${dbName}`);
      await adminClient.query(`CREATE DATABASE "${dbName}"`);
      console.log(`✅ Base de datos ${dbName} creada exitosamente`);
    } else {
      console.log(`ℹ️  La base de datos ${dbName} ya existe`);
    }

    // Crear extensiones necesarias en la nueva base de datos
    await adminClient.end();
    
    const appClient = new Client({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'scota2024',
      database: dbName
    });

    await appClient.connect();
    console.log(`✅ Conectado a base de datos: ${dbName}`);

    // Crear extensiones
    const extensions = ['uuid-ossp', 'postgis'];
    
    for (const extension of extensions) {
      try {
        await appClient.query(`CREATE EXTENSION IF NOT EXISTS "${extension}"`);
        console.log(`✅ Extensión ${extension} habilitada`);
      } catch (error) {
        if (extension === 'postgis') {
          console.log(`⚠️  PostGIS no disponible, usando geometría básica`);
        } else {
          console.log(`⚠️  Error habilitando extensión ${extension}: ${error.message}`);
        }
      }
    }

    console.log('🎉 Configuración de base de datos completada');
    await appClient.end();

  } catch (error) {
    console.error('❌ Error configurando la base de datos:', error.message);
    throw error;
  } finally {
    if (adminClient._connected) {
      await adminClient.end();
    }
  }
};

// Función para verificar la conexión
const testConnection = async () => {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'scota2024',
    database: process.env.DB_NAME || 'scota_development'
  });

  try {
    await client.connect();
    console.log('🔗 Probando conexión a la base de datos...');
    
    const result = await client.query('SELECT NOW() as current_time, VERSION() as version');
    console.log('✅ Conexión exitosa!');
    console.log(`⏰ Hora del servidor: ${result.rows[0].current_time}`);
    console.log(`📊 Versión PostgreSQL: ${result.rows[0].version.split(',')[0]}`);
    
    await client.end();
    return true;
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    return false;
  }
};

// Función principal
const setupDatabase = async () => {
  try {
    console.log('🚀 Iniciando configuración de S.C.O.T.A. Database...\n');
    
    await createDatabase();
    console.log('');
    
    const connected = await testConnection();
    
    if (connected) {
      console.log('\n✅ ¡Base de datos configurada correctamente!');
      console.log('💡 Próximos pasos:');
      console.log('   1. npm run migrate - Para crear las tablas');
      console.log('   2. npm run seed - Para poblar con datos de ejemplo');
      console.log('   3. npm run dev - Para iniciar el servidor');
    }
    
  } catch (error) {
    console.error('\n❌ Error en la configuración:', error.message);
    
    console.log('\n🛠  Instrucciones de configuración manual:');
    console.log('1. Asegúrate de que PostgreSQL esté corriendo');
    console.log('2. Verifica las credenciales en el archivo .env');
    console.log('3. El usuario debe tener permisos para crear bases de datos');
    console.log('\n📋 Variables de entorno requeridas:');
    console.log('   DB_HOST=localhost');
    console.log('   DB_PORT=5432');
    console.log('   DB_NAME=scota_development');
    console.log('   DB_USER=postgres');
    console.log('   DB_PASSWORD=tu_password');
    
    process.exit(1);
  }
};

// Ejecutar si es llamado directamente
if (require.main === module) {
  setupDatabase();
}

module.exports = {
  createDatabase,
  testConnection,
  setupDatabase
};