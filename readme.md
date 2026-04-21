# 🏠 Sistema de Gestión de Propiedades y Cobranza

**Descripción:** Plataforma integral para propietarios/administradores que permite llevar el control de propiedades en alquiler, servicios asociados, contratos, inquilinos, pagos y generación de reportes financieros. Incluye panel web administrativo y aplicación móvil para registro rápido de pagos.

---

## 📋 Stack Tecnológico Recomendado

| Capa               | Tecnología                                       | Justificación                                                                                                                                   |
| ------------------ | ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **Backend**        | NestJS (Node.js) + TypeScript                    | Framework robusto, modular y con soporte nativo para arquitectura hexagonal.                                                                    |
| **Arquitectura**   | Hexagonal (Puertos y Adaptadores)                | Desacopla lógica de negocio de infraestructura, facilita testing y cambios.                                                                     |
| **Base de Datos**  | PostgreSQL                                       | ACID, rendimiento, y manejo de relaciones complejas (propiedades, contratos).                                                                   |
| **Frontend Web**   | React + TypeScript + Vite (o Next.js)            | React por su ecosistema y reutilización de lógica con la app móvil (si usas Expo). Vite para desarrollo rápido; Next.js si requieres SEO o SSR. |
| **App Móvil**      | Expo (React Native)                              | Desarrollo ágil, compatibilidad iOS/Android, y acceso a cámara para fotos.                                                                      |
| **ORM / DB**       | Prisma o TypeORM                                 | Prisma recomendado por type-safety y migraciones sencillas.                                                                                     |
| **Autenticación**  | JWT + Refresh Tokens (Passport)                  | Seguridad estándar para API REST.                                                                                                               |
| **Almacenamiento** | Cloudinary / AWS S3                              | Para imágenes de propiedades (fotos).                                                                                                           |
| **Reportes**       | Chart.js (web) / Victory Native (móvil) + PDFKit | Gráficas y exportación a PDF/Excel.                                                                                                             |

---

## ✅ Requerimientos Funcionales

### 🧑‍💼 Gestión de Usuarios

- [ ] Registro e inicio de sesión (email/password).
- [ ] Roles: `admin` (dueño/gestor) y `viewer` (solo lectura, opcional).
- [ ] Recuperación de contraseña.

### 🏢 Gestión de Propiedades

- [ ] CRUD de propiedades: dirección, categoría (casa, depto, local, etc.), notas adicionales.
- [ ] Asociar múltiples fotos por propiedad (subida desde web y móvil).
- [ ] Visualizar galería de imágenes.

### 📆 Fechas y Vencimientos

- [ ] Fecha de vencimiento de contrato (alerta 30/15/7 días antes).
- [ ] Fecha de vencimiento de pago mensual (configurable por propiedad).
- [ ] Dashboard con próximos vencimientos.

### 💡 Servicios y Costos Fijos

- [ ] Registrar servicios por propiedad: Luz, Agua, Gas, Internet, Rol (impuesto predial), Gastos comunes, Seguros.
- [ ] Monto mensual estimado o real por servicio.
- [ ] Posibilidad de marcar si el servicio está incluido en el arriendo o lo paga el inquilino.

### 👥 Gestión de Arrendatarios

- [ ] CRUD de arrendatarios: nombre, email, teléfono, RUT/DNI.
- [ ] Asociar un arrendatario activo a una propiedad (historial de ocupación).
- [ ] Ver historial de pagos por arrendatario/propiedad.

### 💰 Cobranza y Pagos

- [ ] Registro de pago de arriendo por propiedad (monto, fecha, método de pago, comprobante opcional).
- [ ] Cálculo automático de deuda pendiente (considerando servicios si corresponde).
- [ ] Generación de comprobante de pago simple (PDF).
- [ ] Envío de recordatorio de pago por email (opcional).

### 📊 Reportes Financieros

- [ ] Panel de ingresos vs egresos por período (diario, semanal, mensual, anual).
- [ ] Reporte detallado por propiedad (historial de pagos, morosidad).
- [ ] Exportar reportes a PDF o CSV.
- [ ] Gráficos de ocupación y rentabilidad.

---

## 🏗️ Arquitectura del Backend (Hexagonal con NestJS)

src/
├── modules/
│ ├── property/
│ │ ├── application/ # Casos de uso (services)
│ │ ├── domain/ # Entidades, value objects, repositorios (puertos)
│ │ └── infrastructure/ # Adaptadores (controllers, repositorios Prisma, DTOs)
│ ├── tenant/
│ ├── payment/
│ ├── auth/
│ └── report/
├── shared/
│ ├── domain/ # Interfaces base, eventos de dominio
│ └── infrastructure/ # Configuración DB, módulos globales
└── main.ts

**Principios:**

- El dominio no conoce detalles externos (ORM, HTTP, etc.).
- Inyección de dependencias mediante tokens de NestJS para cambiar implementaciones fácilmente.
- Testing unitario de la lógica de negocio aislada.

