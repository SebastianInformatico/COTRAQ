import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  Tooltip,
  Fab,
  LinearProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  PlayArrow as StartIcon,
  Stop as StopIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FilterList as FilterIcon,
  LocationOn,
  DirectionsCar,
  AccessTime,
  Assignment,
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { format } from 'date-fns';
import { useTripStore, useVehicleStore } from '@/store';
import { useAuthStore } from '@/store/authStore';
import { useUserStore } from '@/store/userStore';
import { Trip, Vehicle, TripStatus, CargoType } from '@/types';

const TripsPage: React.FC = () => {
  const { trips, fetchTrips, createTrip, startTrip, completeTrip, isLoading, error } = useTripStore();
  const { vehicles, fetchVehicles } = useVehicleStore();
  const { users, fetchUsers } = useUserStore();
  const { user } = useAuthStore();

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [filter, setFilter] = useState<TripStatus | 'all'>('all');
  const [formData, setFormData] = useState({
    origin_address: '',
    destination_address: '',
    cargo_type: '' as CargoType,
    cargo_weight: '',
    cargo_description: '',
    scheduled_start_time: new Date(),
    estimated_duration: '',
    driver_id: '',
    vehicle_id: '',
    notes: '',
  });

  useEffect(() => {
    fetchTrips();
    fetchVehicles();
    fetchUsers();
  }, [fetchTrips, fetchVehicles, fetchUsers]);

  const handleCreateTrip = async () => {
    try {
      // Mapear los datos al formato que espera el backend
      const payload: any = {
        ...formData,
        cargo_weight_kg: parseFloat(formData.cargo_weight), // Mapear a cargo_weight_kg
        estimated_duration: parseInt(formData.estimated_duration),
        // El backend espera 'scheduled_start', no 'scheduled_start_time'
        scheduled_start: formData.scheduled_start_time.toISOString(),
        // El estado inicial debe ser 'scheduled', no 'pending'
        status: 'scheduled',
      };
      
      // Eliminar campos que no existen en el modelo de backend
      delete payload.scheduled_start_time;
      delete payload.cargo_weight;

      await createTrip(payload);
      setOpenDialog(false);
      resetForm();
    } catch (error) {
      console.error('Error creating trip:', error);
    }
  };

  const handleStartTrip = async (tripId: string) => {
    try {
      await startTrip(tripId);
    } catch (error) {
      console.error('Error starting trip:', error);
    }
  };

  const handleCompleteTrip = async (tripId: string) => {
    try {
      await completeTrip(tripId);
    } catch (error) {
      console.error('Error completing trip:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      origin_address: '',
      destination_address: '',
      cargo_type: '' as CargoType,
      cargo_weight: '',
      cargo_description: '',
      scheduled_start_time: new Date(),
      estimated_duration: '',
      driver_id: '',
      vehicle_id: '',
      notes: '',
    });
  };

  const getStatusColor = (status: TripStatus) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'in_progress': return 'info';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status: TripStatus) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'in_progress': return 'En Progreso';
      case 'completed': return 'Completado';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const getCargoTypeText = (type: CargoType) => {
    switch (type) {
      case 'feed': return 'Alimento';
      case 'mussels': return 'Choritos';
      case 'finished_product': return 'Producto Terminado';
      default: return type;
    }
  };

  const filteredTrips = filter === 'all' ? trips : trips.filter(trip => trip.status === filter);
  const canCreateTrips = user?.role === 'admin' || user?.role === 'supervisor';

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Box sx={{ height: '100%' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Gestión de Viajes
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Control y seguimiento de viajes de transporte acuícola
            </Typography>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Estadísticas rápidas */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ p: 1.5, bgcolor: 'warning.light', borderRadius: 1 }}>
                    <AccessTime sx={{ color: 'warning.contrastText' }} />
                  </Box>
                  <Box>
                    <Typography variant="h4" component="div">
                      {trips.filter(t => t.status === 'pending').length}
                    </Typography>
                    <Typography color="text.secondary">
                      Viajes Pendientes
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ p: 1.5, bgcolor: 'info.light', borderRadius: 1 }}>
                    <DirectionsCar sx={{ color: 'info.contrastText' }} />
                  </Box>
                  <Box>
                    <Typography variant="h4" component="div">
                      {trips.filter(t => t.status === 'in_progress').length}
                    </Typography>
                    <Typography color="text.secondary">
                      En Progreso
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ p: 1.5, bgcolor: 'success.light', borderRadius: 1 }}>
                    <Assignment sx={{ color: 'success.contrastText' }} />
                  </Box>
                  <Box>
                    <Typography variant="h4" component="div">
                      {trips.filter(t => 
                        t.status === 'completed' && 
                        new Date(t.actual_end_time || '').toDateString() === new Date().toDateString()
                      ).length}
                    </Typography>
                    <Typography color="text.secondary">
                      Completados Hoy
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ p: 1.5, bgcolor: 'primary.light', borderRadius: 1 }}>
                    <LocationOn sx={{ color: 'primary.contrastText' }} />
                  </Box>
                  <Box>
                    <Typography variant="h4" component="div">
                      {trips.length}
                    </Typography>
                    <Typography color="text.secondary">
                      Total Viajes
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filtros y acciones */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Filtrar por estado</InputLabel>
            <Select
              value={filter}
              label="Filtrar por estado"
              onChange={(e) => setFilter(e.target.value as TripStatus | 'all')}
              startAdornment={<FilterIcon sx={{ mr: 1 }} />}
            >
              <MenuItem value="all">Todos los estados</MenuItem>
              <MenuItem value="pending">Pendientes</MenuItem>
              <MenuItem value="in_progress">En Progreso</MenuItem>
              <MenuItem value="completed">Completados</MenuItem>
              <MenuItem value="cancelled">Cancelados</MenuItem>
            </Select>
          </FormControl>

          {canCreateTrips && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenDialog(true)}
              sx={{ height: 56 }}
            >
              Nuevo Viaje
            </Button>
          )}
        </Box>

        {/* Tabla de viajes */}
        <Card>
          <CardContent sx={{ p: 0 }}>
            {isLoading && <LinearProgress />}
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Ruta</TableCell>
                    <TableCell>Carga</TableCell>
                    <TableCell>Conductor</TableCell>
                    <TableCell>Vehículo</TableCell>
                    <TableCell>Programado</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredTrips.map((trip) => (
                    <TableRow key={trip.id} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                            {trip.origin_address} → {trip.destination_address}
                          </Typography>
                          {trip.notes && (
                            <Typography variant="caption" color="text.secondary">
                              {trip.notes}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Box>
                          <Typography variant="body2">
                            {getCargoTypeText(trip.cargo_type)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {trip.cargo_weight} kg
                          </Typography>
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Typography variant="body2">
                          Conductor {trip.driver_id}
                        </Typography>
                      </TableCell>
                      
                      <TableCell>
                        <Typography variant="body2">
                          Vehículo {trip.vehicle_id}
                        </Typography>
                      </TableCell>
                      
                      <TableCell>
                        <Typography variant="body2">
                          {format(new Date(trip.scheduled_start_time), 'dd/MM/yyyy HH:mm')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ~{trip.estimated_duration} min
                        </Typography>
                      </TableCell>
                      
                      <TableCell>
                        <Chip
                          label={getStatusText(trip.status)}
                          color={getStatusColor(trip.status) as any}
                          size="small"
                        />
                      </TableCell>
                      
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title="Ver detalles">
                            <IconButton size="small" onClick={() => setSelectedTrip(trip)}>
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          
                          {trip.status === 'pending' && (user?.role === 'admin' || user?.role === 'supervisor' || user?.id === trip.driver_id) && (
                            <Tooltip title="Iniciar viaje">
                              <IconButton 
                                size="small" 
                                color="primary"
                                onClick={() => handleStartTrip(trip.id)}
                              >
                                <StartIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                          
                          {trip.status === 'in_progress' && (user?.role === 'admin' || user?.role === 'supervisor' || user?.id === trip.driver_id) && (
                            <Tooltip title="Completar viaje">
                              <IconButton 
                                size="small" 
                                color="success"
                                onClick={() => handleCompleteTrip(trip.id)}
                              >
                                <StopIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                          
                          {trip.status === 'pending' && canCreateTrips && (
                            <Tooltip title="Editar">
                              <IconButton size="small">
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {filteredTrips.length === 0 && (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary">
                  No hay viajes para mostrar
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {filter === 'all' 
                    ? 'No se han creado viajes aún.' 
                    : `No hay viajes con estado "${getStatusText(filter as TripStatus)}".`
                  }
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Dialog para crear nuevo viaje */}
        <Dialog 
          open={openDialog} 
          onClose={() => setOpenDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Crear Nuevo Viaje</DialogTitle>
          
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Dirección de Origen"
                  value={formData.origin_address}
                  onChange={(e) => setFormData({...formData, origin_address: e.target.value})}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Dirección de Destino"
                  value={formData.destination_address}
                  onChange={(e) => setFormData({...formData, destination_address: e.target.value})}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Tipo de Carga</InputLabel>
                  <Select
                    value={formData.cargo_type}
                    label="Tipo de Carga"
                    onChange={(e) => setFormData({...formData, cargo_type: e.target.value as CargoType})}
                  >
                    <MenuItem value="feed">Alimento</MenuItem>
                    <MenuItem value="mussels">Choritos</MenuItem>
                    <MenuItem value="finished_product">Producto Terminado</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Peso de Carga (kg)"
                  type="number"
                  value={formData.cargo_weight}
                  onChange={(e) => setFormData({...formData, cargo_weight: e.target.value})}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Descripción de la Carga"
                  value={formData.cargo_description}
                  onChange={(e) => setFormData({...formData, cargo_description: e.target.value})}
                  multiline
                  rows={2}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <DateTimePicker
                  label="Fecha y Hora Programada"
                  minutesStep={30}
                  value={formData.scheduled_start_time}
                  onChange={(date) => setFormData({...formData, scheduled_start_time: date || new Date()})}
                  slotProps={{ textField: { fullWidth: true, required: true } }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Duración Estimada (minutos)"
                  type="number"
                  value={formData.estimated_duration}
                  onChange={(e) => setFormData({...formData, estimated_duration: e.target.value})}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Vehículo</InputLabel>
                  <Select
                    value={formData.vehicle_id}
                    label="Vehículo"
                    onChange={(e) => setFormData({...formData, vehicle_id: e.target.value})}
                  >
                    {vehicles.filter(v => v.status === 'active').map((vehicle) => (
                      <MenuItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.license_plate} - {vehicle.model}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Conductor</InputLabel>
                  <Select
                    value={formData.driver_id}
                    label="Conductor"
                    onChange={(e) => setFormData({...formData, driver_id: e.target.value})}
                  >
                    {users.filter(u => u.role === 'driver').map((driver) => (
                      <MenuItem key={driver.id} value={driver.id}>
                        {driver.first_name} {driver.last_name} ({driver.username})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notas Adicionales"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  multiline
                  rows={3}
                />
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setOpenDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleCreateTrip}
              variant="contained"
              disabled={isLoading}
            >
              Crear Viaje
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default TripsPage;