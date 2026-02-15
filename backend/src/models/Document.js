module.exports = (sequelize, DataTypes) => {
  const Document = sequelize.define('Document', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    vehicle_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'vehicles',
        key: 'id'
      }
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    type: {
      type: DataTypes.ENUM(
        'insurance', 'permit', 'inspection', 'license', 'registration',
        'certificate', 'manual', 'invoice', 'contract', 'other'
      ),
      allowNull: false,
      comment: 'Tipo de documento'
    },
    category: {
      type: DataTypes.ENUM('vehicle', 'driver', 'company', 'legal', 'safety', 'maintenance'),
      allowNull: false,
      comment: 'Categoría del documento'
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: 'Título del documento'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Descripción del documento'
    },
    document_number: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Número de documento (póliza, patente, etc.)'
    },
    file_url: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'URL del archivo'
    },
    file_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Nombre original del archivo'
    },
    file_size: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Tamaño del archivo en bytes'
    },
    mime_type: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Tipo MIME del archivo'
    },
    issue_date: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Fecha de emisión'
    },
    expiry_date: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Fecha de vencimiento'
    },
    issuing_authority: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: 'Autoridad emisora'
    },
    status: {
      type: DataTypes.ENUM('active', 'expired', 'expiring_soon', 'cancelled', 'renewed'),
      allowNull: false,
      defaultValue: 'active'
    },
    is_required: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Si es un documento obligatorio'
    },
    reminder_days: {
      type: DataTypes.INTEGER,
      defaultValue: 30,
      comment: 'Días antes del vencimiento para recordar'
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Etiquetas para búsqueda'
    },
    version: {
      type: DataTypes.STRING(10),
      defaultValue: '1.0',
      comment: 'Versión del documento'
    },
    previous_document_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'documents',
        key: 'id'
      },
      comment: 'Documento previo que reemplaza'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Notas adicionales'
    },
    uploaded_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      comment: 'Usuario que subió el documento'
    },
    verified_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      comment: 'Usuario que verificó el documento'
    },
    verified_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Fecha de verificación'
    }
  }, {
    tableName: 'documents',
    indexes: [
      {
        fields: ['vehicle_id']
      },
      {
        fields: ['user_id']
      },
      {
        fields: ['type']
      },
      {
        fields: ['category']
      },
      {
        fields: ['status']
      },
      {
        fields: ['expiry_date']
      },
      {
        fields: ['is_required']
      },
      {
        fields: ['document_number']
      }
    ],
    hooks: {
      beforeUpdate: (document) => {
        if (document.changed('expiry_date')) {
          document.updateStatus();
        }
      }
    }
  });

  // Métodos de instancia
  Document.prototype.updateStatus = function() {
    if (!this.expiry_date) {
      this.status = 'active';
      return;
    }

    const now = new Date();
    const expiry = new Date(this.expiry_date);
    const daysUntilExpiry = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) {
      this.status = 'expired';
    } else if (daysUntilExpiry <= this.reminder_days) {
      this.status = 'expiring_soon';
    } else {
      this.status = 'active';
    }
  };

  Document.prototype.isExpired = function() {
    if (!this.expiry_date) return false;
    return new Date() > new Date(this.expiry_date);
  };

  Document.prototype.isExpiringSoon = function() {
    if (!this.expiry_date) return false;
    const now = new Date();
    const expiry = new Date(this.expiry_date);
    const daysUntilExpiry = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry > 0 && daysUntilExpiry <= this.reminder_days;
  };

  Document.prototype.getDaysUntilExpiry = function() {
    if (!this.expiry_date) return null;
    const now = new Date();
    const expiry = new Date(this.expiry_date);
    return Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
  };

  Document.prototype.renew = async function(newExpiryDate, newFileUrl, newVersion) {
    // Crear nuevo documento
    const newDocument = await Document.create({
      vehicle_id: this.vehicle_id,
      user_id: this.user_id,
      type: this.type,
      category: this.category,
      title: this.title,
      description: this.description,
      document_number: this.document_number,
      file_url: newFileUrl || this.file_url,
      file_name: this.file_name,
      mime_type: this.mime_type,
      issue_date: new Date(),
      expiry_date: newExpiryDate,
      issuing_authority: this.issuing_authority,
      is_required: this.is_required,
      reminder_days: this.reminder_days,
      tags: this.tags,
      version: newVersion || this.version,
      previous_document_id: this.id,
      uploaded_by: this.uploaded_by
    });

    // Marcar documento actual como renovado
    this.status = 'renewed';
    await this.save();

    return newDocument;
  };

  Document.prototype.verify = async function(verifierId) {
    this.verified_by = verifierId;
    this.verified_at = new Date();
    return await this.save();
  };

  // Métodos estáticos
  Document.getExpired = async function() {
    return await this.findAll({
      where: {
        status: 'expired'
      },
      include: [
        { model: sequelize.models.Vehicle, as: 'vehicle' },
        { model: sequelize.models.User, as: 'user' }
      ],
      order: [['expiry_date', 'ASC']]
    });
  };

  Document.getExpiringSoon = async function(days = 30) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return await this.findAll({
      where: {
        expiry_date: {
          [sequelize.Sequelize.Op.between]: [new Date(), futureDate]
        },
        status: ['active', 'expiring_soon']
      },
      include: [
        { model: sequelize.models.Vehicle, as: 'vehicle' },
        { model: sequelize.models.User, as: 'user' }
      ],
      order: [['expiry_date', 'ASC']]
    });
  };

  Document.getByVehicle = async function(vehicleId) {
    return await this.findAll({
      where: { 
        vehicle_id: vehicleId,
        status: ['active', 'expiring_soon']
      },
      order: [
        ['type', 'ASC'],
        ['expiry_date', 'ASC']
      ]
    });
  };

  Document.getByUser = async function(userId) {
    return await this.findAll({
      where: { 
        user_id: userId,
        status: ['active', 'expiring_soon']
      },
      order: [
        ['type', 'ASC'],
        ['expiry_date', 'ASC']
      ]
    });
  };

  Document.getRequiredMissing = async function() {
    // Vehículos sin documentos requeridos
    const vehicles = await sequelize.models.Vehicle.findAll({
      where: { status: 'active' }
    });

    const requiredTypes = ['insurance', 'permit', 'inspection'];
    const missingDocs = [];

    for (const vehicle of vehicles) {
      for (const type of requiredTypes) {
        const doc = await this.findOne({
          where: {
            vehicle_id: vehicle.id,
            type: type,
            status: ['active', 'expiring_soon']
          }
        });

        if (!doc) {
          missingDocs.push({
            vehicle_id: vehicle.id,
            vehicle_name: vehicle.getDisplayName(),
            missing_type: type
          });
        }
      }
    }

    return missingDocs;
  };

  Document.searchDocuments = async function(query, filters = {}) {
    const whereClause = {};
    
    if (query) {
      whereClause[sequelize.Sequelize.Op.or] = [
        { title: { [sequelize.Sequelize.Op.iLike]: `%${query}%` } },
        { description: { [sequelize.Sequelize.Op.iLike]: `%${query}%` } },
        { document_number: { [sequelize.Sequelize.Op.iLike]: `%${query}%` } }
      ];
    }

    if (filters.type) whereClause.type = filters.type;
    if (filters.category) whereClause.category = filters.category;
    if (filters.status) whereClause.status = filters.status;
    if (filters.vehicle_id) whereClause.vehicle_id = filters.vehicle_id;
    if (filters.user_id) whereClause.user_id = filters.user_id;

    return await this.findAll({
      where: whereClause,
      include: [
        { model: sequelize.models.Vehicle, as: 'vehicle' },
        { model: sequelize.models.User, as: 'user' }
      ],
      order: [['updated_at', 'DESC']]
    });
  };

  Document.updateStatuses = async function() {
    const documents = await this.findAll({
      where: {
        expiry_date: { [sequelize.Sequelize.Op.ne]: null },
        status: ['active', 'expiring_soon']
      }
    });

    for (const doc of documents) {
      doc.updateStatus();
      await doc.save();
    }

    return documents.length;
  };

  return Document;
};