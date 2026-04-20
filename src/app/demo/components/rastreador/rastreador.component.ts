import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';

import { Proyecto, PROYECTO_SIN_PROYECTO } from '../../model/Proyecto';
import { Registro } from '../../model/Registro';
import { ClientesService } from '../../service/clientes.service';
import { Clientes } from '../../model/Clientes';
import { ProyectosService } from '../../service/proyectos.service';
import { TimerService } from '../../service/timer.service'; // Asegúrate de la ruta correcta

@Component({
  selector: 'app-rastreador',
  standalone: true,
  imports: [
    CommonModule, FormsModule, InputTextModule, ButtonModule,
    OverlayPanelModule, DialogModule, DropdownModule, CheckboxModule
  ],
  templateUrl: './rastreador.component.html',
  styleUrl: './rastreador.component.css'
})
export class RastreadorComponent implements OnInit, OnDestroy {

  private STORAGE_REGISTROS = 'registros';
  private STORAGE_ETIQUETAS = 'etiquetas';
  private STORAGE_TIMER_ACTIVO = 'timer_activo';

  tareaActual: string = '';
  esFacturable: boolean = false;
  busquedaProyecto: string = '';
  proyectos: Proyecto[] = [];
  proyectoSeleccionado: Proyecto | null = PROYECTO_SIN_PROYECTO;
  mostrarModalProyecto: boolean = false;
  clientes: Clientes[] = [];
  etiquetasDisponibles: any[] = [];
  etiquetasSeleccionadas: string[] = [];
  busquedaEtiqueta: string = '';

  inicioTiempo!: Date;
  registros: Registro[] = [];
  registrosAgrupados: any[] = [];

  nuevoProyecto = {
    nombre: '',
    cliente: null as Clientes | null,
    color: '#2196F3',
    publico: true
  };

  constructor(
    private proyectosService: ProyectosService, 
    private clientesService: ClientesService,
    public timerService: TimerService // Inyectamos el servicio global
  ) { }

  ngOnInit() {
    this.cargarProyectos();
    this.cargarRegistros();
    this.cargarClientes();
    this.cargarEtiquetas();
    this.verificarTimerPersistente();
    this.agruparRegistros();
  }

  ngOnDestroy() {
    // Ya no limpiamos el intervalo aquí para que siga corriendo en la pestaña
  }

  // Getter para que el HTML siga funcionando con tu variable original
  get tiempoTranscurrido(): string {
    return this.timerService.tiempoTranscurrido();
  }

  get corriendo(): boolean {
    return this.timerService.corriendo();
  }

  verificarTimerPersistente() {
    const guardado = localStorage.getItem(this.STORAGE_TIMER_ACTIVO);
    if (guardado) {
      const data = JSON.parse(guardado);
      this.inicioTiempo = new Date(data.inicio);
      this.tareaActual = data.descripcion;
      this.proyectoSeleccionado = data.proyecto;
      this.esFacturable = data.facturable;
      this.etiquetasSeleccionadas = data.etiquetas || [];
      
      // Reconectamos el servicio con los datos guardados
      this.timerService.start(
        this.inicioTiempo, 
        this.tareaActual, 
        this.proyectoSeleccionado, 
        this.esFacturable, 
        this.etiquetasSeleccionadas
      );
    }
  }

  toggleTimer() {
    // IMPORTANTE: Preguntar al servicio, no a la variable local
    if (!this.timerService.corriendo()) {
        this.inicioTiempo = new Date();
        this.timerService.start(
            this.inicioTiempo, 
            this.tareaActual, 
            this.proyectoSeleccionado, 
            this.esFacturable, 
            this.etiquetasSeleccionadas
        );
    } else {
        // Obtenemos la info del servicio antes de pararlo
        const inicio = this.timerService.inicioTiempo; 
        const finTiempo = new Date();
        
        if (inicio) {
            const diffMs = finTiempo.getTime() - inicio.getTime();
            const session = JSON.parse(localStorage.getItem('userSession') || '{}');
            
            const nuevoRegistro: Registro = {
                descripcion: this.tareaActual?.trim() || 'Sin descripción',
                proyecto: this.proyectoSeleccionado,
                miembroId: session.userData?.id,
                miembroNombre: session.userData?.nombre,
                inicio: inicio,
                fin: finTiempo,
                duracion: this.formatearTiempo(diffMs),
                facturable: this.esFacturable,
                etiquetas: [...this.etiquetasSeleccionadas]
            };

            this.guardarRegistro(nuevoRegistro);
        }

        // DETENEMOS EL SERVICIO
        this.timerService.stop(); 
        
        // Refrescamos la lista
        this.cargarRegistros();
        this.agruparRegistros();

        // Limpiamos los campos
        this.tareaActual = '';
        this.proyectoSeleccionado = PROYECTO_SIN_PROYECTO;
        this.etiquetasSeleccionadas = [];
    }
}

