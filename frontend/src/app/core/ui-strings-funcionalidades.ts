/** Textos de la página pública /funcionalidades (ES/EN). */
export const FUNCIONALIDADES_ES = {
  intro: {
    title: 'Todo lo que necesitas para organizar tu vida',
    subtitle:
      'TaskMaster te ayuda a priorizar, ejecutar y medir tu progreso en un solo lugar',
    cta: 'Empezar ahora',
  },
  cards: [
    {
      tag: 'Prioridad',
      title: 'Priorización automática',
      desc: 'Ordena tus tareas con base en urgencia y fecha límite para que siempre sepas qué va primero.',
    },
    {
      tag: 'IA',
      title: 'Asistente IA',
      desc: 'Recomienda pasos, divide tareas complejas, sugiere prioridades y hábitos para mejorar tu enfoque.',
    },
    {
      tag: 'Analítica',
      title: 'Estadísticas de productividad',
      desc: 'Gráficas y resúmenes para entender tu avance: cumplimiento, ritmo y consistencia semanal.',
    },
  ],
  flow: {
    titleLine1: 'Un flujo simple: de',
    connector: 'a',
    pendingWord: 'Pendiente',
    doneWord: 'Finalizado',
    desc: 'TaskMaster está pensado como prototipo funcional: claro, rápido y usable en móvil o escritorio.',
    features: [
      'Arrastra y suelta las tareas entre columnas',
      'Organiza por estado: Pendiente, En proceso, Finalizado',
      'Vista clara de todo tu progreso en un solo lugar',
    ],
  },
  kanban: {
    colPending: 'Pendiente',
    colProgress: 'En proceso',
    colDone: 'Finalizado',
    t1: { name: 'Proyecto PDS', prio: 'Alta', date: 'Mar 10' },
    t2: { name: 'Estudiar parcial', prio: 'Media', date: 'Mar 12' },
    t3: { name: 'Diseño UI/UX', prio: 'Alta', date: 'Hoy' },
    t4: { name: 'Definir alcance', ok: 'OK' },
  },
  postKanban: {
    eyebrow: 'Después del tablero',
    title: 'Cuando el orden visual ya está claro',
    lead: 'El tablero muestra el estado; lo que sigue es disciplina suave: hábitos y señales para que el flujo no se diluya.',
    spots: [
      {
        title: 'Foco acotado',
        text: 'Lleva en “En proceso” solo lo que puedes avanzar hoy. El resto puede esperar en Pendiente sin culpa.',
      },
      {
        title: 'Captura al vuelo',
        text: 'Anota primero; refina el título después. Una idea atrapada vale más que una fila perfecta mañana.',
      },
      {
        title: 'Ritmo de revisión',
        text: 'Dos minutos al empezar el día: qué sigue, qué bloquea y qué puedes cerrar antes del mediodía.',
      },
    ],
    panelReorderTitle: 'Señales de que conviene reordenar',
    panelReorderItems: [
      'Muchas tarjetas en Pendiente sin una fecha creíble.',
      'Varias cosas “en proceso” y pocas que lleguen a Finalizado.',
      'Dos tareas que dicen casi lo mismo: suele haber duplicado.',
    ],
    panelLoadTitle: 'Antes de sumar más carga',
    panelLoadItems: [
      'Si una tarjeta no cabe en una línea, quizá son dos trabajos distintos.',
      'Si lleva semanas quieta, el tamaño del trabajo, no el tablero, pide un corte.',
      'Mejor cerrar algo pequeño que mover sin fin lo enorme.',
    ],
  },
  extra: {
    title: '¿Por qué elegir TaskMaster?',
    cards: [
      {
        title: 'Interfaz intuitiva',
        desc: 'Diseño limpio y fácil de usar. Sin complicaciones ni curvas de aprendizaje.',
      },
      {
        title: 'Acceso multiplataforma',
        desc: 'Funciona en web, tablets y móviles. Tus tareas siempre a mano.',
      },
      {
        title: 'Seguridad y privacidad',
        desc: 'Tus datos protegidos. Solo tú tienes acceso a tu información.',
      },
    ],
  },
  complements: {
    eyebrow: 'Detalle',
    title: 'Complementos que usas cada día',
    lead: 'Funciones prácticas que no sustituyen lo anterior: amplían cómo capturas, encuentras y retomas el trabajo.',
    items: [
      {
        title: 'Fecha límite con hora',
        desc: 'Cada tarea lleva un vencimiento concreto (fecha y hora). Sirve para anclar entregas sin mezclarlo con el orden sugerido por prioridad.',
      },
      {
        title: 'Descripción opcional',
        desc: 'Añade detalle donde lo necesites: enlaces, criterios de “hecho” o notas breves, sin abrir otra herramienta.',
      },
      {
        title: 'Prioridad en cuatro niveles',
        desc: 'De baja a urgente, tú eliges la etiqueta de urgencia en el formulario; encaja con el tablero y con la lista filtrada.',
      },
      {
        title: 'Lista y acciones rápidas',
        desc: 'Filtra por estado, marca como finalizada con un clic, edita o elimina desde la misma pantalla: menos fricción entre revisar y ejecutar.',
      },
    ],
  },
  personas: {
    eyebrow: 'Casos de uso',
    title: 'Un mismo producto, distintos ritmos',
    blocks: [
      {
        name: 'Estudiantes',
        desc: 'Parciales, trabajos grupales y lecturas: encaja fechas de examen con bloques de estudio sin mezclar asignaturas.',
      },
      {
        name: 'Freelance y creativos',
        desc: 'Clientes y entregables en paralelo: una vista por cliente o campaña y límites claros para no prometer de más.',
      },
      {
        name: 'Varios frentes a la vez',
        desc: 'Cliente, familia y proyecto personal: prioridad y fecha límite te permiten repartir atención sin mezclar contextos.',
      },
    ],
  },
  faq: {
    eyebrow: 'Ayuda',
    title: 'Preguntas frecuentes',
    items: [
      {
        q: '¿Necesito instalar algo?',
        a: 'No. TaskMaster funciona en el navegador; entra desde cualquier dispositivo con tu cuenta.',
      },
      {
        q: '¿Puedo usarlo solo para proyectos personales?',
        a: 'Sí. Puedes mantener listas privadas y usar el flujo de estados sin compartir nada con nadie.',
      },
      {
        q: '¿Qué pasa si pierdo la conexión?',
        a: 'Depende del momento de la sesión: lo ideal es volver a conectar para que los cambios queden guardados en el servidor.',
      },
      {
        q: '¿Hay límite de tareas?',
        a: 'En el uso típico del prototipo no hace falta preocuparse por cupos; prioriza ordenar antes que acumular sin fin.',
      },
    ],
  },
  bottomCta: {
    title: '¿Listo para probarlo?',
    text: 'Crea tu cuenta y recorre el flujo en menos de un minuto.',
    btn: 'Crear cuenta gratuita',
  },
} as const;