---

## 📱 Funcionalidades Específicas de la App Expo

- [ ] Login persistente con SecureStore.
- [ ] Escaneo de comprobante de pago con cámara (opcional).
- [ ] Registro rápido de pago: seleccionar propiedad, ingresar monto, subir foto.
- [ ] Listado de propiedades con resumen de estado de pago.
- [ ] Notificaciones push para recordatorios de vencimiento.
- [ ] Visualización de fotos de la propiedad.

---

## 🗄️ Modelo de Base de Datos (PostgreSQL)

### Tablas principales

```sql
users
  - id (uuid)
  - email (unique)
  - password_hash
  - full_name
  - role (admin/viewer)
  - created_at

properties
  - id (uuid)
  - user_id (fk)
  - category (enum)
  - address
  - contract_end_date
  - payment_due_day (1-31)
  - notes
  - created_at

property_photos
  - id
  - property_id (fk)
  - url
  - uploaded_at

utilities
  - id
  - property_id (fk)
  - type (enum: electricity, water, internet, gas, rol, other)
  - amount (decimal)
  - is_included_in_rent (boolean)
  - billing_month (date, opcional)

tenants
  - id (uuid)
  - name
  - email
  - phone
  - document_id (opcional)
  - created_at

property_tenants
  - id
  - property_id (fk)
  - tenant_id (fk)
  - start_date
  - end_date (null si está activo)
  - monthly_rent (decimal)
  - is_active (boolean)

payments
  - id (uuid)
  - property_tenant_id (fk)  # relaciona propiedad+inquilino activo
  - amount
  - payment_date
  - payment_method (enum: cash, transfer, deposit, etc.)
  - receipt_url (opcional)
  - recorded_by (user_id fk)
  - notes
  - created_at

  Lista de Tareas por Hacer (Roadmap)
🔹 Fase 0: Configuración Inicial
Crear repositorio Git y estructura de monorepo (opcional: Nx o Turborepo).

Inicializar proyecto NestJS con configuración de Prettier/ESLint.

Configurar PostgreSQL local con Docker Compose.

Configurar Prisma y generar primer schema.

Implementar arquitectura hexagonal base (carpetas y módulo de ejemplo).

🔹 Fase 1: Autenticación y Usuarios
Backend: Módulo Auth con JWT, registro y login.

Frontend Web: Página de login/registro con React Hook Form + Zod.

App Expo: Pantalla de login y almacenamiento de token.

🔹 Fase 2: Gestión de Propiedades (Backend + Web)
CRUD completo de propiedades (dominio + infraestructura).

Subida de imágenes a Cloudinary/S3 (módulo de archivos).

Pantalla de listado y formulario de propiedad en React.

Visualización de galería con lightbox.

🔹 Fase 3: Gestión de Arrendatarios
Backend: ABM de arrendatarios.

Backend: Asignación de arrendatario a propiedad (histórico).

Web: Páginas de arrendatarios y asignación desde ficha de propiedad.

🔹 Fase 4: Servicios y Costos Fijos
Backend: CRUD de utilities por propiedad.

Web: Sección en detalle de propiedad para gestionar servicios.

🔹 Fase 5: Registro de Pagos
Backend: Endpoint para registrar pago (validar monto, deuda previa).

Web: Formulario rápido de pago con selector de propiedad/arrendatario.

App Expo: Pantalla de registro de pago con cámara para comprobante.

🔹 Fase 6: Dashboard y Reportes
Backend: Endpoints de reportes agregados (ingresos, egresos, ocupación).

Web: Dashboard con gráficos (Recharts) y filtros de fecha.

Web: Exportación a PDF/CSV (usando jsPDF o similar).

App Expo: Pantalla de resumen financiero simple.

🔹 Fase 7: Notificaciones y Recordatorios
Backend: Job programado (cron) para detectar vencimientos.

Backend: Envío de emails (Nodemailer) con plantillas.

App Expo: Integración con Expo Notifications para push.

🔹 Fase 8: Despliegue y Producción
Configurar CI/CD (GitHub Actions).

Desplegar Backend en Railway / Render / AWS.

Desplegar Frontend Web en Vercel / Netlify.

Publicar App Expo en stores (o usar EAS Build para distribución interna).

🚀 Siguientes Pasos Inmediatos
Definir el alcance del MVP: Priorizar propiedades, arrendatarios y registro de pagos simple.

Configurar el entorno de desarrollo siguiendo la Fase 0.

Comenzar con el módulo de Autenticación (es transversal).

📚 Recursos Útiles
NestJS Documentation

Hexagonal Architecture in NestJS (Curso/Artículo)

Prisma with PostgreSQL

Expo Camera

Nota del arquitecto: Este documento está diseñado para ser un punto de partida vivo. A medida que el proyecto avance, se recomienda actualizar las tareas completadas y refinar los requerimientos según el feedback del usuario final.
```
