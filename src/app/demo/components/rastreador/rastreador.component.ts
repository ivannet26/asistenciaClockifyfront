import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// PrimeNG
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { OverlayPanelModule, OverlayPanel } from 'primeng/overlaypanel';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';

// Modelos y Servicios
import { Proyecto, PROYECTO_SIN_PROYECTO } from '../../model/Proyecto';
import { Tarea } from '../../model/Tarea';
import { Registro } from '../../model/Registro';
import { ClientesService } from '../../service/clientes.service';
import { Clientes } from '../../model/Clientes';
import { ProyectosService } from '../../service/proyectos.service';
import { TareasService } from '../../service/tareas.service';
import { TimerService } from '../../service/timer.service';
import { Observable } from 'rxjs';
import { PermissionService } from '../../service/permission.service';
import { ConfigService } from '../../../demo/service/config.service';

@Component({
  selector: 'app-rastreador',
  standalone: true,
  imports: [
    CommonModule, FormsModule, InputTextModule, ButtonModule,
    OverlayPanelModule, DialogModule, DropdownModule, CheckboxModule, TooltipModule
  ],
  providers: [MessageService],
  templateUrl: './rastreador.component.html',
  styleUrl: './rastreador.component.css'
})
export class RastreadorComponent implements OnInit, OnDestroy {

  private readonly STORAGE_REGISTROS = 'registros';
  private readonly STORAGE_ETIQUETAS = 'etiquetas';
  private readonly STORAGE_FAVORITOS = 'proyectos_favoritos';
  private readonly STORAGE_TAREAS_FAV = 'tareas_favoritas';

  tareaActual: string = '';
  esFacturable: boolean = false;

  // Proyectos y Tareas
  busquedaProyecto: string = '';
  proyectos: (Proyecto & { tareas?: Tarea[], desplegado?: boolean })[] = [];
  gruposProyectos: any[] = [];

  proyectosFavoritos: number[] = [];
  tareasFavoritas: number[] = [];

  proyectoSeleccionado: Proyecto | null = PROYECTO_SIN_PROYECTO;
  tareaSeleccionada: Tarea | null = null;
  mostrarModalProyecto: boolean = false;

  // Modal Crear Tarea
  mostrarModalTarea: boolean = false;
  proyectoParaNuevaTarea: Proyecto | null = null;
  nombreNuevaTarea: string = '';

  clientes: Clientes[] = [];
  etiquetasDisponibles: any[] = [];
  etiquetasSeleccionadas: string[] = [];
  busquedaEtiqueta: string = '';

  registros: Registro[] = [];
  registrosAgrupados: any[] = [];
  registroSeleccionadoParaEditar: any = null;
  canCreateP$!: Observable<boolean>;

  nuevoProyecto = {
    nombre: '',
    cliente: null as Clientes | null,
    color: '#2196F3',
    publico: true
  };

  constructor(
    private proyectosService: ProyectosService,
    private tareasService: TareasService,
    private clientesService: ClientesService,
    public timerService: TimerService,
    private permissionService: PermissionService,
    public configService: ConfigService,
    private router: Router,
    private messageService: MessageService
  ) { }

