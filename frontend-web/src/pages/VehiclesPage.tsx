import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  LinearProgress,
  Avatar,
  Tooltip,
  Paper,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Build as MaintenanceIcon,
  DirectionsCar,
  Warning,
  CheckCircle,
  Error as ErrorIcon,
  DateRange,
} from '@mui/icons-material';
import { useVehicleStore } from '@/store';
import { useAuthStore } from '@/store/authStore';
import { Vehicle, VehicleStatus, VehicleType } from '@/types';
import { format } from 'date-fns';

const VehiclesPage: React.FC = () => {
  const { vehicles, fetchVehicles, createVehicle, updateVehicle, isLoading, error } = useVehicleStore();
  const { user } = useAuthStore();
  
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    license_plate: '',
    model: '',
    brand: '',
    year: '',
    type: '' as VehicleType,
    capacity_kg: '',
    capacity_m3: '',
    fuel_type: '',
    current_km: '',
    last_maintenance_km: '',
    next_maintenance_km: '',
    status: 'active' as VehicleStatus,
    notes: '',
  });

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const handleSubmit = async () => {
    try {
      const vehicleData = {
        ...formData,
        year: parseInt(formData.year),
        capacity_kg: parseFloat(formData.capacity_kg),
        capacity_m3: formData.capacity_m3 ? parseFloat(formData.capacity_m3) : undefined,
        current_km: parseInt(formData.current_km),
        last_maintenance_km: parseInt(formData.last_maintenance_km) || 0,
        next_maintenance_km: parseInt(formData.next_maintenance_km) || 0,
      };

      if (editMode && selectedVehicle) {
        await updateVehicle(selectedVehicle.id, vehicleData);
      } else {
        await createVehicle(vehicleData);
      }
      
      setOpenDialog(false);
      resetForm();
    } catch (error) {
      console.error('Error saving vehicle:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      license_plate: '',
      model: '',
      brand: '',
      year: '',
      type: '' as VehicleType,
      capacity_kg: '',
      capacity_m3: '',
      fuel_type: '',
      current_km: '',
      last_maintenance_km: '',
      next_maintenance_km: '',
      status: 'active',
      notes: '',
    });
    setSelectedVehicle(null);
    setEditMode(false);
  };

  const handleEdit = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setFormData({
      license_plate: vehicle.license_plate,
      model: vehicle.model,
      brand: vehicle.brand,
      year: vehicle.year.toString(),
      type: vehicle.type,
      capacity_kg: vehicle.capacity_kg?.toString() || '',
      capacity_m3: vehicle.capacity_m3?.toString() || '',
      fuel_type: vehicle.fuel_type,
      current_km: vehicle.current_km.toString(),
      last_maintenance_km: vehicle.last_maintenance_km?.toString() || '',
      next_maintenance_km: vehicle.next_maintenance_km?.toString() || '',
      status: vehicle.status,
      notes: vehicle.notes || '',
    });
    setEditMode(true);
    setOpenDialog(true);
  };

  const getStatusColor = (status: VehicleStatus) => {
    switch (status) {
      case 'active': return 'success';
      case 'maintenance': return 'warning';
      case 'inactive': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status: VehicleStatus) => {
    switch (status) {
      case 'active': return 'Activo';
      case 'maintenance': return 'Mantenimiento';
      case 'inactive': return 'Inactivo';
      default: return status;
    }
  };

  const getVehicleTypeText = (type: VehicleType) => {
    switch (type) {
      case 'truck': return 'Camión';
      case 'van': return 'Furgoneta';
      case 'pickup': return 'Pickup';
      case 'refrigerated': return 'Camión Refrigerado';
      case 'tank': return 'Camión Cisterna';
      default: return type;
    }
  };

  const getMaintenanceStatus = (vehicle: Vehicle) => {
    if (!vehicle.next_maintenance_km) return null;
    
    const kmUntilMaintenance = vehicle.next_maintenance_km - vehicle.current_km;
    
    if (kmUntilMaintenance <= 0) {
      return { status: 'overdue', text: 'Mantenimiento Vencido', color: 'error' };
    } else if (kmUntilMaintenance <= 1000) {
      return { status: 'due_soon', text: 'Mantenimiento Próximo', color: 'warning' };
    }
    
    return { status: 'ok', text: 'Mantenimiento al Día', color: 'success' };
  };

  const canManageVehicles = user?.role === 'admin' || user?.role === 'supervisor';

  const activeVehicles = vehicles.filter(v => v.status === 'active').length;
  const maintenanceVehicles = vehicles.filter(v => v.status === 'maintenance').length;
  const vehiclesNeedingMaintenance = vehicles.filter(v => {
    const maintenanceStatus = getMaintenanceStatus(v);
    return maintenanceStatus && ['overdue', 'due_soon'].includes(maintenanceStatus.status);
  }).length;

  return (
    <Box sx={{ height: '100%' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Gestión de Vehículos
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Control y seguimiento de la flota de vehículos
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Estadísticas de la flota */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <CheckCircle />
                </Avatar>
                <Box>
                  <Typography variant="h4" component="div">
                    {activeVehicles}
                  </Typography>
                  <Typography color="text.secondary">
                    Vehículos Activos
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
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <MaintenanceIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" component="div">
                    {maintenanceVehicles}
                  </Typography>
                  <Typography color="text.secondary">
                    En Mantenimiento
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
                <Avatar sx={{ bgcolor: 'error.main' }}>
                  <Warning />
                </Avatar>
                <Box>
                  <Typography variant="h4" component="div">
                    {vehiclesNeedingMaintenance}
                  </Typography>
                  <Typography color="text.secondary">
                    Requieren Mantención
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
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <DirectionsCar />
                </Avatar>
                <Box>
                  <Typography variant="h4" component="div">
                    {vehicles.length}
                  </Typography>
                  <Typography color="text.secondary">
                    Total Flota
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Acciones */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
        {canManageVehicles && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
          >
            Agregar Vehículo
          </Button>
        )}
      </Box>

      {/* Tabla de vehículos */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          {isLoading && <LinearProgress />}
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Vehículo</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Kilometraje</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Mantenimiento</TableCell>
                  <TableCell>Última Actualización</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {vehicles.map((vehicle) => {
                  const maintenanceStatus = getMaintenanceStatus(vehicle);
                  
                  return (
                    <TableRow key={vehicle.id} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                            {vehicle.license_plate}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {vehicle.brand} {vehicle.model} ({vehicle.year})
                          </Typography>
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Box>
                          <Typography variant="body2">
                            {getVehicleTypeText(vehicle.type)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {vehicle.capacity_kg ? `${vehicle.capacity_kg} kg` : ''}
                            {vehicle.capacity_m3 ? ` | ${vehicle.capacity_m3} m³` : ''}
                          </Typography>
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2">
                          {vehicle.current_km.toLocaleString()} km
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {vehicle.fuel_type}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={getStatusText(vehicle.status)}
                          color={getStatusColor(vehicle.status) as any}
                          size="small"
                        />
                      </TableCell>

                      <TableCell>
                        {maintenanceStatus ? (
                          <Box>
                            <Chip
                              label={maintenanceStatus.text}
                              color={maintenanceStatus.color as any}
                              size="small"
                              icon={maintenanceStatus.status === 'overdue' ? <ErrorIcon /> : 
                                    maintenanceStatus.status === 'due_soon' ? <Warning /> : 
                                    <CheckCircle />}
                            />
                            {vehicle.next_maintenance_km && (
                              <Typography variant="caption" display="block" color="text.secondary">
                                Próx: {vehicle.next_maintenance_km.toLocaleString()} km
                              </Typography>
                            )}
                          </Box>
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            No programado
                          </Typography>
                        )}
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2">
                          {format(new Date(vehicle.updated_at), 'dd/MM/yyyy')}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title="Ver detalles">
                            <IconButton size="small">
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          
                          {canManageVehicles && (
                            <Tooltip title="Editar">
                              <IconButton 
                                size="small" 
                                onClick={() => handleEdit(vehicle)}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                          )}

                          {(user?.role === 'admin' || user?.role === 'supervisor' || user?.role === 'mechanic') && (
                            <Tooltip title="Mantenimiento">
                              <IconButton size="small" color="warning">
                                <MaintenanceIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {vehicles.length === 0 && (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                No hay vehículos registrados
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Agregue vehículos para comenzar a gestionar la flota.
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Dialog para agregar/editar vehículo */}
      <Dialog 
        open={openDialog} 
        onClose={() => {
          setOpenDialog(false);
          resetForm();
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editMode ? 'Editar Vehículo' : 'Agregar Nuevo Vehículo'}
        </DialogTitle>
        
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Patente"
                value={formData.license_plate}
                onChange={(e) => setFormData({...formData, license_plate: e.target.value.toUpperCase()})}
                required
                helperText="Ej: ABC-1234"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Marca"
                value={formData.brand}
                onChange={(e) => setFormData({...formData, brand: e.target.value})}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Modelo"
                value={formData.model}
                onChange={(e) => setFormData({...formData, model: e.target.value})}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Año"
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({...formData, year: e.target.value})}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Tipo de Vehículo</InputLabel>
                <Select
                  value={formData.type}
                  label="Tipo de Vehículo"
                  onChange={(e) => setFormData({...formData, type: e.target.value as VehicleType})}
                >
                  <MenuItem value="truck">Camión</MenuItem>
                  <MenuItem value="pickup">Pickup</MenuItem>
                  <MenuItem value="van">Furgoneta</MenuItem>
                  <MenuItem value="refrigerated">Camión Refrigerado</MenuItem>
                  <MenuItem value="tank">Camión Cisterna</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Capacidad de Carga (kg)"
                type="number"
                value={formData.capacity_kg}
                onChange={(e) => setFormData({...formData, capacity_kg: e.target.value})}
                required
              />
            </Grid>

            {(formData.type === 'tank' || formData.type === 'refrigerated' || formData.type === 'truck') && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Capacidad Volumétrica (m³)"
                  type="number"
                  value={formData.capacity_m3}
                  onChange={(e) => setFormData({...formData, capacity_m3: e.target.value})}
                />
              </Grid>
            )}

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tipo de Combustible"
                value={formData.fuel_type}
                onChange={(e) => setFormData({...formData, fuel_type: e.target.value})}
                placeholder="Ej: Diesel, Gasolina, Eléctrico"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Kilometraje Actual"
                type="number"
                value={formData.current_km}
                onChange={(e) => setFormData({...formData, current_km: e.target.value})}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Último Mantenimiento (km)"
                type="number"
                value={formData.last_maintenance_km}
                onChange={(e) => setFormData({...formData, last_maintenance_km: e.target.value})}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Próximo Mantenimiento (km)"
                type="number"
                value={formData.next_maintenance_km}
                onChange={(e) => setFormData({...formData, next_maintenance_km: e.target.value})}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Estado</InputLabel>
                <Select
                  value={formData.status}
                  label="Estado"
                  onChange={(e) => setFormData({...formData, status: e.target.value as VehicleStatus})}
                >
                  <MenuItem value="active">Activo</MenuItem>
                  <MenuItem value="maintenance">En Mantenimiento</MenuItem>
                  <MenuItem value="inactive">Inactivo</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notas"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                multiline
                rows={3}
                placeholder="Observaciones, características especiales, etc."
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => {
            setOpenDialog(false);
            resetForm();
          }}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit}
            variant="contained"
            disabled={isLoading}
          >
            {editMode ? 'Actualizar' : 'Agregar'} Vehículo
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VehiclesPage;