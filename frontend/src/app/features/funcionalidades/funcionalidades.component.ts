import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HeaderComponent, FooterComponent } from '@shared/layout';

@Component({
  selector: 'app-funcionalidades',
  standalone: true,
  imports: [CommonModule, RouterLink, HeaderComponent, FooterComponent],
  template: `
    <div class="funcionalidades">
      <app-header />

      <main class="main">
        <section class="intro-hero">
          <div class="intro-wave"></div>
          <div class="intro-content">
            <h1 class="intro-title">Todo lo que necesitas para organizar tu vida</h1>
            <p class="intro-subtitle">TaskMaster te ayuda a priorizar, ejecutar y medir tu progreso en un solo lugar</p>
            <a routerLink="/register" class="intro-btn">Empezar ahora</a>
          </div>
        </section>

        <section class="cards-section">
          <div class="cards-grid">
            <article class="func-card">
              <span class="func-tag">Prioridad</span>
              <div class="func-card-icon"><span class="func-emoji">🧠</span></div>
              <h3 class="func-title">Priorización automática</h3>
              <p class="func-desc">Ordena tus tareas con base en urgencia y fecha límite para que siempre sepas qué va primero.</p>
            </article>

            <article class="func-card">
              <span class="func-tag">IA</span>
              <div class="func-card-icon"><span class="func-emoji">🤖</span></div>
              <h3 class="func-title">Asistente IA</h3>
              <p class="func-desc">Recomienda pasos, divide tareas complejas, sugiere prioridades y hábitos para mejorar tu enfoque.</p>
            </article>

            <article class="func-card">
              <span class="func-tag">Analítica</span>
              <div class="func-card-icon"><span class="func-emoji">📈</span></div>
              <h3 class="func-title">Estadísticas de productividad</h3>
              <p class="func-desc">Gráficas y resúmenes para entender tu avance: cumplimiento, ritmo y consistencia semanal.</p>
            </article>
          </div>
        </section>

        <section class="flow-section">
          <div class="flow-content">
            <div class="flow-text">
              <h2 class="flow-title">
                <span class="flow-title-line1">Un flujo simple: de</span>
                <span class="flow-title-line2">
                  <span class="underline-word">&ldquo;Pendiente&rdquo;</span> a &ldquo;Finalizado&rdquo;
                </span>
              </h2>
              <p class="flow-desc">
                TaskMaster está pensado como prototipo funcional: claro, rápido y usable en móvil o escritorio.
              </p>
              <ul class="flow-features">
                <li>Arrastra y suelta las tareas entre columnas</li>
                <li>Organiza por estado: Pendiente, En proceso, Finalizado</li>
                <li>Vista clara de todo tu progreso en un solo lugar</li>
              </ul>
            </div>

            <div class="kanban-board">
              <div class="kanban-col">
                <h4 class="kanban-col-title">
                  <span class="col-dot col-dot-orange"></span>
                  Pendiente
                </h4>
                <div class="kanban-task">
                  <div class="task-name">Proyecto PDS</div>
                  <div class="task-meta">
                    <span class="priority-badge priority-alta">Alta</span>
                    <span class="date-badge">Mar 10</span>
                  </div>
                </div>
                <div class="kanban-task">
                  <div class="task-name">Estudiar parcial</div>
                  <div class="task-meta">
                    <span class="priority-badge priority-media">Media</span>
                    <span class="date-badge">Mar 12</span>
                  </div>
                </div>
              </div>

              <div class="kanban-col">
                <h4 class="kanban-col-title">
                  <span class="col-dot col-dot-blue"></span>
                  En proceso
                </h4>
                <div class="kanban-task kanban-task-active">
                  <div class="task-name">Diseño UI/UX</div>
                  <div class="task-meta">
                    <span class="priority-badge priority-alta">Alta</span>
                    <span class="date-badge">Hoy</span>
                  </div>
                  <div class="task-progress-bar"></div>
                </div>
              </div>

              <div class="kanban-col">
                <h4 class="kanban-col-title">
                  <span class="col-dot col-dot-green"></span>
                  Finalizado
                </h4>
                <div class="kanban-task kanban-task-done">
                  <div class="task-name">Definir alcance</div>
                  <span class="done-badge">OK</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="post-kanban" aria-labelledby="post-kanban-heading">
          <div class="post-kanban-wrap">
            <span class="post-kanban-eyebrow">Después del tablero</span>
            <h2 id="post-kanban-heading">Cuando el orden visual ya está claro</h2>
            <p class="post-kanban-lead">
              El tablero muestra el estado; lo que sigue es disciplina suave: hábitos y señales para que el flujo no se diluya.
            </p>

            <div class="post-kanban-strip">
              <article class="pk-spot pk-spot--1">
                <div class="pk-spot-icon" aria-hidden="true">🎯</div>
                <h3 class="pk-spot-title">Foco acotado</h3>
                <p class="pk-spot-text">
                  Lleva en “En proceso” solo lo que puedes avanzar hoy. El resto puede esperar en Pendiente sin culpa.
                </p>
              </article>
              <article class="pk-spot pk-spot--2">
                <div class="pk-spot-icon" aria-hidden="true">✍️</div>
                <h3 class="pk-spot-title">Captura al vuelo</h3>
                <p class="pk-spot-text">
                  Anota primero; refina el título después. Una idea atrapada vale más que una fila perfecta mañana.
                </p>
              </article>
              <article class="pk-spot pk-spot--3">
                <div class="pk-spot-icon" aria-hidden="true">🌅</div>
                <h3 class="pk-spot-title">Ritmo de revisión</h3>
                <p class="pk-spot-text">
                  Dos minutos al empezar el día: qué sigue, qué bloquea y qué puedes cerrar antes del mediodía.
                </p>
              </article>
            </div>

            <div class="post-kanban-split">
              <div class="pk-panel">
                <h3 class="pk-panel-title">Señales de que conviene reordenar</h3>
                <ul class="pk-list">
                  <li>Muchas tarjetas en Pendiente sin una fecha creíble.</li>
                  <li>Varias cosas “en proceso” y pocas que lleguen a Finalizado.</li>
                  <li>Dos tareas que dicen casi lo mismo: suele haber duplicado.</li>
                </ul>
              </div>
              <div class="pk-panel pk-panel--accent">
                <h3 class="pk-panel-title">Antes de sumar más carga</h3>
                <ul class="pk-list">
                  <li>Si una tarjeta no cabe en una línea, quizá son dos trabajos distintos.</li>
                  <li>Si lleva semanas quieta, el tamaño del trabajo, no el tablero, pide un corte.</li>
                  <li>Mejor cerrar algo pequeño que mover sin fin lo enorme.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section class="extra-info">
          <h2 class="extra-title">¿Por qué elegir TaskMaster?</h2>
          <div class="extra-grid">
            <div class="extra-card extra-card-1">
              <div class="extra-icon">🎯</div>
              <h3>Interfaz intuitiva</h3>
              <p>Diseño limpio y fácil de usar. Sin complicaciones ni curvas de aprendizaje.</p>
            </div>
            <div class="extra-card extra-card-2">
              <div class="extra-icon">📱</div>
              <h3>Acceso multiplataforma</h3>
              <p>Funciona en web, tablets y móviles. Tus tareas siempre a mano.</p>
            </div>
            <div class="extra-card extra-card-3">
              <div class="extra-icon">🔒</div>
              <h3>Seguridad y privacidad</h3>
              <p>Tus datos protegidos. Solo tú tienes acceso a tu información.</p>
            </div>
          </div>
        </section>

        <section class="complements-section" aria-labelledby="complements-heading">
          <div class="complements-shell">
            <div class="complements-head">
              <span class="complements-eyebrow">Detalle</span>
              <h2 id="complements-heading" class="complements-title">Complementos que usas cada día</h2>
              <p class="complements-lead">
                Funciones prácticas que no sustituyen lo anterior: amplían cómo capturas, encuentras y retomas el trabajo.
              </p>
            </div>
          <div class="complements-grid">
            <article class="complement-card complement-card--1">
              <span class="complement-step">01</span>
              <h3>Fecha límite con hora</h3>
              <p>
                Cada tarea lleva un vencimiento concreto (fecha y hora). Sirve para anclar entregas sin mezclarlo con el orden sugerido por prioridad.
              </p>
            </article>
            <article class="complement-card complement-card--2">
              <span class="complement-step">02</span>
              <h3>Descripción opcional</h3>
              <p>
                Añade detalle donde lo necesites: enlaces, criterios de “hecho” o notas breves, sin abrir otra herramienta.
              </p>
            </article>
            <article class="complement-card complement-card--3">
              <span class="complement-step">03</span>
              <h3>Prioridad en cuatro niveles</h3>
              <p>
                De baja a urgente, tú eliges la etiqueta de urgencia en el formulario; encaja con el tablero y con la lista filtrada.
              </p>
            </article>
            <article class="complement-card complement-card--4">
              <span class="complement-step">04</span>
              <h3>Lista y acciones rápidas</h3>
              <p>
                Filtra por estado, marca como finalizada con un clic, edita o elimina desde la misma pantalla: menos fricción entre revisar y ejecutar.
              </p>
            </article>
          </div>
          </div>
        </section>

        <section class="personas-section" aria-labelledby="personas-heading">
          <span class="personas-eyebrow">Casos de uso</span>
          <h2 id="personas-heading" class="personas-title">Un mismo producto, distintos ritmos</h2>
          <div class="personas-grid">
            <div class="persona-block persona-block--1">
              <div class="persona-icon" aria-hidden="true">📚</div>
              <h3 class="persona-name">Estudiantes</h3>
              <p class="persona-desc">
                Parciales, trabajos grupales y lecturas: encaja fechas de examen con bloques de estudio sin mezclar asignaturas.
              </p>
            </div>
            <div class="persona-block persona-block--2">
              <div class="persona-icon" aria-hidden="true">💼</div>
              <h3 class="persona-name">Freelance y creativos</h3>
              <p class="persona-desc">
                Clientes y entregables en paralelo: una vista por cliente o campaña y límites claros para no prometer de más.
              </p>
            </div>
            <div class="persona-block persona-block--3">
              <div class="persona-icon" aria-hidden="true">⚡</div>
              <h3 class="persona-name">Varios frentes a la vez</h3>
              <p class="persona-desc">
                Cliente, familia y proyecto personal: prioridad y fecha límite te permiten repartir atención sin mezclar contextos.
              </p>
            </div>
          </div>
        </section>

        <section class="faq-section" aria-labelledby="faq-heading">
          <div class="faq-head">
            <span class="faq-eyebrow">Ayuda</span>
            <h2 id="faq-heading" class="faq-title">Preguntas frecuentes</h2>
          </div>
          <div class="faq-list">
            <details class="faq-item">
              <summary class="faq-summary">¿Necesito instalar algo?</summary>
              <p class="faq-answer">
                No. TaskMaster funciona en el navegador; entra desde cualquier dispositivo con tu cuenta.
              </p>
            </details>
            <details class="faq-item">
              <summary class="faq-summary">¿Puedo usarlo solo para proyectos personales?</summary>
              <p class="faq-answer">
                Sí. Puedes mantener listas privadas y usar el flujo de estados sin compartir nada con nadie.
              </p>
            </details>
            <details class="faq-item">
              <summary class="faq-summary">¿Qué pasa si pierdo la conexión?</summary>
              <p class="faq-answer">
                Depende del momento de la sesión: lo ideal es volver a conectar para que los cambios queden guardados en el servidor.
              </p>
            </details>
            <details class="faq-item">
              <summary class="faq-summary">¿Hay límite de tareas?</summary>
              <p class="faq-answer">
                En el uso típico del prototipo no hace falta preocuparse por cupos; prioriza ordenar antes que acumular sin fin.
              </p>
            </details>
          </div>
        </section>

        <section class="bottom-cta" aria-label="Registro">
          <div class="bottom-cta-inner">
            <div class="bottom-cta-glow" aria-hidden="true"></div>
            <div class="bottom-cta-content">
              <h2 class="bottom-cta-title">¿Listo para probarlo?</h2>
              <p class="bottom-cta-text">Crea tu cuenta y recorre el flujo en menos de un minuto.</p>
              <a routerLink="/register" class="bottom-cta-btn">Crear cuenta gratuita</a>
            </div>
          </div>
        </section>
      </main>

      <app-footer />
    </div>
  `,
  styleUrls: ['./funcionalidades.component.scss'],
})
export class FuncionalidadesComponent {}
