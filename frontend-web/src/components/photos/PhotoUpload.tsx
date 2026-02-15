import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Button,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  IconButton,
  Grid,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  PhotoCamera as CameraIcon,
  Upload as UploadIcon,
  Close as CloseIcon,
  LocationOn as LocationIcon,
  Image as ImageIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { Photo } from '@/types';

interface PhotoUploadProps {
  open: boolean;
  onClose: () => void;
  onPhotoUploaded: (photo: Photo) => void;
  tripId?: string;
  vehicleId?: string;
  maintenanceId?: string;
  checklistResponseId?: string;
  requiredType?: string;
  requiredCategory?: string;
}

interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
}

interface DeviceInfo {
  userAgent: string;
  platform: string;
  appVersion: string;
  timestamp: string;
}

const PhotoUploadComponent: React.FC<PhotoUploadProps> = ({
  open,
  onClose,
  onPhotoUploaded,
  tripId,
  vehicleId,
  maintenanceId,
  checklistResponseId,
  requiredType,
  requiredCategory,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  
  // Metadatos de la foto
  const [photoData, setPhotoData] = useState({
    type: requiredType || 'general',
    category: requiredCategory || 'other',
    title: '',
    description: '',
    includeLocation: true,
    isRequired: Boolean(requiredType),
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Tipos y categorías disponibles
  const photoTypes = [
    { value: 'pre_trip', label: 'Pre-Viaje' },
    { value: 'during_trip', label: 'Durante el Viaje' },
    { value: 'post_trip', label: 'Post-Viaje' },
    { value: 'maintenance', label: 'Mantenimiento' },
    { value: 'damage', label: 'Daño' },
    { value: 'cargo', label: 'Carga' },
    { value: 'signature', label: 'Firma' },
    { value: 'document', label: 'Documento' },
    { value: 'incident', label: 'Incidente' },
    { value: 'general', label: 'General' },
  ];

  const photoCategories = [
    { value: 'vehicle_exterior', label: 'Exterior del Vehículo' },
    { value: 'vehicle_interior', label: 'Interior del Vehículo' },
    { value: 'cargo_loading', label: 'Carga/Cargando' },
    { value: 'cargo_unloading', label: 'Descarga/Descargando' },
    { value: 'damage_evidence', label: 'Evidencia de Daño' },
    { value: 'maintenance_work', label: 'Trabajo de Mantenimiento' },
    { value: 'checklist_item', label: 'Item de Checklist' },
    { value: 'delivery_proof', label: 'Comprobante de Entrega' },
    { value: 'safety_check', label: 'Verificación de Seguridad' },
    { value: 'other', label: 'Otro' },
  ];

  useEffect(() => {
    if (open && photoData.includeLocation) {
      getCurrentLocation();
    }
    
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [open]);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      console.warn('Geolocalización no soportada');
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Intentar obtener dirección usando reverse geocoding
          const response = await fetch(
            `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=YOUR_API_KEY`
          );
          const data = await response.json();
          const address = data.results?.[0]?.formatted || undefined;

          setLocation({ latitude, longitude, address });
        } catch {
          // Si falla el reverse geocoding, solo guardar coordenadas
          setLocation({ latitude, longitude });
        }
        setIsGettingLocation(false);
      },
      (error) => {
        console.warn('Error obteniendo ubicación:', error);
        setIsGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const getDeviceInfo = (): DeviceInfo => ({
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    appVersion: 'Web 1.0', // Versión del app web
    timestamp: new Date().toISOString(),
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      setError('Por favor seleccione un archivo de imagen');
      return;
    }

    // Validar tamaño (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('El archivo es muy grande. Máximo 10MB');
      return;
    }

    setSelectedFile(file);
    setError(null);

    // Crear preview
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // Auto-generar título si está vacío
    if (!photoData.title) {
      const timestamp = new Date().toLocaleString();
      const type = photoTypes.find(t => t.value === photoData.type)?.label || 'Foto';
      setPhotoData(prev => ({
        ...prev,
        title: `${type} - ${timestamp}`
      }));
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Cámara trasera preferida
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });

      setStream(mediaStream);
      setIsCapturing(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      setError('No se pudo acceder a la cámara');
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      if (!blob) return;

      const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
      setSelectedFile(file);

      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);

      // Detener cámara
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
      setIsCapturing(false);

      // Auto-generar título
      if (!photoData.title) {
        const timestamp = new Date().toLocaleString();
        const type = photoTypes.find(t => t.value === photoData.type)?.label || 'Foto';
        setPhotoData(prev => ({
          ...prev,
          title: `${type} - ${timestamp}`
        }));
      }
    }, 'image/jpeg', 0.8);
  };

  const extractExifData = async (file: File): Promise<any> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        // Aquí se implementaría extracción de EXIF real con una librería
        // Por ahora devolvemos datos básicos
        resolve({
          width: img.width,
          height: img.height,
          timestamp: new Date().toISOString(),
          fileSize: file.size,
          mimeType: file.type,
        });
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Seleccione una foto');
      return;
    }

    setUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Extraer EXIF data
      const exifData = await extractExifData(selectedFile);
      
      // Preparar FormData
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('type', photoData.type);
      formData.append('category', photoData.category);
      formData.append('title', photoData.title || '');
      formData.append('description', photoData.description || '');
      formData.append('is_required', String(photoData.isRequired));
      
      // Generar metadatos de dispositivo
      const deviceInfo = getDeviceInfo();
      formData.append('device_info', JSON.stringify(deviceInfo));
      formData.append('exif_data', JSON.stringify(exifData));

      // Agregar IDs relacionados
      if (tripId) formData.append('trip_id', tripId);
      if (vehicleId) formData.append('vehicle_id', vehicleId);
      if (maintenanceId) formData.append('maintenance_id', maintenanceId);
      if (checklistResponseId) formData.append('checklist_response_id', checklistResponseId);

      // Agregar ubicación si está disponible
      if (location && photoData.includeLocation) {
        formData.append('location_lat', String(location.latitude));
        formData.append('location_lng', String(location.longitude));
        if (location.address) {
          formData.append('location_address', location.address);
        }
      }

      // Simular progreso
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      // Simular upload exitoso
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      const mockPhoto: Photo = {
        id: `photo-${Date.now()}`,
        trip_id: tripId,
        maintenance_id: maintenanceId,
        vehicle_id: vehicleId,
        taken_by: 'current-user-id',
        type: photoData.type as any,
        title: photoData.title,
        file_url: previewUrl || '',
        file_name: selectedFile.name,
        taken_at: new Date().toISOString(),
        is_verified: false,
        notes: photoData.description,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      onPhotoUploaded(mockPhoto);
      setSuccess(true);
      
      // Auto-cerrar después de 2 segundos
      setTimeout(() => {
        handleClose();
      }, 2000);
      
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al subir la foto');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploading(false);
    setError(null);
    setSuccess(false);
    setUploadProgress(0);
    setLocation(null);
    setIsCapturing(false);
    setStream(null);
    
    // Reset form
    setPhotoData({
      type: requiredType || 'general',
      category: requiredCategory || 'other',
      title: '',
      description: '',
      includeLocation: true,
      isRequired: Boolean(requiredType),
    });
    
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CameraIcon color="primary" />
            <Typography variant="h6">
              {requiredType ? 'Foto Requerida' : 'Subir Evidencia Fotográfica'}
            </Typography>
          </Box>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Estados de éxito/error */}
        {success && (
          <Alert severity="success" icon={<CheckIcon />} sx={{ mb: 2 }}>
            Foto subida exitosamente
          </Alert>
        )}
        
        {error && (
          <Alert severity="error" icon={<ErrorIcon />} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Preview de la cámara */}
        {isCapturing && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ textAlign: 'center' }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  style={{ width: '100%', maxWidth: '400px', borderRadius: 8 }}
                />
                <canvas ref={canvasRef} style={{ display: 'none' }} />
                <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'center' }}>
                  <Button variant="contained" onClick={capturePhoto}>Capturar</Button>
                  <Button onClick={() => {
                    if (stream) {
                      stream.getTracks().forEach(track => track.stop());
                    }
                    setIsCapturing(false);
                  }}>Cancelar</Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Opciones de captura */}
        {!selectedFile && !isCapturing && (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <Card sx={{ cursor: 'pointer' }} onClick={startCamera}>
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <CameraIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h6">Tomar Foto</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Usar cámara del dispositivo
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card sx={{ cursor: 'pointer' }} onClick={() => fileInputRef.current?.click()}>
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <UploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h6">Seleccionar Archivo</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Subir desde galería
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/*"
          style={{ display: 'none' }}
        />

        {/* Preview de la imagen seleccionada */}
        {selectedFile && previewUrl && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Vista Previa
              </Typography>
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <img
                  src={previewUrl}
                  alt="Preview"
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '300px', 
                    borderRadius: 8,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                <Chip icon={<ImageIcon />} label={`${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`} size="small" />
                <Chip label={selectedFile.type} size="small" />
                {location && (
                  <Chip icon={<LocationIcon />} label="Con Ubicación" color="success" size="small" />
                )}
                <Button 
                  size="small"
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl(null);
                  }}
                >
                  Cambiar
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Formulario de metadatos */}
        {selectedFile && (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Tipo</InputLabel>
                <Select
                  value={photoData.type}
                  onChange={(e) => setPhotoData(prev => ({ ...prev, type: e.target.value }))}
                  disabled={Boolean(requiredType)}
                >
                  {photoTypes.map(type => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Categoría</InputLabel>
                <Select
                  value={photoData.category}
                  onChange={(e) => setPhotoData(prev => ({ ...prev, category: e.target.value }))}
                  disabled={Boolean(requiredCategory)}
                >
                  {photoCategories.map(category => (
                    <MenuItem key={category.value} value={category.value}>
                      {category.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Título"
                value={photoData.title}
                onChange={(e) => setPhotoData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Título descriptivo de la foto"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Descripción"
                value={photoData.description}
                onChange={(e) => setPhotoData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descripción detallada o notas adicionales"
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={photoData.includeLocation}
                    onChange={(e) => setPhotoData(prev => ({ ...prev, includeLocation: e.target.checked }))}
                  />
                }
                label="Incluir ubicación GPS"
              />
              
              {photoData.includeLocation && (
                <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  {isGettingLocation ? (
                    <Chip icon={<CircularProgress size={16} />} label="Obteniendo ubicación..." size="small" />
                  ) : location ? (
                    <Chip 
                      icon={<LocationIcon />} 
                      label={location.address || `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`}
                      color="success" 
                      size="small" 
                    />
                  ) : (
                    <>
                      <Chip icon={<ErrorIcon />} label="Ubicación no disponible" color="error" size="small" />
                      <IconButton size="small" onClick={getCurrentLocation}>
                        <RefreshIcon />
                      </IconButton>
                    </>
                  )}
                </Box>
              )}
            </Grid>
          </Grid>
        )}

        {/* Progress bar durante upload */}
        {uploading && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" gutterBottom>
              Subiendo foto... {uploadProgress}%
            </Typography>
            <LinearProgress variant="determinate" value={uploadProgress} />
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={uploading}>
          Cancelar
        </Button>
        <Button
          onClick={handleUpload}
          variant="contained"
          disabled={!selectedFile || uploading || success}
          startIcon={uploading ? <CircularProgress size={20} /> : <UploadIcon />}
        >
          {uploading ? 'Subiendo...' : 'Subir Foto'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PhotoUploadComponent;