import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

// PrimeNG
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

// Pipes y Servicios
import { FormatDurationPipe } from '../utilities/format-duration.pipe';
import { ConfigService } from '../../../demo/service/config.service';
import { ExtraccionExcel } from '../utilities/extraccion-excel.utils';
import { AppAjustes } from '../../service/appajustes.service';

@Component({
  selector: 'app-informes',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TabMenuModule, DropdownModule,
    CalendarModule, TableModule, ButtonModule, CardModule,
    ChartModule, InputSwitchModule, CheckboxModule,
    OverlayPanelModule, InputTextModule, FormatDurationPipe
  ],
  templateUrl: './informes.component.html',
  styleUrl: './informes.component.css'
})
export class InformesComponent implements OnInit {
  @ViewChild('op') op!: OverlayPanel;
  @ViewChild('dt') dt!: Table;

  tabactivot!: MenuItem;
  tabactivoe!: MenuItem;
  filtroEtiqueta: string = '';
  registroSeleccionado: any = null;
  tipoInformeSeleccionado: string = '1';

  rangoFechas: Date[] = [];
  textoRango: string = '';

  dataBarras: any;
  optionsBarras: any;
  dataDona: any;
  optionsDona: any;

  tiempoTotal: number = 0;
  proyectosResumen: any[] = [];
  registrosDetallados: any[] = [];
  registrosFiltrados: any[] = [];
  etiquetasDisponibles: any[] = [];
  gruposDisponibles: any[] = [];
  datosSemanales: any[] = [];
  totalesPorDiaSemanaSegundos: number[] = [];
  etiquetasDias: string[] = [];

  filtroEquipo: any = null;
  filtroCliente: any = null;
  filtroProyecto: any = null;
  filtroTarea: any = null;
  filtroEtiquetaSeleccionada: any = null;
  filtroEstado: any = null;
  filtroDescripcion: string = '';

  jerarquia1Nombre = 'Clientes';
  jerarquia2Nombre = 'Pro';
  jerarquia3Nombre = 'Tarea';

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

  constructor(
    private route: ActivatedRoute,
    private link: Router,
    private appAjustes: AppAjustes,
    public configService: ConfigService 
  ) {
    this.tabactivot = this.tabsT[0];
    this.tabactivoe = this.tabsE[0];
  }

