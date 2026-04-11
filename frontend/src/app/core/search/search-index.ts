export interface SearchableItem {
  title: string;
  description: string;
  route: string;
  keywords: string[];
}

/** Contenido indexado para la búsqueda global del sitio. */
export const SEARCH_INDEX: SearchableItem[] = [
  {
    title: 'Inicio',
    description: 'Página principal de TaskMaster: beneficios, registro y acceso.',
    route: '/',
    keywords: ['inicio', 'landing', 'principal', 'domina tu tiempo', 'crear cuenta'],
  },
  {
    title: 'Funcionalidades',
    description: 'Características del gestor de tareas y productividad.',
    route: '/funcionalidades',
    keywords: ['funcionalidades', 'características', 'qué hace', 'módulos'],
  },
  {
    title: 'Productividad',
    description: 'Cómo TaskMaster ayuda con tu productividad y actividades.',
    route: '/productividad',
    keywords: ['productividad', 'eficiencia', 'actividades', 'tiempo'],
  },
  {
    title: 'Asistente IA',
    description: 'Asistente inteligente para organizar tareas y planificar.',
    route: '/asistente-ia',
    keywords: ['asistente', 'ia', 'inteligencia artificial', 'chat', 'planificación'],
  },
  {
    title: 'Nosotros',
    description: 'Equipo de desarrollo e información académica del proyecto.',
    route: '/nosotros',
    keywords: ['nosotros', 'equipo', 'universidad', 'proyecto', 'desarrollo'],
  },
  {
    title: 'Iniciar sesión',
    description: 'Accede a tu cuenta de TaskMaster.',
    route: '/login',
    keywords: ['login', 'iniciar sesión', 'entrar', 'cuenta', 'correo'],
  },
  {
    title: 'Registro',
    description: 'Crea una cuenta nueva en TaskMaster.',
    route: '/register',
    keywords: ['registro', 'registrarse', 'crear cuenta', 'sign up'],
  },
  {
    title: 'Mi perfil',
    description: 'Datos personales, estadísticas y rol en TaskMaster.',
    route: '/perfil',
    keywords: ['perfil', 'cuenta', 'usuario', 'nombre', 'correo', 'rol'],
  },
  {
    title: 'Calendario',
    description: 'Vista mensual con notas por día y festivos (requiere sesión).',
    route: '/dashboard',
    keywords: [
      'dashboard',
      'calendario',
      'panel',
      'notas',
      'festivos',
      'mes',
      'agenda',
    ],
  },
  {
    title: 'Mis tareas',
    description: 'Lista y filtro de tareas (requiere sesión).',
    route: '/tasks',
    keywords: ['tareas', 'lista', 'pendientes', 'mis tareas'],
  },
  {
    title: 'Nueva tarea',
    description: 'Crear una nueva tarea (requiere sesión).',
    route: '/tasks/new',
    keywords: ['nueva tarea', 'crear tarea', 'añadir'],
  },
  {
    title: 'Editar tarea',
    description: 'Modifica una tarea existente desde la lista (abre el formulario de edición).',
    route: '/tasks',
    keywords: ['editar tarea', 'modificar tarea', 'cambiar tarea', 'actualizar'],
  },
  {
    title: 'Búsqueda',
    description: 'Buscar páginas y secciones de TaskMaster.',
    route: '/buscar',
    keywords: ['buscar', 'buscador', 'encontrar', 'search'],
  },
  {
    title: 'Mi productividad',
    description: 'Resumen personal, racha e ideas según tus tareas (requiere sesión).',
    route: '/mi-productividad',
    keywords: ['mi productividad', 'estadísticas propias', 'insights', 'racha', 'gráficas'],
  },
  {
    title: 'Asistente IA (mi cuenta)',
    description: 'Chat con el asistente usando tu historial y tareas (requiere sesión).',
    route: '/mi-asistente-ia',
    keywords: [
      'mi asistente',
      'chat privado',
      'organizar día',
      'conversación',
      'ia cuenta',
    ],
  },
  {
    title: 'Notificaciones',
    description: 'Preferencias y avisos de la aplicación (requiere sesión).',
    route: '/mi-notificaciones',
    keywords: ['notificaciones', 'avisos', 'alertas', 'recordatorios'],
  },
  {
    title: 'Configuración',
    description: 'Tema, idioma, zona horaria y ajustes de productividad (requiere sesión).',
    route: '/mi-configuracion',
    keywords: [
      'configuración',
      'ajustes',
      'tema',
      'idioma',
      'zona horaria',
      'preferencias',
    ],
  },
];
