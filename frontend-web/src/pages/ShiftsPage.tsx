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
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  AccessTime as TimeIcon,
  CalendarToday as DateIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useShiftStore } from '@/store/shiftStore';
import { useUserStore } from '@/store/userStore';
import { useAuthStore } from '@/store/authStore';
import { Shift } from '@/types';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const ShiftsPage: React.FC = () => {
  const { shifts, fetchShifts, createShift, updateShift, deleteShift, isLoading, error } = useShiftStore();
  const { users, fetchUsers } = useUserStore();
  const { user: currentUser } = useAuthStore();
  
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);

  const [formData, setFormData] = useState({
    user_id: '',
    shift_date: new Date().toISOString().split('T')[0],
    shift_type: 'morning',
    scheduled_start: '08:00',
    scheduled_end: '16:00',
    notes: '',
  });

  useEffect(() => {
    fetchShifts(); // In a real app, might filter by date range
    fetchUsers({ role: 'driver' });
  }, [fetchShifts, fetchUsers]);

  const handleOpenDialog = (shift?: Shift) => {
    if (shift) {
      setSelectedShift(shift);
      setFormData({
        user_id: shift.user_id,
        shift_date: shift.shift_date,
        shift_type: shift.shift_type,
        scheduled_start: shift.scheduled_start,
        scheduled_end: shift.scheduled_end,
        notes: shift.notes || '',
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
      user_id: '',
      shift_date: new Date().toISOString().split('T')[0],
      shift_type: 'morning',
      scheduled_start: '08:00',
      scheduled_end: '16:00',
      notes: '',
    });
    setSelectedShift(null);
  };

  const handleSubmit = async () => {
    try {
      if (editMode && selectedShift) {
        await updateShift(selectedShift.id, formData);
      } else {
        await createShift(formData);
      }
      setOpenDialog(false);
      resetForm();
      fetchShifts();
    } catch (error) {
      console.error('Error saving shift:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este turno?')) {
      await deleteShift(id);
      fetchShifts();
    }
  };

  const getShiftColor = (type: string) => {
    switch (type) {
      case 'morning': return 'primary';
      case 'afternoon': return 'warning';
      case 'night': return 'secondary';
      case 'full_day': return 'info';
      default: return 'default';
    }
  };

  const getShiftLabel = (type: string) => {
    const labels: Record<string, string> = {
      morning: 'Mañana',
      afternoon: 'Tarde',
      night: 'Noche',
      full_day: 'Día Completo',
      split: 'Cortado',
      on_call: 'Guardia',
    };
    return labels[type] || type;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
          Gestión de Turnos
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Asignar Turno
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Paper sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
             <TextField
                fullWidth
                label="Filtrar por Fecha"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                size="small"
              />
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Conductor</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Tipo de Turno</TableCell>
              <TableCell>Horario Programado</TableCell>
              <TableCell>Asistencia Real</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {shifts
                .filter(s => !dateFilter || s.shift_date === dateFilter) // Simple client-side filter
                .map((shift) => {
                    const driver = users.find(u => u.id === shift.user_id);
                    return (
                      <TableRow key={shift.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: 'info.main' }}>
                                <PersonIcon />
                            </Avatar>
                            <Box>
                                <Typography variant="subtitle2">
                                    {driver ? `${driver.first_name} ${driver.last_name}` : 'Usuario Desconocido'}
                                </Typography>
                                {driver && <Typography variant="caption">{driver.employee_id}</Typography>}
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                           {format(parseISO(shift.shift_date), 'dd MMMM yyyy', { locale: es })}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={getShiftLabel(shift.shift_type)} 
                            color={getShiftColor(shift.shift_type) as any} 
                            size="small" 
                          />
                        </TableCell>
                        <TableCell>
                            {shift.scheduled_start.slice(0, 5)} - {shift.scheduled_end.slice(0, 5)}
                        </TableCell>
                         <TableCell>
                            {shift.actual_start ? (
                                <Typography variant="body2" color="success.main">
                                    {shift.actual_start.slice(0, 5)} - {shift.actual_end ? shift.actual_end.slice(0, 5) : '...'}
                                </Typography>
                            ) : (
                                <Typography variant="caption" color="text.secondary">Pendiente</Typography>
                            )}
                        </TableCell>
                        <TableCell>
                            <Chip label={shift.status} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton onClick={() => handleOpenDialog(shift)} size="small">
                            <EditIcon />
                          </IconButton>
                          <IconButton onClick={() => handleDelete(shift.id)} size="small" color="error">
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editMode ? 'Editar Turno' : 'Asignar Turno'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Conductor</InputLabel>
                <Select
                  value={formData.user_id}
                  label="Conductor"
                  onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                >
                  {users.filter(u => u.role === 'driver').map((u) => (
                    <MenuItem key={u.id} value={u.id}>
                      {u.first_name} {u.last_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Fecha"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={formData.shift_date}
                onChange={(e) => setFormData({ ...formData, shift_date: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Tipo de Turno</InputLabel>
                <Select
                  value={formData.shift_type}
                  label="Tipo de Turno"
                  onChange={(e) => setFormData({ ...formData, shift_type: e.target.value })}
                >
                  <MenuItem value="morning">Mañana (06:00 - 14:00)</MenuItem>
                  <MenuItem value="afternoon">Tarde (14:00 - 22:00)</MenuItem>
                  <MenuItem value="night">Noche (22:00 - 06:00)</MenuItem>
                  <MenuItem value="full_day">Día Completo</MenuItem>
                  <MenuItem value="split">Cortado</MenuItem>
                  <MenuItem value="on_call">Guardia</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Hora Inicio"
                type="time"
                InputLabelProps={{ shrink: true }}
                value={formData.scheduled_start}
                onChange={(e) => setFormData({ ...formData, scheduled_start: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Hora Fin"
                type="time"
                InputLabelProps={{ shrink: true }}
                value={formData.scheduled_end}
                onChange={(e) => setFormData({ ...formData, scheduled_end: e.target.value })}
              />
            </Grid>
             <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notas"
                multiline
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {editMode ? 'Guardar' : 'Asignar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ShiftsPage;
