# TaskMaster — Frontend (Angular)

Proyecto generado con [Angular CLI](https://github.com/angular/angular-cli) 17.

## Estructura de carpetas (`src/app`)

| Carpeta | Contenido |
|--------|-----------|
| **`core/`** | Lógica de aplicación: `services/`, `guards/`, `interceptors/`, `models/`. Un solo uso en toda la app. |
| **`shared/`** | Componentes y utilidades reutilizables. `layout/` (header, footer) con barrel `shared/layout/index.ts`. |
| **`features/`** | Pantallas por dominio: `landing`, `funcionalidades`, `productividad`, `asistente-ia`, `auth`, `dashboard`, `tasks`. Cada feature es un módulo de rutas con componentes standalone. |
| **`routes/`** | Definición de rutas segmentada: `guest.routes.ts` (públicas) y `auth.routes.ts` (protegidas). `app.routes.ts` las combina. |

### Alias TypeScript (`tsconfig.json`)

- `@core/*` → `src/app/core/*` (modelos, servicios, guards)
- `@shared/*` → `src/app/shared/*` (ej. `import { HeaderComponent } from '@shared/layout'`)
- `@env/*` → `src/environments/*`

### Convenciones

- **Rutas**: carga perezosa (`loadComponent`) en `routes/*.routes.ts`.
- **Modelos**: interfaces en `core/models/` y reexport en `core/models/index.ts`.
- **Barrels**: `shared/layout/index.ts` y `shared/index.ts` para imports cortos de layout.

## Desarrollo

```bash
npm install
npm start
```

Navegador: `http://localhost:4200/`.

## Build

```bash
npm run build
```

Salida en `dist/frontend`.