  ngOnInit() {
    this.appAjustes.config$.subscribe(config => {
      this.jerarquia1Nombre = config.espacioTrabajo.jerarquia1Nombre;
      this.jerarquia2Nombre = config.espacioTrabajo.jerarquia2Nombre;
      this.jerarquia3Nombre = config.espacioTrabajo.jerarquia3Nombre;
    });
    this.configurarGraficos();
    this.cargarEtiquetasDeStorage();
    this.cargarGruposDeStorage();
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

  // --- GETTERS DINÁMICOS ACTUALIZADOS ---
  get opcionesEquipo() { return this.gruposDisponibles; }

  get opcionesClientes() {
    const datos = this.registrosDetallados.map(r => r.clienteNombre).filter(n => n);
    return [...new Set(datos)].map(c => ({ label: c, value: c }));
  }

  // CAMBIO: Ahora el label del filtro de proyectos también es dinámico
  get opcionesProyectos() {
    const datos = this.registrosDetallados.map(r => r.proyecto?.nombre || r.proyecto).filter(p => p);
    return [...new Set(datos)].map(p => ({ label: p, value: p }));
  }

  get opcionesTareas() {
    return this.registrosDetallados
      .filter(r => {
        if (!this.filtroProyecto) return true;
        const nombreProy = r.proyecto?.nombre || r.proyecto;
        return nombreProy === this.filtroProyecto; // ← compara con el filtro activo
      })
      .map(r => r.tarea?.nombre || r.tarea)
      .filter(t => t)
      .filter((t, i, arr) => arr.indexOf(t) === i)
      .map(t => ({ label: t, value: t }));
  }

  get opcionesEstados() {
    return [{ label: 'Activo', value: 'Activo' }, { label: 'Archivado', value: 'Archivado' }];
  }

  irAlRastreador() {
    this.link.navigate(['/menu-layout/rastreador']);
  }

  aplicarFiltrosLocales() {
    this.registrosFiltrados = this.registrosDetallados.filter(r => {
      const coincideEquipo = !this.filtroEquipo || r.grupoId === this.filtroEquipo;
      const coincideCliente = !this.filtroCliente || r.clienteNombre === this.filtroCliente;
      const coincideProyecto = !this.filtroProyecto || (r.proyecto?.nombre || r.proyecto) === this.filtroProyecto;
      const coincideTarea = !this.filtroTarea ||
        (r.tarea?.nombre || r.tarea) === this.filtroTarea;
      const coincideEtiqueta = !this.filtroEtiquetaSeleccionada || (r.etiquetas && r.etiquetas.includes(this.filtroEtiquetaSeleccionada));
      const coincideEstado = !this.filtroEstado || (r.estado || 'Activo') === this.filtroEstado;
      const coincideDesc = !this.filtroDescripcion || r.descripcion?.toLowerCase().includes(this.filtroDescripcion.toLowerCase());
      return coincideEquipo && coincideCliente && coincideProyecto && coincideTarea && coincideEtiqueta && coincideEstado && coincideDesc;
    });

    if (this.rangoFechas && this.rangoFechas[0]) {
      this.procesarEstadisticas(this.rangoFechas[0]);
    }
  }

  cargarGruposDeStorage() {
    const data = localStorage.getItem('grupos');
    if (data) {
      this.gruposDisponibles = JSON.parse(data).map((g: any) => ({ label: g.nombre, value: g.id }));
    }
  }

  cargarEtiquetasDeStorage() {
    const tagsData = localStorage.getItem('etiquetas');
    if (tagsData) {
      this.etiquetasDisponibles = JSON.parse(tagsData).map((e: any) => ({ label: e.nombre || e, value: e.nombre || e }));
    }
  }

  cargarTodoDesdeStorage(inicioF: Date, finF: Date) {
    const data = localStorage.getItem('registros');
    if (!data) return;

    const registros = JSON.parse(data);
    const clientes = JSON.parse(localStorage.getItem('clientes') || '[]');
    const grupos = JSON.parse(localStorage.getItem('grupos') || '[]');

    this.registrosDetallados = registros.map((r: any) => {
      const cliente = clientes.find((c: any) => c.id === r.proyecto?.clienteId);
      const grupoRelacionado = grupos.find((g: any) => g.miembrosIds?.includes(r.miembroId));

      let duracionSegundos = 0;
      if (r.duracion?.includes(':')) {
        const p = r.duracion.split(':');
        duracionSegundos = (parseInt(p[0]) * 3600) + (parseInt(p[1]) * 60) + parseInt(p[2]);
      }

      return {
        ...r,
        inicio: new Date(r.inicio),
        fin: new Date(r.fin),
        duracionSegundos: duracionSegundos,
        clienteNombre: cliente?.nombre || 'Sin Cliente',
        miembroNombre: r.miembroNombre || 'Sin nombre',
        grupoId: grupoRelacionado?.id || null,
        grupoNombre: grupoRelacionado?.nombre || 'Sin Grupo',
        tarea: r.tarea?.nombre || r.tarea || null
      };
    })
      .filter((r: any) => r.inicio >= inicioF && r.inicio <= new Date(finF.getTime() + 86400000))
      .sort((a: any, b: any) => b.inicio.getTime() - a.inicio.getTime());

    this.aplicarFiltrosLocales();
  }

  seleccionarOpcion(opcion: string) {
    const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
    let inicio = new Date(hoy); let fin = new Date(hoy);

    switch (opcion) {
      case 'hoy': fin.setHours(23, 59, 59, 999); break;
      case 'ayer': inicio.setDate(hoy.getDate() - 1); fin.setDate(hoy.getDate() - 1); fin.setHours(23, 59, 59, 999); break;
      case 'estaSemana':
        const diff = (hoy.getDay() === 0 ? 6 : hoy.getDay() - 1);
        inicio.setDate(hoy.getDate() - diff);
        fin = new Date(inicio); fin.setDate(inicio.getDate() + 6); fin.setHours(23, 59, 59, 999);
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
      const s = r.duracionSegundos || 0;
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

    this.tiempoTotal = totalSGlobal;
    this.proyectosResumen = Object.keys(tiemposPorProyecto).map(n => ({
      titulo: n,
      duracionSegundos: tiemposPorProyecto[n],
      color: '#2196F3'
    }));

    this.datosSemanales = Object.keys(agrupacionSemanal).map(n => {
      const registroRef = this.registrosFiltrados.find((r: any) =>
        ((r.proyecto?.nombre || r.proyecto) === n)
      );
      return {
        proyectoNombre: n,
        descripcion: registroRef?.descripcion || 'Sin descripción',
        proyectoColor: registroRef?.proyecto?.color || null,
        clienteNombre: registroRef?.clienteNombre || 'Sin Cliente',
        diasSegundos: agrupacionSemanal[n],
        totalSegundos: agrupacionSemanal[n].reduce((a, b) => a + b, 0)
      };
    });

    this.totalesPorDiaSemanaSegundos = tiempoPorDiaBarras;
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
        y: { beginAtZero: true, ticks: { callback: (v: any) => this.formatearEjeGrafico(v) } }
      }
    };
    this.optionsDona = { cutout: '80%', plugins: { legend: { display: false } } };
  }

  private formatearEjeGrafico(t: number): string {
    const h = Math.floor(t / 3600).toString().padStart(2, '0');
    const m = Math.floor((t % 3600) / 60).toString().padStart(2, '0');
    return `${h}:${m}`;
  }

  CambioTabT(event: any) { this.tabactivot = event; }
  CambioTabE(event: any) { this.tabactivoe = event; }

  restarHoras(duracion: string, horas: number = 8): { tiempo: string, estado: string } {
    if (!duracion) return { tiempo: '00:00:00', estado: 'Sin datos' };
    const [h, m, s] = duracion.split(':').map(Number);
    const trabajados = (h * 3600) + (m * 60) + s;
    const requeridos = horas * 3600;
    const diferencia = requeridos - trabajados;

    const hDiff = Math.floor(Math.abs(diferencia) / 3600).toString().padStart(2, '0');
    const mDiff = Math.floor((Math.abs(diferencia) % 3600) / 60).toString().padStart(2, '0');
    const sDiff = (Math.abs(diferencia) % 60).toString().padStart(2, '0');
    const formato = `${hDiff}:${mDiff}:${sDiff}`;

    if (diferencia > 60) return { tiempo: '- ' + formato, estado: 'Debe ' };
    if (diferencia < -60) return { tiempo: '+ ' + formato, estado: 'Extra' };
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
        // CAMBIO: También dinámico en el Excel
        [this.configService.jerarquia2Nombre()]: ` ${r.proyecto?.nombre || r.proyecto || 'Sin ' + this.configService.jerarquia2Nombre()}`,
        'Cliente': `${r.clienteNombre || 'Sin Cliente'}`,
        'Horas Extra': this.restarHoras(r.duracion).tiempo,
        'Observación': this.restarHoras(r.duracion).estado,
      }),
      'Informe - Asistencia'
    );
  }
}