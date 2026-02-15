module.exports = (sequelize, DataTypes) => {
  const Shift = sequelize.define('Shift', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    shift_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: 'Fecha del turno'
    },
    shift_type: {
      type: DataTypes.ENUM('morning', 'afternoon', 'night', 'full_day', 'split', 'on_call'),
      allowNull: false,
      defaultValue: 'full_day',
      comment: 'Tipo de turno'
    },
    scheduled_start: {
      type: DataTypes.TIME,
      allowNull: false,
      comment: 'Hora programada de inicio'
    },
    scheduled_end: {
      type: DataTypes.TIME,
      allowNull: false,
      comment: 'Hora programada de fin'
    },
    actual_start: {
      type: DataTypes.TIME,
      allowNull: true,
      comment: 'Hora real de inicio'
    },
    actual_end: {
      type: DataTypes.TIME,
      allowNull: true,
      comment: 'Hora real de fin'
    },
    break_start: {
      type: DataTypes.TIME,
      allowNull: true,
      comment: 'Inicio de descanso'
    },
    break_end: {
      type: DataTypes.TIME,
      allowNull: true,
      comment: 'Fin de descanso'
    },
    status: {
      type: DataTypes.ENUM('scheduled', 'in_progress', 'completed', 'absent', 'cancelled', 'late'),
      allowNull: false,
      defaultValue: 'scheduled'
    },
    location_checkin: {
      type: DataTypes.GEOMETRY('POINT'),
      allowNull: true,
      comment: 'Ubicación de check-in'
    },
    location_checkout: {
      type: DataTypes.GEOMETRY('POINT'),
      allowNull: true,
      comment: 'Ubicación de check-out'
    },
    checkin_address: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Dirección de check-in'
    },
    checkout_address: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Dirección de check-out'
    },
    regular_hours: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      comment: 'Horas regulares trabajadas'
    },
    overtime_hours: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      comment: 'Horas extras trabajadas'
    },
    break_duration_minutes: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Duración del descanso en minutos'
    },
    hourly_rate: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: true,
      comment: 'Tarifa por hora'
    },
    overtime_rate: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: true,
      comment: 'Tarifa horas extras'
    },
    total_pay: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Pago total del turno'
    },
    supervisor_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      comment: 'Supervisor del turno'
    },
    department: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Departamento o área de trabajo'
    },
    vehicle_assigned: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'vehicles',
        key: 'id'
      },
      comment: 'Vehículo asignado para el turno'
    },
    route_assigned: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Ruta asignada'
    },
    tasks_assigned: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Lista de tareas asignadas'
    },
    tasks_completed: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Lista de tareas completadas'
    },
    performance_rating: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 5
      },
      comment: 'Calificación del desempeño (1-5)'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Notas del turno'
    },
    incidents: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Incidentes reportados'
    },
    weather_conditions: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Condiciones climáticas'
    },
    approved_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      comment: 'Aprobado por'
    },
    approved_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Fecha de aprobación'
    }
  }, {
    tableName: 'shifts',
    indexes: [
      {
        fields: ['user_id']
      },
      {
        fields: ['shift_date']
      },
      {
        fields: ['shift_type']
      },
      {
        fields: ['status']
      },
      {
        fields: ['supervisor_id']
      },
      {
        fields: ['vehicle_assigned']
      },
      {
        unique: true,
        fields: ['user_id', 'shift_date', 'shift_type']
      }
    ]
  });

  // Métodos de instancia
  Shift.prototype.checkIn = async function(location, address) {
    this.actual_start = new Date().toTimeString().slice(0, 8);
    this.status = 'in_progress';
    if (location) this.location_checkin = location;
    if (address) this.checkin_address = address;
    
    // Evaluar si llegó tarde
    const scheduled = new Date(`1970-01-01T${this.scheduled_start}`);
    const actual = new Date(`1970-01-01T${this.actual_start}`);
    
    if (actual > scheduled) {
      this.status = 'late';
    }
    
    return await this.save();
  };

  Shift.prototype.checkOut = async function(location, address) {
    this.actual_end = new Date().toTimeString().slice(0, 8);
    this.status = 'completed';
    if (location) this.location_checkout = location;
    if (address) this.checkout_address = address;
    
    this.calculateHours();
    return await this.save();
  };

  Shift.prototype.startBreak = async function() {
    this.break_start = new Date().toTimeString().slice(0, 8);
    return await this.save();
  };

  Shift.prototype.endBreak = async function() {
    this.break_end = new Date().toTimeString().slice(0, 8);
    this.calculateBreakDuration();
    return await this.save();
  };

  Shift.prototype.calculateHours = function() {
    if (!this.actual_start || !this.actual_end) return;

    const start = new Date(`1970-01-01T${this.actual_start}`);
    const end = new Date(`1970-01-01T${this.actual_end}`);
    const scheduled_start = new Date(`1970-01-01T${this.scheduled_start}`);
    const scheduled_end = new Date(`1970-01-01T${this.scheduled_end}`);
    
    // Calcular horas totales trabajadas
    let totalMinutes = (end - start) / (1000 * 60);
    
    // Restar tiempo de descanso
    if (this.break_duration_minutes) {
      totalMinutes -= this.break_duration_minutes;
    }
    
    const totalHours = totalMinutes / 60;
    const scheduledHours = (scheduled_end - scheduled_start) / (1000 * 60 * 60);
    
    // Calcular horas regulares y extras
    if (totalHours <= scheduledHours) {
      this.regular_hours = Math.round(totalHours * 100) / 100;
      this.overtime_hours = 0;
    } else {
      this.regular_hours = Math.round(scheduledHours * 100) / 100;
      this.overtime_hours = Math.round((totalHours - scheduledHours) * 100) / 100;
    }
    
    // Calcular pago total
    this.calculatePay();
  };

  Shift.prototype.calculateBreakDuration = function() {
    if (!this.break_start || !this.break_end) return;
    
    const start = new Date(`1970-01-01T${this.break_start}`);
    const end = new Date(`1970-01-01T${this.break_end}`);
    
    this.break_duration_minutes = (end - start) / (1000 * 60);
  };

  Shift.prototype.calculatePay = function() {
    if (!this.hourly_rate || !this.regular_hours) return;
    
    let total = this.regular_hours * this.hourly_rate;
    
    if (this.overtime_hours && this.overtime_rate) {
      total += this.overtime_hours * this.overtime_rate;
    }
    
    this.total_pay = Math.round(total * 100) / 100;
  };

  Shift.prototype.isLate = function() {
    if (!this.actual_start) return false;
    
    const scheduled = new Date(`1970-01-01T${this.scheduled_start}`);
    const actual = new Date(`1970-01-01T${this.actual_start}`);
    
    return actual > scheduled;
  };

  Shift.prototype.approve = async function(approvedBy) {
    this.approved_by = approvedBy;
    this.approved_at = new Date();
    return await this.save();
  };

  // Métodos estáticos
  Shift.getByUser = async function(userId, dateFrom, dateTo) {
    const whereClause = { user_id: userId };
    
    if (dateFrom && dateTo) {
      whereClause.shift_date = {
        [sequelize.Sequelize.Op.between]: [dateFrom, dateTo]
      };
    }
    
    return await this.findAll({
      where: whereClause,
      include: [
        { model: sequelize.models.User, as: 'supervisor' },
        { model: sequelize.models.Vehicle, as: 'vehicle_assigned' }
      ],
      order: [['shift_date', 'DESC']]
    });
  };

  Shift.getByDate = async function(date) {
    return await this.findAll({
      where: { shift_date: date },
      include: [
        { model: sequelize.models.User, as: 'user' },
        { model: sequelize.models.User, as: 'supervisor' },
        { model: sequelize.models.Vehicle, as: 'vehicle_assigned' }
      ],
      order: [['scheduled_start', 'ASC']]
    });
  };

  Shift.getActiveShifts = async function() {
    return await this.findAll({
      where: {
        shift_date: new Date().toISOString().split('T')[0],
        status: ['in_progress', 'late']
      },
      include: [
        { model: sequelize.models.User, as: 'user' },
        { model: sequelize.models.Vehicle, as: 'vehicle_assigned' }
      ]
    });
  };

  Shift.getLateShifts = async function(date = null) {
    const whereClause = { status: 'late' };
    
    if (date) {
      whereClause.shift_date = date;
    } else {
      whereClause.shift_date = new Date().toISOString().split('T')[0];
    }
    
    return await this.findAll({
      where: whereClause,
      include: [
        { model: sequelize.models.User, as: 'user' },
        { model: sequelize.models.User, as: 'supervisor' }
      ]
    });
  };

  Shift.getPayrollData = async function(dateFrom, dateTo, userId = null) {
    const whereClause = {
      shift_date: {
        [sequelize.Sequelize.Op.between]: [dateFrom, dateTo]
      },
      status: 'completed'
    };
    
    if (userId) whereClause.user_id = userId;
    
    return await this.findAll({
      where: whereClause,
      attributes: [
        'user_id',
        [sequelize.fn('SUM', sequelize.col('regular_hours')), 'total_regular_hours'],
        [sequelize.fn('SUM', sequelize.col('overtime_hours')), 'total_overtime_hours'],
        [sequelize.fn('SUM', sequelize.col('total_pay')), 'total_pay'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'shifts_count']
      ],
      include: [
        { model: sequelize.models.User, as: 'user', attributes: ['first_name', 'last_name', 'employee_id'] }
      ],
      group: ['user_id', 'user.id'],
      raw: false
    });
  };

  Shift.createSchedule = async function(userId, startDate, endDate, shiftPattern) {
    const shifts = [];
    let currentDate = new Date(startDate);
    const end = new Date(endDate);
    
    while (currentDate <= end) {
      const dayOfWeek = currentDate.getDay();
      
      if (shiftPattern[dayOfWeek]) {
        const shift = await this.create({
          user_id: userId,
          shift_date: currentDate.toISOString().split('T')[0],
          shift_type: shiftPattern[dayOfWeek].type,
          scheduled_start: shiftPattern[dayOfWeek].start,
          scheduled_end: shiftPattern[dayOfWeek].end,
          hourly_rate: shiftPattern[dayOfWeek].hourly_rate,
          overtime_rate: shiftPattern[dayOfWeek].overtime_rate
        });
        
        shifts.push(shift);
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return shifts;
  };

  return Shift;
};