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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Paper,
  InputAdornment,
  Alert,
  Link,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Description as DocumentIcon,
  AttachFile as AttachFileIcon,
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  CheckCircle as ValidIcon,
  Error as ExpiredIcon,
  Warning as ExpiringIcon,
} from '@mui/icons-material';
import { useDocumentStore } from '@/store/documentStore';
import { useVehicleStore } from '@/store';
import { useAuthStore } from '@/store/authStore';
import { useUserStore } from '@/store/userStore';
import { Document } from '@/types';
import { format } from 'date-fns';

const DocumentsPage: React.FC = () => {
  const { documents, fetchDocuments, createDocument, deleteDocument, isLoading, error } = useDocumentStore();
  const { vehicles, fetchVehicles } = useVehicleStore();
  const { users, fetchUsers } = useUserStore();
  const { user: currentUser } = useAuthStore();
  
  const [openDialog, setOpenDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    type: 'other',
    category: 'vehicle',
    description: '',
    document_number: '',
    expiry_date: '',
    vehicle_id: '',
    user_id: '',
  });

  useEffect(() => {
    fetchDocuments({ search: searchTerm, category: categoryFilter !== 'all' ? categoryFilter : undefined });
    fetchVehicles();
    fetchUsers();
  }, [fetchDocuments, fetchVehicles, fetchUsers, searchTerm, categoryFilter]);

  const handleOpenDialog = () => {
    resetForm();
    setOpenDialog(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      type: 'other',
      category: 'vehicle',
      description: '',
      document_number: '',
      expiry_date: '',
      vehicle_id: '',
      user_id: '',
    });
    setSelectedFile(null);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
        alert("Por favor seleccione un archivo");
        return;
    }

    try {
      const data = new FormData();
      data.append('file', selectedFile);
      Object.keys(formData).forEach(key => {
          data.append(key, (formData as any)[key]);
      });

      await createDocument(data);
      setOpenDialog(false);
      resetForm();
      fetchDocuments();
    } catch (error) {
      console.error('Error saving document:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este documento?')) {
      await deleteDocument(id);
      fetchDocuments();
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid': return <ValidIcon color="success" />;
      case 'expired': return <ExpiredIcon color="error" />;
      case 'expiring': return <ExpiringIcon color="warning" />;
      default: return <DocumentIcon color="action" />;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
          Gestión de Documentos
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
        >
          Subir Documento
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Paper sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Buscar documento..."
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
              <InputLabel>Categoría</InputLabel>
              <Select
                value={categoryFilter}
                label="Categoría"
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <MenuItem value="all">Todas</MenuItem>
                <MenuItem value="vehicle">Vehículo</MenuItem>
                <MenuItem value="driver">Conductor</MenuItem>
                <MenuItem value="company">Empresa</MenuItem>
                <MenuItem value="legal">Legal</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3}>
          {documents.map((doc) => (
              <Grid item xs={12} sm={6} md={4} key={doc.id}>
                  <Card>
                      <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Avatar sx={{ bgcolor: 'primary.light', mr: 2 }}>
                                {getStatusIcon(doc.status)}
                            </Avatar>
                            <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="h6" noWrap title={doc.title}>{doc.title}</Typography>
                                <Typography variant="body2" color="textSecondary">{doc.type}</Typography>
                            </Box>
                             <IconButton size="small" color="error" onClick={() => handleDelete(doc.id)}>
                                <DeleteIcon />
                            </IconButton>
                          </Box>
                          
                          <Typography variant="body2" sx={{ mb: 1 }}>
                              <strong>Categoría:</strong> {doc.category}
                          </Typography>
                           {doc.expiry_date && (
                              <Typography variant="body2" sx={{ mb: 1, color: doc.status === 'expired' ? 'error.main' : 'text.primary' }}>
                                  <strong>Vence:</strong> {format(new Date(doc.expiry_date), 'dd/MM/yyyy')}
                              </Typography>
                           )}
                           {doc.vehicle_id && (
                               <Typography variant="body2" sx={{ mb: 1 }}>
                                   <strong>Vehículo:</strong> {vehicles.find(v => v.id === doc.vehicle_id)?.license_plate || 'Unknown'}
                               </Typography>
                           )}

                           <Box sx={{ mt: 2 }}>
                               <Button 
                                variant="outlined" 
                                size="small" 
                                fullWidth 
                                startIcon={<ViewIcon />}
                                href={doc.file_url}
                                target="_blank"
                               >
                                   Ver Documento
                               </Button>
                           </Box>
                      </CardContent>
                  </Card>
              </Grid>
          ))}
      </Grid>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Subir Nuevo Documento</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Título del Documento"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </Grid>
             <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Categoría</InputLabel>
                <Select
                  value={formData.category}
                  label="Categoría"
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <MenuItem value="vehicle">Vehículo</MenuItem>
                  <MenuItem value="driver">Conductor</MenuItem>
                  <MenuItem value="company">Empresa</MenuItem>
                  <MenuItem value="legal">Legal</MenuItem>
                   <MenuItem value="safety">Seguridad</MenuItem>
                    <MenuItem value="maintenance">Mantenimiento</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Tipo</InputLabel>
                <Select
                  value={formData.type}
                  label="Tipo"
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <MenuItem value="insurance">Seguro</MenuItem>
                  <MenuItem value="permit">Permiso</MenuItem>
                  <MenuItem value="inspection">Inspección Técnica</MenuItem>
                  <MenuItem value="license">Licencia</MenuItem>
                   <MenuItem value="registration">Registro</MenuItem>
                    <MenuItem value="contract">Contrato</MenuItem>
                     <MenuItem value="invoice">Factura</MenuItem>
                     <MenuItem value="other">Otro</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {formData.category === 'vehicle' && (
                 <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Vehículo Asociado</InputLabel>
                    <Select
                      value={formData.vehicle_id}
                      label="Vehículo Asociado"
                      onChange={(e) => setFormData({ ...formData, vehicle_id: e.target.value })}
                    >
                        <MenuItem value="">Ninguno</MenuItem>
                      {vehicles.map((v) => (
                        <MenuItem key={v.id} value={v.id}>
                          {v.brand} {v.model} - {v.license_plate}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
            )}

             {formData.category === 'driver' && (
                 <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Conductor Asociado</InputLabel>
                    <Select
                      value={formData.user_id}
                      label="Conductor Asociado"
                      onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                    >
                         <MenuItem value="">Ninguno</MenuItem>
                      {users.filter(u => u.role === 'driver').map((u) => (
                        <MenuItem key={u.id} value={u.id}>
                          {u.first_name} {u.last_name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
            )}

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Fecha de Vencimiento"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={formData.expiry_date}
                onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
              />
            </Grid>
             <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Número de Documento"
                value={formData.document_number}
                onChange={(e) => setFormData({ ...formData, document_number: e.target.value })}
              />
            </Grid>
            
             <Grid item xs={12}>
                 <Button
                    component="label"
                    variant="outlined"
                    startIcon={<CloudUploadIcon />}
                    fullWidth
                    sx={{ height: 56 }}
                 >
                     {selectedFile ? selectedFile.name : 'Seleccionar Archivo (PDF, JPG, PNG)'}
                     <input type="file" hidden onChange={handleFileChange} />
                 </Button>
            </Grid>

            <Grid item xs={12}>
               <TextField
                fullWidth
                label="Descripción / Notas"
                multiline
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>

          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={!selectedFile}>
            Subir
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DocumentsPage;
