module.exports = (sequelize, DataTypes) => {
  const Photo = sequelize.define('Photo', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    trip_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'trips',
        key: 'id'
      }
    },
    maintenance_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'maintenances',
        key: 'id'
      }
    },
    checklist_response_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'checklist_responses',
        key: 'id'
      }
    },
    vehicle_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'vehicles',
        key: 'id'
      }
    },
    taken_by: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    type: {
      type: DataTypes.ENUM(
        'pre_trip', 'during_trip', 'post_trip', 'maintenance', 
        'damage', 'cargo', 'signature', 'document', 'incident', 'general'
      ),
      allowNull: false,
      comment: 'Tipo de foto'
    },
    category: {
      type: DataTypes.ENUM(
        'vehicle_exterior', 'vehicle_interior', 'cargo_loading', 
        'cargo_unloading', 'damage_evidence', 'maintenance_work',
        'checklist_item', 'delivery_proof', 'safety_check', 'other'
      ),
      allowNull: false,
      defaultValue: 'other'
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: 'Título descriptivo de la foto'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Descripción detallada'
    },
    file_url: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'URL del archivo de imagen'
    },
    thumbnail_url: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'URL del thumbnail'
    },
    file_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Nombre del archivo'
    },
    file_size: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Tamaño en bytes'
    },
    mime_type: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: 'image/jpeg'
    },
    width: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Ancho en pixels'
    },
    height: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Alto en pixels'
    },
    location_lat: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true,
      comment: 'Latitud donde se tomó la foto'
    },
    location_lng: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true,
      comment: 'Longitud donde se tomó la foto'
    },
    location_address: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Dirección donde se tomó'
    },
    taken_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Momento de captura'
    },
    device_info: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Información del dispositivo (modelo, OS, app version)'
    },
    exif_data: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Metadatos EXIF de la imagen'
    },
    is_required: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Si era una foto obligatoria'
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Si la foto ha sido verificada'
    },
    verified_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    verified_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Etiquetas para búsqueda'
    },
    visibility: {
      type: DataTypes.ENUM('public', 'internal', 'restricted', 'private'),
      allowNull: false,
      defaultValue: 'internal'
    },
    quality_score: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 100
      },
      comment: 'Puntuación de calidad automática'
    },
    processing_status: {
      type: DataTypes.ENUM('pending', 'processed', 'failed'),
      defaultValue: 'pending'
    },
    processing_results: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Resultados del análisis automático'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Notas adicionales'
    }
  }, {
    tableName: 'photos',
    indexes: [
      {
        fields: ['trip_id']
      },
      {
        fields: ['maintenance_id']
      },
      {
        fields: ['checklist_response_id']
      },
      {
        fields: ['vehicle_id']
      },
      {
        fields: ['taken_by']
      },
      {
        fields: ['type']
      },
      {
        fields: ['category']
      },
      {
        fields: ['taken_at']
      },
      {
        fields: ['is_verified']
      },
      {
        fields: ['visibility']
      }
    ]
  });

  // Métodos de instancia
  Photo.prototype.verify = async function(verifierId, notes) {
    this.is_verified = true;
    this.verified_by = verifierId;
    this.verified_at = new Date();
    if (notes) this.notes = notes;
    return await this.save();
  };

  Photo.prototype.addTag = function(tag) {
    if (!this.tags) this.tags = [];
    if (!this.tags.includes(tag)) {
      this.tags.push(tag);
    }
  };

  Photo.prototype.removeTag = function(tag) {
    if (this.tags) {
      this.tags = this.tags.filter(t => t !== tag);
    }
  };

  Photo.prototype.getLocationString = function() {
    if (this.location_address) {
      return this.location_address;
    }
    if (this.location_lat && this.location_lng) {
      return `${this.location_lat}, ${this.location_lng}`;
    }
    return 'Ubicación desconocida';
  };

  Photo.prototype.isHighQuality = function() {
    return this.quality_score && this.quality_score >= 80;
  };

  Photo.prototype.needsReview = function() {
    return !this.is_verified && this.is_required;
  };

  Photo.prototype.generateThumbnail = async function() {
    // Esta función sería implementada usando Sharp o similar
    // para generar thumbnails automáticamente
    const thumbnailPath = this.file_url.replace(/\.[^/.]+$/, '_thumb.jpg');
    this.thumbnail_url = thumbnailPath;
    return thumbnailPath;
  };

  // Métodos estáticos
  Photo.getByTrip = async function(tripId) {
    return await this.findAll({
      where: { trip_id: tripId },
      include: [
        { model: sequelize.models.User, as: 'taken_by_user' },
        { model: sequelize.models.ChecklistResponse, as: 'checklist_response' }
      ],
      order: [['taken_at', 'ASC']]
    });
  };

  Photo.getByMaintenance = async function(maintenanceId) {
    return await this.findAll({
      where: { maintenance_id: maintenanceId },
      include: [
        { model: sequelize.models.User, as: 'taken_by_user' }
      ],
      order: [['taken_at', 'ASC']]
    });
  };

  Photo.getByVehicle = async function(vehicleId, limit = 20) {
    return await this.findAll({
      where: { vehicle_id: vehicleId },
      include: [
        { model: sequelize.models.User, as: 'taken_by_user' },
        { model: sequelize.models.Trip, as: 'trip' },
        { model: sequelize.models.Maintenance, as: 'maintenance' }
      ],
      order: [['taken_at', 'DESC']],
      limit
    });
  };

  Photo.getUnverified = async function() {
    return await this.findAll({
      where: {
        is_verified: false,
        is_required: true
      },
      include: [
        { model: sequelize.models.User, as: 'taken_by_user' },
        { model: sequelize.models.Trip, as: 'trip' }
      ],
      order: [['taken_at', 'ASC']]
    });
  };

  Photo.getByDateRange = async function(startDate, endDate, filters = {}) {
    const whereClause = {
      taken_at: {
        [sequelize.Sequelize.Op.between]: [startDate, endDate]
      }
    };

    if (filters.type) whereClause.type = filters.type;
    if (filters.category) whereClause.category = filters.category;
    if (filters.vehicle_id) whereClause.vehicle_id = filters.vehicle_id;
    if (filters.taken_by) whereClause.taken_by = filters.taken_by;
    if (filters.is_verified !== undefined) whereClause.is_verified = filters.is_verified;

    return await this.findAll({
      where: whereClause,
      include: [
        { model: sequelize.models.User, as: 'taken_by_user' },
        { model: sequelize.models.Vehicle, as: 'vehicle' },
        { model: sequelize.models.Trip, as: 'trip' }
      ],
      order: [['taken_at', 'DESC']]
    });
  };

  Photo.searchPhotos = async function(query, filters = {}) {
    const whereClause = {};

    if (query) {
      whereClause[sequelize.Sequelize.Op.or] = [
        { title: { [sequelize.Sequelize.Op.iLike]: `%${query}%` } },
        { description: { [sequelize.Sequelize.Op.iLike]: `%${query}%` } },
        { notes: { [sequelize.Sequelize.Op.iLike]: `%${query}%` } }
      ];
    }

    Object.assign(whereClause, filters);

    return await this.findAll({
      where: whereClause,
      include: [
        { model: sequelize.models.User, as: 'taken_by_user' },
        { model: sequelize.models.Vehicle, as: 'vehicle' },
        { model: sequelize.models.Trip, as: 'trip' }
      ],
      order: [['taken_at', 'DESC']]
    });
  };

  Photo.getStatistics = async function(dateFrom, dateTo) {
    const whereClause = {};
    
    if (dateFrom && dateTo) {
      whereClause.taken_at = {
        [sequelize.Sequelize.Op.between]: [dateFrom, dateTo]
      };
    }

    const [totalPhotos, verifiedPhotos, requiredPhotos] = await Promise.all([
      this.count({ where: whereClause }),
      this.count({ where: { ...whereClause, is_verified: true } }),
      this.count({ where: { ...whereClause, is_required: true } })
    ]);

    const photosByType = await this.findAll({
      attributes: [
        'type',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: whereClause,
      group: ['type'],
      raw: true
    });

    const photosByCategory = await this.findAll({
      attributes: [
        'category',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: whereClause,
      group: ['category'],
      raw: true
    });

    return {
      total_photos: totalPhotos,
      verified_photos: verifiedPhotos,
      unverified_photos: totalPhotos - verifiedPhotos,
      required_photos: requiredPhotos,
      verification_rate: totalPhotos > 0 ? Math.round((verifiedPhotos / totalPhotos) * 100) : 0,
      by_type: photosByType.reduce((acc, item) => {
        acc[item.type] = parseInt(item.count);
        return acc;
      }, {}),
      by_category: photosByCategory.reduce((acc, item) => {
        acc[item.category] = parseInt(item.count);
        return acc;
      }, {})
    };
  };

  Photo.bulkVerify = async function(photoIds, verifierId) {
    return await this.update(
      {
        is_verified: true,
        verified_by: verifierId,
        verified_at: new Date()
      },
      {
        where: {
          id: { [sequelize.Sequelize.Op.in]: photoIds }
        }
      }
    );
  };

  Photo.cleanupOldPhotos = async function(daysOld = 365) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const oldPhotos = await this.findAll({
      where: {
        taken_at: {
          [sequelize.Sequelize.Op.lt]: cutoffDate
        },
        visibility: 'internal'
      }
    });

    // Aquí se implementaría la lógica para eliminar archivos físicos
    // antes de eliminar los registros de la base de datos

    return await this.destroy({
      where: {
        id: { [sequelize.Sequelize.Op.in]: oldPhotos.map(p => p.id) }
      }
    });
  };

  return Photo;
};