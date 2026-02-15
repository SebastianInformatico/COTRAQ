module.exports = (sequelize, DataTypes) => {
  const Trip = sequelize.define('Trip', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    trip_number: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      comment: 'Número único del viaje'
    },
    driver_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    vehicle_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'vehicles',
        key: 'id'
      }
    },
    supervisor_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    cargo_type: {
      type: DataTypes.ENUM('alimento', 'choritos', 'producto_terminado', 'mixto'),
      allowNull: false,
      comment: 'Tipo de carga transportada'
    },
    cargo_description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Descripción detallada de la carga'
    },
    cargo_weight_kg: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Peso de la carga en kg'
    },
    cargo_volume_m3: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Volumen de la carga en m³'
    },
    origin_address: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Dirección de origen'
    },
    origin_coordinates: {
      type: DataTypes.GEOMETRY('POINT'),
      allowNull: true,
      comment: 'Coordenadas GPS del origen'
    },
    destination_address: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Dirección de destino'
    },
    destination_coordinates: {
      type: DataTypes.GEOMETRY('POINT'),
      allowNull: true,
      comment: 'Coordenadas GPS del destino'
    },
    scheduled_start: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: 'Hora programada de inicio'
    },
    scheduled_end: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Hora programada de finalización'
    },
    actual_start: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Hora real de inicio'
    },
    actual_end: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Hora real de finalización'
    },
    status: {
      type: DataTypes.ENUM('scheduled', 'in_progress', 'completed', 'cancelled', 'delayed'),
      allowNull: false,
      defaultValue: 'scheduled'
    },
    distance_km: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: true,
      comment: 'Distancia recorrida en km'
    },
    fuel_consumption_liters: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: true,
      comment: 'Consumo de combustible en litros'
    },
    odometer_start: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Kilometraje inicial'
    },
    odometer_end: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Kilometraje final'
    },
    temperature_required: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Requiere control de temperatura'
    },
    temperature_min: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      comment: 'Temperatura mínima requerida en °C'
    },
    temperature_max: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      comment: 'Temperatura máxima requerida en °C'
    },
    client_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Nombre del cliente'
    },
    client_contact: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Contacto del cliente'
    },
    client_phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: 'Teléfono del cliente'
    },
    delivery_instructions: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Instrucciones especiales de entrega'
    },
    priority: {
      type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
      allowNull: false,
      defaultValue: 'normal'
    },
    toll_cost: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: true,
      comment: 'Costo de peajes'
    },
    other_expenses: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: true,
      comment: 'Otros gastos del viaje'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Observaciones del viaje'
    },
    incidents: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Incidentes reportados durante el viaje'
    },
    delivery_confirmation: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Confirmación de entrega'
    },
    signature_url: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'URL de la firma de recepción'
    }
  }, {
    tableName: 'trips',
    indexes: [
      {
        unique: true,
        fields: ['trip_number']
      },
      {
        fields: ['driver_id']
      },
      {
        fields: ['vehicle_id']
      },
      {
        fields: ['supervisor_id']
      },
      {
        fields: ['status']
      },
      {
        fields: ['cargo_type']
      },
      {
        fields: ['scheduled_start']
      },
      {
        fields: ['priority']
      }
    ],
    paranoid: true, // Habilitar soft deletes
    hooks: {
      beforeCreate: async (trip) => {
        if (!trip.trip_number) {
          const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
          const count = await sequelize.models.Trip.count({
            where: {
              created_at: {
                [sequelize.Sequelize.Op.gte]: new Date().setHours(0, 0, 0, 0)
              }
            }
          });
          trip.trip_number = `VI${timestamp}${String(count + 1).padStart(3, '0')}`;
        }
      }
    }
  });

  // Métodos de instancia
  Trip.prototype.isActive = function() {
    return ['scheduled', 'in_progress'].includes(this.status);
  };

  Trip.prototype.isCompleted = function() {
    return this.status === 'completed';
  };

  Trip.prototype.isDelayed = function() {
    if (!this.scheduled_start) return false;
    const now = new Date();
    const scheduled = new Date(this.scheduled_start);
    return this.status === 'scheduled' && now > scheduled;
  };

  Trip.prototype.getDuration = function() {
    if (!this.actual_start || !this.actual_end) return null;
    const start = new Date(this.actual_start);
    const end = new Date(this.actual_end);
    return Math.round((end - start) / (1000 * 60)); // minutos
  };

  Trip.prototype.calculateDistance = function() {
    if (!this.odometer_start || !this.odometer_end) return null;
    return this.odometer_end - this.odometer_start;
  };

  Trip.prototype.startTrip = async function() {
    this.actual_start = new Date();
    this.status = 'in_progress';
    return await this.save();
  };

  Trip.prototype.completeTrip = async function() {
    this.actual_end = new Date();
    this.status = 'completed';
    if (this.odometer_start && this.odometer_end) {
      this.distance_km = this.odometer_end - this.odometer_start;
    }
    return await this.save();
  };

  Trip.prototype.cancelTrip = async function(reason) {
    this.status = 'cancelled';
    this.notes = this.notes ? `${this.notes}\nCancelado: ${reason}` : `Cancelado: ${reason}`;
    return await this.save();
  };

  // Métodos estáticos
  Trip.getActiveTrips = async function() {
    return await this.findAll({
      where: {
        status: ['scheduled', 'in_progress']
      },
      include: [
        { model: sequelize.models.User, as: 'driver' },
        { model: sequelize.models.User, as: 'supervisor' },
        { model: sequelize.models.Vehicle, as: 'vehicle' }
      ],
      order: [['scheduled_start', 'ASC']]
    });
  };

  Trip.getTripsByDriver = async function(driverId, startDate, endDate) {
    const where = { driver_id: driverId };
    
    if (startDate && endDate) {
      where.scheduled_start = {
        [sequelize.Sequelize.Op.between]: [startDate, endDate]
      };
    }

    return await this.findAll({
      where,
      include: [
        { model: sequelize.models.Vehicle, as: 'vehicle' }
      ],
      order: [['scheduled_start', 'DESC']]
    });
  };

  Trip.getTripsByCargoType = async function(cargoType) {
    return await this.findAll({
      where: { cargo_type: cargoType },
      include: [
        { model: sequelize.models.User, as: 'driver' },
        { model: sequelize.models.Vehicle, as: 'vehicle' }
      ],
      order: [['scheduled_start', 'DESC']]
    });
  };

  Trip.getDelayedTrips = async function() {
    const now = new Date();
    return await this.findAll({
      where: {
        status: 'scheduled',
        scheduled_start: {
          [sequelize.Sequelize.Op.lt]: now
        }
      },
      include: [
        { model: sequelize.models.User, as: 'driver' },
        { model: sequelize.models.Vehicle, as: 'vehicle' }
      ]
    });
  };

  return Trip;
};