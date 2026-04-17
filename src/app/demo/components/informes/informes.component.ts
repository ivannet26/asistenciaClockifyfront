import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { Router } from '@angular/router';
import { TabMenuModule } from "primeng/tabmenu";
import { DropdownModule } from "primeng/dropdown";
import { CalendarModule } from "primeng/calendar";
import { TableModule, Table } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from "primeng/card";
import { ChartModule } from 'primeng/chart';
import { InputSwitchModule } from 'primeng/inputswitch';
import { CheckboxModule } from 'primeng/checkbox';
import { OverlayPanelModule, OverlayPanel } from 'primeng/overlaypanel';
import { InputTextModule } from 'primeng/inputtext';
import { MenuItem } from 'primeng/api';

import { ExtraccionExcel } from '../utilities/extraccion-excel.utils';

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
  @ViewChild('dt') dt!: Table;

  // --- UI ---
  tabactivot!: MenuItem;
  tabactivoe!: MenuItem;
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
  registrosFiltrados: any[] = []; 
  etiquetasDisponibles: any[] = [];
  gruposDisponibles: any[] = [];
  datosSemanales: any[] = [];
  totalesPorDiaSemana: string[] = [];
  etiquetasDias: string[] = [];

  // --- Variables de Filtros ---
  filtroEquipo: any = null; // Guardará el ID o Nombre del Grupo seleccionado
  filtroCliente: any = null;
  filtroProyecto: any = null;
  filtroTarea: any = null;
  filtroEtiquetaSeleccionada: any = null;
  filtroEstado: any = null;
  filtroDescripcion: string = '';

  estiloFiltro = { 'border': 'none', 'font-size': '12px' };

  tabsT: MenuItem[] = [
    { label: 'Resumido', id: '0' },
    { label: 'Detallado', id: '1' },
    { label: 'Semanal', id: '2' },
    { label: 'Compartido', id: '3' }
  ];

  tabsE: MenuItem[] = [
    { label: 'Asistencia', id: '0' },
    { label: 'Asignación', id: '1' }
  ];

  opcionesInformes = [
    { label: 'INFORME DE TIEMPO', value: 1 },
    { label: 'INFORME DE EQUIPO', value: 2 }
  ];

  opcionSeleccionada: number = 1;

  constructor(private route: ActivatedRoute, private link: Router) {
    this.tabactivot = this.tabsT[0];
    this.tabactivoe = this.tabsE[0];
  }

  ngOnInit() {
    this.configurarGraficos();
    this.cargarEtiquetasDeStorage();
    this.cargarGruposDeStorage(); // Cargar los grupos (Sistemas, Contabilidad, etc)
    this.seleccionarOpcion('estaSemana');

    this.route.queryParams.subscribe(params => {
      const tipo = params['tipo'];
      const tab = params['tab']?.toString();
      if (tipo === 'tiempo') {
        this.opcionSeleccionada = 1;
        if (tab !== undefined) {
          const encontrado = this.tabsT.find(t => t.id === tab);
          if (encontrado) this.tabactivot = encontrado;
        }
      } else if (tipo === 'equipo') {
        this.opcionSeleccionada = 2;
        if (tab !== undefined) {
          const encontrado = this.tabsE.find(t => t.id === tab);
          if (encontrado) this.tabactivoe = encontrado;
        }
      }
    });
  }

  // --- GETTERS DINÁMICOS PARA FILTROS ---
  
  // Ahora devuelve los grupos cargados del storage
  get opcionesEquipo() {
    return this.gruposDisponibles;
  }

  get opcionesClientes() {
    const datos = this.registrosDetallados.map(r => r.clienteNombre).filter(n => n);
    return [...new Set(datos)].map(c => ({ label: c, value: c }));
  }

  get opcionesProyectos() {
    const datos = this.registrosDetallados.map(r => r.proyecto?.nombre || r.proyecto).filter(p => p);
    return [...new Set(datos)].map(p => ({ label: p, value: p }));
  }

  get opcionesTareas() {
    const datos = this.registrosDetallados.map(r => r.tarea).filter(t => t);
    return [...new Set(datos)].map(t => ({ label: t, value: t }));
  }

  get opcionesEstados() {
    return [
      { label: 'Activo', value: 'Activo' },
      { label: 'Archivado', value: 'Archivado' }
    ];
  }

  // --- LÓGICA DE FILTRADO ---
  aplicarFiltrosLocales() {
    this.registrosFiltrados = this.registrosDetallados.filter(r => {
      // Filtrar por Equipo (Grupo). Compara el grupo del registro con el seleccionado
      const coincideEquipo = !this.filtroEquipo || r.grupoNombre === this.filtroEquipo || r.grupoId === this.filtroEquipo;
      
      const coincideCliente = !this.filtroCliente || r.clienteNombre === this.filtroCliente;
      const coincideProyecto = !this.filtroProyecto || (r.proyecto?.nombre || r.proyecto) === this.filtroProyecto;
      const coincideTarea = !this.filtroTarea || r.tarea === this.filtroTarea;
      const coincideEtiqueta = !this.filtroEtiquetaSeleccionada || (r.etiquetas && r.etiquetas.includes(this.filtroEtiquetaSeleccionada));
      
      const estadoRegistro = r.estado || 'Activo';
      const coincideEstado = !this.filtroEstado || estadoRegistro === this.filtroEstado;
      
      const coincideDesc = !this.filtroDescripcion || r.descripcion?.toLowerCase().includes(this.filtroDescripcion.toLowerCase());

      return coincideEquipo && coincideCliente && coincideProyecto && coincideTarea && coincideEtiqueta && coincideEstado && coincideDesc;
    });

    this.procesarEstadisticas(this.rangoFechas[0]);
  }

  // --- CARGA DE DATOS DESDE STORAGE ---

  cargarGruposDeStorage() {
    const data = localStorage.getItem('grupos');
    if (data) {
      const grupos = JSON.parse(data);
      this.gruposDisponibles = grupos.map((g: any) => ({
        label: g.nombre, // Ej: "Sistemas"
        value: g.nombre  // O g.id si tus registros guardan el ID
      }));
    }
  }

  cargarEtiquetasDeStorage() {
    const tagsData = localStorage.getItem('etiquetas');
    if (tagsData) {
      const etiquetasGuardadas = JSON.parse(tagsData);
      this.etiquetasDisponibles = etiquetasGuardadas.map((e: any) => ({
        label: e.nombre || e, 
        value: e.nombre || e
      }));
    }
  }

  cargarTodoDesdeStorage(inicioF: Date, finF: Date) {
    const data = localStorage.getItem('registros');
    if (!data) return;
    const registros = JSON.parse(data);
    const clientesData = localStorage.getItem('clientes');
    const clientes = clientesData ? JSON.parse(clientesData) : [];

    this.registrosDetallados = registros
      .map((r: any) => {
        const clienteId = r.proyecto?.clienteId;
        const cliente = clientes.find((c: any) => c.id === clienteId);
        return {
          ...r,
          inicio: new Date(r.inicio),
          fin: new Date(r.fin),
          clienteNombre: cliente?.nombre || 'Sin Cliente',
          miembroNombre: r.miembroNombre || 'Sin nombre',
          // Asegúrate de que el registro tenga el nombre del grupo para filtrar
          grupoNombre: r.grupoNombre || 'General' 
        };
      })
      .filter((r: any) =>
        r.inicio >= inicioF &&
        r.inicio <= new Date(finF.getTime() + 86400000)
      )
      .sort((a: any, b: any) => b.inicio.getTime() - a.inicio.getTime());

    this.aplicarFiltrosLocales();
  }

  // --- LÓGICA DE CALENDARIO ---

  seleccionarOpcion(opcion: string) {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    let inicio = new Date(hoy);
    let fin = new Date(hoy);

    switch (opcion) {
      case 'hoy': fin.setHours(23, 59, 59, 999); break;
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

    irAlRastreador() {
    this.link.navigate(['/menu-layout/rastreador']);
  }

  // --- GRÁFICOS Y ESTADÍSTICAS ---

  procesarEstadisticas(lunesReferencia: Date) {
    const tiemposPorProyecto: { [key: string]: number } = {};
    const tiempoPorDiaBarras = [0, 0, 0, 0, 0, 0, 0];
    const agrupacionSemanal: { [key: string]: number[] } = {};
    let totalSGlobal = 0;

    const diasNombres = ['lun.', 'mar.', 'mié.', 'jue.', 'vie.', 'sáb.', 'dom.'];
    this.etiquetasDias = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(lunesReferencia);
      d.setDate(lunesReferencia.getDate() + i);
      this.etiquetasDias.push(`${diasNombres[i]}, ${d.getDate()}`);
    }

    this.registrosFiltrados.forEach(r => {
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

    this.datosSemanales = Object.keys(agrupacionSemanal).map(n => {
      const registroRef = this.registrosFiltrados.find((r: any) => {
        const nombre = (r.proyecto && typeof r.proyecto === 'object') ? r.proyecto.nombre : (r.proyecto || 'Sin Proyecto');
        return nombre === n;
      });
      return {
        proyecto: n,
        descripcion: registroRef?.descripcion || 'Sin descripción',
        proyectoColor: registroRef?.proyecto?.color || null,
        proyectoNombre: registroRef?.proyecto?.nombre || registroRef?.proyecto || 'Sin Proyecto',
        clienteNombre: registroRef?.clienteNombre || 'Sin Cliente',
        dias: agrupacionSemanal[n].map(seg => seg > 0 ? this.formatearSegundos(seg) : '—'),
        total: this.formatearSegundos(agrupacionSemanal[n].reduce((a, b) => a + b, 0))
      };
    });

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

  // --- NAVEGACIÓN Y EXPORTACIÓN ---


  CambioTabT(event: any) { this.tabactivot = event; }
  CambioTabE(event: any) { this.tabactivoe = event; }

  restarHoras(duracion: string, horas: number = 8): { tiempo: string, estado: string } {
    if(!duracion) return { tiempo: '00:00:00', estado: 'Sin datos' };
    const [h, m, s] = duracion.split(':').map(Number);
    const trabajados = (h * 3600) + (m * 60) + s;
    const requeridos = horas * 3600;
    const diferencia = requeridos - trabajados;
    const umbral = 60;

    if (diferencia > umbral) return { tiempo: '- ' + this.formatearSegundos(diferencia), estado: 'Debe ' };
    if (diferencia < -umbral) return { tiempo: '+ ' + this.formatearSegundos(Math.abs(diferencia)), estado: 'Extra' };
    return { tiempo: '00:00:00', estado: 'Completado' };
  }

  exportar(): void {
    ExtraccionExcel.desdeTabla(
      this.dt,
      (r, i) => ({
        'N°': i + 1,
        'Usuario': r.miembroNombre || 'Usuario',
        'Fecha': r.inicio ? new Date(r.inicio).toLocaleDateString('es-ES') : '',
        'Inicio': r.inicio ? new Date(r.inicio).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : '',
        'Fin': r.fin ? new Date(r.fin).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : '',
        'Descripcion': `${r.descripcion || 'Sin descripción'}`,
        'Trabajo': ` ${r.proyecto?.nombre || r.proyecto || 'Sin Proyecto'}`,
        'Cliente': `${r.clienteNombre || 'Sin Cliente'}`,
        'Horas Extra': this.restarHoras(r.duracion).tiempo,
        'Observación': this.restarHoras(r.duracion).estado,
      }),
      'Informe - Asistencia'
    );
  }
}