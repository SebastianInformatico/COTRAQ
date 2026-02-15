import React, { useState } from 'react';
import {
  Box,
  TextField,
  Typography,
  Alert,
  Link,
  Divider,
  InputAdornment,
  IconButton,
  Fade,
  Paper,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Person as PersonIcon,
  Phone as PhoneIcon,
  LocalShipping as ShippingIcon,
  CheckCircleOutline as CheckIcon,
  Login as LoginIcon,
  PersonAdd as RegisterIcon,
} from '@mui/icons-material';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';

/* ─── Keyframe animation via style tag ─── */
const AnimationStyles = () => (
  <style>{`
    @keyframes float {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-10px) rotate(0deg); }
    }
    @keyframes pulse-ring {
      0% { transform: scale(0.95); opacity: 0.7; }
      50% { transform: scale(1.05); opacity: 1; }
      100% { transform: scale(0.95); opacity: 0.7; }
    }
  `}</style>
);

interface LoginProps {
  onToggleMode: () => void;
  isRegister: boolean;
}

const Login: React.FC<LoginProps> = ({ onToggleMode, isRegister }) => {
  React.useEffect(() => {
    // Limpiar sesión anterior al cargar página de login
    localStorage.removeItem('scota_user');
    localStorage.removeItem('scota_token');
    localStorage.removeItem('scota_refresh_token');
    useAuthStore.getState().logout();
  }, []);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { login, register, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (isRegister) {
      if (formData.password !== formData.confirmPassword) {
        alert('Las contraseñas no coinciden');
        return;
      }
      if (formData.password.length < 6) {
        alert('La contraseña debe tener al menos 6 caracteres');
        return;
      }
      if (!formData.firstName.trim() || !formData.lastName.trim()) {
        alert('Nombre y apellido son requeridos');
        return;
      }
    }

    if (!formData.email || !formData.password) {
      alert('Email y contraseña son requeridos');
      return;
    }

    try {
      if (isRegister) {
        await register({
          username: formData.email.split('@')[0].trim(),
          email: formData.email.trim(),
          password: formData.password,
          first_name: formData.firstName.trim(),
          last_name: formData.lastName.trim(),
        });
      } else {
        await login(formData.email.trim(), formData.password);
      }
      navigate('/dashboard');
    } catch {
      // error handled by store
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /* ─── Shared text field style ─── */
  const fieldSx = {
    mb: 2.5,
    '& .MuiOutlinedInput-root': {
      backgroundColor: '#f8fafc',
      borderRadius: '12px',
      fontSize: '0.95rem',
      transition: 'all 0.25s ease',
      border: '1px solid transparent',
      '&:hover': {
        backgroundColor: '#f1f5f9',
        borderColor: '#cbd5e1',
      },
      '&.Mui-focused': {
        backgroundColor: '#fff',
        borderColor: '#1976d2',
        boxShadow: '0 0 0 3px rgba(25, 118, 210, 0.08)',
      },
      '& fieldset': {
        borderColor: '#e2e8f0',
        transition: 'border-color 0.25s ease',
      },
    },
    '& .MuiInputLabel-root': {
      fontSize: '0.9rem',
      '&.Mui-focused': {
        color: '#1976d2',
      },
    },
  };

  return (
    <>
      <AnimationStyles />
      <Box
        sx={{
          display: 'flex',
          minHeight: '100vh',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          bgcolor: '#f0f4f8',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #e3f2fd 0%, #f0f4f8 100%)',
        }}
      >
        {/* Background decorative elements */}
        <Box
          sx={{
            position: 'absolute',
            top: -100,
            left: -100,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(25,118,210,0.05) 0%, rgba(25,118,210,0) 100%)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -50,
            right: -50,
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(13,71,161,0.05) 0%, rgba(13,71,161,0) 100%)',
          }}
        />

        <Fade in timeout={800}>
          <Box sx={{ width: '100%', maxWidth: 460, px: 2, position: 'relative', zIndex: 1 }}>
            {/* ─── Centered Logo ─── */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '24px',
                  background: 'linear-gradient(135deg, #0d47a1, #1976d2)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                  boxShadow: '0 10px 25px rgba(25,118,210,0.3)',
                  animation: 'float 6s ease-in-out infinite',
                }}
              >
                <ShippingIcon sx={{ fontSize: 44, color: '#fff' }} />
              </Box>
              <Typography
                variant="h1"
                sx={{
                  fontWeight: 900,
                  color: '#0d47a1',
                  fontSize: '2rem',
                  letterSpacing: '1px',
                  mb: 0.5,
                }}
              >
                S.C.O.T.A.
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.9rem' }}>
                Sistema de Control Operativo para Transporte Acuícola
              </Typography>
            </Box>

            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, sm: 5 },
                borderRadius: '24px',
                bgcolor: '#ffffff',
                border: '1px solid rgba(255,255,255,0.8)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.02)',
                backdropFilter: 'blur(20px)',
              }}
            >
              {/* ── Form header ── */}
              <Box sx={{ mb: 4, textAlign: 'center' }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 800,
                    color: '#1e293b',
                    letterSpacing: '-0.5px',
                    mb: 1,
                  }}
                >
                  {isRegister ? 'Crear cuenta' : 'Bienvenido de nuevo'}
                </Typography>
                <Typography
                  sx={{
                    color: '#64748b',
                    fontSize: '0.9rem',
                    lineHeight: 1.5,
                  }}
                >
                  {isRegister
                    ? 'Ingrese sus datos para registrarse'
                    : 'Ingrese sus credenciales para continuar'}
                </Typography>
              </Box>

              {/* ── Error alert ── */}
              {error && (
                <Alert
                  severity="error"
                  sx={{
                    mb: 3,
                    borderRadius: '12px',
                    border: '1px solid #fecaca',
                    bgcolor: '#fef2f2',
                    '& .MuiAlert-icon': { alignItems: 'center' },
                  }}
                >
                  {error}
                </Alert>
              )}

              {/* ── Form ── */}
              <Box component="form" onSubmit={handleSubmit} noValidate>
                {isRegister && (
                  <>
                    <Box sx={{ display: 'flex', gap: 2, mb: 0 }}>
                      <TextField
                        required
                        fullWidth
                        id="firstName"
                        label="Nombre"
                        name="firstName"
                        autoComplete="given-name"
                        value={formData.firstName}
                        onChange={handleChange}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PersonIcon sx={{ color: '#94a3b8', fontSize: 20 }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={fieldSx}
                      />
                      <TextField
                        required
                        fullWidth
                        id="lastName"
                        label="Apellido"
                        name="lastName"
                        autoComplete="family-name"
                        value={formData.lastName}
                        onChange={handleChange}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PersonIcon sx={{ color: '#94a3b8', fontSize: 20 }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={fieldSx}
                      />
                    </Box>

                    <TextField
                      required
                      fullWidth
                      id="phone"
                      label="Teléfono"
                      name="phone"
                      autoComplete="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PhoneIcon sx={{ color: '#94a3b8', fontSize: 20 }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={fieldSx}
                    />
                  </>
                )}

                <TextField
                  required
                  fullWidth
                  id="email"
                  label={isRegister ? "Correo electrónico" : "Correo o Usuario"}
                  name="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon sx={{ color: '#94a3b8', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={fieldSx}
                />

                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Contraseña"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                  value={formData.password}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: '#94a3b8', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          tabIndex={-1}
                          sx={{ color: '#94a3b8' }}
                        >
                          {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={fieldSx}
                />

                {isRegister && (
                  <TextField
                    required
                    fullWidth
                    name="confirmPassword"
                    label="Confirmar contraseña"
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon sx={{ color: '#94a3b8', fontSize: 20 }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                            tabIndex={-1}
                            sx={{ color: '#94a3b8' }}
                          >
                            {showConfirmPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={fieldSx}
                  />
                )}

                <LoadingButton
                  type="submit"
                  fullWidth
                  variant="contained"
                  loading={isLoading}
                  startIcon={isRegister ? <RegisterIcon /> : <LoginIcon />}
                  sx={{
                    mt: 1,
                    mb: 2,
                    py: 1.6,
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    borderRadius: '12px',
                    textTransform: 'none',
                    background: 'linear-gradient(135deg, #0d47a1 0%, #1565c0 50%, #1976d2 100%)',
                    boxShadow: '0 6px 20px rgba(13, 71, 161, 0.35)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #051e3e 0%, #0d47a1 50%, #1565c0 100%)',
                      boxShadow: '0 8px 28px rgba(13, 71, 161, 0.45)',
                      transform: 'translateY(-1px)',
                    },
                    '&:active': {
                      transform: 'translateY(0)',
                    },
                  }}
                >
                  {isRegister ? 'Crear cuenta' : 'Iniciar sesión'}
                </LoadingButton>

                {/* ── Security note ── */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 0.8,
                    mt: 1,
                    mb: 2.5,
                  }}
                >
                  <CheckIcon sx={{ fontSize: 14, color: '#94a3b8' }} />
                  <Typography sx={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 500 }}>
                    Conexión segura y encriptada
                  </Typography>
                </Box>

                <Divider sx={{ my: 2.5, '&::before, &::after': { borderColor: '#e8ecf1' } }}>
                  <Typography
                    sx={{
                      color: '#94a3b8',
                      fontSize: '0.78rem',
                      px: 2,
                      fontWeight: 500,
                    }}
                  >
                    o
                  </Typography>
                </Divider>

                <Box textAlign="center" sx={{ mt: 2.5 }}>
                  <Typography sx={{ color: '#64748b', fontSize: '0.88rem' }}>
                    {isRegister ? '¿Ya tiene una cuenta?' : '¿No tiene una cuenta?'}
                    {' '}
                    <Link
                      component="button"
                      type="button"
                      onClick={onToggleMode}
                      sx={{
                        textDecoration: 'none',
                        fontWeight: 700,
                        color: '#1565c0',
                        fontSize: '0.88rem',
                        transition: 'all 0.2s',
                        '&:hover': {
                          textDecoration: 'underline',
                          color: '#0d47a1',
                        },
                      }}
                    >
                      {isRegister ? 'Iniciar sesión' : 'Crear cuenta'}
                    </Link>
                  </Typography>
                </Box>
              </Box>
            </Paper>

            <Typography
              sx={{
                mt: 4,
                color: 'rgba(100, 116, 139, 0.6)',
                fontSize: '0.75rem',
                textAlign: 'center',
              }}
            >
              © {new Date().getFullYear()} S.C.O.T.A. — Todos los derechos reservados
            </Typography>
          </Box>
        </Fade>
      </Box>
    </>
  );
};

const AuthPage: React.FC = () => {
  const [isRegister, setIsRegister] = useState(false);

  const toggleMode = () => {
    setIsRegister(!isRegister);
  };

  return <Login onToggleMode={toggleMode} isRegister={isRegister} />;
};

export default AuthPage;