import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Imports de PrimeNG
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { ChartModule } from 'primeng/chart';

@Component({
  selector: 'app-panel',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ButtonModule, 
    DropdownModule,
    InputTextModule,
    ChartModule
  ],
  templateUrl: './panel.component.html',
  styles: [`
    .card-stats {
        background: #f8f9fa;
        padding: 1.2rem;
        border-radius: 4px;
        border: 1px solid #dee2e6;
        text-align: center;
    }
    .stat-label {
        display: block;
        color: #9aa0a6;
        text-transform: uppercase;
        font-size: 0.7rem;
        font-weight: 700;
        margin-bottom: 0.5rem;
    }
    .stat-value {
        color: #3c4043;
        font-size: 1.8rem;
        font-weight: 700;
    }
    .bg-cyan-clock { background-color: #00BCD4 !important; } /* Celeste/Cian Clockify */
    .shadow-inset { box-shadow: inset 0 1px 2px rgba(0,0,0,0.1); }
  `]
})
export class PanelComponent implements OnInit {
  // --- LISTAS DE DATOS ---
  registrosCompletos: any[] = [];
  proyectosConTiempo: any[] = []; // Para el Top Actividades (Derecha)
  proyectosParaDistribucion: any[] = []; // Para las barras celestes (Abajo)
  
  // --- VARIABLES DE RESUMEN ---
  tiempoTotalFormateado: string = '00:00:00';
  proyectoPrincipal: string = 'PROYECTO';

  // --- CONFIGURACIÓN DE GRÁFICAS ---
  dataGrafica: any;      
  opcionesGrafica: any;
  dataBarras: any;       
  opcionesBarras: any;

  ngOnInit() {
    this.configurarOpcionesGraficas();
    this.cargarTodoDesdeStorage();
  }

  configurarOpcionesGraficas() {
    // Configuración para la Rosca (Doughnut) - CORREGIDO para que aparezca
    this.opcionesGrafica = {
      responsive: true,
      maintainAspectRatio: false, // CLAVE: Permite que se ajuste al div HTML
      cutout: '85%', 
      plugins: { legend: { display: false } } 
    };

    // Configuración para las Barras Semanales
    this.opcionesBarras = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context: any) => 'Tiempo: ' + this.formatearSegundos(context.raw)
          }
        }
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#9aa0a6' } },
        y: { 
          beginAtZero: true, 
          grid: { color: '#f1f3f4' }, 
          ticks: { 
            callback: (value: number) => this.formatearSegundos(value) 
          } 
        }
      }
    };
  }

  private extraerNombreProyecto(proyecto: any): string {
    if (!proyecto) return 'Sin Proyecto';
    return (typeof proyecto === 'object') ? (proyecto.nombre || 'Sin Nombre') : proyecto;
  }

  private formatearSegundos(totalS: number): string {
    const h = Math.floor(totalS / 3600).toString().padStart(2, '0');
    const m = Math.floor((totalS % 3600) / 60).toString().padStart(2, '0');
    const s = (totalS % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  }

  cargarTodoDesdeStorage() {
    const data = localStorage.getItem('registros');
    if (data) {
      this.registrosCompletos = JSON.parse(data);
      this.procesarTodo();
    }
  }

  procesarTodo() {
    const tiemposPorProyecto: { [key: string]: number } = {};
    const tiemposPorActividad: { [key: string]: { segundos: number, proyecto: string } } = {};
    let totalSegundosGlobal = 0;

    this.registrosCompletos.forEach(r => {
      const nombreProy = this.extraerNombreProyecto(r.proyecto);
      const desc = r.descripcion || '(Sin descripción)';
      
      let s = 0;
      if (r.duracion && r.duracion.includes(':')) {
        const p = r.duracion.split(':');
        s = (parseInt(p[0]) * 3600) + (parseInt(p[1]) * 60) + parseInt(p[2]);
      }

      tiemposPorProyecto[nombreProy] = (tiemposPorProyecto[nombreProy] || 0) + s;

      if (!tiemposPorActividad[desc]) {
        tiemposPorActividad[desc] = { segundos: 0, proyecto: nombreProy };
      }
      tiemposPorActividad[desc].segundos += s;

      totalSegundosGlobal += s;
    });

    this.tiempoTotalFormateado = this.formatearSegundos(totalSegundosGlobal);

    const sortedProy = Object.keys(tiemposPorProyecto).sort((a,b) => tiemposPorProyecto[b] - tiemposPorProyecto[a]);
    this.proyectoPrincipal = sortedProy[0] || 'PROYECTO';

    // 1. Gráfica de Barras Semanal (CAMBIADO A CELESTE/CIAN)
    this.dataBarras = {
      labels: ['lun., abr. 6', 'mar.', 'mié.', 'jue.', 'vie.', 'sáb.', 'dom.'],
      datasets: [{
        data: [totalSegundosGlobal, 0, 0, 0, 0, 0, 0],
        backgroundColor: '#00BCD4', // Cian/Celeste
        borderRadius: 4,
        barThickness: 50
      }]
    };

    // 2. Gráfica de Rosca (CAMBIADO A PALETA CELESTE)
    this.dataGrafica = {
      labels: Object.keys(tiemposPorProyecto),
      datasets: [{
        data: Object.values(tiemposPorProyecto),
        // Paleta de celestes: Cian, Celeste claro, Azul muy claro, Gris azulado
        backgroundColor: ['#00BCD4', '#81D4FA', '#E1F5FE', '#B0BEC5'],
        borderWidth: 0
      }]
    };

    // 3. Desglose para Distribución
    this.proyectosParaDistribucion = Object.keys(tiemposPorProyecto).map(nombre => {
      const seg = tiemposPorProyecto[nombre];
      return {
        nombre: nombre,
        tiempoFormateado: this.formatearSegundos(seg),
        porcentaje: totalSegundosGlobal > 0 ? (seg / totalSegundosGlobal) * 100 : 0
      };
    });

    // 4. Lista de Actividades
    this.proyectosConTiempo = Object.keys(tiemposPorActividad).map(desc => ({
      nombre: desc,
      proyecto: tiemposPorActividad[desc].proyecto,
      tiempoFormateado: this.formatearSegundos(tiemposPorActividad[desc].segundos)
    }));
  }
}