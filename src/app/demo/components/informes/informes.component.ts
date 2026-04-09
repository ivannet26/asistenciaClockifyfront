import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

// PrimeNG
import { TabMenuModule } from "primeng/tabmenu";
import { DropdownModule } from "primeng/dropdown";
import { CalendarModule } from "primeng/calendar";
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from "primeng/card";
import { ChartModule } from 'primeng/chart';
import { InputSwitchModule } from 'primeng/inputswitch';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-informes',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TabMenuModule, DropdownModule, 
    CalendarModule, TableModule, ButtonModule, CardModule, 
    ChartModule, InputSwitchModule
  ],
  templateUrl: './informes.component.html',
  styleUrl: './informes.component.css'
})
export class InformesComponent implements OnInit {
  // Configuración UI
  selectedDate: Date = new Date();
  tipoInformeSeleccionado: string = '1';
  tabactivo: MenuItem;
  mostrarEstimacion: boolean = false;

  // Gráficos y Datos
  dataBarras: any;
  optionsBarras: any;
  dataDona: any;
  optionsDona: any;
  
  tiempoTotalFormateado: string = '00:00:00';
  proyectosResumen: any[] = [];
  
  tabs: MenuItem[] = [
    { label: 'Resumido', id: '0' },
    { label: 'Detallado', id: '1' },
    { label: 'Semanal', id: '2' },
    { label: 'Compartido', id: '3' }
  ];

  opcionesInformes = [
    { label: 'INFORME DE TIEMPO', value: '1' },
    { label: 'INFORME DE EQUIPO', value: '2' },
    { label: 'INFORME DE GASTOS', value: '3' }
  ];

  constructor(private route: ActivatedRoute) {
    this.tabactivo = this.tabs[0];
  }

  ngOnInit() {
    this.configurarGraficos();
    this.cargarDatosDesdeStorage();

    this.route.queryParams.subscribe(params => {
      const tabId = params['tab'];
      if (tabId !== undefined) {
        const encontrado = this.tabs.find(t => t.id === tabId.toString());
        if (encontrado) this.tabactivo = encontrado;
      }
    });
  }

  configurarGraficos() {
    this.optionsBarras = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false } },
        y: { beginAtZero: true, ticks: { callback: (v: any) => this.formatearEjeY(v) } }
      }
    };

    this.optionsDona = {
      cutout: '75%',
      plugins: { legend: { display: false } }
    };
  }

  cargarDatosDesdeStorage() {
    const data = localStorage.getItem('registros');
    if (!data) return;

    const registros = JSON.parse(data);
    const tiemposPorProyecto: { [key: string]: number } = {};
    const tiempoPorDia = [0, 0, 0, 0, 0, 0, 0]; // lun-dom
    let totalSegundos = 0;

    registros.forEach((r: any) => {
      // Lógica de cálculo de segundos (reutilizando tu lógica de Panel)
      let s = 0;
      if (r.duracion?.includes(':')) {
        const p = r.duracion.split(':');
        s = (parseInt(p[0]) * 3600) + (parseInt(p[1]) * 60) + parseInt(p[2]);
      }

      const proyNombre = (r.proyecto && typeof r.proyecto === 'object') ? r.proyecto.nombre : (r.proyecto || 'Sin Proyecto');
      
      tiemposPorProyecto[proyNombre] = (tiemposPorProyecto[proyNombre] || 0) + s;
      totalSegundos += s;

      // Distribución por día (asumiendo registros de esta semana)
      if (r.inicio) {
        const dia = new Date(r.inicio).getDay();
        const idx = (dia === 0) ? 6 : dia - 1;
        if (idx >= 0 && idx < 7) tiempoPorDia[idx] += s;
      }
    });

    this.tiempoTotalFormateado = this.formatearSegundos(totalSegundos);

    // Preparar Tabla de Proyectos
    this.proyectosResumen = Object.keys(tiemposPorProyecto).map(nombre => ({
      titulo: nombre,
      duracion: this.formatearSegundos(tiemposPorProyecto[nombre]),
      importe: '0,00 USD',
      color: this.generarColor(nombre),
      segundos: tiemposPorProyecto[nombre]
    }));

    // Data Barras
    this.dataBarras = {
      labels: ['lun.', 'mar.', 'mié.', 'jue.', 'vie.', 'sáb.', 'dom.'],
      datasets: [{
        data: tiempoPorDia,
        backgroundColor: '#007ad9', 
        borderRadius: 4
      }]
    };

    // Data Dona
    this.dataDona = {
      labels: Object.keys(tiemposPorProyecto),
      datasets: [{
        data: Object.values(tiemposPorProyecto),
        backgroundColor: this.proyectosResumen.map(p => p.color)
      }]
    };
  }

  private generarColor(nombre: string): string {
    const colores: any = { 'cajabanco': '#ff4d4d', 'CLOCKIFY': '#00bfff', 'gm': '#007bff' };
    return colores[nombre] || '#ced4da';
  }

  private formatearSegundos(t: number): string {
    const h = Math.floor(t / 3600).toString().padStart(2, '0');
    const m = Math.floor((t % 3600) / 60).toString().padStart(2, '0');
    const s = (t % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  }

  private formatearEjeY(v: number) {
    return v >= 3600 ? Math.floor(v / 3600) + 'h' : v + 's';
  }

  CambioTab(event: any) {
    this.tabactivo = event;
  }
}