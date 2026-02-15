module.exports = (sequelize, DataTypes) => {
  const ChecklistItem = sequelize.define('ChecklistItem', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    checklist_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'checklists',
        key: 'id'
      }
    },
    question: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Pregunta o elemento a verificar'
    },
    type: {
      type: DataTypes.ENUM('yes_no', 'text', 'number', 'select', 'multiselect', 'photo', 'signature'),
      allowNull: false,
      defaultValue: 'yes_no',
      comment: 'Tipo de respuesta esperada'
    },
    is_required: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Si la respuesta es obligatoria'
    },
    order_index: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Orden de presentación'
    },
    options: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Opciones para preguntas tipo select/multiselect'
    },
    validation_rules: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Reglas de validación (min, max, regex, etc.)'
    },
    help_text: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Texto de ayuda para el usuario'
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Categoría del elemento (motor, frenos, documentos, etc.)'
    },
    points_value: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      comment: 'Valor en puntos de este elemento'
    },
    is_critical: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Si es un elemento crítico que impide continuar'
    },
    requires_photo: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Si requiere evidencia fotográfica'
    },
    default_value: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Valor por defecto'
    },
    conditional_logic: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Lógica condicional para mostrar este elemento'
    }
  }, {
    tableName: 'checklist_items',
    indexes: [
      {
        fields: ['checklist_id']
      },
      {
        fields: ['order_index']
      },
      {
        fields: ['type']
      },
      {
        fields: ['category']
      },
      {
        fields: ['is_critical']
      },
      {
        unique: true,
        fields: ['checklist_id', 'order_index']
      }
    ]
  });

  // Métodos de instancia
  ChecklistItem.prototype.validateResponse = function(response) {
    const errors = [];

    // Verificar si es requerido
    if (this.is_required && (!response || response.trim() === '')) {
      errors.push('Este campo es obligatorio');
      return { valid: false, errors };
    }

    // Validar según el tipo
    switch (this.type) {
      case 'yes_no':
        if (response && !['yes', 'no', 'si', 'no'].includes(response.toLowerCase())) {
          errors.push('Respuesta debe ser Sí o No');
        }
        break;

      case 'number':
        const num = Number(response);
        if (isNaN(num)) {
          errors.push('Debe ser un número válido');
        } else if (this.validation_rules) {
          if (this.validation_rules.min !== undefined && num < this.validation_rules.min) {
            errors.push(`El valor debe ser mayor o igual a ${this.validation_rules.min}`);
          }
          if (this.validation_rules.max !== undefined && num > this.validation_rules.max) {
            errors.push(`El valor debe ser menor o igual a ${this.validation_rules.max}`);
          }
        }
        break;

      case 'text':
        if (this.validation_rules) {
          if (this.validation_rules.minLength && response.length < this.validation_rules.minLength) {
            errors.push(`Debe tener al menos ${this.validation_rules.minLength} caracteres`);
          }
          if (this.validation_rules.maxLength && response.length > this.validation_rules.maxLength) {
            errors.push(`No debe exceder ${this.validation_rules.maxLength} caracteres`);
          }
          if (this.validation_rules.pattern) {
            const regex = new RegExp(this.validation_rules.pattern);
            if (!regex.test(response)) {
              errors.push(this.validation_rules.patternMessage || 'Formato inválido');
            }
          }
        }
        break;

      case 'select':
        if (this.options && !this.options.includes(response)) {
          errors.push('Opción no válida');
        }
        break;

      case 'multiselect':
        try {
          const selected = JSON.parse(response);
          if (!Array.isArray(selected)) {
            errors.push('Formato de selección inválido');
          } else if (this.options) {
            const invalidOptions = selected.filter(opt => !this.options.includes(opt));
            if (invalidOptions.length > 0) {
              errors.push(`Opciones no válidas: ${invalidOptions.join(', ')}`);
            }
          }
        } catch (e) {
          errors.push('Formato JSON inválido para selección múltiple');
        }
        break;
    }

    return {
      valid: errors.length === 0,
      errors
    };
  };

  ChecklistItem.prototype.shouldShow = function(responses) {
    if (!this.conditional_logic) return true;

    const { condition, rules } = this.conditional_logic;
    
    if (condition === 'AND') {
      return rules.every(rule => this.evaluateRule(rule, responses));
    } else if (condition === 'OR') {
      return rules.some(rule => this.evaluateRule(rule, responses));
    }
    
    return true;
  };

  ChecklistItem.prototype.evaluateRule = function(rule, responses) {
    const { itemId, operator, value } = rule;
    const response = responses[itemId];
    
    if (!response) return false;
    
    switch (operator) {
      case 'equals':
        return response.value === value;
      case 'not_equals':
        return response.value !== value;
      case 'contains':
        return response.value && response.value.includes(value);
      case 'greater_than':
        return Number(response.value) > Number(value);
      case 'less_than':
        return Number(response.value) < Number(value);
      default:
        return false;
    }
  };

  ChecklistItem.prototype.getDisplayOptions = function() {
    if (!this.options) return [];
    
    if (Array.isArray(this.options)) {
      return this.options;
    }
    
    // Si options es un objeto con configuración adicional
    if (this.options.items) {
      return this.options.items;
    }
    
    return [];
  };

  // Métodos estáticos
  ChecklistItem.getByChecklist = async function(checklistId) {
    return await this.findAll({
      where: { checklist_id: checklistId },
      order: [['order_index', 'ASC']]
    });
  };

  ChecklistItem.getCriticalItems = async function(checklistId) {
    return await this.findAll({
      where: {
        checklist_id: checklistId,
        is_critical: true
      },
      order: [['order_index', 'ASC']]
    });
  };

  ChecklistItem.getByCategory = async function(checklistId, category) {
    return await this.findAll({
      where: {
        checklist_id: checklistId,
        category: category
      },
      order: [['order_index', 'ASC']]
    });
  };

  ChecklistItem.reorderItems = async function(checklistId, itemOrders) {
    const transaction = await sequelize.transaction();
    
    try {
      for (const { itemId, newOrder } of itemOrders) {
        await this.update(
          { order_index: newOrder },
          { 
            where: { 
              id: itemId, 
              checklist_id: checklistId 
            },
            transaction 
          }
        );
      }
      
      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  };

  return ChecklistItem;
};