  ngOnInit() {
    this.cargarFavoritos();
    this.cargarClientes();
    this.cargarProyectosYTareas();
    this.cargarRegistros();
    this.cargarEtiquetas();
    this.agruparRegistros();
    this.canCreateP$ = this.permissionService.canDo('createProject');
    this.timerService.detenerDesdeAfuera$.subscribe(() => {
      this.finalizarYGuardarManual();
    });

    const timerGuardado = localStorage.getItem('timer_activo');
    if (timerGuardado) {
      const data = JSON.parse(timerGuardado);
      const ahora = new Date().getTime();
      const ultimaSenal = new Date(data.fin).getTime();
      const segundosDeSilencio = (ahora - ultimaSenal) / 1000;

      if (segundosDeSilencio > 3) {
        console.log("Sesión finalizada detectada. Guardando registro...");
        const session = JSON.parse(localStorage.getItem('userSession') || '{}');
        const inicio = new Date(data.inicio);
        const fin = new Date(data.fin);
        const diffMs = fin.getTime() - inicio.getTime();

        const registroRecuperado: any = {
          descripcion: data.descripcion,
          proyecto: data.proyecto,
          tarea: data.tarea,
          miembroId: session.userData?.id,
          miembroNombre: session.userData?.nombre,
          inicio: inicio,
          fin: fin,
          duracion: this.formatearTiempo(diffMs),
          facturable: data.facturable,
          etiquetas: data.etiquetas || []
        };

        this.guardarRegistro(registroRecuperado);
        this.timerService.stop();
        this.cargarRegistros();
        this.agruparRegistros();
      } else {
        this.timerService.remanecer(data);
        this.tareaActual = this.timerService.tareaActual();
        this.proyectoSeleccionado = this.timerService.proyectoSeleccionado();
      }
    }
  }

  ngOnDestroy() { }

  // ========================================================
  // LÓGICA DE PROYECTOS, TAREAS Y GRUPOS
  // ========================================================

  cargarProyectosYTareas() {
    const proyBase = this.proyectosService.getProyectos();
    const tareasFull = this.tareasService.getTareas();

    this.proyectos = proyBase.map(p => ({
      ...p,
      tareas: tareasFull.filter(t => t.proyectoId === p.id),
      desplegado: false
    }));
    this.actualizarGruposProyectos();
  }

  onBusquedaProyectoChange() {
    this.actualizarGruposProyectos();
  }

  actualizarGruposProyectos() {
    const b = this.busquedaProyecto.toLowerCase();
    let filtrados = this.proyectos;

    if (b) {
      filtrados = this.proyectos.filter(p =>
        p.nombre.toLowerCase().includes(b) ||
        (p.tareas && p.tareas.some(t => t.nombre.toLowerCase().includes(b)))
      );
    }

    const gruposMap = new Map<string, any>();

    // 1. FAVORITOS
    const favs = filtrados.filter(p =>
      this.proyectosFavoritos.includes(p.id!) ||
      (p.tareas && p.tareas.some(t => this.tareasFavoritas.includes(t.id)))
    );
    if (favs.length > 0 && !b) {
      gruposMap.set('FAVORITOS', { nombreCliente: 'FAVORITOS', proyectos: favs, desplegado: true });
    }

    // 2. SIN CLIENTE
    const sinCliente = filtrados.filter(p => !p.clienteId);
    if (sinCliente.length > 0) {
      gruposMap.set('SIN CLIENTE', { nombreCliente: 'SIN CLIENTE', proyectos: sinCliente, desplegado: true });
    }

    // 3. POR CLIENTES
    this.clientes.forEach(c => {
      const proysCliente = filtrados.filter(p => p.clienteId === c.id);
      if (proysCliente.length > 0) {
        gruposMap.set(c.nombre, { nombreCliente: c.nombre.toUpperCase(), proyectos: proysCliente, desplegado: true });
      }
    });

    this.gruposProyectos = Array.from(gruposMap.values());
  }

  cargarFavoritos() {
    const dataP = localStorage.getItem(this.STORAGE_FAVORITOS);
    if (dataP) this.proyectosFavoritos = JSON.parse(dataP);

    const dataT = localStorage.getItem(this.STORAGE_TAREAS_FAV);
    if (dataT) this.tareasFavoritas = JSON.parse(dataT);
  }

  toggleFavoritoProyecto(event: Event, pId: number) {
    event.stopPropagation();
    const idx = this.proyectosFavoritos.indexOf(pId);
    if (idx > -1) this.proyectosFavoritos.splice(idx, 1);
    else this.proyectosFavoritos.push(pId);

    localStorage.setItem(this.STORAGE_FAVORITOS, JSON.stringify(this.proyectosFavoritos));
    this.actualizarGruposProyectos();
  }

