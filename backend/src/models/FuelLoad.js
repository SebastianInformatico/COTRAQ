module.exports = (sequelize, DataTypes) => {
  const FuelLoad = sequelize.define('FuelLoad', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    vehicle_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'vehicles',
        key: 'id'
      },
      comment: 'Vehículo que carga combustible'
    },
    driver_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      comment: 'Conductor responsable'
    },
    trip_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'trips',
        key: 'id'
      },
      comment: 'Viaje asociado (opcional)'
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    odometer: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Kilometraje al momento de la carga'
    },
    liters: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0.1
      }
    },
    price_per_liter: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Precio por litro en CLP'
    },
    total_cost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Costo total de la carga'
    },
    fuel_type: {
      type: DataTypes.ENUM('diesel', 'gasoline', 'gas', 'adblue'),
      allowNull: false,
      defaultValue: 'diesel'
    },
    full_tank: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: '¿Se llenó el tanque?'
    },
    payment_method: {
      type: DataTypes.ENUM('fuel_card', 'credit_card', 'cash', 'transfer'),
      allowNull: false,
      defaultValue: 'fuel_card',
      comment: 'Método de pago (Tarjeta Flota, Efectivo, etc)'
    },
    card_number: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: 'Últimos dígitos de la tarjeta o identificador'
    },
    station_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Nombre de la estación de servicio'
    },
    station_location: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: 'Ubicación/Dirección de la estación'
    },
    invoice_number: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Número de factura o boleta'
    },
    receipt_photo_url: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Foto del comprobante'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'fuel_loads',
    paranoid: true, // Soft deletes para mantener historial
    hooks: {
      beforeSave: (fuelLoad) => {
        // Calcular total si no viene y tenemos litros y precio
        if (!fuelLoad.total_cost && fuelLoad.liters && fuelLoad.price_per_liter) {
          fuelLoad.total_cost = fuelLoad.liters * fuelLoad.price_per_liter;
        }
      }
    }
  });

  return FuelLoad;
};
