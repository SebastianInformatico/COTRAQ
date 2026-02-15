module.exports = (sequelize, DataTypes) => {
  const AuditLog = sequelize.define('AuditLog', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: true, // System actions might not have a user
      comment: 'Usuario que realizó la acción'
    },
    action: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'CREATE, UPDATE, DELETE, LOGIN, LOGOUT, etc.'
    },
    entity: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'Nombre del modelo afectado (User, Vehicle, etc.)'
    },
    entity_id: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'ID del registro afectado'
    },
    details: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Detalles del cambio (valores anteriores/nuevos)'
    },
    ip_address: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    user_agent: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    tableName: 'audit_logs',
    timestamps: true,
    updatedAt: false // Logs are immutable, only createdAt matters
  });

  AuditLog.associate = (models) => {
    AuditLog.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
  };

  return AuditLog;
};
