# Sistema ASCAN - Backend

Sistema de gestión clínica desarrollado con Next.js y TypeScript.

## 🚀 Configuración para Despliegue

### 1. Variables de Entorno

Copia el archivo de ejemplo y configura tus variables:

```bash
cp env.production.example .env.production
```

### 2. Variables Requeridas

- `MYSQL_HOST`: Host de tu base de datos MySQL
- `MYSQL_USER`: Usuario de la base de datos
- `MYSQL_PASSWORD`: Contraseña de la base de datos
- `MYSQL_DATABASE`: Nombre de la base de datos
- `JWT_SECRET`: Clave secreta para JWT (generar con `node generate-jwt-secret.js`)

### 3. Instalación

```bash
npm install
```

### 4. Build y Ejecución

```bash
# Desarrollo
npm run dev

# Producción
npm run build
npm start
```

## 📊 Base de Datos

El sistema requiere una base de datos MySQL con las siguientes tablas:
- usuarios
- roles
- pacientes
- citas
- consultas
- laboratorio
- historial_medico

## 🔐 Seguridad

- Autenticación JWT
- Hashing de contraseñas con bcrypt
- Validación de datos con Zod
- Headers de seguridad configurados

## 🌐 API Endpoints

- `/api/auth/*` - Autenticación
- `/api/pacientes/*` - Gestión de pacientes
- `/api/citas/*` - Gestión de citas
- `/api/consultas/*` - Gestión de consultas
- `/api/laboratorio/*` - Resultados de laboratorio
- `/api/roles/*` - Gestión de roles y permisos

## 🚀 Despliegue

El backend está configurado para ejecutarse en el puerto 3001 en producción.
