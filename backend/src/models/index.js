const { Sequelize } = require('sequelize');
const config = require('../../database/config')[process.env.NODE_ENV || 'development'];

// Inicializar Sequelize
let sequelize;
if (config.use_env_variable) {
  // En producción, usar DATABASE_URL directamente
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  // En desarrollo, usar credenciales individuales
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
}

// Importar modelos
const User = require('./User')(sequelize, Sequelize.DataTypes);
const Vehicle = require('./Vehicle')(sequelize, Sequelize.DataTypes);
const Trip = require('./Trip')(sequelize, Sequelize.DataTypes);
const Checklist = require('./Checklist')(sequelize, Sequelize.DataTypes);
const ChecklistItem = require('./ChecklistItem')(sequelize, Sequelize.DataTypes);
const ChecklistResponse = require('./ChecklistResponse')(sequelize, Sequelize.DataTypes);
const Maintenance = require('./Maintenance')(sequelize, Sequelize.DataTypes);
const Document = require('./Document')(sequelize, Sequelize.DataTypes);
const Shift = require('./Shift')(sequelize, Sequelize.DataTypes);
const Photo = require('./Photo')(sequelize, Sequelize.DataTypes);
const AuditLog = require('./AuditLog')(sequelize, Sequelize.DataTypes);
const FuelLoad = require('./FuelLoad')(sequelize, Sequelize.DataTypes);
const TripEvent = require('./TripEvent')(sequelize, Sequelize.DataTypes);

// Definir asociaciones
const db = {
  sequelize,
  Sequelize,
  User,
  Vehicle,
  Trip,
  Checklist,
  ChecklistItem,
  ChecklistResponse,
  Maintenance,
  Document,
  Shift,
  Photo,
  AuditLog,
  FuelLoad,
  TripEvent
};

// === ASOCIACIONES ===

// Usuario asociaciones
User.hasMany(Trip, { 
  foreignKey: 'driver_id', 
  as: 'trips_as_driver' 
});
User.hasMany(Trip, { 
  foreignKey: 'supervisor_id', 
  as: 'trips_as_supervisor' 
});
User.hasMany(Shift, { 
  foreignKey: 'user_id', 
  as: 'shifts' 
});
User.hasMany(Maintenance, { 
  foreignKey: 'mechanic_id', 
  as: 'maintenances' 
});

// Vehículo asociaciones  
Vehicle.hasMany(Trip, { 
  foreignKey: 'vehicle_id', 
  as: 'trips' 
});
Vehicle.hasMany(Maintenance, { 
  foreignKey: 'vehicle_id', 
  as: 'maintenances' 
});
Vehicle.hasMany(Document, { 
  foreignKey: 'vehicle_id', 
  as: 'documents' 
});

// Viaje asociaciones
Trip.belongsTo(User, { 
  foreignKey: 'driver_id', 
  as: 'driver' 
});
Trip.belongsTo(User, { 
  foreignKey: 'supervisor_id', 
  as: 'supervisor' 
});
Trip.belongsTo(Vehicle, { 
  foreignKey: 'vehicle_id', 
  as: 'vehicle' 
});
Trip.hasMany(ChecklistResponse, { 
  foreignKey: 'trip_id', 
  as: 'checklist_responses' 
});
Trip.hasMany(Photo, { 
  foreignKey: 'trip_id', 
  as: 'photos' 
});

// Checklist asociaciones
Checklist.hasMany(ChecklistItem, { 
  foreignKey: 'checklist_id', 
  as: 'items' 
});

// ChecklistItem asociaciones
ChecklistItem.belongsTo(Checklist, { 
  foreignKey: 'checklist_id', 
  as: 'checklist' 
});
ChecklistItem.hasMany(ChecklistResponse, { 
  foreignKey: 'checklist_item_id', 
  as: 'responses' 
});

// ChecklistResponse asociaciones
ChecklistResponse.belongsTo(Trip, { 
  foreignKey: 'trip_id', 
  as: 'trip' 
});
ChecklistResponse.belongsTo(ChecklistItem, { 
  foreignKey: 'checklist_item_id', 
  as: 'checklist_item' 
});

// Mantenimiento asociaciones
Maintenance.belongsTo(Vehicle, { 
  foreignKey: 'vehicle_id', 
  as: 'vehicle' 
});
Maintenance.belongsTo(User, { 
  foreignKey: 'mechanic_id', 
  as: 'mechanic' 
});

// Documento asociaciones
Document.belongsTo(Vehicle, { 
  foreignKey: 'vehicle_id', 
  as: 'vehicle' 
});
Document.belongsTo(User, { 
  foreignKey: 'user_id', 
  as: 'user' 
});

// Turno asociaciones
Shift.belongsTo(User, { 
  foreignKey: 'user_id', 
  as: 'user' 
});

// Foto asociaciones
Photo.belongsTo(Trip, { 
  foreignKey: 'trip_id', 
  as: 'trip' 
});

// FuelLoad asociaciones
FuelLoad.belongsTo(User, { foreignKey: 'driver_id', as: 'driver' });
FuelLoad.belongsTo(Vehicle, { foreignKey: 'vehicle_id', as: 'vehicle' });
FuelLoad.belongsTo(Trip, { foreignKey: 'trip_id', as: 'trip' });

User.hasMany(FuelLoad, { foreignKey: 'driver_id', as: 'fuel_loads' });
Vehicle.hasMany(FuelLoad, { foreignKey: 'vehicle_id', as: 'fuel_loads' });
Trip.hasMany(FuelLoad, { foreignKey: 'trip_id', as: 'fuel_loads' });

// TripEvent asociaciones
TripEvent.belongsTo(Trip, { foreignKey: 'trip_id', as: 'trip' });
TripEvent.belongsTo(User, { foreignKey: 'reported_by', as: 'reporter' });
Trip.hasMany(TripEvent, { foreignKey: 'trip_id', as: 'events' });

module.exports = db;