  // --- Lógica de Agrupación y Carga (Sin cambios) ---

  agruparRegistros() {
    const grupos: any[] = [];
    const hoy = new Date();
    const ayer = new Date();
    ayer.setDate(hoy.getDate() - 1);
    const mapa = new Map<string, any>();

    this.registros.forEach(reg => {
      const fecha = new Date(reg.inicio);
      let clave = '';
      let label = '';

      if (this.esMismaFecha(fecha, hoy)) { clave = 'hoy'; label = 'Hoy'; } 
      else if (this.esMismaFecha(fecha, ayer)) { clave = 'ayer'; label = 'Ayer'; } 
      else {
        clave = fecha.toDateString();
        label = fecha.toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric', month: 'short' });
      }

      if (!mapa.has(clave)) {
        mapa.set(clave, { label, fecha, registros: [], totalMs: 0 });
      }

      const grupo = mapa.get(clave);
      grupo.registros.push(reg);
      grupo.totalMs += new Date(reg.fin).getTime() - new Date(reg.inicio).getTime();
    });

    mapa.forEach(g => grupos.push(g));
    this.registrosAgrupados = grupos.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
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
        fin: new Date(r.fin),
        etiquetas: r.etiquetas || []
      }));
  }

  guardarRegistro(nuevoRegistro: Registro) {
    const data = JSON.parse(localStorage.getItem(this.STORAGE_REGISTROS) || '[]');
    data.unshift(nuevoRegistro);
    localStorage.setItem(this.STORAGE_REGISTROS, JSON.stringify(data));
  }

  eliminarRegistro(registro: Registro) {
    const todosLosRegistros = JSON.parse(localStorage.getItem(this.STORAGE_REGISTROS) || '[]');
    const dataActualizada = todosLosRegistros.filter((r: any) => {
        return new Date(r.inicio).getTime() !== new Date(registro.inicio).getTime() || 
               r.descripcion !== registro.descripcion;
    });
    localStorage.setItem(this.STORAGE_REGISTROS, JSON.stringify(dataActualizada));
    this.cargarRegistros();
    this.agruparRegistros();
  }

  // --- Helpers ---
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

  cargarProyectos() { this.proyectos = this.proyectosService.getProyectos(); }
  cargarClientes() { this.clientes = this.clientesService.getClientes(); }
  cargarEtiquetas() { this.etiquetasDisponibles = JSON.parse(localStorage.getItem(this.STORAGE_ETIQUETAS) || '[]'); }

  seleccionarProyecto(proyecto: Proyecto, panel: any) { this.proyectoSeleccionado = proyecto; panel.hide(); }

  toggleEtiqueta(nombre: string) {
    const i = this.etiquetasSeleccionadas.indexOf(nombre);
    if (i > -1) this.etiquetasSeleccionadas.splice(i, 1);
    else this.etiquetasSeleccionadas.push(nombre);
  }

  get etiquetasFiltradas() {
    const b = this.busquedaEtiqueta.toLowerCase();
    return b ? this.etiquetasDisponibles.filter(t => t.nombre.toLowerCase().includes(b)) : this.etiquetasDisponibles;
  }

  repetirTarea(r: any) {
    this.tareaActual = r.descripcion;
    this.proyectoSeleccionado = r.proyecto;
    this.etiquetasSeleccionadas = [...(r.etiquetas || [])];
    if (!this.corriendo) this.toggleTimer();
  }

  get totalHoy(): string {
    const hoy = new Date().toDateString();
    const ms = this.registros
      .filter(r => new Date(r.inicio).toDateString() === hoy)
      .reduce((acc, r) => acc + (new Date(r.fin).getTime() - new Date(r.inicio).getTime()), 0);
    return this.formatearTiempo(ms);
  }

  abrirModalNuevoProyecto() { this.cargarClientes(); this.mostrarModalProyecto = true; }

  guardarProyecto() {
    if (!this.nuevoProyecto.nombre?.trim()) return;
    this.proyectos = this.proyectosService.agregarProyecto(
      this.nuevoProyecto.nombre, this.nuevoProyecto.cliente?.id ?? 0, 
      this.nuevoProyecto.color, this.nuevoProyecto.publico, 0, true, new Date()
    );
    this.proyectoSeleccionado = this.proyectos[this.proyectos.length - 1];
    this.mostrarModalProyecto = false;
    this.nuevoProyecto = { nombre: '', cliente: null, color: '#2196F3', publico: true };
  }
}