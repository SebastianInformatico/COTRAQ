module.exports = (sequelize, DataTypes) => {
  const Checklist = sequelize.define('Checklist', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Nombre del checklist'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Descripción del checklist'
    },
    type: {
      type: DataTypes.ENUM('pre_trip', 'during_trip', 'post_trip', 'maintenance', 'safety'),
      allowNull: false,
      comment: 'Tipo de checklist'
    },
    cargo_type: {
      type: DataTypes.ENUM('alimento', 'choritos', 'producto_terminado', 'general'),
      allowNull: false,
      defaultValue: 'general',
      comment: 'Tipo de carga al que aplica'
    },
    vehicle_type: {
      type: DataTypes.ENUM('truck', 'pickup', 'van', 'refrigerated', 'tank', 'all'),
      allowNull: false,
      defaultValue: 'all',
      comment: 'Tipo de vehículo al que aplica'
    },
    is_mandatory: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Si el checklist es obligatorio'
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Si el checklist está activo'
    },
    version: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: '1.0',
      comment: 'Versión del checklist'
    },
    instructions: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Instrucciones para completar el checklist'
    },
    estimated_duration_minutes: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Duración estimada en minutos'
    },
    requires_photo_evidence: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Si requiere evidencia fotográfica'
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      comment: 'Usuario que creó el checklist'
    },
    approved_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      comment: 'Usuario que aprobó el checklist'
    },
    approved_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Fecha de aprobación'
    }
  }, {
    tableName: 'checklists',
    indexes: [
      {
        fields: ['type']
      },
      {
        fields: ['cargo_type']
      },
      {
        fields: ['vehicle_type']
      },
      {
        fields: ['is_active']
      },
      {
        fields: ['is_mandatory']
      },
      {
        unique: true,
        fields: ['name', 'version']
      }
    ]
  });

  // Métodos de instancia
  Checklist.prototype.isApplicableForTrip = function(trip, vehicle) {
    // Verificar si está activo
    if (!this.is_active) return false;
    
    // Verificar tipo de carga
    if (this.cargo_type !== 'general' && this.cargo_type !== trip.cargo_type) {
      return false;
    }
    
    // Verificar tipo de vehículo
    if (this.vehicle_type !== 'all' && this.vehicle_type !== vehicle.type) {
      return false;
    }
    
    return true;
  };

  Checklist.prototype.duplicate = async function(newName, newVersion) {
    const items = await this.getItems({
      order: [['order_index', 'ASC']]
    });
    
    // Crear nueva checklist
    const newChecklist = await sequelize.models.Checklist.create({
      name: newName || `${this.name} (Copia)`,
      description: this.description,
      type: this.type,
      cargo_type: this.cargo_type,
      vehicle_type: this.vehicle_type,
      is_mandatory: this.is_mandatory,
      version: newVersion || '1.0',
      instructions: this.instructions,
      estimated_duration_minutes: this.estimated_duration_minutes,
      requires_photo_evidence: this.requires_photo_evidence
    });
    
    // Duplicar items
    for (const item of items) {
      await sequelize.models.ChecklistItem.create({
        checklist_id: newChecklist.id,
        question: item.question,
        type: item.type,
        is_required: item.is_required,
        order_index: item.order_index,
        options: item.options,
        validation_rules: item.validation_rules,
        help_text: item.help_text,
        category: item.category
      });
    }
    
    return newChecklist;
  };

  // Métodos estáticos
  Checklist.getApplicableChecklists = async function(tripType, cargoType, vehicleType) {
    return await this.findAll({
      where: {
        is_active: true,
        type: tripType,
        [sequelize.Sequelize.Op.or]: [
          { cargo_type: 'general' },
          { cargo_type: cargoType }
        ],
        [sequelize.Sequelize.Op.or]: [
          { vehicle_type: 'all' },
          { vehicle_type: vehicleType }
        ]
      },
      include: [
        {
          model: sequelize.models.ChecklistItem,
          as: 'items',
          order: [['order_index', 'ASC']]
        }
      ],
      order: [['name', 'ASC']]
    });
  };

  Checklist.getMandatoryChecklists = async function(tripType) {
    return await this.findAll({
      where: {
        is_active: true,
        is_mandatory: true,
        type: tripType
      },
      include: [
        {
          model: sequelize.models.ChecklistItem,
          as: 'items',
          order: [['order_index', 'ASC']]
        }
      ]
    });
  };

  Checklist.getByCargoType = async function(cargoType) {
    return await this.findAll({
      where: {
        is_active: true,
        [sequelize.Sequelize.Op.or]: [
          { cargo_type: 'general' },
          { cargo_type: cargoType }
        ]
      },
      include: [
        {
          model: sequelize.models.ChecklistItem,
          as: 'items',
          order: [['order_index', 'ASC']]
        }
      ]
    });
  };

  Checklist.getStatistics = async function() {
    const total = await this.count();
    const active = await this.count({ where: { is_active: true } });
    const mandatory = await this.count({ where: { is_mandatory: true } });
    
    const byType = await this.findAll({
      attributes: [
        'type',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['type'],
      raw: true
    });
    
    const byCargoType = await this.findAll({
      attributes: [
        'cargo_type',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['cargo_type'],
      raw: true
    });

    return {
      total,
      active,
      mandatory,
      inactive: total - active,
      byType: byType.reduce((acc, item) => {
        acc[item.type] = item.count;
        return acc;
      }, {}),
      byCargoType: byCargoType.reduce((acc, item) => {
        acc[item.cargo_type] = item.count;
        return acc;
      }, {})
    };
  };

  return Checklist;
};