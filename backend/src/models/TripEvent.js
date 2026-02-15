module.exports = (sequelize, DataTypes) => {
  const TripEvent = sequelize.define('TripEvent', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    trip_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'trips',
        key: 'id'
      }
    },
    type: {
      type: DataTypes.ENUM('departure', 'arrival', 'stop', 'checkpoint', 'rest', 'incident', 'temperature_check', 'refuel', 'other'),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    location_name: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    location_coordinates: {
      type: DataTypes.GEOMETRY('POINT'),
      allowNull: true
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    reported_by: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Datos extra: temperatura, litros, fotos, etc.'
    }
  }, {
    tableName: 'trip_events',
    paranoid: true,
    indexes: [
      {
        fields: ['trip_id']
      },
      {
        fields: ['type']
      },
      {
        fields: ['timestamp']
      }
    ]
  });

  return TripEvent;
};
