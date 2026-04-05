/** Página pública /nosotros */
export const NOSOTROS_PAGE_ES = {
  team: {
    title: 'Equipo de Desarrollo',
    avatarAltPrefix: 'Avatar ilustrado de',
    members: [
      { name: 'Rafael Montoya Ocampo', role: 'Lider de proyecto' },
      { name: 'Isabela Puerta Pérez', role: 'Desarrolladora Frontend' },
      { name: 'Darwin Gonzalez Granados', role: 'Desarrollador Backend' },
      { name: 'Daniel Felipe Espitia', role: 'Especialista en IA y Testing' },
    ],
  },
  about: {
    title: 'Sobre el proyecto',
    descHtml:
      'TaskMaster es un <strong>prototipo académico</strong> de gestor inteligente de tareas personales: une una interfaz web sencilla con ideas de productividad y un asistente basado en IA para ayudarte a decidir qué hacer primero. Está pensado como demostración de buenas prácticas de desarrollo, accesibilidad y trabajo en equipo.',
    keysLabel: 'Ideas clave',
    keys: [
      { title: 'Organización y prioridades', text: 'Listas claras, fechas límite visibles y orden por urgencia.' },
      { title: 'Seguimiento de productividad', text: 'Métricas y vistas que reflejan tu avance real.' },
      { title: 'Asistente IA para planificar', text: 'Sugerencias y recordatorios en lenguaje natural.' },
      { title: 'Experiencia unificada', text: 'Misma identidad y navegación coherente en todo el sitio.' },
    ],
  },
  academic: [
    { label: 'Universidad', value: 'Universidad Autónoma de Manizales' },
    { label: 'Programa', value: 'Ingeniería en Sistemas' },
    { label: 'Curso', value: 'Proyecto de Desarrollo de Software' },
    { label: 'Profesor', value: 'German Alonzo Gonzales Martinez' },
  ],
  deepIntro: {
    title: 'TaskMaster, explicado con calma',
    lead:
      'Aquí profundizamos en lo que hace especial al proyecto: no solo una lista de funciones, sino el sentido de cada pieza para estudiar, trabajar y organizarte mejor.',
  },
  deepBlocks: [
    {
      heading: 'Organización que se entiende a la primera',
      p1:
        'Cuando todo parece urgente, lo que más ayuda es <strong>ver el panorama completo</strong>. TaskMaster te invita a capturar tareas en un solo lugar, asignar fechas límite y ordenar por prioridad para que el estrés no decida por ti.',
      p2:
        'La idea es que sepas, de un vistazo, qué vence pronto y qué puede esperar un poco más. Así reduces la carga mental de recordar fechas sueltas en chats, cuadernos o notas sueltas.',
    },
    {
      heading: 'Productividad con contexto, no solo números',
      p1:
        'Las estadísticas sirven cuando <strong>cuentan una historia</strong>: si avanzas en bloques cortos, si acumulas retrasos en un tipo de tarea o si ciertos días te funcionan mejor. El prototipo apunta a mostrar tu ritmo de forma honesta, sin humo ni gamificación vacía.',
      p2:
        'El objetivo no es presionarte, sino darte señales para ajustar hábitos: repartir carga, anticipar entregas y celebrar pequeños avances que antes pasaban desapercibidos.',
    },
    {
      heading: 'Un asistente que habla contigo, no contra ti',
      p1:
        'El asistente IA está pensado para <strong>acompañar la planificación</strong>: puedes formular dudas como le harías a un compañero —por ejemplo, cómo repartir estudio antes de un parcial o qué bloque conviene atacar primero.',
      p2:
        'Las respuestas buscan ser útiles y contextualizadas, siempre como apoyo a tu criterio. No sustituye el juicio de un docente; sí puede aliviar la fricción de organizar cuando el tiempo aprieta.',
    },
    {
      heading: 'Una sola experiencia, de la portada al tablero',
      p1:
        'Cuidamos la <strong>coherencia visual y verbal</strong>: tipografías, colores y tono de los textos se alinean entre la página pública y el área de trabajo. Eso reduce la curva de aprendizaje y transmite cuidado por el detalle.',
      p2:
        'Queremos que TaskMaster se sienta como un producto redondo, aun siendo prototipo: cada pantalla refuerza la misma promesa —organización clara y calmada.',
    },
    {
      heading: 'Raíces académicas y trabajo en equipo',
      p1:
        'Este software nace en el marco del <strong>Proyecto de Desarrollo de Software</strong> de la Universidad Autónoma de Manizales, con roles definidos —líder, frontend, backend, IA y pruebas— y decisiones documentadas para el curso.',
      p2:
        'Eso nos obliga a pensar en trazabilidad: qué se construyó, por qué y con qué aprendizajes. La transparencia frente al profesor y al equipo es parte del valor del entregable, no un adorno.',
    },
  ],
  more: {
    techTitle: 'Tecnologías y herramientas',
    techTagsAria: 'Lista de tecnologías',
    techLead: 'Piezas con las que construimos el prototipo: frontend moderno, API propia y buenas prácticas de despliegue.',
    techTags: ['Angular', 'TypeScript', 'SCSS', 'Node.js', 'REST API', 'Git'],
    goals: [
      {
        title: 'Objetivo académico',
        text: 'Aplicar ciclo de vida de software, trabajo colaborativo y entregas iterativas en un proyecto web real.',
      },
      {
        title: 'Objetivo de producto',
        text: 'Ofrecer un flujo simple para registrar tareas, ver progreso y recibir sugerencias sin fricción.',
      },
      {
        title: 'Objetivo técnico',
        text: 'Separar frontend y backend, validar datos y mantener una base de código clara para futuras mejoras.',
      },
    ],
  },
} as const;

