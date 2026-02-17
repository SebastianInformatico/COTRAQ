# Guía de Despliegue - COTRAQ

Esta guía explica cómo desplegar el sistema COTRAQ utilizando **Railway** para el backend y la base de datos, y **Vercel** para el frontend web.

## 1. Despliegue del Backend (Railway)

### Pasos:

1. Crea una cuenta en [Railway.app](https://railway.app/).
2. Conecta tu repositorio de GitHub.
3. Agrega un nuevo servicio de **PostgreSQL** a tu proyecto en Railway.
4. Conecta el servicio de Backend (`/backend`):
   - Ve a "New" -> "GitHub Repo" -> Selecciona el repositorio.
   - En la configuración del servicio, establece el **Root Directory** como `backend`.
5. Configura las variables de entorno en Railway para el servicio de backend:
   - `NODE_ENV`: `production`
   - `PORT`: `3001` (o el que prefieras)
   - `JWT_SECRET`: Una cadena aleatoria segura.
   - `FRONTEND_URL`: La URL que te asigne Vercel (ej. `https://cotraq.vercel.app`).
   - `DB_SSL`: `true`
   - Railway inyectará automáticamente `DATABASE_URL` si el servicio de PostgreSQL está en el mismo proyecto.

### Migraciones:

El archivo `railway.json` ya está configurado para ejecutar `npm run migrate` automáticamente antes de iniciar.

---

## 2. Despliegue del Frontend Web (Vercel)

### Pasos:

1. Crea una cuenta en [Vercel](https://vercel.com/).
2. Importa tu repositorio desde GitHub.
3. Al configurar el proyecto:
   - **Root Directory**: `frontend-web`
   - **Framework Preset**: `Vite`
4. Configura las variables de entorno en Vercel:
   - `VITE_API_URL`: La URL que te asigne Railway para el backend (ej. `https://cotraq-production.up.railway.app/api`).
5. Haz clic en **Deploy**.

---

## Resumen de Variables de Entorno

| Servicio     | Variable       | Descripción                                     |
| :----------- | :------------- | :---------------------------------------------- |
| **Backend**  | `DATABASE_URL` | Proporcionada por Railway.                      |
| **Backend**  | `JWT_SECRET`   | Secreto para tokens JWT.                        |
| **Backend**  | `FRONTEND_URL` | URL del frontend en Vercel.                     |
| **Frontend** | `VITE_API_URL` | URL del backend en Railway terminada en `/api`. |

---

## Notas Importantes

- **CORS**: El backend está configurado para aceptar peticiones desde dominios `.vercel.app` y `.up.railway.app` automáticamente.
- **SSL**: La conexión a la base de datos de Railway requiere SSL, lo cual ya está configurado en `backend/database/config.js`.
