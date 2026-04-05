/** Página pública /asistente-ia */
export const ASISTENTE_IA_PAGE_ES = {
  hero: {
    title: '¿Qué hace el asistente IA?',
    subtitle: 'Analiza tus tareas y te recomienda cómo organizar tu tiempo de forma inteligente.',
  },
  features: [
    { title: 'Analiza tus prioridades', desc: 'Evalúa fechas límite y nivel de avance.' },
    { title: 'Optimiza tu tiempo', desc: 'Sugiere el mejor orden para trabajar.' },
    { title: 'Previene retrasos', desc: 'Recomienda cómo abordar tareas próximas a vencer' },
  ],
  chat: {
    title: 'Habla con él en lenguaje natural',
    text: 'No necesitas aprender comandos complicados. Simplemente escribe como si estuvieras hablando con un compañero de trabajo.',
    userMsg: 'Necesito organizar el proyecto de matemáticas para la próxima semana',
    assistantMsg:
      'Puedo ayudarte a ordenar las tareas por prioridad y plazos. Te sugiero repasar el tema el lunes, practicar ejercicios el miércoles y dejar un repaso corto antes de la entrega.',
  },
  responseCard: {
    title: 'Respuesta instantánea',
    metricTime: 'TIEMPO DE RESPUESTA',
    metricAvail: 'DISPONIBILIDAD',
    pill1: 'Procesamiento en tiempo real',
    pill2: 'Respuestas contextuales',
  },
  examples: {
    eyebrow: 'Inspírate',
    title: 'Ejemplos de preguntas',
    lead: 'Puedes pedirle al asistente que te ayude con planificación, prioridades o recordatorios. Estas son algunas ideas para empezar.',
    cards: [
      { tag: 'Prioridades', quote: '«¿Qué tareas debería hacer primero esta semana?»', hint: 'Prioriza según fechas límite y carga de trabajo.' },
      { tag: 'Calendario', quote: '«Tengo tres exámenes el mismo día, ¿cómo reparto el estudio?»', hint: 'Obtén un reparto sugerido por días y temas.' },
      { tag: 'Equipo', quote: '«Resume lo que tengo pendiente para el proyecto grupal»', hint: 'Vista rápida de tareas abiertas y próximos hitos.' },
    ],
  },
  how: {
    eyebrow: 'Súper simple',
    title: 'Ponlo en marcha en tres pasos',
    steps: [
      { title: 'Crea o importa tus tareas', desc: 'Añade lo que tengas pendiente en TaskMaster para que el asistente tenga contexto.' },
      { title: 'Escribe en lenguaje natural', desc: 'No hace falta sintaxis especial: pregunta como en una conversación normal.' },
      { title: 'Aplica las sugerencias', desc: 'Revisa el orden propuesto y ajusta fechas o prioridades en tu tablero.' },
    ],
  },
  faq: {
    eyebrow: 'Tranquilo',
    title: 'Preguntas frecuentes',
    items: [
      {
        q: '¿El asistente sustituye a un tutor o profesor?',
        a: 'No. Te orienta sobre organización y priorización; las decisiones académicas siguen siendo tuyas.',
      },
      {
        q: '¿Mis datos se usan para entrenar modelos?',
        a: 'Tratamos tu información según la política de privacidad del producto; no la compartimos con fines de entrenamiento sin tu consentimiento explícito.',
      },
      {
        q: '¿Funciona sin conexión?',
        a: 'El asistente necesita conexión para generar respuestas. Podrás seguir viendo tareas guardadas en la app cuando vuelvas a estar en línea.',
      },
    ],
  },
  cta: {
    title: '¿Listo para organizarte con IA?',
    text: 'Crea una cuenta y empieza a planificar con recomendaciones adaptadas a tu calendario de tareas.',
    btnPrimary: 'Crear cuenta',
    btnGhost: 'Ya tengo cuenta',
  },
} as const;

export const ASISTENTE_IA_PAGE_EN = {
  hero: {
    title: 'What does the AI assistant do?',
    subtitle: 'It analyzes your tasks and recommends how to organize your time smartly.',
  },
  features: [
    { title: 'Analyzes your priorities', desc: 'Evaluates due dates and progress.' },
    { title: 'Optimizes your time', desc: 'Suggests the best order to work.' },
    { title: 'Helps avoid delays', desc: 'Recommends how to tackle tasks close to their due date.' },
  ],
  chat: {
    title: 'Talk to it in plain language',
    text: 'No complicated commands—write as you would to a coworker.',
    userMsg: 'I need to organize my math project for next week',
    assistantMsg:
      'I can help you order tasks by priority and deadlines. I suggest reviewing the topic on Monday, practicing on Wednesday, and a short review before the due date.',
  },
  responseCard: {
    title: 'Instant response',
    metricTime: 'RESPONSE TIME',
    metricAvail: 'AVAILABILITY',
    pill1: 'Real-time processing',
    pill2: 'Contextual answers',
  },
  examples: {
    eyebrow: 'Get inspired',
    title: 'Example questions',
    lead: 'Ask the assistant for planning, priorities, or reminders. Here are some ideas to start.',
    cards: [
      { tag: 'Priorities', quote: '“What should I do first this week?”', hint: 'Prioritize by deadlines and workload.' },
      { tag: 'Calendar', quote: '“I have three exams the same day—how should I split studying?”', hint: 'Get a suggested split by day and topic.' },
      { tag: 'Team', quote: '“Summarize what I have pending for the group project”', hint: 'Quick view of open tasks and upcoming milestones.' },
    ],
  },
  how: {
    eyebrow: 'Super simple',
    title: 'Get started in three steps',
    steps: [
      { title: 'Create or import your tasks', desc: 'Add what is pending in TaskMaster so the assistant has context.' },
      { title: 'Write in natural language', desc: 'No special syntax—ask as in a normal conversation.' },
      { title: 'Apply the suggestions', desc: 'Review the proposed order and adjust dates or priorities on your board.' },
    ],
  },
  faq: {
    eyebrow: 'Relax',
    title: 'FAQ',
    items: [
      {
        q: 'Does the assistant replace a tutor or teacher?',
        a: 'No. It guides organization and prioritization; academic decisions are still yours.',
      },
      {
        q: 'Are my data used to train models?',
        a: 'We handle your information per the product privacy policy; we do not share it for training without explicit consent.',
      },
      {
        q: 'Does it work offline?',
        a: 'The assistant needs a connection to generate answers. You can still see saved tasks when you are back online.',
      },
    ],
  },
  cta: {
    title: 'Ready to get organized with AI?',
    text: 'Create an account and start planning with recommendations tailored to your task calendar.',
    btnPrimary: 'Create account',
    btnGhost: 'I already have an account',
  },
} as const;
