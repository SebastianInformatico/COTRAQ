module.exports = (sequelize, DataTypes) => {
  const Vehicle = sequelize.define('Vehicle', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    license_plate: {
      type: DataTypes.STRING(10),
      allowNull: false,
      unique: true,
      comment: 'Patente del vehículo'
    },
    brand: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'Marca del vehículo'
    },
    model: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'Modelo del vehículo'
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1990,
        max: new Date().getFullYear() + 1
      }
    },
    type: {
      type: DataTypes.ENUM('truck', 'pickup', 'van', 'refrigerated', 'tank'),
      allowNull: false,
      defaultValue: 'truck',
      comment: 'Tipo de vehículo'
    },
    capacity_kg: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Capacidad de carga en kilogramos'
    },
    capacity_m3: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Capacidad volumétrica en metros cúbicos'
    },
    fuel_type: {
      type: DataTypes.ENUM('gasoline', 'diesel', 'gas', 'electric', 'hybrid'),
      allowNull: false,
      defaultValue: 'diesel'
    },
    vin: {
      type: DataTypes.STRING(17),
      allowNull: true,
      unique: true,
      comment: 'Número de identificación del vehículo'
    },
    engine_number: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Número de motor'
    },
    odometer: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: 'Kilometraje actual'
    },
    status: {
      type: DataTypes.ENUM('active', 'maintenance', 'inactive', 'retired'),
      allowNull: false,
      defaultValue: 'active'
    },
    insurance_company: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Compañía de seguros'
    },
    insurance_policy: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Número de póliza'
    },
    insurance_expiry: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Fecha de vencimiento del seguro'
    },
    inspection_expiry: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Fecha de vencimiento revisión técnica'
    },
    permit_expiry: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Fecha de vencimiento permiso de circulación'
    },
    has_gps: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Tiene sistema GPS instalado'
    },
    has_temperature_control: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Tiene control de temperatura'
    },
    temperature_range_min: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      comment: 'Temperatura mínima en °C'
    },
    temperature_range_max: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      comment: 'Temperatura máxima en °C'
    },
    acquisition_date: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Fecha de adquisición'
    },
    acquisition_cost: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      comment: 'Costo de adquisición'
    },
    color: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Observaciones generales'
    },
    photo_url: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'URL de foto del vehículo'
    }
  }, {
    tableName: 'vehicles',
    indexes: [
      {
        unique: true,
        fields: ['license_plate']
      },
      {
        unique: true,
        fields: ['vin'],
        where: {
          vin: {
            [sequelize.Sequelize.Op.ne]: null
          }
        }
      },
      {
        fields: ['status']
      },
      {
        fields: ['type']
      },
      {
        fields: ['brand', 'model']
      }
    ],
    paranoid: true, // Habilitar soft deletes
    
    hooks: {
      beforeCreate: async (vehicle) => {
        if (vehicle.license_plate) {
          vehicle.license_plate = vehicle.license_plate.toUpperCase();
        }
      }
    }
  });

  // Métodos de instancia
  Vehicle.prototype.isAvailable = function() {
    return this.status === 'active';
  };

  Vehicle.prototype.isInsuranceExpired = function() {
    if (!this.insurance_expiry) return null;
    return new Date() > new Date(this.insurance_expiry);
  };

  Vehicle.prototype.isInspectionExpired = function() {
    if (!this.inspection_expiry) return null;
    return new Date() > new Date(this.inspection_expiry);
  };

  Vehicle.prototype.isPermitExpired = function() {
    if (!this.permit_expiry) return null;
    return new Date() > new Date(this.permit_expiry);
  };

  Vehicle.prototype.updateOdometer = function(newKm) {
    if (newKm > this.odometer) {
      this.odometer = newKm;
      return this.save();
    }
    return Promise.reject('El nuevo kilometraje debe ser mayor al actual');
  };

  Vehicle.prototype.getDisplayName = function() {
    return `${this.brand} ${this.model} (${this.license_plate})`;
  };

  // Métodos estáticos
  Vehicle.getAvailable = async function() {
    return await this.findAll({
      where: {
        status: 'active'
      },
      order: [
        ['brand', 'ASC'],
        ['model', 'ASC']
      ]
    });
  };

  Vehicle.getExpiredDocuments = async function() {
    const today = new Date();
    const twoWeeks = new Date();
    twoWeeks.setDate(today.getDate() + 14);

    return await this.findAll({
      where: {
        status: 'active',
        [sequelize.Sequelize.Op.or]: [
          {
            insurance_expiry: {
              [sequelize.Sequelize.Op.between]: [today, twoWeeks]
            }
          },
          {
            inspection_expiry: {
              [sequelize.Sequelize.Op.between]: [today, twoWeeks]
            }
          },
          {
            permit_expiry: {
              [sequelize.Sequelize.Op.between]: [today, twoWeeks]
            }
          }
        ]
      }
    });
  };

  Vehicle.getByType = async function(type) {
    return await this.findAll({
      where: {
        type: type,
        status: 'active'
      }
    });
  };

  Vehicle.getMaintenanceNeeded = async function() {
    return await this.findAll({
      where: {
        status: 'maintenance'
      }
    });
  };

  return Vehicle;
};