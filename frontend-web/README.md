# S.C.O.T.A. Web Frontend

Sistema de Control Operativo para Transporte Acuícola - Aplicación Web Frontend

## Descripción

Aplicación web desarrollada con React y TypeScript para la gestión integral de operaciones de transporte en la industria acuícola. Proporciona una interfaz moderna y responsiva para supervisores, conductores y personal administrativo.

## Características Principales

### 🚗 Gestión de Viajes
- Creación y seguimiento de viajes de transporte
- Control de rutas y tiempos
- Estados en tiempo real (pendiente, en progreso, completado)
- Gestión de carga (alimento, choritos, producto terminado)

### ✅ Sistema de Checklists
- Checklists personalizables por tipo de transporte
- Validación obligatoria antes del inicio de viajes
- Registro de respuestas y observaciones
- Historial completo de verificaciones

### 📸 Evidencia Fotográfica
- Captura y almacenamiento de fotos durante el proceso
- Geolocalización automática de imágenes
- Categorización por tipo de evidencia
- Visualización en galería organizada

### 🔧 Control de Mantenimiento
- Programación de mantenimientos preventivos
- Registro de reparaciones realizadas
- Alertas por vencimiento de servicios
- Historial completo por vehículo

### 🚛 Gestión de Vehículos
- Inventario completo de la flota
- Estados operativos en tiempo real
- Documentación y certificaciones
- Seguimiento de ubicación

### 👥 Administración de Usuarios
- Gestión de roles y permisos
- Perfiles personalizados por usuario
- Control de acceso basado en funciones
- Auditoría de actividades

### 📋 Control Documental
- Centralización de documentos importantes
- Versionado y control de cambios
- Acceso rápido por categorías
- Notificaciones de vencimientos

### ⏰ Gestión de Turnos
- Programación de horarios de trabajo
- Asignación automática de recursos
- Control de horas trabajadas
- Reportes de productividad

## Stack Tecnológico

- **React 18** - Framework de UI
- **TypeScript** - Tipado estático
- **Material-UI v5** - Componentes de interfaz
- **React Router v6** - Navegación
- **React Query** - Gestión de estado del servidor
- **Zustand** - Gestión de estado global
- **Axios** - Cliente HTTP
- **Vite** - Build tool y dev server

## Estructura del Proyecto

```
frontend-web/
├── public/
│   ├── index.html
│   ├── favicon.ico
│   └── manifest.json
├── src/
│   ├── components/          # Componentes reutilizables
│   │   ├── auth/           # Componentes de autenticación
│   │   ├── layout/         # Layout y navegación
│   │   ├── shared/         # Componentes compartidos
│   │   └── forms/          # Formularios específicos
│   ├── pages/              # Páginas principales
│   │   ├── Dashboard.tsx
│   │   ├── TripsPage.tsx
│   │   ├── VehiclesPage.tsx
│   │   └── ...
│   ├── services/           # Servicios de API
│   │   ├── api.ts
│   │   └── ...
│   ├── store/              # Estado global
│   │   ├── authStore.ts
│   │   ├── index.ts
│   │   └── ...
│   ├── types/              # Definiciones de tipos
│   │   └── index.ts
│   ├── utils/              # Utilidades
│   ├── theme/              # Tema de Material-UI
│   ├── App.tsx
│   └── index.tsx
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Instalación y Configuración

### Prerrequisitos
- Node.js 18 o superior
- npm o yarn
- Backend de S.C.O.T.A. ejecutándose

### Pasos de instalación

1. **Clonar el repositorio e instalar dependencias:**
```bash
cd frontend-web
npm install
```

2. **Configurar variables de entorno:**
```bash
# Crear archivo .env.local
echo "REACT_APP_API_URL=http://localhost:3001/api" > .env.local
```

3. **Iniciar el servidor de desarrollo:**
```bash
npm start
```

La aplicación estará disponible en `http://localhost:3000`

## Scripts Disponibles

