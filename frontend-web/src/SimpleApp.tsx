// Componente simple de navegación sin react-router-dom
import React, { useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box, Card, CardContent, Typography, Button, TextField, Alert } from '@mui/material';
import theme from './theme';

type Page = 'login' | 'dashboard' | 'trips' | 'vehicles' | 'profile';

const SimpleApp: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [user, setUser] = useState<any>(null);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Simular login
    if (loginData.email === 'admin@cotraq.com' && loginData.password === 'admin123') {
      setUser({ email: loginData.email, role: 'admin', name: 'Administrador' });
      setCurrentPage('dashboard');
    } else {
      setError('Credenciales inválidas');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('login');
    setLoginData({ email: '', password: '' });
  };

  const renderNavigation = () => (
    <Box sx={{ bgcolor: 'primary.main', color: 'white', p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Typography variant="h6">S.C.O.T.A. - Sistema de Control Operativo</Typography>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button color="inherit" onClick={() => setCurrentPage('dashboard')}>Dashboard</Button>
        <Button color="inherit" onClick={() => setCurrentPage('trips')}>Viajes</Button>
        <Button color="inherit" onClick={() => setCurrentPage('vehicles')}>Vehículos</Button>
        <Button color="inherit" onClick={() => setCurrentPage('profile')}>Perfil</Button>
        <Button color="inherit" onClick={handleLogout}>Salir</Button>
      </Box>
    </Box>
  );

  const renderLogin = () => (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: 'grey.100' }}>
      <Card sx={{ maxWidth: 400, width: '100%', m: 2 }}>
        <CardContent>
          <Typography variant="h4" component="h1" gutterBottom textAlign="center">
            S.C.O.T.A.
          </Typography>
          <Typography variant="subtitle1" gutterBottom textAlign="center" color="text.secondary">
            Sistema de Control Operativo para Transporte Acuícola
          </Typography>
          
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          <form onSubmit={handleLogin}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={loginData.email}
              onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Contraseña"
              type="password"
              value={loginData.password}
              onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
              margin="normal"
              required
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ mt: 3, mb: 2 }}
            >
              Iniciar Sesión
            </Button>
          </form>
          
          <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 2 }}>
            Usuario de prueba: admin@cotraq.com / admin123
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );

  const renderDashboard = () => (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Dashboard Principal</Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2, mt: 2 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" color="primary" gutterBottom>Viajes Activos</Typography>
            <Typography variant="h3">12</Typography>
            <Typography variant="body2" color="text.secondary">En progreso hoy</Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="h6" color="primary" gutterBottom>Vehículos</Typography>
            <Typography variant="h3">8</Typography>
            <Typography variant="body2" color="text.secondary">Disponibles</Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="h6" color="primary" gutterBottom>Checklists</Typography>
            <Typography variant="h3">25</Typography>
            <Typography variant="body2" color="text.secondary">Completados hoy</Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="h6" color="primary" gutterBottom>Conductores</Typography>
            <Typography variant="h3">6</Typography>
            <Typography variant="body2" color="text.secondary">En servicio</Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );

  const renderTrips = () => (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Gestión de Viajes</Typography>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>Próximos Viajes</Typography>
          <Typography>• Viaje #001 - Puerto Montt → Santiago (Programado 14:00)</Typography>
          <Typography>• Viaje #002 - Valparaíso → Concepción (Programado 16:30)</Typography>
          <Typography>• Viaje #003 - Castro → Puerto Montt (En progreso)</Typography>
          <Button variant="contained" sx={{ mt: 2 }}>Crear Nuevo Viaje</Button>
        </CardContent>
      </Card>
    </Box>
  );

  const renderVehicles = () => (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Control de Vehículos</Typography>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>Flota de Vehículos</Typography>
          <Typography>• Camión CAM-001 - Disponible (Último mantenimiento: 01/02/2026)</Typography>
          <Typography>• Camión CAM-002 - En viaje (Destino: Santiago)</Typography>
          <Typography>• Pickup PU-001 - Disponible (Próximo mantenimiento: 20/02/2026)</Typography>
          <Button variant="contained" sx={{ mt: 2 }}>Programar Mantenimiento</Button>
        </CardContent>
      </Card>
    </Box>
  );

  const renderProfile = () => (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Perfil de Usuario</Typography>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>Información Personal</Typography>
          <Typography><strong>Nombre:</strong> {user?.name}</Typography>
          <Typography><strong>Email:</strong> {user?.email}</Typography>
          <Typography><strong>Rol:</strong> {user?.role}</Typography>
          <Button variant="contained" sx={{ mt: 2 }}>Editar Perfil</Button>
        </CardContent>
      </Card>
    </Box>
  );

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard': return renderDashboard();
      case 'trips': return renderTrips();
      case 'vehicles': return renderVehicles();
      case 'profile': return renderProfile();
      default: return renderDashboard();
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {!user ? renderLogin() : (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          {renderNavigation()}
          <Box sx={{ flexGrow: 1, bgcolor: 'grey.50' }}>
            {renderContent()}
          </Box>
        </Box>
      )}
    </ThemeProvider>
  );
};

export default SimpleApp;