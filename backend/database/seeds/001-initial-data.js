const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Función auxiliar para generar UUIDs determinísticos para desarrollo
const generateUUID = (seed) => {
  // Para desarrollo, generar UUIDs basados en seeds para consistencia
  const crypto = require('crypto');
  const hash = crypto.createHash('sha256').update(seed).digest('hex');
  return `${hash.substring(0, 8)}-${hash.substring(8, 12)}-${hash.substring(12, 16)}-${hash.substring(16, 20)}-${hash.substring(20, 32)}`;
};

module.exports = {
  async up(queryInterface) {
    console.log('🌱 Sembrando datos iniciales para S.C.O.T.A...');

    // IDs predefinidos para referencias consistentes
    const adminId = generateUUID('admin-user');
    const supervisorId = generateUUID('supervisor-user');
    const driver1Id = generateUUID('driver1-user');
    const driver2Id = generateUUID('driver2-user');
    const mechanicId = generateUUID('mechanic-user');

    const vehicle1Id = generateUUID('vehicle-truck1');
    const vehicle2Id = generateUUID('vehicle-refrigerated1');
    const vehicle3Id = generateUUID('vehicle-pickup1');

    const checklist1Id = generateUUID('checklist-pretrip');
    const checklist2Id = generateUUID('checklist-posttrip');
    const checklist3Id = generateUUID('checklist-refrigerated');

    // === USUARIOS ===
    await queryInterface.bulkInsert('users', [
      {
        id: adminId,
        username: 'admin',
        email: 'admin@cotraq.com',
        password: await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10),
        first_name: 'Administrador',
        last_name: 'Sistema',
        role: 'admin',
        employee_id: 'ADM001',
        phone: '+56912345678',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: supervisorId,
        username: 'supervisor1',
        email: 'supervisor@cotraq.com',
        password: await bcrypt.hash('super123', 10),
        first_name: 'Carlos',
        last_name: 'Supervisor',
        role: 'supervisor',
        employee_id: 'SUP001',
        phone: '+56987654321',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: driver1Id,
        username: 'conductor1',
        email: 'conductor1@cotraq.com',
        password: await bcrypt.hash('driver123', 10),
        first_name: 'Juan',
        last_name: 'Pérez',
        role: 'driver',
        employee_id: 'DRV001',
        phone: '+56911111111',
        license_number: 'A1-12345678',
        license_expiry: new Date('2025-12-31'),
        is_active: true,
        emergency_contact_name: 'María Pérez',
        emergency_contact_phone: '+56922222222',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: driver2Id,
        username: 'conductor2',
        email: 'conductor2@cotraq.com',
        password: await bcrypt.hash('driver123', 10),
        first_name: 'Pedro',
        last_name: 'González',
        role: 'driver',
        employee_id: 'DRV002',
        phone: '+56933333333',
        license_number: 'A1-87654321',
        license_expiry: new Date('2026-06-30'),
        is_active: true,
        emergency_contact_name: 'Ana González',
        emergency_contact_phone: '+56944444444',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: mechanicId,
        username: 'mecanico1',
        email: 'mecanico@cotraq.com',
        password: await bcrypt.hash('mech123', 10),
        first_name: 'Luis',
        last_name: 'Mecánico',
        role: 'mechanic',
        employee_id: 'MEC001',
        phone: '+56955555555',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // === VEHÍCULOS ===
    await queryInterface.bulkInsert('vehicles', [
      {
        id: vehicle1Id,
        license_plate: 'COTR01',
        brand: 'Volvo',
        model: 'FH16',
        year: 2022,
        type: 'truck',
        capacity_kg: 25000.00,
        capacity_m3: 80.00,
        fuel_type: 'diesel',
        vin: 'YV2A2A1C5DA123456',
        odometer: 45000,
        status: 'active',
        insurance_company: 'Seguros Chile',
        insurance_policy: 'POL-2024-001',
        insurance_expiry: new Date('2024-12-31'),
        inspection_expiry: new Date('2024-11-15'),
        permit_expiry: new Date('2024-10-31'),
        has_gps: true,
        has_temperature_control: false,
        acquisition_date: new Date('2022-01-15'),
        acquisition_cost: 45000000.00,
        color: 'Blanco',
        notes: 'Vehículo principal para transporte de alimento',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: vehicle2Id,
        license_plate: 'COTR02',
        brand: 'Mercedes-Benz',
        model: 'Actros',
        year: 2021,
        type: 'refrigerated',
        capacity_kg: 20000.00,
        capacity_m3: 60.00,
        fuel_type: 'diesel',
        vin: 'WDB9442361L123456',
        odometer: 62000,
        status: 'active',
        insurance_company: 'Seguros Chile',
        insurance_policy: 'POL-2024-002',
        insurance_expiry: new Date('2024-12-31'),
        inspection_expiry: new Date('2024-11-20'),
        permit_expiry: new Date('2024-10-31'),
        has_gps: true,
        has_temperature_control: true,
        temperature_range_min: -5.00,
        temperature_range_max: 4.00,
        acquisition_date: new Date('2021-03-10'),
        acquisition_cost: 52000000.00,
        color: 'Azul',
        notes: 'Vehículo refrigerado para producto terminado',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: vehicle3Id,
        license_plate: 'COTR03',
        brand: 'Ford',
        model: 'F-150',
        year: 2023,
        type: 'pickup',
        capacity_kg: 3000.00,
        capacity_m3: 15.00,
        fuel_type: 'gasoline',
        vin: '1FTFW1E58EFA12345',
        odometer: 15000,
        status: 'active',
        insurance_company: 'Seguros Chile',
        insurance_policy: 'POL-2024-003',
        insurance_expiry: new Date('2024-12-31'),
        inspection_expiry: new Date('2024-12-01'),
        permit_expiry: new Date('2024-10-31'),
        has_gps: true,
        has_temperature_control: false,
        acquisition_date: new Date('2023-05-20'),
        acquisition_cost: 18000000.00,
        color: 'Gris',
        notes: 'Vehículo para entregas locales y transporte de choritos',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // === CHECKLISTS ===
    await queryInterface.bulkInsert('checklists', [
      {
        id: checklist1Id,
        name: 'Revisión Pre-Viaje General',
        description: 'Checklist completo antes de iniciar cualquier viaje',
        type: 'pre_trip',
        cargo_type: 'general',
        vehicle_type: 'all',
        is_mandatory: true,
        is_active: true,
        version: '1.0',
        instructions: 'Completar todas las verificaciones antes de iniciar el viaje. Cualquier problema debe reportarse inmediatamente.',
        estimated_duration_minutes: 15,
        requires_photo_evidence: true,
        created_by: adminId,
        approved_by: adminId,
        approved_at: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: checklist2Id,
        name: 'Revisión Post-Viaje General',
        description: 'Checklist al finalizar el viaje',
        type: 'post_trip',
        cargo_type: 'general',
        vehicle_type: 'all',
        is_mandatory: true,
        is_active: true,
        version: '1.0',
        instructions: 'Completar inmediatamente después de finalizar el viaje.',
        estimated_duration_minutes: 10,
        requires_photo_evidence: false,
        created_by: adminId,
        approved_by: adminId,
        approved_at: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: checklist3Id,
        name: 'Control de Temperatura - Producto Terminado',
        description: 'Verificaciones especiales para transporte refrigerado',
        type: 'during_trip',
        cargo_type: 'producto_terminado',
        vehicle_type: 'refrigerated',
        is_mandatory: true,
        is_active: true,
        version: '1.0',
        instructions: 'Verificar temperatura cada 2 horas durante el transporte.',
        estimated_duration_minutes: 5,
        requires_photo_evidence: true,
        created_by: adminId,
        approved_by: adminId,
        approved_at: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // === ITEMS DE CHECKLIST ===
    const checklistItems = [];
    
    // Items para Pre-Viaje General
    const preViajeItems = [
      { question: '¿Están funcionando correctamente las luces delanteras y traseras?', category: 'luces', order: 1 },
      { question: '¿Los neumáticos están en buen estado y con presión adecuada?', category: 'neumaticos', order: 2, is_critical: true },
      { question: '¿El nivel de aceite del motor está en el rango correcto?', category: 'motor', order: 3 },
      { question: '¿El nivel de combustible es suficiente para el viaje?', category: 'combustible', order: 4, is_critical: true },
      { question: '¿Los frenos responden correctamente?', category: 'frenos', order: 5, is_critical: true },
      { question: '¿La documentación del vehículo está completa y vigente?', category: 'documentos', order: 6, requires_photo: true },
      { question: '¿El kit de emergencias está completo?', category: 'seguridad', order: 7 },
      { question: 'Observaciones adicionales', type: 'text', category: 'general', order: 8, is_required: false }
    ];

    preViajeItems.forEach(item => {
      checklistItems.push({
        id: generateUUID(`pretrip-${item.order}`),
        checklist_id: checklist1Id,
        question: item.question,
        type: item.type || 'yes_no',
        is_required: item.is_required !== false,
        order_index: item.order,
        category: item.category,
        is_critical: item.is_critical || false,
        requires_photo: item.requires_photo || false,
        created_at: new Date(),
        updated_at: new Date()
      });
    });

    // Items para Post-Viaje General
    const postViajeItems = [
      { question: '¿Se entregó toda la carga según las instrucciones?', category: 'entrega', order: 1 },
      { question: '¿Se obtuvo la firma de recepción del cliente?', category: 'entrega', order: 2, requires_photo: true },
      { question: '¿El vehículo presenta algún daño nuevo?', category: 'vehiculo', order: 3 },
      { question: 'Kilometraje final', type: 'number', category: 'kilometraje', order: 4 },
      { question: '¿Ocurrió algún incidente durante el viaje?', category: 'incidentes', order: 5 },
      { question: 'Descripción de incidentes (si los hubo)', type: 'text', category: 'incidentes', order: 6, is_required: false }
    ];

    postViajeItems.forEach(item => {
      checklistItems.push({
        id: generateUUID(`posttrip-${item.order}`),
        checklist_id: checklist2Id,
        question: item.question,
        type: item.type || 'yes_no',
        is_required: item.is_required !== false,
        order_index: item.order,
        category: item.category,
        is_critical: item.is_critical || false,
        requires_photo: item.requires_photo || false,
        created_at: new Date(),
        updated_at: new Date()
      });
    });

    // Items para Control de Temperatura
    const tempItems = [
      { question: 'Temperatura actual del compartimento (°C)', type: 'number', category: 'temperatura', order: 1, validation_rules: { min: -10, max: 10 } },
      { question: '¿La temperatura está dentro del rango permitido (-5°C a 4°C)?', category: 'temperatura', order: 2, is_critical: true },
      { question: '¿El sistema de refrigeración funciona correctamente?', category: 'refrigeracion', order: 3, is_critical: true },
      { question: 'Ubicación actual del vehículo', type: 'text', category: 'ubicacion', order: 4 }
    ];

    tempItems.forEach(item => {
      checklistItems.push({
        id: generateUUID(`temp-${item.order}`),
        checklist_id: checklist3Id,
        question: item.question,
        type: item.type || 'yes_no',
        is_required: item.is_required !== false,
        order_index: item.order,
        category: item.category,
        is_critical: item.is_critical || false,
        requires_photo: item.requires_photo || false,
        validation_rules: item.validation_rules ? JSON.stringify(item.validation_rules) : null,
        created_at: new Date(),
        updated_at: new Date()
      });
    });

    await queryInterface.bulkInsert('checklist_items', checklistItems);

    // === VIAJES DE EJEMPLO ===
    const trip1Id = generateUUID('trip-alimento-1');
    const trip2Id = generateUUID('trip-producto-1');

    await queryInterface.bulkInsert('trips', [
      {
        id: trip1Id,
        trip_number: 'VI20240213001',
        driver_id: driver1Id,
        vehicle_id: vehicle1Id,
        supervisor_id: supervisorId,
        cargo_type: 'alimento',
        cargo_description: 'Alimento balanceado para salmones - 20 toneladas',
        cargo_weight_kg: 20000.00,
        cargo_volume_m3: 45.00,
        origin_address: 'Planta Alimentos COTRAQ, Puerto Montt',
        destination_address: 'Centro de Cultivo Isla Grande, Chiloé',
        scheduled_start: new Date('2024-02-13 08:00:00'),
        scheduled_end: new Date('2024-02-13 16:00:00'),
        status: 'scheduled',
        priority: 'normal',
        client_name: 'AquaChile S.A.',
        client_contact: 'Roberto Silva',
        client_phone: '+56965432112',
        delivery_instructions: 'Descargar en bodega principal. Coordinar con encargado.',
        temperature_required: false,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: trip2Id,
        trip_number: 'VI20240213002',
        driver_id: driver2Id,
        vehicle_id: vehicle2Id,
        supervisor_id: supervisorId,
        cargo_type: 'producto_terminado',
        cargo_description: 'Salmón fresco procesado - 15 toneladas',
        cargo_weight_kg: 15000.00,
        cargo_volume_m3: 35.00,
        origin_address: 'Planta de Proceso COTRAQ, Puerto Varas',
        destination_address: 'Aeropuerto El Tepual, Puerto Montt',
        scheduled_start: new Date('2024-02-13 14:00:00'),
        scheduled_end: new Date('2024-02-13 18:00:00'),
        status: 'scheduled',
        priority: 'high',
        client_name: 'Exportadora del Sur',
        client_contact: 'Carmen Peña',
        client_phone: '+56987654321',
        delivery_instructions: 'Entrega en cámara fría del aeropuerto. Vuelo LAN 456.',
        temperature_required: true,
        temperature_min: -2.00,
        temperature_max: 2.00,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // === TURNOS DE EJEMPLO ===
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    await queryInterface.bulkInsert('shifts', [
      {
        id: generateUUID('shift-driver1-today'),
        user_id: driver1Id,
        shift_date: today.toISOString().split('T')[0],
        shift_type: 'full_day',
        scheduled_start: '08:00:00',
        scheduled_end: '18:00:00',
        status: 'scheduled',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: generateUUID('shift-driver2-today'),
        user_id: driver2Id,
        shift_date: today.toISOString().split('T')[0],
        shift_type: 'full_day',
        scheduled_start: '07:00:00',
        scheduled_end: '17:00:00',
        status: 'scheduled',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: generateUUID('shift-driver1-tomorrow'),
        user_id: driver1Id,
        shift_date: tomorrow.toISOString().split('T')[0],
        shift_type: 'morning',
        scheduled_start: '06:00:00',
        scheduled_end: '14:00:00',
        status: 'scheduled',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    console.log('✅ Datos iniciales sembrados correctamente');
    console.log('');
    console.log('👤 Usuarios creados:');
    console.log('   - admin@cotraq.com / admin123 (Administrador)');
    console.log('   - supervisor@cotraq.com / super123 (Supervisor)');
    console.log('   - conductor1@cotraq.com / driver123 (Conductor)');
    console.log('   - conductor2@cotraq.com / driver123 (Conductor)');
    console.log('   - mecanico@cotraq.com / mech123 (Mecánico)');
    console.log('');
    console.log('🚚 Vehículos: 3 vehículos (camión, refrigerado, pickup)');
    console.log('📋 Checklists: 3 checklists (pre-viaje, post-viaje, temperatura)');
    console.log('🛣  Viajes: 2 viajes de ejemplo programados');
    console.log('⏰ Turnos: Turnos para hoy y mañana');
  },

  async down(queryInterface) {
    const tables = ['shifts', 'trips', 'checklist_items', 'checklists', 'vehicles', 'users'];
    
    for (const table of tables) {
      await queryInterface.bulkDelete(table, null, {});
    }
    
    console.log('✅ Todos los datos de prueba eliminados');
  }
};