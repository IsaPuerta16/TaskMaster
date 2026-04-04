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

El API estará en **http://localhost:3000**. Base de datos SQLite en `taskmaster.db`.

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
