# S.C.O.T.A. - Sistema de Control Operativo para Transporte Acuícola

Sistema integral para la gestión y control de operaciones de transporte en la industria acuícola.

## 🚚 Fase 1: Transporte Especializado
- **Alimento para peces**
- **Choritos** 
- **Producto terminado**

## 🎯 Funcionalidades Principales

### ✅ Checklist de Transporte
- Pre-viaje: Revisión de vehículo, documentación, carga
- Durante viaje: Controles de temperatura, estado de carga
- Post-viaje: Entrega, limpieza, reportes

### 👥 Gestión de Turnos
- Asignación de conductores y vehículos
- Control de horarios y disponibilidad
- Reportes de productividad

### 📸 Evidencia Fotográfica
- Captura de fotos durante pre-viaje, transporte y entrega
- Almacenamiento seguro con metadatos
- Trazabilidad completa

### 🔧 Registro de Mantenciones
- Programación de mantenimientos preventivos
- Registro de reparaciones y costos
- Alertas automáticas

### 📋 Control Documental
- Gestión de permisos y certificaciones
- Vencimientos y renovaciones
- Archivo digital seguro

## 🏗️ Arquitectura del Sistema

### Backend (Node.js + Express + PostgreSQL)
```
backend/
├── src/
│   ├── controllers/     # Controladores de API
│   ├── models/         # Modelos de datos
│   ├── routes/         # Rutas de API
│   ├── middleware/     # Middlewares
│   ├── services/       # Lógica de negocio
│   └── utils/          # Utilidades
├── database/
│   ├── migrations/     # Migraciones de BD
│   └── seeds/          # Datos iniciales
└── uploads/            # Archivos subidos
```

### Frontend Web (React)
```
frontend-web/
├── src/
│   ├── components/     # Componentes reutilizables
│   ├── pages/         # Páginas principales
│   ├── hooks/         # Custom hooks
│   ├── services/      # Servicios API
│   ├── store/         # Estado global
│   └── utils/         # Utilidades
└── public/            # Archivos estáticos
```

### Frontend Móvil (React Native)
```
frontend-mobile/
├── src/
│   ├── components/     # Componentes móviles
│   ├── screens/       # Pantallas
│   ├── navigation/    # Navegación
│   ├── services/      # Servicios API
│   ├── store/         # Estado global
│   └── utils/         # Utilidades
└── assets/            # Recursos móviles
```

## 👤 Tipos de Usuario

- **🚛 Conductores**: App móvil para checklist y reportes de campo
- **👁️ Supervisores**: Panel web para monitoreo y supervisión
- **⚙️ Administradores**: Acceso completo a configuración y reportes
- **🔧 Mecánicos**: Registro de mantenimientos y estado de vehículos

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js >= 18
- PostgreSQL >= 13
- Git

### Backend
```bash
cd backend
npm install
npm run setup-db
npm run dev
```

### Frontend Web
```bash
cd frontend-web
npm install
npm start
```

### Frontend Móvil
```bash
cd frontend-mobile
npm install
npx react-native run-android # o run-ios
```

## 🛡️ Seguridad
- Autenticación JWT
- Roles y permisos granulares
- Encriptación de datos sensibles
- Backup automático

## 📊 Tecnologías Utilizadas

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **PostgreSQL** - Base de datos relacional
- **Sequelize** - ORM
- **JWT** - Autenticación
- **Multer** - Upload de archivos
- **Sharp** - Procesamiento de imágenes

### Frontend Web
- **React** - Librería UI
- **TypeScript** - Tipado estático
- **Material-UI** - Componentes UI
- **React Query** - Gestión de estado servidor
- **React Hook Form** - Formularios

### Frontend Móvil
- **React Native** - Framework móvil
- **TypeScript** - Tipado estático
- **React Navigation** - Navegación
- **React Native Camera** - Cámara
- **AsyncStorage** - Almacenamiento local

## 📝 Licencia
Propietario - COTRAQ

---
*Desarrollado para optimizar y digitalizar las operaciones de transporte acuícola*