  toggleFavoritoTarea(event: Event, tId: number, pId: number) {
    event.stopPropagation();
    const idx = this.tareasFavoritas.indexOf(tId);
    if (idx > -1) {
      this.tareasFavoritas.splice(idx, 1);
    } else {
      this.tareasFavoritas.push(tId);
      // Si la tarea es favorita, hacer que el proyecto también lo sea automáticamente
      if (!this.proyectosFavoritos.includes(pId)) {
        this.proyectosFavoritos.push(pId);
        localStorage.setItem(this.STORAGE_FAVORITOS, JSON.stringify(this.proyectosFavoritos));
      }
    }
    localStorage.setItem(this.STORAGE_TAREAS_FAV, JSON.stringify(this.tareasFavoritas));
    this.actualizarGruposProyectos();
  }

  toggleDespliegueTareas(event: Event, proyecto: any) {
    event.stopPropagation();
    proyecto.desplegado = !proyecto.desplegado;
  }

  abrirCrearTarea(event: Event, proyecto: Proyecto, panel: any) {
    event.stopPropagation();
    this.proyectoParaNuevaTarea = proyecto;
    this.nombreNuevaTarea = '';
    this.mostrarModalTarea = true;
    panel.hide();
  }

  guardarNuevaTarea() {
    if (!this.nombreNuevaTarea.trim() || !this.proyectoParaNuevaTarea) return;
    this.tareasService.agregarTarea(this.proyectoParaNuevaTarea.id!, this.nombreNuevaTarea.trim());
    this.messageService.add({ severity: 'success', summary: 'Tarea Creada', detail: 'La tarea se guardó correctamente' });
    this.cargarProyectosYTareas();
    this.mostrarModalTarea = false;
    this.proyectoParaNuevaTarea = null;
    this.nombreNuevaTarea = '';
  }

  seleccionarSinProyecto(panel: any) {
    this.proyectoSeleccionado = PROYECTO_SIN_PROYECTO;
    this.tareaSeleccionada = null;
    if (this.registroSeleccionadoParaEditar) {
      this.registroSeleccionadoParaEditar.proyecto = null;
      this.registroSeleccionadoParaEditar.tarea = null;
      this.actualizarRegistroEnStorage(this.registroSeleccionadoParaEditar);
      this.registroSeleccionadoParaEditar = null;
    }
    panel.hide();
  }

  seleccionarProyecto(proyecto: Proyecto, panel: any) {
    if (this.registroSeleccionadoParaEditar) {
      this.registroSeleccionadoParaEditar.proyecto = proyecto;
      this.registroSeleccionadoParaEditar.tarea = null;
      this.actualizarRegistroEnStorage(this.registroSeleccionadoParaEditar);
      this.registroSeleccionadoParaEditar = null;
    } else {
      this.proyectoSeleccionado = proyecto;
      this.tareaSeleccionada = null;
    }
    panel.hide();
  }

  seleccionarTarea(tarea: Tarea, proyecto: Proyecto, panel: any) {
    if (this.registroSeleccionadoParaEditar) {
        this.registroSeleccionadoParaEditar.proyecto = proyecto;
        this.registroSeleccionadoParaEditar.tarea = tarea;
        this.actualizarRegistroEnStorage(this.registroSeleccionadoParaEditar);
        this.registroSeleccionadoParaEditar = null;
    } else {
        this.proyectoSeleccionado = proyecto;
        this.tareaSeleccionada = tarea;
    }
    panel.hide();
  }

  generarTooltip(proyecto: any, tarea?: any): string {
    let clientName = 'Sin cliente';
    if(proyecto?.clienteId) {
        const c = this.clientes.find(x => x.id === proyecto.clienteId);
        if(c) clientName = c.nombre;
    }
    let tool = `Project: ${proyecto?.nombre} | Client: ${clientName}`;
    if (tarea) tool += ` | Task: ${tarea.nombre}`;
    return tool;
  }

  // ========================================================
  // LÓGICA DE REGISTROS DEL CRONÓMETRO INTACTA
  // ========================================================

