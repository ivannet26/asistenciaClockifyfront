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
    .card {
        background: #ffffff;
        padding: 1.5rem;
        border-bottom: 1px solid #dee2e6;
    }
    .surface-100 {
        background-color: #f8f9fa !important;
    }
  `]
})
export class PanelComponent implements OnInit {
  // --- DATOS ---
  proyectos: any[] = [];
  registrosCompletos: any[] = [];
  
  // --- RESUMEN SUPERIOR ---
  tiempoTotalFormateado: string = '00:00:00';
  proyectoPrincipal: string = '--';

  // --- CONFIGURACIÓN DE GRÁFICAS ---
  dataGrafica: any;      // Gráfica de Rosca (Doughnut)
  opcionesGrafica: any;
  
  dataBarras: any;       // Gráfica de Barras (Semanal)
  opcionesBarras: any;

  ngOnInit() {
    this.configurarOpcionesGraficas();
    this.cargarTodoDesdeStorage();
  }

  configurarOpcionesGraficas() {
    // Configuración para la Rosca (Doughnut)
    this.opcionesGrafica = {
      plugins: {
        legend: { position: 'bottom', labels: { usePointStyle: true } }
      },
      maintainAspectRatio: false,
      cutout: '70%' 
    };

    // Configuración para las Barras (Semanal)
    this.opcionesBarras = {
      maintainAspectRatio: false,
      aspectRatio: 0.8,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#9aa0a6' } },
        y: { beginAtZero: true, grid: { color: '#f1f3f4' }, ticks: { display: false } }
      }
    };
  }

  private extraerNombreProyecto(proyecto: any): string {
    if (!proyecto) return 'Sin Proyecto';
    if (typeof proyecto === 'object') return proyecto.nombre || 'Sin Nombre';
    return proyecto;
  }

  cargarTodoDesdeStorage() {
    const data = localStorage.getItem('registros');
    if (data) {
      this.registrosCompletos = JSON.parse(data);
      
      // 1. Lista de proyectos para el Top Lateral
      const nombresUnicos = [...new Set(this.registrosCompletos.map((r: any) => 
        this.extraerNombreProyecto(r.proyecto)
      ))];
      this.proyectos = nombresUnicos.map(n => ({ nombre: n }));

      // 2. Dashboard Stats
      if (this.proyectos.length > 0) {
        this.proyectoPrincipal = this.proyectos[0].nombre;
      }

      this.procesarGraficaRosca();
      this.procesarGraficaBarras();
      this.sumarTiempoTotal();
    }
  }

  procesarGraficaRosca() {
    const conteo: { [key: string]: number } = {};
    this.registrosCompletos.forEach(r => {
      const nombre = this.extraerNombreProyecto(r.proyecto);
      conteo[nombre] = (conteo[nombre] || 0) + 1;
    });

    this.dataGrafica = {
      labels: Object.keys(conteo),
      datasets: [{
        data: Object.values(conteo),
        backgroundColor: ['#03a9f4', '#ff4081', '#4caf50', '#ffc107'],
        hoverOffset: 4
      }]
    };
  }

  procesarGraficaBarras() {
    // Simulación de datos semanales como en tu imagen
    this.dataBarras = {
      labels: ['lun., abr. 6', 'mar., abr. 7', 'mié., abr. 8', 'jue., abr. 9', 'vie., abr. 10', 'sáb., abr. 11', 'dom., abr. 12'],
      datasets: [{
        label: 'Tiempo',
        data: [18, 0, 0, 0, 0, 0, 0], // El 18 viene de tus 18 segundos totales
        backgroundColor: '#2196F3',
        borderRadius: 5
      }]
    };
  }

  sumarTiempoTotal() {
    let totalSegundos = 0;
    this.registrosCompletos.forEach(r => {
      if (r.duracion && r.duracion.includes(':')) {
        const p = r.duracion.split(':');
        totalSegundos += (parseInt(p[0]) * 3600) + (parseInt(p[1]) * 60) + parseInt(p[2]);
      }
    });

    const h = Math.floor(totalSegundos / 3600).toString().padStart(2, '0');
    const m = Math.floor((totalSegundos % 3600) / 60).toString().padStart(2, '0');
    const s = (totalSegundos % 60).toString().padStart(2, '0');
    this.tiempoTotalFormateado = `${h}:${m}:${s}`;
  }
}