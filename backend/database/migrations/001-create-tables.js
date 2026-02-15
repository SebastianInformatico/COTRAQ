const { QueryInterface, DataTypes } = require('sequelize');

module.exports = {
  async up(queryInterface) {
    // Habilitar extensiones
    await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    
    // Crear tabla users
    await queryInterface.createTable('users', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      first_name: {
        type: DataTypes.STRING(50),
        allowNull: false
      },
      last_name: {
        type: DataTypes.STRING(50),
        allowNull: false
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: true
      },
      role: {
        type: DataTypes.ENUM('admin', 'supervisor', 'driver', 'mechanic'),
        allowNull: false,
        defaultValue: 'driver'
      },
      license_number: {
        type: DataTypes.STRING(20),
        allowNull: true
      },
      license_expiry: {
        type: DataTypes.DATE,
        allowNull: true
      },
      employee_id: {
        type: DataTypes.STRING(20),
        allowNull: true,
        unique: true
      },
      profile_picture: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false
      },
      last_login: {
        type: DataTypes.DATE,
        allowNull: true
      },
      emergency_contact_name: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      emergency_contact_phone: {
        type: DataTypes.STRING(20),
        allowNull: true
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    });

    // Crear tabla vehicles
    await queryInterface.createTable('vehicles', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      license_plate: {
        type: DataTypes.STRING(10),
        allowNull: false,
        unique: true
      },
      brand: {
        type: DataTypes.STRING(50),
        allowNull: false
      },
      model: {
        type: DataTypes.STRING(50),
        allowNull: false
      },
      year: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      type: {
        type: DataTypes.ENUM('truck', 'pickup', 'van', 'refrigerated', 'tank'),
        allowNull: false,
        defaultValue: 'truck'
      },
      capacity_kg: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
      },
      capacity_m3: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
      },
      fuel_type: {
        type: DataTypes.ENUM('gasoline', 'diesel', 'gas', 'electric', 'hybrid'),
        allowNull: false,
        defaultValue: 'diesel'
      },
      vin: {
        type: DataTypes.STRING(17),
        allowNull: true,
        unique: true
      },
      engine_number: {
        type: DataTypes.STRING(50),
        allowNull: true
      },
      odometer: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      status: {
        type: DataTypes.ENUM('active', 'maintenance', 'inactive', 'retired'),
        allowNull: false,
        defaultValue: 'active'
      },
      insurance_company: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      insurance_policy: {
        type: DataTypes.STRING(50),
        allowNull: true
      },
      insurance_expiry: {
        type: DataTypes.DATE,
        allowNull: true
      },
      inspection_expiry: {
        type: DataTypes.DATE,
        allowNull: true
      },
      permit_expiry: {
        type: DataTypes.DATE,
        allowNull: true
      },
      has_gps: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      has_temperature_control: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      temperature_range_min: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true
      },
      temperature_range_max: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true
      },
      acquisition_date: {
        type: DataTypes.DATE,
        allowNull: true
      },
      acquisition_cost: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true
      },
      color: {
        type: DataTypes.STRING(30),
        allowNull: true
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      photo_url: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    });

    // Crear tabla checklists
    await queryInterface.createTable('checklists', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      type: {
        type: DataTypes.ENUM('pre_trip', 'during_trip', 'post_trip', 'maintenance', 'safety'),
        allowNull: false
      },
      cargo_type: {
        type: DataTypes.ENUM('alimento', 'choritos', 'producto_terminado', 'general'),
        allowNull: false,
        defaultValue: 'general'
      },
      vehicle_type: {
        type: DataTypes.ENUM('truck', 'pickup', 'van', 'refrigerated', 'tank', 'all'),
        allowNull: false,
        defaultValue: 'all'
      },
      is_mandatory: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      version: {
        type: DataTypes.STRING(10),
        allowNull: false,
        defaultValue: '1.0'
      },
      instructions: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      estimated_duration_minutes: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      requires_photo_evidence: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      created_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      approved_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      approved_at: {
        type: DataTypes.DATE,
        allowNull: true
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    });

    // Crear tabla checklist_items
    await queryInterface.createTable('checklist_items', {
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
        },
        onDelete: 'CASCADE'
      },
      question: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      type: {
        type: DataTypes.ENUM('yes_no', 'text', 'number', 'select', 'multiselect', 'photo', 'signature'),
        allowNull: false,
        defaultValue: 'yes_no'
      },
      is_required: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      order_index: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      options: {
        type: DataTypes.JSON,
        allowNull: true
      },
      validation_rules: {
        type: DataTypes.JSON,
        allowNull: true
      },
      help_text: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      category: {
        type: DataTypes.STRING(50),
        allowNull: true
      },
      points_value: {
        type: DataTypes.INTEGER,
        defaultValue: 1
      },
      is_critical: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      requires_photo: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      default_value: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      conditional_logic: {
        type: DataTypes.JSON,
        allowNull: true
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    });

    // Crear tabla trips
    await queryInterface.createTable('trips', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      trip_number: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true
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
        allowNull: false
      },
      cargo_description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      cargo_weight_kg: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
      },
      cargo_volume_m3: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
      },
      origin_address: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      destination_address: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      scheduled_start: {
        type: DataTypes.DATE,
        allowNull: false
      },
      scheduled_end: {
        type: DataTypes.DATE,
        allowNull: true
      },
      actual_start: {
        type: DataTypes.DATE,
        allowNull: true
      },
      actual_end: {
        type: DataTypes.DATE,
        allowNull: true
      },
      status: {
        type: DataTypes.ENUM('scheduled', 'in_progress', 'completed', 'cancelled', 'delayed'),
        allowNull: false,
        defaultValue: 'scheduled'
      },
      distance_km: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: true
      },
      fuel_consumption_liters: {
        type: DataTypes.DECIMAL(6, 2),
        allowNull: true
      },
      odometer_start: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      odometer_end: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      temperature_required: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      temperature_min: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true
      },
      temperature_max: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true
      },
      client_name: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      client_contact: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      client_phone: {
        type: DataTypes.STRING(20),
        allowNull: true
      },
      delivery_instructions: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      priority: {
        type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
        allowNull: false,
        defaultValue: 'normal'
      },
      toll_cost: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: true
      },
      other_expenses: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: true
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      incidents: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      delivery_confirmation: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      signature_url: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    });

    // Crear tabla checklist_responses
    await queryInterface.createTable('checklist_responses', {
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
        },
        onDelete: 'CASCADE'
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
        allowNull: true
      },
      response_numeric: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
      },
      response_boolean: {
        type: DataTypes.BOOLEAN,
        allowNull: true
      },
      response_json: {
        type: DataTypes.JSON,
        allowNull: true
      },
      photo_urls: {
        type: DataTypes.JSON,
        allowNull: true
      },
      signature_url: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      comments: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      location_lat: {
        type: DataTypes.DECIMAL(10, 7),
        allowNull: true
      },
      location_lng: {
        type: DataTypes.DECIMAL(10, 7),
        allowNull: true
      },
      location_address: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      response_timestamp: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      is_compliant: {
        type: DataTypes.BOOLEAN,
        allowNull: true
      },
      requires_followup: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      followup_notes: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      reviewed_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      reviewed_at: {
        type: DataTypes.DATE,
        allowNull: true
      },
      review_status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected', 'needs_clarification'),
        defaultValue: 'pending'
      },
      review_comments: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    });

    // Crear resto de tablas con estructura simplificada
    await queryInterface.createTable('maintenances', {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      vehicle_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'vehicles', key: 'id' } },
      mechanic_id: { type: DataTypes.UUID, allowNull: true, references: { model: 'users', key: 'id' } },
      type: { type: DataTypes.ENUM('preventive', 'corrective', 'emergency', 'inspection'), allowNull: false },
      status: { type: DataTypes.ENUM('scheduled', 'in_progress', 'completed', 'cancelled', 'postponed'), allowNull: false, defaultValue: 'scheduled' },
      priority: { type: DataTypes.ENUM('low', 'normal', 'high', 'critical'), allowNull: false, defaultValue: 'normal' },
      title: { type: DataTypes.STRING(200), allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: true },
      scheduled_date: { type: DataTypes.DATE, allowNull: false },
      completed_at: { type: DataTypes.DATE, allowNull: true },
      actual_cost: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
      notes: { type: DataTypes.TEXT, allowNull: true },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
    });

    await queryInterface.createTable('documents', {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      vehicle_id: { type: DataTypes.UUID, allowNull: true, references: { model: 'vehicles', key: 'id' } },
      user_id: { type: DataTypes.UUID, allowNull: true, references: { model: 'users', key: 'id' } },
      type: { type: DataTypes.ENUM('insurance', 'permit', 'inspection', 'license', 'registration', 'certificate', 'other'), allowNull: false },
      title: { type: DataTypes.STRING(200), allowNull: false },
      file_url: { type: DataTypes.TEXT, allowNull: false },
      file_name: { type: DataTypes.STRING(255), allowNull: false },
      expiry_date: { type: DataTypes.DATE, allowNull: true },
      status: { type: DataTypes.ENUM('active', 'expired', 'expiring_soon', 'cancelled'), allowNull: false, defaultValue: 'active' },
      notes: { type: DataTypes.TEXT, allowNull: true },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
    });

    await queryInterface.createTable('shifts', {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      user_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'users', key: 'id' } },
      shift_date: { type: DataTypes.DATEONLY, allowNull: false },
      shift_type: { type: DataTypes.ENUM('morning', 'afternoon', 'night', 'full_day'), allowNull: false, defaultValue: 'full_day' },
      scheduled_start: { type: DataTypes.TIME, allowNull: false },
      scheduled_end: { type: DataTypes.TIME, allowNull: false },
      actual_start: { type: DataTypes.TIME, allowNull: true },
      actual_end: { type: DataTypes.TIME, allowNull: true },
      status: { type: DataTypes.ENUM('scheduled', 'in_progress', 'completed', 'absent', 'cancelled'), allowNull: false, defaultValue: 'scheduled' },
      notes: { type: DataTypes.TEXT, allowNull: true },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
    });

    await queryInterface.createTable('photos', {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      trip_id: { type: DataTypes.UUID, allowNull: true, references: { model: 'trips', key: 'id' } },
      maintenance_id: { type: DataTypes.UUID, allowNull: true, references: { model: 'maintenances', key: 'id' } },
      vehicle_id: { type: DataTypes.UUID, allowNull: true, references: { model: 'vehicles', key: 'id' } },
      taken_by: { type: DataTypes.UUID, allowNull: false, references: { model: 'users', key: 'id' } },
      type: { type: DataTypes.ENUM('pre_trip', 'during_trip', 'post_trip', 'maintenance', 'damage', 'cargo', 'general'), allowNull: false },
      title: { type: DataTypes.STRING(200), allowNull: true },
      file_url: { type: DataTypes.TEXT, allowNull: false },
      file_name: { type: DataTypes.STRING(255), allowNull: false },
      taken_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      is_verified: { type: DataTypes.BOOLEAN, defaultValue: false },
      notes: { type: DataTypes.TEXT, allowNull: true },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
    });

    console.log('✅ Todas las tablas creadas exitosamente');
  },

  async down(queryInterface) {
    const tables = [
      'photos', 'checklist_responses', 'checklist_items', 'checklists',
      'shifts', 'documents', 'maintenances', 'trips', 'vehicles', 'users'
    ];

    for (const table of tables) {
      await queryInterface.dropTable(table);
    }
    
    console.log('✅ Todas las tablas eliminadas');
  }
};