  toggleTimer() {
    this.registroSeleccionadoParaEditar = null;
    if (!this.timerService.corriendo()) {
      this.timerService.start(
        new Date(),
        this.tareaActual,
        this.proyectoSeleccionado,
        this.esFacturable,
        this.etiquetasSeleccionadas
      );
    } else {
      this.finalizarYGuardarManual();
    }
  }

  finalizarYGuardarManual() {
    const inicio = this.timerService.inicioTiempo;
    const fin = new Date();
    if (inicio) {
      const diffMs = fin.getTime() - inicio.getTime();
      const session = JSON.parse(localStorage.getItem('userSession') || '{}');

      const nuevo: any = {
        descripcion: this.tareaActual?.trim() || 'Sin descripción',
        proyecto: this.proyectoSeleccionado,
        tarea: this.tareaSeleccionada,
        miembroId: session.userData?.id,
        miembroNombre: session.userData?.nombre,
        inicio: inicio,
        fin: fin,
        duracion: this.formatearTiempo(diffMs),
        facturable: this.esFacturable,
        etiquetas: [...this.etiquetasSeleccionadas]
      };

      this.guardarRegistro(nuevo);
      this.timerService.stop();
      this.resetearFormulario();
      this.cargarRegistros();
      this.agruparRegistros();
    }
  }

  guardarRegistro(nuevo: any) {
    const data = JSON.parse(localStorage.getItem(this.STORAGE_REGISTROS) || '[]');
    const existe = data.find((r: any) =>
      new Date(r.inicio).getTime() === new Date(nuevo.inicio).getTime()
    );
    if (!existe) {
      data.unshift(nuevo);
      localStorage.setItem(this.STORAGE_REGISTROS, JSON.stringify(data));
    }
  }

  actualizarRegistroEnStorage(regActualizado: any) {
    const todos = JSON.parse(localStorage.getItem(this.STORAGE_REGISTROS) || '[]');
    const index = todos.findIndex((r: any) =>
      new Date(r.inicio).getTime() === new Date(regActualizado.inicio).getTime()
    );
    if (index !== -1) {
      todos[index] = regActualizado;
      localStorage.setItem(this.STORAGE_REGISTROS, JSON.stringify(todos));
      this.cargarRegistros();
      this.agruparRegistros();
    }
  }

  resetearFormulario() {
    this.tareaActual = '';
    this.proyectoSeleccionado = PROYECTO_SIN_PROYECTO;
    this.tareaSeleccionada = null;
    this.etiquetasSeleccionadas = [];
    this.esFacturable = false;
  }

  cargarRegistros() {
    const session = JSON.parse(localStorage.getItem('userSession') || '{}');
    const miembroId = session.userData?.id;
    const data = JSON.parse(localStorage.getItem(this.STORAGE_REGISTROS) || '[]');
    this.registros = data
      .filter((r: any) => r.miembroId === miembroId)
      .map((r: any) => ({
        ...r,
        inicio: new Date(r.inicio),
        fin: new Date(r.fin)
      }));
  }

  agruparRegistros() {
    const mapa = new Map<string, any>();
    const hoy = new Date();
    const ayer = new Date();
    ayer.setDate(hoy.getDate() - 1);

    this.registros.forEach(reg => {
      const fecha = new Date(reg.inicio);
      let clave = this.esMismaFecha(fecha, hoy) ? 'hoy' :
        this.esMismaFecha(fecha, ayer) ? 'ayer' : fecha.toDateString();

      let label = clave === 'hoy' ? 'Hoy' : clave === 'ayer' ? 'Ayer' :
        fecha.toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric', month: 'short' });

      if (!mapa.has(clave)) {
        mapa.set(clave, { label, fecha, registros: [], totalMs: 0 });
      }

      const grupo = mapa.get(clave);
      grupo.registros.push(reg);
      grupo.totalMs += new Date(reg.fin).getTime() - new Date(reg.inicio).getTime();
    });

    this.registrosAgrupados = Array.from(mapa.values()).sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
  }

