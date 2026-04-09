import { Component, OnInit, ViewChild } from '@angular/core';
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
import { OverlayPanelModule, OverlayPanel } from 'primeng/overlaypanel';
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
  @ViewChild('op') op!: OverlayPanel;

  // --- UI ---
  tabactivo!: MenuItem;
  filtroEtiqueta: string = '';
  registroSeleccionado: any = null;
  tipoInformeSeleccionado: string = '1';

  // --- Calendario estilo Panel ---
  rangoFechas: Date[] = [];
  textoRango: string = '';

  // --- Datos ---
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
  etiquetasDias: string[] = [];

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
    this.cargarEtiquetasDeStorage();
    // Inicializar con la semana actual como en el Panel
    this.seleccionarOpcion('estaSemana');

    this.route.queryParams.subscribe(params => {
      const tabId = params['tab'];
      if (tabId !== undefined) {
        const encontrado = this.tabs.find(t => t.id === tabId.toString());
        if (encontrado) this.tabactivo = encontrado;
      }
    });
  }

  // --- LÓGICA DE CALENDARIO DEL PANEL ---
  seleccionarOpcion(opcion: string) {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    let inicio = new Date(hoy);
    let fin = new Date(hoy);

    switch (opcion) {
      case 'hoy':
        fin.setHours(23, 59, 59, 999);
        break;
      case 'ayer':
        inicio.setDate(hoy.getDate() - 1);
        fin.setDate(hoy.getDate() - 1);
        fin.setHours(23, 59, 59, 999);
        break;
      case 'estaSemana':
        const d = hoy.getDay();
        const diffAlLunes = (d === 0 ? 6 : d - 1);
        inicio.setDate(hoy.getDate() - diffAlLunes);
        fin = new Date(inicio);
        fin.setDate(inicio.getDate() + 6);
        fin.setHours(23, 59, 59, 999);
        break;
      case 'mes':
        inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        fin = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0, 23, 59, 59, 999);
        break;
    }

    this.rangoFechas = [inicio, fin];
    this.actualizarYFiltrar();
    if (this.op) this.op.hide();
  }

  actualizarYFiltrar() {
    if (this.rangoFechas && this.rangoFechas[0]) {
      const inicio = new Date(this.rangoFechas[0]);
      const fin = this.rangoFechas[1] ? new Date(this.rangoFechas[1]) : new Date(inicio);
      
      const opciones: any = { day: '2-digit', month: '2-digit', year: 'numeric' };
      this.textoRango = `${inicio.toLocaleDateString('es-ES', opciones)} - ${fin.toLocaleDateString('es-ES', opciones)}`;
      
      this.cargarTodoDesdeStorage(inicio, fin);
    }
  }

  cambiarSemana(dir: number) {
    const nuevaFecha = new Date(this.rangoFechas[0]);
    nuevaFecha.setDate(nuevaFecha.getDate() + (dir * 7));
    const fin = new Date(nuevaFecha);
    fin.setDate(nuevaFecha.getDate() + 6);
    this.rangoFechas = [nuevaFecha, fin];
    this.actualizarYFiltrar();
  }

  // --- CARGA Y PROCESAMIENTO ---
  cargarTodoDesdeStorage(inicioF: Date, finF: Date) {
    const data = localStorage.getItem('registros');
    if (!data) return;
    const registros = JSON.parse(data);

    this.registrosDetallados = registros
      .map((r: any) => ({ ...r, inicio: new Date(r.inicio), fin: new Date(r.fin) }))
      .filter((r: any) => r.inicio >= inicioF && r.inicio <= new Date(finF.getTime() + 86400000))
      .sort((a: any, b: any) => b.inicio.getTime() - a.inicio.getTime());

    this.procesarEstadisticas(inicioF);
  }

  procesarEstadisticas(lunesReferencia: Date) {
    const tiemposPorProyecto: { [key: string]: number } = {};
    const tiempoPorDiaBarras = [0, 0, 0, 0, 0, 0, 0];
    const agrupacionSemanal: { [key: string]: number[] } = {};
    let totalSGlobal = 0;

    // Etiquetas dinámicas (lun., 6 abr.)
    const diasNombres = ['lun.', 'mar.', 'mié.', 'jue.', 'vie.', 'sáb.', 'dom.'];
    this.etiquetasDias = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(lunesReferencia);
      d.setDate(lunesReferencia.getDate() + i);
      this.etiquetasDias.push(`${diasNombres[i]}, ${d.getDate()}`);
    }

    this.registrosDetallados.forEach(r => {
      let s = 0;
      if (r.duracion?.includes(':')) {
        const p = r.duracion.split(':');
        s = (parseInt(p[0]) * 3600) + (parseInt(p[1]) * 60) + parseInt(p[2]);
      }
      const proyNombre = (r.proyecto && typeof r.proyecto === 'object') ? r.proyecto.nombre : (r.proyecto || 'Sin Proyecto');
      tiemposPorProyecto[proyNombre] = (tiemposPorProyecto[proyNombre] || 0) + s;
      totalSGlobal += s;

      const dayIdx = r.inicio.getDay();
      const idx = (dayIdx === 0) ? 6 : dayIdx - 1;
      if (idx >= 0 && idx < 7) {
        tiempoPorDiaBarras[idx] += s;
        if (!agrupacionSemanal[proyNombre]) agrupacionSemanal[proyNombre] = [0, 0, 0, 0, 0, 0, 0];
        agrupacionSemanal[proyNombre][idx] += s;
      }
    });

    this.tiempoTotalFormateado = this.formatearSegundos(totalSGlobal);
    this.proyectosResumen = Object.keys(tiemposPorProyecto).map(n => ({
      titulo: n, duracion: this.formatearSegundos(tiemposPorProyecto[n]), color: '#2196F3'
    }));

    this.datosSemanales = Object.keys(agrupacionSemanal).map(n => ({
      proyecto: n,
      dias: agrupacionSemanal[n].map(seg => seg > 0 ? this.formatearSegundos(seg) : '—'),
      total: this.formatearSegundos(agrupacionSemanal[n].reduce((a, b) => a + b, 0))
    }));
    this.totalesPorDiaSemana = tiempoPorDiaBarras.map(seg => this.formatearSegundos(seg));

    this.dataBarras = {
      labels: this.etiquetasDias,
      datasets: [{ data: tiempoPorDiaBarras, backgroundColor: '#2196F3', borderRadius: 4 }]
    };
    this.dataDona = {
      labels: Object.keys(tiemposPorProyecto),
      datasets: [{ data: Object.values(tiemposPorProyecto), backgroundColor: ['#2196F3', '#64B5F6', '#90CAF9'], borderWidth: 0 }]
    };
  }

  configurarGraficos() {
    this.optionsBarras = {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#9aa0a6' } },
        y: { beginAtZero: true, ticks: { callback: (v: any) => this.formatearSegundos(v) } }
      }
    };
    this.optionsDona = { cutout: '80%', plugins: { legend: { display: false } } };
  }

  private formatearSegundos(t: number): string {
    const h = Math.floor(t / 3600).toString().padStart(2, '0');
    const m = Math.floor((t % 3600) / 60).toString().padStart(2, '0');
    const s = (t % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  }

  cargarEtiquetasDeStorage() {
    const tags = localStorage.getItem('etiquetas');
    this.etiquetasDisponibles = tags ? JSON.parse(tags) : ['GM', 'DISEÑO'];
  }

  get etiquetasFiltradas() {
    return this.etiquetasDisponibles.filter(t => t.toLowerCase().includes(this.filtroEtiqueta.toLowerCase()));
  }

  CambioTab(event: any) { this.tabactivo = event; }
  abrirMenu(panel: any, event: Event, r: any) { this.registroSeleccionado = r; panel.toggle(event); }
  duplicarSeleccionado(p: any) { p.hide(); }
  eliminarSeleccionado(p: any) { p.hide(); }
}