```bash
# Desarrollo
npm start          # Iniciar servidor de desarrollo
npm run dev        # Alias para npm start

# Construcción
npm run build      # Construir para producción
npm run preview    # Previsualizar build de producción

# Calidad de código
npm run lint       # Ejecutar ESLint
npm run type-check # Verificar tipos de TypeScript

# Testing (cuando se implementen)
npm test           # Ejecutar tests
npm run test:watch # Tests en modo watch
```

## Configuración del Entorno

### Variables de Entorno

Crear un archivo `.env.local` en la raíz del proyecto:

```env
# URL de la API backend
REACT_APP_API_URL=http://localhost:3001/api

# Configuración de la aplicación
REACT_APP_NAME=S.C.O.T.A.
REACT_APP_VERSION=1.0.0

# Google Maps (opcional, para funciones de mapas futuras)
REACT_APP_GOOGLE_MAPS_API_KEY=your_api_key_here
```

## Arquitectura y Patrones

### Gestión de Estado
- **Zustand**: Estado global (auth, UI, aplicación)
- **React Query**: Estado del servidor y cache
- **Context API**: Configuraciones y temas

### Estructura de Componentes
- **Atomic Design**: Átomos, moléculas y organismos
- **Container/Presentational**: Separación de lógica y UI
- **Custom Hooks**: Reutilización de lógica de estado

### Navegación y Rutas
- **React Router v6**: Navegación declarativa
- **Rutas protegidas**: Control de acceso por roles
- **Lazy loading**: Carga diferida de componentes

## Funcionalidades por Rol

### Administrador
- Acceso completo a todas las funciones
- Gestión de usuarios y roles
- Configuración del sistema
- Reportes y análisis avanzados

### Supervisor
- Gestión de viajes y recursos
- Monitoreo de operaciones
- Reportes operativos
- Gestión de personal

### Conductor
- Visualización de viajes asignados
- Ejecución de checklists
- Captura de evidencias
- Registro de incidencias

### Mecánico
- Gestión de mantenimientos
- Registro de reparaciones
- Control de repuestos
- Historial técnico

## Integración con Backend

La aplicación web se comunica con el backend a través de una API REST:

- **Autenticación**: JWT tokens con refresh automático
- **Autorización**: Control de acceso basado en roles
- **Upload de archivos**: Multer para imágenes y documentos
- **Paginación**: Carga eficiente de grandes datasets
- **Filtros**: Búsqueda y filtrado avanzado

## Características de UI/UX

### Diseño Responsivo
- Mobile-first approach
- Breakpoints adaptativos
- Navegación optimizada para tablets

### Accesibilidad
- Cumplimiento WCAG 2.1
- Soporte para lectores de pantalla
- Navegación por teclado

### Rendimiento
- Code splitting automático
- Lazy loading de rutas
- Optimización de imágenes
- Cache inteligente

## Desarrollo y Contribución

### Estándares de Código
- **ESLint**: Linting y formateo
- **Prettier**: Formateo consistente
- **TypeScript**: Tipado estático obligatorio
- **Conventional Commits**: Mensajes de commit estandarizados

### Testing
```bash
# Tests unitarios (Jest + React Testing Library)
npm test

# Tests de integración
npm run test:integration

# Tests E2E (Cypress/Playwright)
npm run test:e2e
```

### Deployment

#### Desarrollo
```bash
npm run build
npm run preview
```

#### Producción
```bash
# Build optimizado
npm run build

# Los archivos estáticos estarán en dist/
```

## Próximas Funcionalidades

- [ ] PWA (Progressive Web App)
- [ ] Notificaciones push
- [ ] Modo offline
- [ ] Sincronización en segundo plano
- [ ] Integración con GPS/mapas
- [ ] Reportes PDF automatizados
- [ ] Dashboard en tiempo real
- [ ] Chat/mensajería interna

## Soporte

Para reportar problemas o solicitar nuevas funcionalidades:

1. Verificar issues existentes en el repositorio
2. Crear un nuevo issue con detalles específicos
3. Incluir pasos para reproducir (si es un bug)
4. Proporcionar contexto de uso

## Licencia

Proyecto propietario - S.C.O.T.A. Control Acuícola 2024