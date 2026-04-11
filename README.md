# TaskMaster

**Gestor Inteligente de Tareas Personales**

---

## Equipo

| Rol | Integrante | Responsabilidades |
|-----|------------|-------------------|
| Líder de proyecto | Rafael Montoya Ocampo | Coordinación, cronograma, decisiones generales |
| Desarrolladora Frontend | Isabela Puerta Pérez | UI/UX, interfaz en Angular |
| Desarrollador Backend | Darwin Gonzalez Granados | Lógica, API NestJS, base de datos |
| Especialista IA y Testing | Daniel Felipe Espitia | Chatbot, pruebas, recomendaciones inteligentes |

---

## Universidad Autónoma de Manizales
**Ingeniería en Sistemas** · Proyecto de Desarrollo de Software  
**Profesor:** German Alonzo Gonzalez Martinez  
**Manizales, Colombia · 2025**

---

## Descripción

TaskMaster es una aplicación web/móvil para la gestión inteligente de tareas personales. Permite registrar actividades, priorizarlas automáticamente según fecha límite y urgencia, generar gráficas de productividad e integrar un chatbot con IA que sugiere cómo organizar y ejecutar tareas.

### Características principales

- Registro e inicio de sesión de usuarios
- Creación, edición y eliminación de tareas
- Priorización automática por fecha y urgencia
- Gráficas de productividad y seguimiento
- Recordatorios inteligentes
- Chatbot con IA para recomendaciones
- Interfaz web/móvil responsive

---

## Metodología: Kanban

El proyecto utiliza **Kanban** para organizar el trabajo:

| Estado | Descripción |
|--------|-------------|
| **Pendiente** | Actividades por iniciar |
| **En proceso** | Tareas en desarrollo |
| **En revisión** | Funcionalidades en validación |
| **Finalizado** | Actividades completadas |

**Tablero:** [GitHub Projects - TaskMaster Kanban](https://github.com/IsaPuerta16/TaskMaster/projects)

---

## Stack tecnológico

| Capa | Tecnología |
|------|------------|
| **Frontend** | Angular |
| **Backend** | NestJS |
| **Arquitectura** | Cliente-servidor |
| **Chatbot** | n8n + APIs de IA |

---

## Estructura del proyecto

```
TaskMaster/
├── frontend/          # Angular (cliente)
├── backend/           # NestJS (servidor)
└── README.md
```

### Arquitectura del código

- **Frontend (Angular):** cliente modular **por funcionalidades** (`features/`: auth, tasks, dashboard, user-*, search, public, etc.), con `core/` (servicios transversales, guards, modelos), `shared/` (layout reutilizable) y `routes/` que agrupan rutas públicas vs autenticadas. Alias: `@core/*`, `@features/*`, `@shared/*`.
- **Backend (NestJS):** **monolito modular**: un despliegue único (`AppModule`) que importa módulos de dominio en `src/modules/` (`auth`, `users`, `tasks`, `settings`, `calendar-notes`, `assistant`), cada uno con controlador, servicio y entidades propias.

---

## Diseño

- [Mockup en Figma](https://www.figma.com/design/oMtpL8TB0ExaYaOo3lxYvV/Proyecto-de-Desarrollo-de-Software?node-id=44-105&m=dev&t=AHl9BsRPRgfRBu3e-1)

---

## Ramas del repositorio

| Rama | Responsable |
|------|-------------|
| `main` | Rama principal |
| `Isa` | Isabela - Frontend |
| `Rafa` | Rafael - Liderazgo/DB |
| `Darwin` | Darwin - Backend |
| `Daniel` | Daniel - IA/Testing |

---

## Configuración y ejecución

### Requisitos

- Node.js 18+
- npm

### Backend (NestJS)

```bash
cd backend
npm install
npm run start:dev
```

El API queda en `http://localhost:<PORT>/api` (por defecto Nest usa el puerto **3000**; puedes fijar `PORT=3001` en `backend/.env`). La base de datos es **PostgreSQL** (p. ej. Supabase), configurada con `DATABASE_URL` en `.env`.

### Frontend (Angular)

```bash
cd frontend
npm install
npm run start
```

La aplicación estará en **http://localhost:4200**.

### Endpoints del API

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /api/auth/register | Registro de usuarios |
| POST | /api/auth/login | Inicio de sesión |
| GET | /api/tasks | Listar tareas (requiere auth) |
| POST | /api/tasks | Crear tarea (requiere auth) |
| GET | /api/tasks/stats | Estadísticas de productividad |
| PUT | /api/tasks/:id | Actualizar tarea |
| DELETE | /api/tasks/:id | Eliminar tarea |

---

## Pruebas automáticas

| Ubicación | Comando | Notas |
|-----------|---------|--------|
| **Backend** | `cd backend && npm test` | Jest: auth, tareas, formato respuesta n8n |
| **Backend e2e** | `cd backend && npm run test:e2e` | Requiere `DATABASE_URL` en `.env` |
| **Frontend (Angular)** | `cd frontend && npm run test:ci` | Karma en Chrome headless |