export const FUNCIONALIDADES_EN = {
  intro: {
    title: 'Everything you need to organize your life',
    subtitle:
      'TaskMaster helps you prioritize, execute, and measure your progress in one place',
    cta: 'Get started',
  },
  cards: [
    {
      tag: 'Priority',
      title: 'Automatic prioritization',
      desc: 'Sort tasks by urgency and due date so you always know what comes first.',
    },
    {
      tag: 'AI',
      title: 'AI assistant',
      desc: 'Suggests steps, breaks down complex work, and recommends priorities and habits to sharpen your focus.',
    },
    {
      tag: 'Analytics',
      title: 'Productivity stats',
      desc: 'Charts and summaries to see your progress: completion, pace, and weekly consistency.',
    },
  ],
  flow: {
    titleLine1: 'A simple flow: from',
    connector: 'to',
    pendingWord: 'To do',
    doneWord: 'Done',
    desc: 'TaskMaster is built as a functional prototype: clear, fast, and usable on phone or desktop.',
    features: [
      'Drag and drop tasks between columns',
      'Organize by status: To do, In progress, Done',
      'A clear view of all your progress in one place',
    ],
  },
  kanban: {
    colPending: 'To do',
    colProgress: 'In progress',
    colDone: 'Done',
    t1: { name: 'PDS project', prio: 'High', date: 'Mar 10' },
    t2: { name: 'Study for exam', prio: 'Medium', date: 'Mar 12' },
    t3: { name: 'UI/UX design', prio: 'High', date: 'Today' },
    t4: { name: 'Define scope', ok: 'OK' },
  },
  postKanban: {
    eyebrow: 'After the board',
    title: 'When the visual order is clear',
    lead: 'The board shows status; what follows is gentle discipline—habits and cues so the flow does not fade.',
    spots: [
      {
        title: 'Narrow focus',
        text: 'Keep only what you can move today in “In progress.” The rest can wait in To do without guilt.',
      },
      {
        title: 'Capture on the fly',
        text: 'Write first; polish the title later. A captured idea beats a perfect row tomorrow.',
      },
      {
        title: 'Review rhythm',
        text: 'Two minutes at the start of the day: what’s next, what’s blocked, and what you can close before noon.',
      },
    ],
    panelReorderTitle: 'Signs it’s time to reshuffle',
    panelReorderItems: [
      'Many cards in To do without a believable date.',
      'Several items “in progress” but few reaching Done.',
      'Two tasks that say almost the same thing—often a duplicate.',
    ],
    panelLoadTitle: 'Before adding more load',
    panelLoadItems: [
      'If a card doesn’t fit on one line, it might be two different jobs.',
      'If it has been idle for weeks, the work size—not the board—needs a cut.',
      'Better to close something small than to shuffle the huge forever.',
    ],
  },
  extra: {
    title: 'Why TaskMaster?',
    cards: [
      {
        title: 'Intuitive interface',
        desc: 'Clean, easy design. No clutter and no steep learning curve.',
      },
      {
        title: 'Cross-platform access',
        desc: 'Works on the web, tablets, and phones. Your tasks always at hand.',
      },
      {
        title: 'Security and privacy',
        desc: 'Your data protected. Only you can access your information.',
      },
    ],
  },
  complements: {
    eyebrow: 'Detail',
    title: 'Complements you use every day',
    lead: 'Practical features that don’t replace the rest—they expand how you capture, find, and resume work.',
    items: [
      {
        title: 'Due date with time',
        desc: 'Each task has a concrete due (date and time). Anchor deliveries without mixing it with priority order.',
      },
      {
        title: 'Optional description',
        desc: 'Add detail where you need it: links, “done” criteria, or short notes—without another tool.',
      },
      {
        title: 'Four priority levels',
        desc: 'From low to urgent—you pick urgency in the form; it matches the board and filtered list.',
      },
      {
        title: 'List and quick actions',
        desc: 'Filter by status, mark done in one tap, edit or delete from the same screen—less friction between review and action.',
      },
    ],
  },
  personas: {
    eyebrow: 'Use cases',
    title: 'One product, different rhythms',
    blocks: [
      {
        name: 'Students',
        desc: 'Exams, group work, and readings: align test dates with study blocks without mixing subjects.',
      },
      {
        name: 'Freelancers and creatives',
        desc: 'Clients and deliverables in parallel: one view per client or campaign with clear limits.',
      },
      {
        name: 'Many fronts at once',
        desc: 'Client, family, and personal project: priority and due date help split attention without mixing contexts.',
      },
    ],
  },
  faq: {
    eyebrow: 'Help',
    title: 'FAQ',
    items: [
      {
        q: 'Do I need to install anything?',
        a: 'No. TaskMaster runs in the browser; sign in from any device.',
      },
      {
        q: 'Can I use it only for personal projects?',
        a: 'Yes. You can keep private lists and use the status flow without sharing anything.',
      },
      {
        q: 'What if I lose connection?',
        a: 'It depends on the session; ideally reconnect so changes are saved on the server.',
      },
      {
        q: 'Is there a task limit?',
        a: 'For typical prototype use you don’t need to worry about caps—organize before you pile up endlessly.',
      },
    ],
  },
  bottomCta: {
    title: 'Ready to try it?',
    text: 'Create your account and walk through the flow in under a minute.',
    btn: 'Create free account',
  },
} as const;
