const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { Sequelize, DataTypes } = require('sequelize');
const config = require('./database/config.js')['development'];

const sequelize = new Sequelize({
  dialect: config.dialect,
  storage: config.storage,
  logging: console.log
});

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  first_name: DataTypes.STRING,
  last_name: DataTypes.STRING,
  role: {
    type: DataTypes.ENUM('admin', 'supervisor', 'driver', 'mechanic'),
    defaultValue: 'driver'
  },
  employee_id: DataTypes.STRING,
  phone: DataTypes.STRING,
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'users',
  timestamps: true,
  underscored: true
});

async function seedAdmin() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    
    // Sync to create table if not exists (simplified for manual fix)
    await User.sync();

    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const [user, created] = await User.findOrCreate({
      where: { username: 'admin' },
      defaults: {
        id: uuidv4(),
        email: 'admin@cotraq.com',
        password: hashedPassword,
        first_name: 'Administrador',
        last_name: 'Sistema',
        role: 'admin',
        employee_id: 'ADM001',
        phone: '+56912345678',
        is_active: true
      }
    });

    if (created) {
      console.log('Admin user created: admin / admin123');
    } else {
      console.log('Admin user updated');
      user.password = hashedPassword;
      await user.save();
    }

  } catch (error) {
    console.error('Unable to connect to the database:', error);
  } finally {
    await sequelize.close();
  }
}

seedAdmin();
