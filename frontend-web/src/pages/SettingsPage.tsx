import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Switch,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Alert,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Palette as PaletteIcon,
  Language as LanguageIcon,
  Security as SecurityIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

const SettingsPage: React.FC = () => {
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    weekly_report: false,
  });

  const [appearance, setAppearance] = useState({
    theme: 'light',
    density: 'comfortable',
  });

  const [saved, setSaved] = useState(false);

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    handleSave();
  };

  const handleAppearanceChange = (key: keyof typeof appearance, value: string) => {
    setAppearance(prev => ({
      ...prev,
      [key]: value
    }));
    handleSave();
  };

  const handleSave = () => {
    setSaved(true);
    // Simular guardado
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Configuración
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Personaliza tu experiencia en S.C.O.T.A.
        </Typography>
      </Box>

      {saved && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Configuración guardada correctamente
        </Alert>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        
        {/* Notificaciones */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <NotificationsIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Notificaciones</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            <List>
              <ListItem>
                <ListItemText 
                  primary="Notificaciones por Correo" 
                  secondary="Recibe alertas importantes en tu email"
                />
                <ListItemSecondaryAction>
                  <Switch 
                    edge="end" 
                    checked={notifications.email}
                    onChange={() => handleNotificationChange('email')}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              
              <ListItem>
                <ListItemText 
                  primary="Notificaciones Push" 
                  secondary="Alertas en tiempo real en el navegador"
                />
                <ListItemSecondaryAction>
                  <Switch 
                    edge="end" 
                    checked={notifications.push}
                    onChange={() => handleNotificationChange('push')}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              
              <ListItem>
                <ListItemText 
                  primary="Reporte Semanal" 
                  secondary="Resumen de actividad enviado los lunes"
                />
                <ListItemSecondaryAction>
                  <Switch 
                    edge="end" 
                    checked={notifications.weekly_report}
                    onChange={() => handleNotificationChange('weekly_report')}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </CardContent>
        </Card>

        {/* Apariencia */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <PaletteIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Apariencia</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ display: 'flex', gap: 3 }}>
              <FormControl fullWidth>
                <InputLabel>Tema</InputLabel>
                <Select
                  value={appearance.theme}
                  label="Tema"
                  onChange={(e) => handleAppearanceChange('theme', e.target.value)}
                >
                  <MenuItem value="light">Claro</MenuItem>
                  <MenuItem value="dark">Oscuro (Próximamente)</MenuItem>
                  <MenuItem value="system">Sistema</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl fullWidth>
                <InputLabel>Densidad</InputLabel>
                <Select
                  value={appearance.density}
                  label="Densidad"
                  onChange={(e) => handleAppearanceChange('density', e.target.value)}
                >
                  <MenuItem value="comfortable">Cómoda</MenuItem>
                  <MenuItem value="compact">Compacta</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </CardContent>
        </Card>

        {/* Información */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <InfoIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Acerca de</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            <List dense>
              <ListItem>
                <ListItemText primary="Versión del Sistema" secondary="1.0.0 (Beta)" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Última Actualización" secondary="14 de Febrero, 2026" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Desarrollado para" secondary="Transportes Acuícolas S.A." />
              </ListItem>
            </List>
          </CardContent>
        </Card>

      </Box>
    </Box>
  );
};

export default SettingsPage;
