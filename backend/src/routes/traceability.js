const express = require('express');
const { Trip, TripEvent, User, Vehicle, FuelLoad, Checklist, Document, Sequelize } = require('../models');
const { authenticateToken, requireSupervisor } = require('../middleware/auth');
const router = express.Router();
const { Op } = Sequelize;

router.use(authenticateToken);

/**
 * GET /api/traceability/trip/:id
 * Reporte completo de trazabilidad de un viaje
 * Consolida: Detalles del viaje, Eventos, Cargas de Combustible, Checklist, Documentos
 */
router.get('/trip/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const trip = await Trip.findByPk(id, {
      include: [
        { 
          model: User, 
          as: 'driver', 
          attributes: ['id', 'first_name', 'last_name', 'phone', 'license_number'] 
        },
        { 
          model: Vehicle, 
          as: 'vehicle', 
          attributes: ['id', 'license_plate', 'brand', 'model', 'fuel_type'] 
        },
        {
          model: TripEvent,
          as: 'events',
          include: [
            { model: User, as: 'reporter', attributes: ['first_name', 'last_name'] }
          ]
        },
        {
          model: FuelLoad,
          as: 'fuel_loads'
        },
        // Checklists asociados al vehículo en el rango de fecha del viaje
        // (Nota: Esto requeriría una relación directa Trip->Checklist o inferirla por fechas)
      ]
    });

    if (!trip) {
      return res.status(404).json({ error: 'Viaje no encontrado' });
    }

    // Buscar checklists relacionados (aprox. por fecha o si existiera asociación)
    // Asumimos que queremos ver checklists hechos +- 12 horas del inicio/fin del viaje por ese conductor/vehículo
    const checklists = await Checklist.findAll({
      where: {
        vehicle_id: trip.vehicle_id,
        driver_id: trip.driver_id,
        created_at: {
          [Op.between]: [
            new Date(new Date(trip.scheduled_start).getTime() - 12 * 60 * 60 * 1000),
            new Date(new Date(trip.scheduled_end || trip.scheduled_start).getTime() + 12 * 60 * 60 * 1000)
          ]
        }
      },
      order: [['created_at', 'ASC']]
    });

    // Construir línea de tiempo unificada
    let timeline = [];

    // 1. Agregar eventos del viaje
    if (trip.events) {
      timeline = timeline.concat(trip.events.map(e => ({
        type: 'event',
        category: e.type,
        timestamp: e.timestamp,
        title: `Evento: ${e.type}`,
        details: e.description,
        data: e
      })));
    }

    // 2. Agregar cargas de combustible
    if (trip.fuel_loads) {
      timeline = timeline.concat(trip.fuel_loads.map(f => ({
        type: 'fuel',
        category: 'refuel',
        timestamp: f.date,
        title: 'Carga de Combustible',
        details: `${f.liters}L @ $${f.price_per_liter}/L - Total: $${f.total_cost}`,
        data: f
      })));
    }

    // 3. Agregar checklists
    if (checklists) {
      timeline = timeline.concat(checklists.map(c => ({
        type: 'checklist',
        category: c.type, // 'pre-trip', 'post-trip'
        timestamp: c.createdAt,
        title: `Checklist ${c.type}`,
        details: c.status === 'passed' ? 'Aprobado' : 'Con observaciones',
        data: c
      })));
    }

    // 4. Agregar hitos del viaje (Inicio/Fin Programado y Real)
    timeline.push({
      type: 'status',
      category: 'scheduled_start',
      timestamp: trip.scheduled_start,
      title: 'Inicio Programado',
      details: trip.origin_address
    });
    
    if (trip.actual_start) {
      timeline.push({
        type: 'status',
        category: 'actual_start',
        timestamp: trip.actual_start,
        title: 'Inicio Real',
        details: 'Salida confirmada'
      });
    }
    
    if (trip.actual_end) {
      timeline.push({
        type: 'status',
        category: 'actual_end',
        timestamp: trip.actual_end,
        title: 'Fin Real'
      });
    }

    // Ordenar cronológicamente
    timeline.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    res.json({
      trip_summary: {
        id: trip.id,
        trip_number: trip.trip_number,
        status: trip.status,
        client: trip.client_name,
        route: `${trip.origin_address} -> ${trip.destination_address}`,
        driver: trip.driver ? `${trip.driver.first_name} ${trip.driver.last_name}` : 'N/A',
        vehicle: trip.vehicle ? `${trip.vehicle.license_plate} (${trip.vehicle.brand})` : 'N/A'
      },
      timeline
    });

  } catch (error) {
    console.error('Error en reporte de trazabilidad:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * POST /api/traceability/event
 * Registrar un nuevo evento manual para un viaje (ej: "Tráfico pesado", "Control policial")
 */
router.post('/event', async (req, res) => {
  try {
    const { trip_id, type, description, location_name, metadata } = req.body;
    
    // Verificar que el usuario sea el conductor asignado o un supervisor
    const trip = await Trip.findByPk(trip_id);
    if (!trip) return res.status(404).json({ error: 'Viaje no encontrado' });

    if (req.user.role === 'driver' && trip.driver_id !== req.user.id) {
      return res.status(403).json({ error: 'No autorizado para registrar eventos en este viaje' });
    }

    const event = await TripEvent.create({
      trip_id,
      type,
      description,
      location_name,
      metadata,
      reported_by: req.user.id,
      timestamp: new Date()
    });

    res.status(201).json({ message: 'Evento registrado', event });

  } catch (error) {
    console.error('Error registrando evento:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
