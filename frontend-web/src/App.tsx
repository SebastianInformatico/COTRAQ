import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import theme from './theme';
import AuthPage from './components/auth/AuthPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import TripsPage from './pages/TripsPage';
import VehiclesPage from './pages/VehiclesPage';
import ProfilePage from './pages/ProfilePage';
import ChecklistsPage from './pages/ChecklistsPage';
import ShiftsPage from './pages/ShiftsPage';
import MaintenancePage from './pages/MaintenancePage';
import DocumentsPage from './pages/DocumentsPage';
import UsersPage from './pages/UsersPage';
import SettingsPage from './pages/SettingsPage';

// Configurar React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutos
    },
  },
});

// Componente temporal para páginas en desarrollo
const ComingSoon: React.FC<{ title: string }> = ({ title }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '60vh',
      textAlign: 'center',
    }}
  >
    <h2>{title}</h2>
    <p>Esta página está en desarrollo</p>
  </Box>
);

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
            {/* Ruta pública de autenticación */}
            <Route path="/login" element={<AuthPage />} />
            
            {/* Rutas protegidas con layout */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              {/* Redirigir la raíz al dashboard */}
              <Route index element={<Navigate to="/dashboard" replace />} />
              
              {/* Dashboard - Acceso para todos los roles */}
              <Route path="dashboard" element={<Dashboard />} />
              
              {/* Viajes - Acceso para todos los roles */}
              <Route 
                path="trips" 
                element={<TripsPage />} 
              />
              
              {/* Checklists - Acceso para todos los roles */}
              <Route 
                path="checklists" 
                element={<ChecklistsPage />} 
              />
              
              {/* Vehículos - Acceso para todos los roles */}
              <Route 
                path="vehicles" 
                element={<VehiclesPage />} 
              />
              
              {/* Turnos - Acceso para todos los roles */}
              <Route 
                path="shifts" 
                element={<ShiftsPage />} 
              />
              
              {/* Mantenimiento - Solo admin, supervisor, mechanic */}
              <Route 
                path="maintenance" 
                element={
                  <ProtectedRoute requiredRole={['admin', 'supervisor', 'mechanic']}>
                    <MaintenancePage />
                  </ProtectedRoute>
                } 
              />
              
              {/* Documentos - Acceso para todos los roles */}
              <Route 
                path="documents" 
                element={<DocumentsPage />} 
              />
              
              {/* Usuarios - Solo admin y supervisor */}
              <Route 
                path="users" 
                element={
                  <ProtectedRoute requiredRole={['admin', 'supervisor']}>
                    <UsersPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* Perfil - Acceso para todos los roles */}
              <Route 
                path="profile" 
                element={<ProfilePage />} 
              />
              
              {/* Configuración - Acceso para todos los roles */}
              <Route 
                path="settings" 
                element={<SettingsPage />} 
              />
            </Route>
            
            {/* Ruta catch-all para 404 */}
            <Route 
              path="*" 
              element={
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100vh',
                    textAlign: 'center',
                  }}
                >
                  <h1>404 - Página no encontrada</h1>
                  <p>La página que buscas no existe.</p>
                </Box>
              } 
            />
          </Routes>
        </Router>
        
        {/* React Query Devtools (solo en desarrollo) */}
        <ReactQueryDevtools initialIsOpen={false} />
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;