  eliminarRegistro(registro: any) {
    const todos = JSON.parse(localStorage.getItem(this.STORAGE_REGISTROS) || '[]');
    const filtrados = todos.filter((r: any) =>
      new Date(r.inicio).getTime() !== new Date(registro.inicio).getTime()
    );
    localStorage.setItem(this.STORAGE_REGISTROS, JSON.stringify(filtrados));
    this.cargarRegistros();
    this.agruparRegistros();
  }

  formatearTiempo(ms: number): string {
    const totalS = Math.floor(ms / 1000);
    const h = Math.floor(totalS / 3600).toString().padStart(2, '0');
    const m = Math.floor((totalS % 3600) / 60).toString().padStart(2, '0');
    const s = (totalS % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  }

  formatearHora(fecha: Date): string {
    return fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  esMismaFecha(f1: Date, f2: Date): boolean {
    return f1.getFullYear() === f2.getFullYear() && f1.getMonth() === f2.getMonth() && f1.getDate() === f2.getDate();
  }

  get etiquetasFiltradas() {
    const b = this.busquedaEtiqueta.toLowerCase();
    return b ? this.etiquetasDisponibles.filter(t => t.nombre.toLowerCase().includes(b)) : this.etiquetasDisponibles;
  }

  repetirTarea(r: any) {
    this.tareaActual = r.descripcion;
    this.proyectoSeleccionado = r.proyecto;
    this.tareaSeleccionada = r.tarea || null;
    this.etiquetasSeleccionadas = [...(r.etiquetas || [])];
    if (!this.timerService.corriendo()) this.toggleTimer();
  }

  abrirPanelProyectosEnRegistro(event: any, registro: any, panel: any) {
    this.registroSeleccionadoParaEditar = registro;
    this.cargarProyectosYTareas();
    panel.toggle(event);
  }

  abrirPanelEtiquetasEnRegistro(event: any, registro: any, panel: any) {
    this.registroSeleccionadoParaEditar = registro;
    this.etiquetasSeleccionadas = [...(registro.etiquetas || [])];
    panel.toggle(event);
  }

  toggleEtiqueta(nombre: string) {
    if (this.registroSeleccionadoParaEditar) {
      if (!this.registroSeleccionadoParaEditar.etiquetas) this.registroSeleccionadoParaEditar.etiquetas = [];
      const i = this.registroSeleccionadoParaEditar.etiquetas.indexOf(nombre);
      if (i > -1) this.registroSeleccionadoParaEditar.etiquetas.splice(i, 1);
      else this.registroSeleccionadoParaEditar.etiquetas.push(nombre);
      this.actualizarRegistroEnStorage(this.registroSeleccionadoParaEditar);
    } else {
      const i = this.etiquetasSeleccionadas.indexOf(nombre);
      if (i > -1) this.etiquetasSeleccionadas.splice(i, 1);
      else this.etiquetasSeleccionadas.push(nombre);
    }
  }

  cargarClientes() { this.clientes = this.clientesService.getClientes(); }
  cargarEtiquetas() { this.etiquetasDisponibles = JSON.parse(localStorage.getItem(this.STORAGE_ETIQUETAS) || '[]'); }

  abrirModalNuevoProyecto() { this.mostrarModalProyecto = true; }

  guardarProyecto() {
    if (!this.nuevoProyecto.nombre?.trim()) return;
    const creados = this.proyectosService.agregarProyecto(
      this.nuevoProyecto.nombre, this.nuevoProyecto.cliente?.id ?? 0,
      this.nuevoProyecto.color, this.nuevoProyecto.publico, 0, true, new Date()
    );
    this.cargarProyectosYTareas();
    this.proyectoSeleccionado = creados[creados.length - 1];
    this.tareaSeleccionada = null;
    this.mostrarModalProyecto = false;
    this.nuevoProyecto = { nombre: '', cliente: null, color: '#2196F3', publico: true };
  }
}
