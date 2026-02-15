import React, { useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Chip,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
} from '@mui/material';
import {
  TrendingUp,
  DirectionsCar,
  Assignment,
  Warning,
  PlayArrow,
  CheckCircle,
  Schedule,
  Error,
  Visibility,
} from '@mui/icons-material';
import { useAuthStore } from '@/store/authStore';
import { useTripStore, useVehicleStore } from '@/store';
import { useDocumentStore } from '@/store/documentStore';
import { useMaintenanceStore } from '@/store/maintenanceStore';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactElement;
  color?: string;
  subtitle?: string;
  progress?: number;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color = 'primary',
  subtitle,
  progress,
}) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Avatar sx={{ bgcolor: `${color}.main`, mr: 2 }}>
          {icon}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography color="text.secondary" gutterBottom variant="body2">
            {title}
          </Typography>
          <Typography variant="h4" component="div">
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>
      {progress !== undefined && (
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{ height: 8, borderRadius: 5 }}
        />
      )}
    </CardContent>
  </Card>
);

const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { trips, fetchTrips } = useTripStore();
  const { vehicles, fetchVehicles } = useVehicleStore();
  const { documents, fetchDocuments } = useDocumentStore();
  const { maintenances, fetchMaintenances } = useMaintenanceStore();

  useEffect(() => {
    fetchTrips();
    fetchVehicles();
    fetchDocuments();
    fetchMaintenances();
  }, [fetchTrips, fetchVehicles, fetchDocuments, fetchMaintenances]);

  // Estadísticas calculadas
  const activeTrips = trips.filter(trip => trip.status === 'in_progress').length;
  const pendingTrips = trips.filter(trip => trip.status === 'pending').length;
  const completedTripsToday = trips.filter(trip => {
    const today = new Date().toDateString();
    return trip.status === 'completed' && 
           new Date(trip.actual_end_time || '').toDateString() === today;
  }).length;

  const availableVehicles = vehicles.filter(vehicle => vehicle.status === 'active').length;
  const vehiclesInMaintenance = vehicles.filter(vehicle => vehicle.status === 'maintenance').length;
  
  // Alertas calculadas
  const today = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(today.getDate() + 30);

  const expiringDocuments = documents.filter(doc => {
    if (!doc.expiry_date || doc.status === 'expired' || doc.status === 'cancelled') return false;
    const expiry = new Date(doc.expiry_date);
    return expiry <= thirtyDaysFromNow;
  });

  const activeMaintenances = maintenances.filter(maint => 
    maint.status === 'scheduled' || maint.status === 'in_progress'
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'in_progress': return 'info';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'in_progress': return 'En Progreso';
      case 'completed': return 'Completado';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Saludo personalizado */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          ¡Bienvenido, {user?.first_name}!
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Panel de control - Sistema de Transporte Acuícola
        </Typography>
      </Box>

      {/* Tarjetas de estadísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Viajes Activos"
            value={activeTrips}
            icon={<TrendingUp />}
            color="primary"
            subtitle="En progreso"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Viajes Pendientes"
            value={pendingTrips}
            icon={<Schedule />}
            color="warning"
            subtitle="Por iniciar"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Vehículos Disponibles"
            value={availableVehicles}
            icon={<DirectionsCar />}
            color="success"
            subtitle={`${vehiclesInMaintenance} en mantención`}
            progress={(availableVehicles / vehicles.length) * 100}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Completados Hoy"
            value={completedTripsToday}
            icon={<CheckCircle />}
            color="info"
            subtitle="Viajes finalizados"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Viajes recientes */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" component="h2">
                  Viajes Recientes
                </Typography>
                <Button
                  size="small"
                  onClick={() => window.location.href = '/trips'}
                >
                  Ver todos
                </Button>
              </Box>
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Origen - Destino</TableCell>
                      <TableCell>Conductor</TableCell>
                      <TableCell>Vehículo</TableCell>
                      <TableCell>Estado</TableCell>
                      <TableCell>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {trips.slice(0, 5).map((trip) => (
                      <TableRow key={trip.id}>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {trip.origin_address} → {trip.destination_address}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {trip.cargo_type}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {/* Necesitaremos obtener el nombre del conductor */}
                            Usuario {trip.driver_id}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {/* Necesitaremos obtener la información del vehículo */}
                            Vehículo {trip.vehicle_id}
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
                          <IconButton size="small">
                            <Visibility />
                          </IconButton>
                          {trip.status === 'pending' && (
                            <IconButton size="small" color="primary">
                              <PlayArrow />
                            </IconButton>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Panel lateral con alertas y notificaciones */}
        <Grid item xs={12} lg={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Alertas importantes */}
            <Card>
              <CardContent>
                <Typography variant="h6" component="h2" gutterBottom>
                  Alertas Importantes
                </Typography>
                <List dense>
                  {activeMaintenances.length > 0 && (
                    <ListItem button onClick={() => window.location.href = '/maintenance'}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'warning.main' }}>
                          <Warning />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary="Mantenimientos Activos"
                        secondary={`${activeMaintenances.length} vehículos en servicio`}
                      />
                    </ListItem>
                  )}

                  {expiringDocuments.slice(0, 5).map(doc => (
                    <ListItem key={doc.id}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'error.main' }}>
                          <Error />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={`Vencimiento: ${doc.title}`}
                        secondary={`${doc.vehicle?.license_plate || 'General'} - ${new Date(doc.expiry_date!).toLocaleDateString()}`}
                      />
                    </ListItem>
                  ))}

                  {activeMaintenances.length === 0 && expiringDocuments.length === 0 && (
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'success.main' }}>
                          <CheckCircle />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary="Sin alertas"
                        secondary="Todo está al día"
                      />
                    </ListItem>
                  )}
                </List>
              </CardContent>
            </Card>

            {/* Próximos viajes */}
            <Card>
              <CardContent>
                <Typography variant="h6" component="h2" gutterBottom>
                  Próximos Viajes
                </Typography>
                <List dense>
                  {trips
                    .filter(trip => trip.status === 'pending')
                    .slice(0, 3)
                    .map((trip) => (
                      <ListItem key={trip.id}>
                        <ListItemText
                          primary={`${trip.origin_address} → ${trip.destination_address}`}
                          secondary={`${trip.cargo_type} - ${new Date(trip.scheduled_start_time).toLocaleString()}`}
                        />
                      </ListItem>
                    ))}
                </List>
              </CardContent>
            </Card>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;