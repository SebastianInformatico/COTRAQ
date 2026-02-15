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
  Avatar,
  Paper,
  InputAdornment,
  Tooltip,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Build as MaintenanceIcon,
  Warning,
  CheckCircle,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { useMaintenanceStore } from '@/store/maintenanceStore';
import { useVehicleStore } from '@/store'; // For vehicle list
import { useAuthStore } from '@/store/authStore';
import { Maintenance } from '@/types';
import { format } from 'date-fns';

const MaintenancePage: React.FC = () => {
  const { maintenances, fetchMaintenances, createMaintenance, updateMaintenance, deleteMaintenance, isLoading, error } = useMaintenanceStore();
  const { vehicles, fetchVehicles } = useVehicleStore();
  const { user: currentUser } = useAuthStore();
  
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedMaintenance, setSelectedMaintenance] = useState<Maintenance | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [formData, setFormData] = useState({
    vehicle_id: '',
    mechanic_id: '',
    type: 'preventive',
    status: 'scheduled',
    priority: 'normal',
    title: '',
    description: '',
    scheduled_date: new Date().toISOString().split('T')[0],
    cost: '',
    parts_cost: '',
    labor_cost: '',
    notes: '',
  });

  useEffect(() => {
    fetchMaintenances({ search: searchTerm, status: statusFilter !== 'all' ? statusFilter : undefined });
    fetchVehicles();
  }, [fetchMaintenances, fetchVehicles, searchTerm, statusFilter]);

  const handleOpenDialog = (maintenance?: Maintenance) => {
    if (maintenance) {
      setSelectedMaintenance(maintenance);
      setFormData({
        vehicle_id: maintenance.vehicle_id,
        mechanic_id: maintenance.mechanic_id || '',
        type: maintenance.type,
        status: maintenance.status,
        priority: maintenance.priority,
        title: maintenance.title,
        description: maintenance.description || '',
        scheduled_date: maintenance.scheduled_date ? new Date(maintenance.scheduled_date).toISOString().split('T')[0] : '',
        cost: maintenance.cost?.toString() || '',
        parts_cost: maintenance.parts_cost?.toString() || '',
        labor_cost: maintenance.labor_cost?.toString() || '',
        notes: maintenance.notes || '',
      });
      setEditMode(true);
    } else {
      resetForm();
      setEditMode(false);
    }
    setOpenDialog(true);
  };

  const resetForm = () => {
    setFormData({
      vehicle_id: '',
      mechanic_id: '',
      type: 'preventive',
      status: 'scheduled',
      priority: 'normal',
      title: '',
      description: '',
      scheduled_date: new Date().toISOString().split('T')[0],
      cost: '',
      parts_cost: '',
      labor_cost: '',
      notes: '',
    });
    setSelectedMaintenance(null);
  };

  const handleSubmit = async () => {
    try {
      const dataToSubmit = { 
        ...formData,
        cost: formData.cost ? parseFloat(formData.cost) : 0,
        parts_cost: formData.parts_cost ? parseFloat(formData.parts_cost) : 0,
        labor_cost: formData.labor_cost ? parseFloat(formData.labor_cost) : 0,
      };

      if (editMode && selectedMaintenance) {
        await updateMaintenance(selectedMaintenance.id, dataToSubmit);
      } else {
        await createMaintenance(dataToSubmit);
      }
      setOpenDialog(false);
      resetForm();
      fetchMaintenances();
    } catch (error) {
      console.error('Error saving maintenance:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este mantenimiento?')) {
      await deleteMaintenance(id);
      fetchMaintenances();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'primary';
      case 'scheduled': return 'info';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'normal': return 'info';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
          Gestión de Mantenimiento
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Nuevo Mantenimiento
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Paper sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Buscar mantenimiento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Estado</InputLabel>
              <Select
                value={statusFilter}
                label="Estado"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="scheduled">Programado</MenuItem>
                <MenuItem value="in_progress">En Progreso</MenuItem>
                <MenuItem value="completed">Completado</MenuItem>
                <MenuItem value="cancelled">Cancelado</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Título</TableCell>
              <TableCell>Vehículo</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Prioridad</TableCell>
              <TableCell>Fecha Programada</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {maintenances.map((maintenance) => (
              <TableRow key={maintenance.id}>
                <TableCell>
                  <Typography variant="body1" fontWeight="medium">{maintenance.title}</Typography>
                  <Typography variant="caption" color="text.secondary">{maintenance.description}</Typography>
                </TableCell>
                <TableCell>
                 {maintenance.vehicle ? `${maintenance.vehicle.brand} ${maintenance.vehicle.model} (${maintenance.vehicle.license_plate})` : 'N/A'}
                </TableCell>
                <TableCell>
                  <Chip label={maintenance.type} size="small" variant="outlined" />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={maintenance.priority} 
                    color={getPriorityColor(maintenance.priority) as any} 
                    size="small" 
                  />
                </TableCell>
                <TableCell>
                  {format(new Date(maintenance.scheduled_date), 'dd/MM/yyyy')}
                </TableCell>
                <TableCell>
                  <Chip 
                    label={maintenance.status} 
                    color={getStatusColor(maintenance.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleOpenDialog(maintenance)} size="small">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(maintenance.id)} size="small" color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editMode ? 'Editar Mantenimiento' : 'Nuevo Mantenimiento'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Título"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Vehículo</InputLabel>
                <Select
                  value={formData.vehicle_id}
                  label="Vehículo"
                  onChange={(e) => setFormData({ ...formData, vehicle_id: e.target.value })}
                >
                  {vehicles.map((v) => (
                    <MenuItem key={v.id} value={v.id}>
                      {v.brand} {v.model} - {v.license_plate}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Fecha Programada"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={formData.scheduled_date}
                onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Tipo</InputLabel>
                <Select
                  value={formData.type}
                  label="Tipo"
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <MenuItem value="preventive">Preventivo</MenuItem>
                  <MenuItem value="corrective">Correctivo</MenuItem>
                  <MenuItem value="emergency">Emergencia</MenuItem>
                  <MenuItem value="inspection">Inspección</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Prioridad</InputLabel>
                <Select
                  value={formData.priority}
                  label="Prioridad"
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  <MenuItem value="low">Baja</MenuItem>
                  <MenuItem value="normal">Normal</MenuItem>
                  <MenuItem value="high">Alta</MenuItem>
                  <MenuItem value="critical">Crítica</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descripción"
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>
             <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Costo Total Estimado"
                type="number"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
              />
            </Grid>
             <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Estado</InputLabel>
                 <Select
                  value={formData.status}
                  label="Estado"
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <MenuItem value="scheduled">Programado</MenuItem>
                  <MenuItem value="in_progress">En Progreso</MenuItem>
                  <MenuItem value="completed">Completado</MenuItem>
                  <MenuItem value="cancelled">Cancelado</MenuItem>
                   <MenuItem value="postponed">Pospuesto</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {editMode ? 'Guardar Cambios' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MaintenancePage;
