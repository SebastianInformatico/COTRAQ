const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 50],
        notEmpty: true
      }
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        notEmpty: true
      }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: [6, 255],
        notEmpty: true
      }
    },
    first_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 50]
      }
    },
    last_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 50]
      }
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        is: /^[+]?[\d\s\-\(\)]+$/
      }
    },
    role: {
      type: DataTypes.ENUM('admin', 'supervisor', 'driver', 'mechanic'),
      allowNull: false,
      defaultValue: 'driver'
    },
    license_number: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: 'Número de licencia de conducir'
    },
    license_expiry: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Fecha de vencimiento de licencia'
    },
    employee_id: {
      type: DataTypes.STRING(20),
      allowNull: true,
      unique: true,
      comment: 'ID de empleado interno'
    },
    profile_picture: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'URL de foto de perfil'
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true
    },
    emergency_contact_name: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    emergency_contact_phone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Notas adicionales sobre el usuario'
    }
  }, {
    tableName: 'users',
    indexes: [
      {
        unique: true,
        fields: ['username']
      },
      {
        unique: true,
        fields: ['email']
      },
      {
        unique: true,
        fields: ['employee_id'],
        where: {
          employee_id: {
            [sequelize.Sequelize.Op.ne]: null
          }
        }
      },
      {
        fields: ['role']
      },
      {
        fields: ['is_active']
      }
    ],
    paranoid: true, // Habilitar soft deletes
    
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      }
    }
  });

  // Métodos de instancia
  User.prototype.validatePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
  };

  User.prototype.getFullName = function() {
    return `${this.first_name} ${this.last_name}`;
  };

  User.prototype.isLicenseExpired = function() {
    if (!this.license_expiry) return null;
    return new Date() > new Date(this.license_expiry);
  };

  User.prototype.toJSON = function() {
    const user = this.dataValues;
    delete user.password;
    return user;
  };

  // Métodos estáticos
  User.findByCredentials = async function(login, password) {
    const user = await this.findOne({
      where: {
        [sequelize.Sequelize.Op.or]: [
          { username: login },
          { email: login }
        ],
        is_active: true
      }
    });

    if (!user || !(await user.validatePassword(password))) {
      return null;
    }

    return user;
  };

  User.getActiveDrivers = async function() {
    return await this.findAll({
      where: {
        role: 'driver',
        is_active: true
      },
      order: [
        ['first_name', 'ASC'],
        ['last_name', 'ASC']
      ]
    });
  };

  User.getExpiredLicenses = async function() {
    return await this.findAll({
      where: {
        role: 'driver',
        is_active: true,
        license_expiry: {
          [sequelize.Sequelize.Op.lte]: new Date()
        }
      }
    });
  };

  return User;
};