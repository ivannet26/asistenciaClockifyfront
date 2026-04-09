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
import { CheckboxModule } from 'primeng/checkbox';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { InputTextModule } from 'primeng/inputtext';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-informes',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TabMenuModule, DropdownModule,
    CalendarModule, TableModule, ButtonModule, CardModule,
    ChartModule, InputSwitchModule, CheckboxModule,
    OverlayPanelModule, InputTextModule
  ],
  templateUrl: './informes.component.html',
  styleUrl: './informes.component.css'
})
export class InformesComponent implements OnInit {

  selectedDate: Date = new Date();
  tipoInformeSeleccionado: string = '1';
  tabactivo!: MenuItem;
  filtroEtiqueta: string = '';
  registroSeleccionado: any = null;

  dataBarras: any;
  optionsBarras: any;
  dataDona: any;
  optionsDona: any;

  tiempoTotalFormateado: string = '00:00:00';
  proyectosResumen: any[] = [];
  registrosDetallados: any[] = [];
  etiquetasDisponibles: string[] = [];
  
  datosSemanales: any[] = [];
  totalesPorDiaSemana: string[] = [];
  etiquetasDias: string[] = []; // NUEVO: Para guardar "lun., abr. 6", etc.

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
    this.cargarTodoDesdeStorage();
    this.cargarEtiquetasDeStorage();

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
        x: { grid: { display: false }, ticks: { color: '#9aa0a6' } },
        y: { beginAtZero: true, ticks: { color: '#9aa0a6', callback: (v: any) => this.formatearEjeY(v) } }
      }
    };
    this.optionsDona = { cutout: '80%', plugins: { legend: { display: false } } };
  }

  cargarEtiquetasDeStorage() {
    const tags = localStorage.getItem('etiquetas');
    this.etiquetasDisponibles = tags ? JSON.parse(tags) : ['GM', 'THEOROO', 'DISEÑO', 'MARKETING'];
  }

  get etiquetasFiltradas() {
    return this.etiquetasDisponibles.filter(t => t.toLowerCase().includes(this.filtroEtiqueta.toLowerCase()));
  }

  cargarTodoDesdeStorage() {
    const data = localStorage.getItem('registros');
    if (!data) return;
    const registros = JSON.parse(data);
    this.registrosDetallados = registros.map((r: any) => ({
      ...r,
      inicio: r.inicio ? new Date(r.inicio) : null,
      fin: r.fin ? new Date(r.fin) : null,
      etiquetas: Array.isArray(r.etiquetas) ? r.etiquetas : []
    }));
    this.procesarEstadisticas();
  }

  // --- LÓGICA PARA FECHAS DINÁMICAS ---
  generarEtiquetasSemana(fechaReferencia: Date) {
    const nombresDias = ['dom.', 'lun.', 'mar.', 'mié.', 'jue.', 'vie.', 'sáb.'];
    const nombresMeses = ['ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.', 'jul.', 'ago.', 'sep.', 'oct.', 'nov.', 'dic.'];
    
    let tempEtiquetas = [];
    const diaActual = fechaReferencia.getDay();
    const lunes = new Date(fechaReferencia);
    lunes.setDate(fechaReferencia.getDate() - (diaActual === 0 ? 6 : diaActual - 1));

    for (let i = 0; i < 7; i++) {
      const f = new Date(lunes);
      f.setDate(lunes.getDate() + i);
      const etiqueta = `${nombresDias[f.getDay()]}, ${nombresMeses[f.getMonth()]} ${f.getDate()}`;
      tempEtiquetas.push(etiqueta);
    }
    this.etiquetasDias = tempEtiquetas;
  }

  procesarEstadisticas() {
    this.generarEtiquetasSemana(this.selectedDate);

    const tiemposPorProyecto: { [key: string]: number } = {};
    const tiempoPorDiaBarras = [0, 0, 0, 0, 0, 0, 0];
    const agrupacionSemanal: { [key: string]: number[] } = {};
    let totalSegundos = 0;

    this.registrosDetallados.forEach((r: any) => {
      let s = 0;
      if (r.duracion?.includes(':')) {
        const p = r.duracion.split(':');
        s = (parseInt(p[0]) * 3600) + (parseInt(p[1]) * 60) + parseInt(p[2]);
      }

      const proyNombre = (r.proyecto && typeof r.proyecto === 'object') ? r.proyecto.nombre : (r.proyecto || 'Sin Proyecto');
      tiemposPorProyecto[proyNombre] = (tiemposPorProyecto[proyNombre] || 0) + s;
      totalSegundos += s;

      if (r.inicio) {
        const dia = r.inicio.getDay();
        const idx = (dia === 0) ? 6 : dia - 1; 
        if (idx >= 0 && idx < 7) {
          tiempoPorDiaBarras[idx] += s;
          if (!agrupacionSemanal[proyNombre]) agrupacionSemanal[proyNombre] = [0, 0, 0, 0, 0, 0, 0];
          agrupacionSemanal[proyNombre][idx] += s;
        }
      }
    });

    this.tiempoTotalFormateado = this.formatearSegundos(totalSegundos);
    this.proyectosResumen = Object.keys(tiemposPorProyecto).map(nombre => ({
      titulo: nombre, duracion: this.formatearSegundos(tiemposPorProyecto[nombre]), color: '#2196F3'
    }));

    this.datosSemanales = Object.keys(agrupacionSemanal).map(nombre => ({
      proyecto: nombre,
      dias: agrupacionSemanal[nombre].map(seg => seg > 0 ? this.formatearSegundos(seg) : '—'),
      total: this.formatearSegundos(agrupacionSemanal[nombre].reduce((a, b) => a + b, 0))
    }));
    this.totalesPorDiaSemana = tiempoPorDiaBarras.map(seg => this.formatearSegundos(seg));

    // Refrescar Gráficos con etiquetas dinámicas
    this.dataBarras = {
      labels: this.etiquetasDias, // AQUÍ USA LA NUEVA VARIABLE
      datasets: [{ data: [...tiempoPorDiaBarras], backgroundColor: '#2196F3', borderRadius: 4 }]
    };
    this.dataDona = {
      labels: Object.keys(tiemposPorProyecto),
      datasets: [{ data: Object.values(tiemposPorProyecto), backgroundColor: ['#2196F3', '#64B5F6', '#90CAF9', '#BBDEFB'], borderWidth: 0 }]
    };
  }

  actualizarStorage() {
    localStorage.setItem('registros', JSON.stringify(this.registrosDetallados));
  }

  toggleEtiqueta(registro: any, etiqueta: string) {
    if (!registro.etiquetas) registro.etiquetas = [];
    const index = registro.etiquetas.indexOf(etiqueta);
    index > -1 ? registro.etiquetas.splice(index, 1) : registro.etiquetas.push(etiqueta);
    this.actualizarStorage();
    this.registrosDetallados = [...this.registrosDetallados];
  }

  eliminarRegistro(registro: any) {
    this.registrosDetallados = this.registrosDetallados.filter(r => r !== registro);
    this.actualizarStorage();
    this.procesarEstadisticas();
  }

  duplicarRegistro(registro: any) {
    const copia = { ...registro, etiquetas: [...(registro.etiquetas || [])], inicio: registro.inicio ? new Date(registro.inicio) : null, fin: registro.fin ? new Date(registro.fin) : null };
    this.registrosDetallados.unshift(copia);
    this.actualizarStorage();
    this.procesarEstadisticas();
  }

  abrirMenu(panel: any, event: Event, registro: any) {
    this.registroSeleccionado = registro;
    panel.toggle(event);
  }

  duplicarSeleccionado(panel: any) {
    if (this.registroSeleccionado) {
      this.duplicarRegistro(this.registroSeleccionado);
      panel.hide();
      this.registroSeleccionado = null;
    }
  }

  eliminarSeleccionado(panel: any) {
    if (this.registroSeleccionado) {
      if (confirm('¿Seguro que deseas eliminar este registro?')) {
        this.eliminarRegistro(this.registroSeleccionado);
        panel.hide();
        this.registroSeleccionado = null;
      }
    }
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

  CambioTab(event: any) { this.tabactivo = event; }
}