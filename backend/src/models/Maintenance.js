module.exports = (sequelize, DataTypes) => {
  const Maintenance = sequelize.define('Maintenance', {
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
      }
    },
    mechanic_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    type: {
      type: DataTypes.ENUM('preventive', 'corrective', 'emergency', 'inspection'),
      allowNull: false,
      comment: 'Tipo de mantenimiento'
    },
    status: {
      type: DataTypes.ENUM('scheduled', 'in_progress', 'completed', 'cancelled', 'postponed'),
      allowNull: false,
      defaultValue: 'scheduled'
    },
    priority: {
      type: DataTypes.ENUM('low', 'normal', 'high', 'critical'),
      allowNull: false,
      defaultValue: 'normal'
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: 'Título del mantenimiento'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Descripción detallada'
    },
    scheduled_date: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: 'Fecha programada'
    },
    started_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Fecha de inicio real'
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Fecha de finalización'
    },
    odometer_at_service: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Kilometraje al momento del servicio'
    },
    next_service_km: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Próximo servicio en kilómetros'
    },
    next_service_date: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Fecha del próximo servicio'
    },
    estimated_duration_hours: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      comment: 'Duración estimada en horas'
    },
    actual_duration_hours: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      comment: 'Duración real en horas'
    },
    estimated_cost: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      comment: 'Costo estimado'
    },
    actual_cost: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      comment: 'Costo real'
    },
    parts_cost: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      comment: 'Costo de repuestos'
    },
    labor_cost: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      comment: 'Costo de mano de obra'
    },
    supplier_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Proveedor del servicio'
    },
    supplier_contact: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Contacto del proveedor'
    },
    invoice_number: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Número de factura'
    },
    warranty_expires: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Vencimiento de garantía'
    },
    parts_used: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Lista de repuestos utilizados'
    },
    work_performed: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Trabajo realizado'
    },
    issues_found: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Problemas encontrados'
    },
    recommendations: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Recomendaciones futuras'
    },
    photo_urls: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'URLs de fotos del mantenimiento'
    },
    document_urls: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'URLs de documentos relacionados'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Notas adicionales'
    }
  }, {
    tableName: 'maintenances',
    indexes: [
      {
        fields: ['vehicle_id']
      },
      {
        fields: ['mechanic_id']
      },
      {
        fields: ['type']
      },
      {
        fields: ['status']
      },
      {
        fields: ['priority']
      },
      {
        fields: ['scheduled_date']
      },
      {
        fields: ['next_service_date']
      }
    ]
  });

  // Métodos de instancia
  Maintenance.prototype.start = async function(mechanicId) {
    this.status = 'in_progress';
    this.started_at = new Date();
    if (mechanicId) this.mechanic_id = mechanicId;
    return await this.save();
  };

  Maintenance.prototype.complete = async function(workData) {
    this.status = 'completed';
    this.completed_at = new Date();
    
    if (workData.work_performed) this.work_performed = workData.work_performed;
    if (workData.parts_used) this.parts_used = workData.parts_used;
    if (workData.actual_cost) this.actual_cost = workData.actual_cost;
    if (workData.parts_cost) this.parts_cost = workData.parts_cost;
    if (workData.labor_cost) this.labor_cost = workData.labor_cost;
    if (workData.recommendations) this.recommendations = workData.recommendations;
    if (workData.next_service_km) this.next_service_km = workData.next_service_km;
    if (workData.next_service_date) this.next_service_date = workData.next_service_date;
    
    // Calcular duración real
    if (this.started_at) {
      const duration = (this.completed_at - this.started_at) / (1000 * 60 * 60); // horas
      this.actual_duration_hours = Math.round(duration * 100) / 100;
    }
    
    return await this.save();
  };

  Maintenance.prototype.cancel = async function(reason) {
    this.status = 'cancelled';
    this.notes = this.notes ? `${this.notes}\nCancelado: ${reason}` : `Cancelado: ${reason}`;
    return await this.save();
  };

  Maintenance.prototype.postpone = async function(newDate, reason) {
    this.status = 'postponed';
    this.scheduled_date = newDate;
    this.notes = this.notes ? `${this.notes}\nPostergado: ${reason}` : `Postergado: ${reason}`;
    return await this.save();
  };

  Maintenance.prototype.isOverdue = function() {
    if (this.status !== 'scheduled') return false;
    return new Date() > new Date(this.scheduled_date);
  };

  Maintenance.prototype.getDaysUntilDue = function() {
    if (this.status !== 'scheduled') return null;
    const today = new Date();
    const scheduled = new Date(this.scheduled_date);
    const diffTime = scheduled - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Métodos estáticos
  Maintenance.getUpcoming = async function(days = 30) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    
    return await this.findAll({
      where: {
        status: 'scheduled',
        scheduled_date: {
          [sequelize.Sequelize.Op.between]: [new Date(), futureDate]
        }
      },
      include: [
        { model: sequelize.models.Vehicle, as: 'vehicle' },
        { model: sequelize.models.User, as: 'mechanic' }
      ],
      order: [['scheduled_date', 'ASC']]
    });
  };

  Maintenance.getOverdue = async function() {
    return await this.findAll({
      where: {
        status: 'scheduled',
        scheduled_date: {
          [sequelize.Sequelize.Op.lt]: new Date()
        }
      },
      include: [
        { model: sequelize.models.Vehicle, as: 'vehicle' },
        { model: sequelize.models.User, as: 'mechanic' }
      ],
      order: [['scheduled_date', 'ASC']]
    });
  };

  Maintenance.getByVehicle = async function(vehicleId, limit = 10) {
    return await this.findAll({
      where: { vehicle_id: vehicleId },
      include: [
        { model: sequelize.models.User, as: 'mechanic' }
      ],
      order: [['scheduled_date', 'DESC']],
      limit
    });
  };

  Maintenance.getCostAnalysis = async function(vehicleId, dateFrom, dateTo) {
    const whereClause = { status: 'completed' };
    
    if (vehicleId) whereClause.vehicle_id = vehicleId;
    if (dateFrom && dateTo) {
      whereClause.completed_at = {
        [sequelize.Sequelize.Op.between]: [dateFrom, dateTo]
      };
    }
    
    const maintenances = await this.findAll({
      where: whereClause,
      attributes: [
        'type',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('actual_cost')), 'total_cost'],
        [sequelize.fn('AVG', sequelize.col('actual_cost')), 'avg_cost'],
        [sequelize.fn('SUM', sequelize.col('parts_cost')), 'total_parts'],
        [sequelize.fn('SUM', sequelize.col('labor_cost')), 'total_labor']
      ],
      group: ['type'],
      raw: true
    });
    
    return maintenances.map(m => ({
      type: m.type,
      count: parseInt(m.count),
      total_cost: parseFloat(m.total_cost) || 0,
      avg_cost: parseFloat(m.avg_cost) || 0,
      total_parts: parseFloat(m.total_parts) || 0,
      total_labor: parseFloat(m.total_labor) || 0
    }));
  };

  Maintenance.createPreventive = async function(vehicleId, serviceType, dueDate, kmInterval) {
    return await this.create({
      vehicle_id: vehicleId,
      type: 'preventive',
      title: `Mantenimiento Preventivo - ${serviceType}`,
      scheduled_date: dueDate,
      next_service_km: kmInterval,
      priority: 'normal'
    });
  };

  return Maintenance;
};