import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HeaderComponent, FooterComponent } from '@shared/layout';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, HeaderComponent, FooterComponent],
  template: `
    <div class="landing">
      <app-header />

      <main class="main">
        <section class="hero-banner" id="inicio">
          <h1 class="hero-banner-title">DOMINA TU TIEMPO</h1>
          <h2 class="hero-banner-subtitle">ORGANIZA TU VIDA</h2>
          <p class="hero-banner-desc">
            Gestiona tus tareas con priorizacion automatica, analisis de productividad y asistencia con inteligencia artificial
          </p>
          <div class="hero-banner-buttons">
            <a routerLink="/register" class="btn btn-dark">Crear cuenta</a>
            <a href="#beneficios" class="btn btn-outline-light">Explorar funcionalidades</a>
          </div>
        </section>

        <section class="que-hace-module" id="beneficios">
          <div class="que-hace-inner">
            <h2 class="que-hace-title">¿Qué hace TaskMaster?</h2>
            <p class="que-hace-desc">TaskMaster está diseñado para que seas más eficiente cada día.</p>
            <div class="que-hace-grid">
              <article class="beneficio-card beneficio-1">
                <div class="beneficio-icon-wrap">
                  <span class="beneficio-icon">🧠</span>
                </div>
                <h3>Priorización Inteligente</h3>
                <p>Ordena automáticamente tus tareas según fecha y urgencia.</p>
              </article>
              <article class="beneficio-card beneficio-2">
                <div class="beneficio-icon-wrap">
                  <span class="beneficio-icon">📈</span>
                </div>
                <h3>Seguimiento de Productividad</h3>
                <p>Visualiza tu progreso con estadísticas claras.</p>
              </article>
              <article class="beneficio-card beneficio-3">
                <div class="beneficio-icon-wrap">
                  <span class="beneficio-icon">🤖</span>
                </div>
                <h3>Asistente IA</h3>
                <p>Divide tareas complejas y mejora tus hábitos.</p>
              </article>
            </div>
          </div>
        </section>

        <section class="board-section" id="funcionalidades">
          <div class="board-content">
            <div class="board-text">
              <h2>Visualiza tus tareas en un tablero organizado</h2>
              <p>Mantén el control total de tus actividades con un tablero por estado. Arrastra, prioriza y avanza sin perder el foco.</p>
              <ul class="feature-list">
                <li>
                  <span class="check-wrap">
                    <svg class="check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                  </span>
                  Organiza por columnas: Pendiente, En proceso, Hecho
                </li>
                <li>
                  <span class="check-wrap">
                    <svg class="check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                  </span>
                  Arrastra y suelta para cambiar el estado
                </li>
                <li>
                  <span class="check-wrap">
                    <svg class="check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                  </span>
                  Vista clara de todo tu progreso
                </li>
              </ul>
            </div>
            <div class="board-preview">
              <div class="board-card">
                <div class="board-header">Mi Tablero</div>
                <div class="board-columns">
                  <div class="board-col col-pendiente">
                    <h4>PENDIENTE</h4>
                    <div class="task-card">Revisar informe</div>
                    <div class="task-card">Llamar al cliente</div>
                  </div>
                  <div class="board-col col-proceso">
                    <h4>EN PROCESO</h4>
                    <div class="task-card">Diseño UI</div>
                    <div class="task-card">Reunión equipo</div>
                    <div class="task-card">Documentación</div>
                  </div>
                  <div class="board-col col-hecho">
                    <h4>HECHO</h4>
                    <div class="task-card">Revisar correos</div>
                    <div class="task-card">Actualizar datos</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="landing-split-section" aria-labelledby="landing-priority-heading">
          <div class="landing-split-inner landing-split-inner--reverse">
            <div class="split-visual">
              <div class="priority-mock" aria-hidden="true">
                <div class="priority-mock-header">
                  <span class="priority-mock-title">Mis tareas</span>
                  <span class="priority-mock-badge">Hoy</span>
                </div>
                <div class="priority-mock-row">
                  <span class="pm-task">Entrega informe Q1</span>
                  <span class="pm-pill pm-pill--high">Urgente</span>
                  <span class="pm-date">Mar 12 · 18:00</span>
                </div>
                <div class="priority-mock-row">
                  <span class="pm-task">Llamada proveedor</span>
                  <span class="pm-pill pm-pill--mid">Media</span>
                  <span class="pm-date">Mar 14 · 10:30</span>
                </div>
                <div class="priority-mock-row">
                  <span class="pm-task">Revisar presupuesto</span>
                  <span class="pm-pill pm-pill--low">Baja</span>
                  <span class="pm-date">Mar 18</span>
                </div>
              </div>
            </div>
            <div class="split-copy">
              <h2 id="landing-priority-heading">Fecha límite y prioridad alineadas</h2>
              <p class="split-lead">
                Cada tarea lleva urgencia y vencimiento visibles. Así el tablero y la lista dicen lo mismo: menos suposiciones al planificar el día.
              </p>
              <ul class="split-points">
                <li>Fecha y hora en un solo campo para anclar entregas reales.</li>
                <li>Cuatro niveles de prioridad para ordenar sin pelear con el calendario mental.</li>
                <li>Descripción opcional cuando el título no basta.</li>
              </ul>
            </div>
          </div>
        </section>

        <section class="landing-split-section landing-split-section--alt" aria-labelledby="landing-dash-heading">
          <div class="landing-split-inner">
            <div class="split-copy">
              <h2 id="landing-dash-heading">Un resumen antes de entrar al detalle</h2>
              <p class="split-lead">
                El panel te muestra totales, pendientes, completadas y tareas vencidas. Ideal para decidir si abres la lista o primero recortas carga.
              </p>
              <ul class="split-points">
                <li>Porcentaje de cumplimiento de un vistazo.</li>
                <li>Detecta cuellos de botella antes de sumar tareas nuevas.</li>
                <li>Complementa el tablero: mismo criterio, otra perspectiva.</li>
              </ul>
            </div>
            <div class="split-visual">
              <div class="stats-mock" aria-hidden="true">
                <div class="stats-mock-title">Resumen</div>
                <div class="stats-mock-grid">
                  <div class="stat-tile">
                    <span class="stat-num">24</span>
                    <span class="stat-label">Total</span>
                  </div>
                  <div class="stat-tile stat-tile--ok">
                    <span class="stat-num">9</span>
                    <span class="stat-label">Completadas</span>
                  </div>
                  <div class="stat-tile stat-tile--warn">
                    <span class="stat-num">12</span>
                    <span class="stat-label">Pendientes</span>
                  </div>
                  <div class="stat-tile stat-tile--alert">
                    <span class="stat-num">3</span>
                    <span class="stat-label">Vencidas</span>
                  </div>
                </div>
                <div class="stats-mock-bar">
                  <span class="stats-mock-bar-label">Cumplimiento</span>
                  <div class="stats-mock-bar-track">
                    <div class="stats-mock-bar-fill"></div>
                  </div>
                  <span class="stats-mock-bar-pct">38%</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="landing-ia-band" aria-labelledby="landing-ia-heading">
          <div class="landing-ia-inner">
            <div class="landing-ia-copy">
              <span class="landing-ia-eyebrow">Inteligencia artificial</span>
              <h2 id="landing-ia-heading">¿Un proyecto grande te abruma?</h2>
              <p>
                El asistente IA propone pasos, divide bloques y sugiere prioridades para que el tablero no se llene de títulos imposibles de empezar.
              </p>
            </div>
            <div class="landing-ia-actions">
              <a routerLink="/asistente-ia" class="btn-landing-ghost">Conocer el asistente</a>
              <a routerLink="/register" class="btn-landing-solid">Crear cuenta</a>
            </div>
          </div>
        </section>

      </main>

      <app-footer />
    </div>
  `,
  styleUrls: ['./landing.component.scss'],
})
export class LandingComponent { }