export const NOSOTROS_PAGE_EN = {
  team: {
    title: 'Development team',
    avatarAltPrefix: 'Illustrated avatar of',
    members: [
      { name: 'Rafael Montoya Ocampo', role: 'Project lead' },
      { name: 'Isabela Puerta Pérez', role: 'Frontend developer' },
      { name: 'Darwin Gonzalez Granados', role: 'Backend developer' },
      { name: 'Daniel Felipe Espitia', role: 'AI & testing specialist' },
    ],
  },
  about: {
    title: 'About the project',
    descHtml:
      'TaskMaster is an <strong>academic prototype</strong> of a smart personal task manager: it combines a simple web interface with productivity ideas and an AI-based assistant to help you decide what to do first. It demonstrates good development practices, accessibility, and teamwork.',
    keysLabel: 'Key ideas',
    keys: [
      { title: 'Organization and priorities', text: 'Clear lists, visible due dates, and order by urgency.' },
      { title: 'Productivity tracking', text: 'Metrics and views that reflect your real progress.' },
      { title: 'AI assistant for planning', text: 'Suggestions and reminders in plain language.' },
      { title: 'Unified experience', text: 'Consistent identity and navigation across the site.' },
    ],
  },
  academic: [
    { label: 'University', value: 'Universidad Autónoma de Manizales' },
    { label: 'Program', value: 'Systems Engineering' },
    { label: 'Course', value: 'Software Development Project' },
    { label: 'Professor', value: 'German Alonzo Gonzales Martinez' },
  ],
  deepIntro: {
    title: 'TaskMaster, explained calmly',
    lead:
      'Here we go deeper into what makes the project special: not just a list of features, but the purpose of each piece for studying, working, and organizing better.',
  },
  deepBlocks: [
    {
      heading: 'Organization you understand at first glance',
      p1:
        'When everything feels urgent, it helps to <strong>see the full picture</strong>. TaskMaster invites you to capture tasks in one place, set due dates, and sort by priority so stress does not decide for you.',
      p2:
        'The idea is to know at a glance what is due soon and what can wait. That reduces the mental load of remembering scattered dates across chats, notebooks, or loose notes.',
    },
    {
      heading: 'Productivity with context, not just numbers',
      p1:
        'Stats matter when they <strong>tell a story</strong>: whether you move in short blocks, pile up delays on one task type, or do better on certain days. The prototype aims to show your pace honestly—no empty gamification.',
      p2:
        'The goal is not to pressure you, but to give signals to adjust habits: spread the load, anticipate deadlines, and celebrate small wins that used to go unnoticed.',
    },
    {
      heading: 'An assistant that talks with you, not at you',
      p1:
        'The AI assistant is meant to <strong>support planning</strong>: you can ask questions like you would a peer—how to split study before an exam, or which block to tackle first.',
      p2:
        'Answers aim to be useful and contextual, always backing your judgment. It does not replace a teacher’s judgment; it can ease the friction of organizing when time is tight.',
    },
    {
      heading: 'One experience, from landing to board',
      p1:
        'We care about <strong>visual and verbal consistency</strong>: fonts, colors, and tone align between the public site and the workspace. That lowers the learning curve and shows attention to detail.',
      p2:
        'We want TaskMaster to feel like a cohesive product, even as a prototype: every screen reinforces the same promise—clear, calm organization.',
    },
    {
      heading: 'Academic roots and teamwork',
      p1:
        'This software comes from the <strong>Software Development Project</strong> at Universidad Autónoma de Manizales, with defined roles—lead, frontend, backend, AI, and testing—and documented decisions for the course.',
      p2:
        'That forces us to think about traceability: what was built, why, and what we learned. Transparency with the instructor and the team is part of the deliverable’s value, not decoration.',
    },
  ],
  more: {
    techTitle: 'Technologies and tools',
    techTagsAria: 'Technology list',
    techLead: 'What we used to build the prototype: modern frontend, a custom API, and solid deployment practices.',
    techTags: ['Angular', 'TypeScript', 'SCSS', 'Node.js', 'REST API', 'Git'],
    goals: [
      {
        title: 'Academic goal',
        text: 'Apply the software lifecycle, collaborative work, and iterative delivery in a real web project.',
      },
      {
        title: 'Product goal',
        text: 'Offer a simple flow to log tasks, see progress, and get suggestions without friction.',
      },
      {
        title: 'Technical goal',
        text: 'Separate frontend and backend, validate data, and keep a clear codebase for future improvements.',
      },
    ],
  },
} as const;
