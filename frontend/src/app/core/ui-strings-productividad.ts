/** Página pública /productividad */
export const PRODUCTIVIDAD_PAGE_ES = {
  hero: {
    title: 'Te ayudamos con tu productividad',
    subtitle: 'Para que puedas disfrutar de tus actividades favoritas.',
  },
  activities: [
    { id: '1', label: 'Ejercicio', theme: 'exercise' as const, icon: 'exercise' as const },
    { id: '2', label: 'Colaborar', theme: 'collaborate' as const, icon: 'collaborate' as const },
    { id: '3', label: 'Cocinar', theme: 'cook' as const, icon: 'cook' as const },
    { id: '4', label: 'Trabajo', theme: 'work' as const, icon: 'work' as const },
  ],
  ctaEfficiency: {
    title: 'Mejoramos tu eficiencia',
    desc: 'Para que puedas dedicar tiempo a las actividades que te gustan. TaskMaster te ayuda a priorizar, organizar y cumplir tus metas.',
    btn: 'Mostrar sugerencias →',
  },
  ctaReminder: {
    title: '¡Que no se te olvide nada importante!',
    desc: 'Te avisamos antes de que venza cada tarea.',
  },
  more: {
    pill: 'Productividad sin límites',
    title: 'Todo lo que necesitas para avanzar',
    lead: 'Herramientas pensadas para que tu día fluya sin fricción — claras, rápidas y a tu ritmo.',
    cards: [
      { title: 'Listas y prioridades', desc: 'Ordena por urgencia, proyecto o fecha. Lo importante siempre visible.', tag: 'Prioriza mejor' },
      { title: 'Estadísticas claras', desc: 'Ve tu ritmo semanal y detecta patrones para mejorar poco a poco.', tag: 'Mide tu avance' },
      { title: 'Calendario integrado', desc: 'Sincroniza fechas límite y evita solapamientos en un solo vistazo.', tag: 'Todo alineado' },
      { title: 'Datos seguros', desc: 'Tu información protegida para que solo tú decidas qué compartir.', tag: 'Privacidad primero' },
    ],
  },
  steps: {
    pill: 'En minutos',
    title: 'Cómo empezar en tres pasos',
    subtitle: 'Sin tutoriales eternos: tres movimientos y ya estás organizando.',
    items: [
      { title: 'Crea tu cuenta', desc: 'Regístrate en segundos y accede al tablero desde cualquier dispositivo.' },
      { title: 'Añade tus tareas', desc: 'Escribe lo que tienes pendiente y asigna prioridad o fecha si quieres.' },
      { title: 'Organiza y celebra', desc: 'Mueve tareas entre columnas y revisa tu progreso cuando quieras.' },
    ],
  },
  faq: {
    pill: 'Dudas rápidas',
    title: 'Preguntas frecuentes',
    lead: 'Lo que más nos preguntan antes de empezar.',
    items: [
      {
        q: '¿TaskMaster es gratis?',
        a: 'Puedes empezar sin coste y explorar las funciones principales. Más adelante podrás ampliar si lo necesitas.',
      },
      {
        q: '¿Funciona en el móvil?',
        a: 'Sí. La interfaz es responsive: úsala en el navegador de tu teléfono o tablet con la misma experiencia.',
      },
      {
        q: '¿Puedo usarlo solo para estudio o también para el trabajo?',
        a: 'Sirve para ambos. Muchos usuarios mezclan proyectos personales, universidad y trabajo en un solo lugar.',
      },
    ],
  },
  bottomCta: {
    title: 'Empieza a organizar tu tiempo hoy',
    desc: 'Únete a TaskMaster y lleva tu productividad al siguiente nivel.',
    trust: 'Miles de tareas organizadas cada semana',
    btnPrimary: 'Crear cuenta gratis',
    btnGhost: 'Ver funcionalidades',
    peekTitle: 'Mi tablero',
    peekCol1: 'Pendiente',
    peekCol2: 'En curso',
    peekCol3: 'Hecho',
    peekCard1: 'Revisar informe',
    peekCard2: 'Email cliente',
    peekCard3: 'Diseño UI',
    peekCard4: 'Plan semanal',
  },
} as const;

export const PRODUCTIVIDAD_PAGE_EN = {
  hero: {
    title: 'We help you stay productive',
    subtitle: 'So you can enjoy the activities you love.',
  },
  activities: [
    { id: '1', label: 'Exercise', theme: 'exercise' as const, icon: 'exercise' as const },
    { id: '2', label: 'Collaborate', theme: 'collaborate' as const, icon: 'collaborate' as const },
    { id: '3', label: 'Cook', theme: 'cook' as const, icon: 'cook' as const },
    { id: '4', label: 'Work', theme: 'work' as const, icon: 'work' as const },
  ],
  ctaEfficiency: {
    title: 'We boost your efficiency',
    desc: 'So you can spend time on what you enjoy. TaskMaster helps you prioritize, organize, and hit your goals.',
    btn: 'Show suggestions →',
  },
  ctaReminder: {
    title: "Don't let important things slip!",
    desc: 'We remind you before each task is due.',
  },
  more: {
    pill: 'Productivity without limits',
    title: 'Everything you need to move forward',
    lead: 'Tools designed for a smooth day—clear, fast, and at your pace.',
    cards: [
      { title: 'Lists and priorities', desc: 'Sort by urgency, project, or date. What matters stays visible.', tag: 'Prioritize better' },
      { title: 'Clear stats', desc: 'See your weekly rhythm and spot patterns to improve step by step.', tag: 'Track progress' },
      { title: 'Built-in calendar', desc: 'Sync due dates and avoid overlaps at a glance.', tag: 'Stay aligned' },
      { title: 'Secure data', desc: 'Your information protected—you choose what to share.', tag: 'Privacy first' },
    ],
  },
  steps: {
    pill: 'In minutes',
    title: 'Start in three steps',
    subtitle: 'No endless tutorials—three moves and you are organizing.',
    items: [
      { title: 'Create your account', desc: 'Sign up in seconds and open the board from any device.' },
      { title: 'Add your tasks', desc: 'Write what is pending and add priority or date if you want.' },
      { title: 'Organize and celebrate', desc: 'Move tasks across columns and check progress anytime.' },
    ],
  },
  faq: {
    pill: 'Quick questions',
    title: 'FAQ',
    lead: 'What people ask most before they start.',
    items: [
      {
        q: 'Is TaskMaster free?',
        a: 'You can start at no cost and explore core features. You can expand later if you need to.',
      },
      {
        q: 'Does it work on mobile?',
        a: 'Yes. The UI is responsive—use it in your phone or tablet browser with the same experience.',
      },
      {
        q: 'Can I use it only for study or also for work?',
        a: 'Both. Many users mix personal projects, university, and work in one place.',
      },
    ],
  },
  bottomCta: {
    title: 'Start organizing your time today',
    desc: 'Join TaskMaster and take your productivity further.',
    trust: 'Thousands of tasks organized every week',
    btnPrimary: 'Create free account',
    btnGhost: 'See features',
    peekTitle: 'My board',
    peekCol1: 'To do',
    peekCol2: 'In progress',
    peekCol3: 'Done',
    peekCard1: 'Review report',
    peekCard2: 'Client email',
    peekCard3: 'UI design',
    peekCard4: 'Weekly plan',
  },
} as const;
