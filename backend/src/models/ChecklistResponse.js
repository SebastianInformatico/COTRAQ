module.exports = (sequelize, DataTypes) => {
  const ChecklistResponse = sequelize.define('ChecklistResponse', {
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
    checklist_item_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'checklist_items',
        key: 'id'
      }
    },
    response_value: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Valor de la respuesta'
    },
    response_numeric: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Valor numérico para respuestas numéricas'
    },
    response_boolean: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      comment: 'Valor booleano para respuestas sí/no'
    },
    response_json: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Respuestas complejas (multiselect, arrays)'
    },
    photo_urls: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'URLs de fotos de evidencia'
    },
    signature_url: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'URL de firma digital'
    },
    comments: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Comentarios adicionales'
    },
    location_lat: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true,
      comment: 'Latitud donde se respondió'
    },
    location_lng: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true,
      comment: 'Longitud donde se respondió'
    },
    location_address: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Dirección donde se respondió'
    },
    response_timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Momento exacto de la respuesta'
    },
    is_compliant: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      comment: 'Si cumple con los estándares'
    },
    requires_followup: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Si requiere seguimiento'
    },
    followup_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Notas de seguimiento'
    },
    reviewed_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      comment: 'Usuario que revisó la respuesta'
    },
    reviewed_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Fecha de revisión'
    },
    review_status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected', 'needs_clarification'),
      defaultValue: 'pending',
      comment: 'Estado de la revisión'
    },
    review_comments: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Comentarios de la revisión'
    }
  }, {
    tableName: 'checklist_responses',
    indexes: [
      {
        fields: ['trip_id']
      },
      {
        fields: ['checklist_item_id']
      },
      {
        fields: ['response_timestamp']
      },
      {
        fields: ['is_compliant']
      },
      {
        fields: ['requires_followup']
      },
      {
        fields: ['review_status']
      },
      {
        unique: true,
        fields: ['trip_id', 'checklist_item_id']
      }
    ]
  });

  // Métodos de instancia
  ChecklistResponse.prototype.getValue = function() {
    // Retorna el valor apropiado según el tipo de respuesta
    if (this.response_boolean !== null) return this.response_boolean;
    if (this.response_numeric !== null) return this.response_numeric;
    if (this.response_json !== null) return this.response_json;
    return this.response_value;
  };

  ChecklistResponse.prototype.setValue = function(value, type = 'text') {
    switch (type) {
      case 'yes_no':
        this.response_boolean = ['yes', 'si', 'sí', true, 1].includes(value);
        this.response_value = this.response_boolean ? 'Sí' : 'No';
        break;
      case 'number':
        this.response_numeric = Number(value);
        this.response_value = String(value);
        break;
      case 'multiselect':
      case 'json':
        this.response_json = typeof value === 'string' ? JSON.parse(value) : value;
        this.response_value = typeof value === 'string' ? value : JSON.stringify(value);
        break;
      default:
        this.response_value = String(value);
    }
  };

  ChecklistResponse.prototype.addPhoto = function(photoUrl) {
    if (!this.photo_urls) {
      this.photo_urls = [];
    }
    this.photo_urls.push(photoUrl);
  };

  ChecklistResponse.prototype.removePhoto = function(photoUrl) {
    if (this.photo_urls) {
      this.photo_urls = this.photo_urls.filter(url => url !== photoUrl);
    }
  };

  ChecklistResponse.prototype.isCompliant = function() {
    if (this.is_compliant !== null) {
      return this.is_compliant;
    }
    
    // Lógica automática basada en el valor de respuesta
    if (this.response_boolean !== null) {
      return this.response_boolean;
    }
    
    return true; // Por defecto
  };

  ChecklistResponse.prototype.approve = async function(reviewerId, comments) {
    this.review_status = 'approved';
    this.reviewed_by = reviewerId;
    this.reviewed_at = new Date();
    this.review_comments = comments;
    return await this.save();
  };

  ChecklistResponse.prototype.reject = async function(reviewerId, comments) {
    this.review_status = 'rejected';
    this.reviewed_by = reviewerId;
    this.reviewed_at = new Date();
    this.review_comments = comments;
    this.requires_followup = true;
    return await this.save();
  };

  ChecklistResponse.prototype.needsClarification = async function(reviewerId, comments) {
    this.review_status = 'needs_clarification';
    this.reviewed_by = reviewerId;
    this.reviewed_at = new Date();
    this.review_comments = comments;
    this.requires_followup = true;
    return await this.save();
  };

  // Métodos estáticos
  ChecklistResponse.getByTrip = async function(tripId) {
    return await this.findAll({
      where: { trip_id: tripId },
      include: [
        {
          model: sequelize.models.ChecklistItem,
          as: 'checklist_item',
          include: [
            {
              model: sequelize.models.Checklist,
              as: 'checklist'
            }
          ]
        }
      ],
      order: [
        [{ model: sequelize.models.ChecklistItem, as: 'checklist_item' }, 'order_index', 'ASC']
      ]
    });
  };

  ChecklistResponse.getTripCompletionStatus = async function(tripId) {
    const responses = await this.getByTrip(tripId);
    
    // Agrupar por checklist
    const checklistGroups = {};
    for (const response of responses) {
      const checklistId = response.checklist_item.checklist.id;
      if (!checklistGroups[checklistId]) {
        checklistGroups[checklistId] = {
          checklist: response.checklist_item.checklist,
          responses: []
        };
      }
      checklistGroups[checklistId].responses.push(response);
    }
    
    // Calcular estadísticas
    const result = {};
    for (const [checklistId, group] of Object.entries(checklistGroups)) {
      const totalItems = await sequelize.models.ChecklistItem.count({
        where: { checklist_id: checklistId }
      });
      
      const completedItems = group.responses.length;
      const compliantItems = group.responses.filter(r => r.isCompliant()).length;
      const pendingReview = group.responses.filter(r => r.review_status === 'pending').length;
      
      result[checklistId] = {
        checklist_name: group.checklist.name,
        checklist_type: group.checklist.type,
        total_items: totalItems,
        completed_items: completedItems,
        compliant_items: compliantItems,
        pending_review: pendingReview,
        completion_percentage: Math.round((completedItems / totalItems) * 100),
        compliance_percentage: completedItems > 0 ? Math.round((compliantItems / completedItems) * 100) : 0
      };
    }
    
    return result;
  };

  ChecklistResponse.getNonCompliantResponses = async function(dateFrom, dateTo) {
    const whereClause = {
      is_compliant: false
    };
    
    if (dateFrom && dateTo) {
      whereClause.response_timestamp = {
        [sequelize.Sequelize.Op.between]: [dateFrom, dateTo]
      };
    }
    
    return await this.findAll({
      where: whereClause,
      include: [
        {
          model: sequelize.models.ChecklistItem,
          as: 'checklist_item',
          include: [{ model: sequelize.models.Checklist, as: 'checklist' }]
        },
        {
          model: sequelize.models.Trip,
          as: 'trip',
          include: [
            { model: sequelize.models.User, as: 'driver' },
            { model: sequelize.models.Vehicle, as: 'vehicle' }
          ]
        }
      ],
      order: [['response_timestamp', 'DESC']]
    });
  };

  ChecklistResponse.getResponseStatistics = async function(checklistId, dateFrom, dateTo) {
    const whereClause = {};
    
    if (dateFrom && dateTo) {
      whereClause.response_timestamp = {
        [sequelize.Sequelize.Op.between]: [dateFrom, dateTo]
      };
    }
    
    if (checklistId) {
      whereClause['$checklist_item.checklist_id$'] = checklistId;
    }
    
    const responses = await this.findAll({
      where: whereClause,
      include: [
        {
          model: sequelize.models.ChecklistItem,
          as: 'checklist_item',
          required: checklistId ? true : false
        }
      ]
    });
    
    const total = responses.length;
    const compliant = responses.filter(r => r.isCompliant()).length;
    const pendingReview = responses.filter(r => r.review_status === 'pending').length;
    const approved = responses.filter(r => r.review_status === 'approved').length;
    const rejected = responses.filter(r => r.review_status === 'rejected').length;
    
    return {
      total_responses: total,
      compliant_responses: compliant,
      non_compliant_responses: total - compliant,
      pending_review: pendingReview,
      approved: approved,
      rejected: rejected,
      compliance_rate: total > 0 ? Math.round((compliant / total) * 100) : 0,
      approval_rate: total > 0 ? Math.round((approved / total) * 100) : 0
    };
  };

  return ChecklistResponse;
};