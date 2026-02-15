import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  TextField,
  RadioGroup,
  Radio,
  Slider,
  Tabs,
  Tab,
  Badge,
} from '@mui/material';
import {
  Add as AddIcon,
  PlayArrow as StartIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  PhotoCamera as PhotoIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useAuthStore } from '@/store/authStore';
import apiService from '@/services/api';
import { Checklist, ChecklistItem, ChecklistResponse, Photo } from '@/types';
import PhotoUpload from '@/components/photos/PhotoUpload';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div hidden={value !== index}>
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const ChecklistsPage: React.FC = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState(0);
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openChecklistForm, setOpenChecklistForm] = useState(false);
  const [selectedChecklist, setSelectedChecklist] = useState<Checklist | null>(null);
  const [checklistResponses, setChecklistResponses] = useState<Record<string, any>>({});
  const [openPhotoUpload, setOpenPhotoUpload] = useState(false);
  const [photoUploadContext, setPhotoUploadContext] = useState<{
    itemId: string;
    itemType: string;
    itemQuestion: string;
  } | null>(null);

  // Estadísticas
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    mandatory: 0,
    completed_today: 0,
  });

  useEffect(() => {
    loadChecklists();
  }, []);

  const loadChecklists = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getChecklists();
      const checklistsData = response.data.checklists;
      setChecklists(checklistsData);
      
      // Calcular estadísticas
      setStats({
        total: checklistsData.length,
        active: checklistsData.filter(c => c.is_active).length,
        mandatory: checklistsData.filter(c => c.is_mandatory).length,
        completed_today: 0, // Esto se podría obtener del backend
      });
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al cargar checklists');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const getTypeLabel = (type: string) => {
    const types = {
      pre_trip: 'Pre-Viaje',
      during_trip: 'Durante el Viaje',
      post_trip: 'Post-Viaje',
      maintenance: 'Mantenimiento',
      safety: 'Seguridad',
    };
    return types[type as keyof typeof types] || type;
  };

  const getTypeColor = (type: string) => {
    const colors = {
      pre_trip: 'primary',
      during_trip: 'warning',
      post_trip: 'success',
      maintenance: 'info',
      safety: 'error',
    };
    return colors[type as keyof typeof colors] || 'default';
  };

  const getCargoTypeLabel = (cargoType: string) => {
    const types = {
      alimento: 'Alimento',
      choritos: 'Choritos',
      producto_terminado: 'Producto Terminado',
      general: 'General',
    };
    return types[cargoType as keyof typeof types] || cargoType;
  };

  const handleStartChecklist = (checklist: Checklist) => {
    setSelectedChecklist(checklist);
    setChecklistResponses({});
    setOpenChecklistForm(true);
  };

  const handleResponseChange = (itemId: string, value: any) => {
    setChecklistResponses(prev => ({
      ...prev,
      [itemId]: value
    }));
  };

  const handlePhotoRequired = (item: ChecklistItem) => {
    setPhotoUploadContext({
      itemId: item.id,
      itemType: 'checklist_item',
      itemQuestion: item.question
    });
    setOpenPhotoUpload(true);
  };

  const handlePhotoUploaded = (photo: Photo) => {
    if (photoUploadContext) {
      // Agregar URL de la foto a las respuestas del checklist
      const currentPhotos = checklistResponses[`${photoUploadContext.itemId}_photos`] || [];
      setChecklistResponses(prev => ({
        ...prev,
        [`${photoUploadContext.itemId}_photos`]: [...currentPhotos, photo.file_url]
      }));
    }
    setOpenPhotoUpload(false);
    setPhotoUploadContext(null);
  };

  const handleSubmitChecklist = async () => {
    if (!selectedChecklist) return;

    try {
      // Aquí iría la lógica para enviar las respuestas al backend
      console.log('Enviando respuestas:', checklistResponses);
      
      setOpenChecklistForm(false);
      setSelectedChecklist(null);
      setChecklistResponses({});
      
      // Mostrar mensaje de éxito
      alert('Checklist completado exitosamente');
    } catch (error) {
      console.error('Error al enviar checklist:', error);
      alert('Error al enviar checklist');
    }
  };

  const renderChecklistForm = () => {
    if (!selectedChecklist || !selectedChecklist.items) return null;

    return (
      <Dialog
        open={openChecklistForm}
        onClose={() => setOpenChecklistForm(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <AssignmentIcon />
            <div>
              <Typography variant="h6">{selectedChecklist.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedChecklist.description}
              </Typography>
            </div>
          </Box>
        </DialogTitle>

        <DialogContent dividers>
          <Box sx={{ mb: 3 }}>
            <Alert severity="info" icon={<InfoIcon />}>
              <Typography variant="body2">
                <strong>Instrucciones:</strong> {selectedChecklist.instructions || 'Complete todos los elementos requeridos del checklist.'}
              </Typography>
              {selectedChecklist.estimated_duration_minutes && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <strong>Duración estimada:</strong> {selectedChecklist.estimated_duration_minutes} minutos
                </Typography>
              )}
            </Alert>
          </Box>

          {selectedChecklist.items.map((item, index) => (
            <Card key={item.id} sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 2 }}>
                  <Typography variant="body2" color="primary" sx={{ fontWeight: 'bold', minWidth: '30px' }}>
                    {index + 1}.
                  </Typography>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      {item.question}
                      {item.is_required && <Typography component="span" color="error"> *</Typography>}
                      {item.is_critical && (
                        <Chip size="small" label="CRÍTICO" color="error" sx={{ ml: 1 }} />
                      )}
                    </Typography>

                    {item.help_text && (
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                        {item.help_text}
                      </Typography>
                    )}

                    {/* Renderizar campo según el tipo */}
                    {item.type === 'yes_no' && (
                      <FormControl component="fieldset">
                        <RadioGroup
                          value={checklistResponses[item.id] || ''}
                          onChange={(e) => handleResponseChange(item.id, e.target.value)}
                          row
                        >
                          <FormControlLabel value="true" control={<Radio />} label="Sí" />
                          <FormControlLabel value="false" control={<Radio />} label="No" />
                        </RadioGroup>
                      </FormControl>
                    )}

                    {item.type === 'text' && (
                      <TextField
                        fullWidth
                        multiline
                        rows={2}
                        value={checklistResponses[item.id] || ''}
                        onChange={(e) => handleResponseChange(item.id, e.target.value)}
                        placeholder="Escriba su respuesta..."
                      />
                    )}

                    {item.type === 'number' && (
                      <TextField
                        type="number"
                        value={checklistResponses[item.id] || ''}
                        onChange={(e) => handleResponseChange(item.id, e.target.value)}
                        placeholder="Ingrese un valor numérico"
                        inputProps={{
                          min: item.validation_rules?.min,
                          max: item.validation_rules?.max,
                        }}
                      />
                    )}

                    {item.type === 'select' && item.options && (
                      <FormControl fullWidth>
                        <TextField
                          select
                          SelectProps={{ native: true }}
                          value={checklistResponses[item.id] || ''}
                          onChange={(e) => handleResponseChange(item.id, e.target.value)}
                        >
                          <option value="">Seleccione una opción</option>
                          {(Array.isArray(item.options) ? item.options : item.options.items || []).map((option: any) => (
                            <option key={option.value || option} value={option.value || option}>
                              {option.label || option}
                            </option>
                          ))}
                        </TextField>
                      </FormControl>
                    )}

                    {item.requires_photo && (
                      <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Button
                          variant="outlined"
                          startIcon={<PhotoIcon />}
                          size="small"
                          color="secondary"
                          onClick={() => handlePhotoRequired(item)}
                        >
                          Tomar Foto
                        </Button>
                        {checklistResponses[`${item.id}_photos`]?.length > 0 && (
                          <Chip 
                            icon={<PhotoIcon />} 
                            label={`${checklistResponses[`${item.id}_photos`].length} foto(s)`}
                            variant="outlined"
                            size="small" 
                            color="success"
                          />
                        )}
                      </Box>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenChecklistForm(false)} startIcon={<CancelIcon />}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmitChecklist} 
            variant="contained" 
            startIcon={<SaveIcon />}
            color="primary"
          >
            Guardar Checklist
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Cargando checklists...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          📋 Gestión de Checklists
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Administre y complete checklists de verificación para transporte acuícola
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Estadísticas */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ p: 1.5, bgcolor: 'primary.light', borderRadius: 1 }}>
                  <AssignmentIcon sx={{ color: 'primary.contrastText' }} />
                </Box>
                <Box>
                  <Typography variant="h4" component="div">
                    {stats.total}
                  </Typography>
                  <Typography color="text.secondary">
                    Total Checklists
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
                  <CheckCircleIcon sx={{ color: 'success.contrastText' }} />
                </Box>
                <Box>
                  <Typography variant="h4" component="div">
                    {stats.active}
                  </Typography>
                  <Typography color="text.secondary">
                    Activos
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
                <Box sx={{ p: 1.5, bgcolor: 'warning.light', borderRadius: 1 }}>
                  <WarningIcon sx={{ color: 'warning.contrastText' }} />
                </Box>
                <Box>
                  <Typography variant="h4" component="div">
                    {stats.mandatory}
                  </Typography>
                  <Typography color="text.secondary">
                    Obligatorios
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
                  <InfoIcon sx={{ color: 'info.contrastText' }} />
                </Box>
                <Box>
                  <Typography variant="h4" component="div">
                    {stats.completed_today}
                  </Typography>
                  <Typography color="text.secondary">
                    Completados Hoy
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Todos los Checklists" />
            <Tab label="Pre-Viaje" />
            <Tab label="Durante Viaje" />
            <Tab label="Post-Viaje" />
            <Tab label="Mantenimiento" />
          </Tabs>
        </Box>

        {/* Panel Todos los Checklists */}
        <TabPanel value={activeTab} index={0}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Tipo de Carga</TableCell>
                  <TableCell>Duración</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {checklists.map((checklist) => (
                  <TableRow key={checklist.id}>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2">{checklist.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {checklist.description}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={getTypeLabel(checklist.type)} 
                        color={getTypeColor(checklist.type) as any}
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {getCargoTypeLabel(checklist.cargo_type)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {checklist.estimated_duration_minutes ? `${checklist.estimated_duration_minutes} min` : 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {checklist.is_active && (
                          <Chip label="Activo" color="success" size="small" />
                        )}
                        {checklist.is_mandatory && (
                          <Chip label="Obligatorio" color="warning" size="small" />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => handleStartChecklist(checklist)}
                          title="Completar Checklist"
                        >
                          <StartIcon />
                        </IconButton>
                        <IconButton size="small" color="default" title="Ver Detalles">
                          <ViewIcon />
                        </IconButton>
                        {user?.role === 'admin' && (
                          <IconButton size="small" color="default" title="Editar">
                            <EditIcon />
                          </IconButton>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Panels por tipo */}
        {['pre_trip', 'during_trip', 'post_trip', 'maintenance'].map((type, index) => (
          <TabPanel key={type} value={activeTab} index={index + 1}>
            <Grid container spacing={3}>
              {checklists
                .filter(checklist => checklist.type === type)
                .map((checklist) => (
                  <Grid item xs={12} md={6} lg={4} key={checklist.id}>
                    <Card sx={{ height: '100%' }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Typography variant="h6" component="h3">
                            {checklist.name}
                          </Typography>
                          <Chip 
                            label={checklist.is_active ? 'Activo' : 'Inactivo'} 
                            color={checklist.is_active ? 'success' : 'default'}
                            size="small" 
                          />
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {checklist.description}
                        </Typography>
                        
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="caption" color="text.secondary">
                            Tipo de Carga: {getCargoTypeLabel(checklist.cargo_type)}
                          </Typography>
                          <br />
                          <Typography variant="caption" color="text.secondary">
                            Items: {checklist.items?.length || 0}
                          </Typography>
                          {checklist.estimated_duration_minutes && (
                            <>
                              <br />
                              <Typography variant="caption" color="text.secondary">
                                Duración: {checklist.estimated_duration_minutes} min
                              </Typography>
                            </>
                          )}
                        </Box>
                        
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'space-between' }}>
                          <Button 
                            variant="contained" 
                            color="primary"
                            startIcon={<StartIcon />}
                            onClick={() => handleStartChecklist(checklist)}
                            size="small"
                          >
                            Iniciar
                          </Button>
                          <IconButton size="small" color="default" title="Ver Detalles">
                            <ViewIcon />
                          </IconButton>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
            </Grid>
          </TabPanel>
        ))}
      </Card>

      {/* Formulario de Checklist Dialog */}
      {renderChecklistForm()}

      {/* Photo Upload Dialog */}
      <PhotoUpload
        open={openPhotoUpload}
        onClose={() => {
          setOpenPhotoUpload(false);
          setPhotoUploadContext(null);
        }}
        onPhotoUploaded={handlePhotoUploaded}
        requiredType="checklist_item"
        requiredCategory="checklist_item"
      />

      {/* FAB para agregar checklist */}
      {user?.role === 'admin' && (
        <Fab
          color="primary"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          title="Crear Nuevo Checklist"
        >
          <AddIcon />
        </Fab>
      )}
    </Box>
  );
};

export default ChecklistsPage;