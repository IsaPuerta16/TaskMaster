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
    description: 'Vista mensual con notas y festivos (requiere sesión).',
    route: '/dashboard',
    keywords: ['dashboard', 'calendario', 'panel', 'estadísticas', 'tareas'],
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
];
