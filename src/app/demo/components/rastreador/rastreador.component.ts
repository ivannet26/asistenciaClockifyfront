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
  private STORAGE_CLIENTES = 'clientes';
  private STORAGE_ETIQUETAS = 'etiquetas';
  private STORAGE_TIMER_ACTIVO = 'timer_activo';

  tareaActual: string = '';
  tiempoTranscurrido: string = '00:00:00';
  esFacturable: boolean = false;
  busquedaProyecto: string = '';
  proyectos: Proyecto[] = [];
  sinProyecto: Proyecto
  proyectoSeleccionado: Proyecto | null = PROYECTO_SIN_PROYECTO;
  mostrarModalProyecto: boolean = false;
  clientes: Clientes[] = [];
  etiquetasDisponibles: any[] = [];
  etiquetasSeleccionadas: string[] = [];
  busquedaEtiqueta: string = '';

  intervalo: any = null;
  corriendo: boolean = false;
  inicioTiempo!: Date;
  registros: Registro[] = [];

  //  NUEVO: agrupados
  registrosAgrupados: any[] = [];

  nuevoProyecto: {
    nombre: string;
    cliente: Clientes | null;
    color: string;
    publico: boolean;
  } = {
      nombre: '',
      cliente: null,
      color: '#2196F3',
      publico: true
    };

  constructor(private proyectosService: ProyectosService, private clientesService: ClientesService) { }

  ngOnInit() {
    this.cargarProyectos();
    this.cargarRegistros();
    this.cargarClientes();
    this.cargarEtiquetas();
    this.verificarTimerPersistente();
    this.agruparRegistros();
  }


  ngOnDestroy() {
    if (this.intervalo) clearInterval(this.intervalo);
  }

  // =========================
  //  AGRUPACIÓN OPTIMIZADA
  // =========================
  cargarProyectos(): void {
    this.proyectos = this.proyectosService.getProyectos();
  }

  guardarProyecto(): void {
    if (!this.nuevoProyecto.nombre?.trim()) return;

    const clienteId = this.nuevoProyecto.cliente?.id ?? 0;

    this.proyectos = this.proyectosService.agregarProyecto(
      this.nuevoProyecto.nombre,
      clienteId,
      this.nuevoProyecto.color,
      this.nuevoProyecto.publico,
      0,
      true,
      new Date(),
    );

    this.proyectoSeleccionado = this.proyectos[this.proyectos.length - 1];
    this.mostrarModalProyecto = false;
    this.nuevoProyecto = { nombre: '', cliente: null, color: '#2196F3', publico: true };
  }

  abrirModalNuevoProyecto() {
    this.cargarClientes();
    this.mostrarModalProyecto = true;
  }

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

      if (this.esMismaFecha(fecha, hoy)) {
        clave = 'hoy'; label = 'Hoy';
      } else if (this.esMismaFecha(fecha, ayer)) {
        clave = 'ayer'; label = 'Ayer';
      } else {
        clave = fecha.toDateString();
        label = fecha.toLocaleDateString('es-PE', {
          weekday: 'short', day: 'numeric', month: 'short'
        });
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

  esMismaFecha(f1: Date, f2: Date): boolean {
    return f1.getFullYear() === f2.getFullYear() &&
      f1.getMonth() === f2.getMonth() &&
      f1.getDate() === f2.getDate();
  }

  cargarEtiquetas() {
    this.etiquetasDisponibles = JSON.parse(localStorage.getItem(this.STORAGE_ETIQUETAS) || '[]');
  }

  toggleEtiqueta(etiquetaNombre: string) {
    const index = this.etiquetasSeleccionadas.indexOf(etiquetaNombre);
    if (index > -1) this.etiquetasSeleccionadas.splice(index, 1);
    else this.etiquetasSeleccionadas.push(etiquetaNombre);
  }

  get etiquetasFiltradas(): any[] {
    const busqueda = this.busquedaEtiqueta.toLowerCase().trim();
    if (!busqueda) return this.etiquetasDisponibles;
    return this.etiquetasDisponibles.filter((tag: any) =>
      tag.nombre.toLowerCase().includes(busqueda)
    );
  }

  verificarTimerPersistente() {
    const guardado = localStorage.getItem(this.STORAGE_TIMER_ACTIVO);
    if (guardado) {
      const data = JSON.parse(guardado);
      this.corriendo = true;
      this.inicioTiempo = new Date(data.inicio);
      this.tareaActual = data.descripcion;
      this.proyectoSeleccionado = data.proyecto;
      this.esFacturable = data.facturable;
      this.etiquetasSeleccionadas = data.etiquetas || [];
      this.iniciarIntervalo();
    }
  }

  actualizarReloj() {
    if (!this.inicioTiempo) return;
    const diffMs = new Date().getTime() - this.inicioTiempo.getTime();
    this.tiempoTranscurrido = this.formatearTiempo(diffMs);
  }

  iniciarIntervalo() {
    if (this.intervalo) clearInterval(this.intervalo);
    this.actualizarReloj();
    this.intervalo = setInterval(() => this.actualizarReloj(), 500);
  }

  toggleTimer() {
    if (!this.corriendo) {
      this.corriendo = true;
      this.inicioTiempo = new Date();

      localStorage.setItem(this.STORAGE_TIMER_ACTIVO, JSON.stringify({
        inicio: this.inicioTiempo,
        descripcion: this.tareaActual,
        proyecto: this.proyectoSeleccionado,
        facturable: this.esFacturable,
        etiquetas: this.etiquetasSeleccionadas
      }));

      this.iniciarIntervalo();
    } else {
      this.corriendo = false;
      if (this.intervalo) { clearInterval(this.intervalo); this.intervalo = null; }

      const finTiempo = new Date();
      const diffMs = finTiempo.getTime() - this.inicioTiempo.getTime();
      const session = JSON.parse(localStorage.getItem('userSession') || '{}');
      const nuevoRegistro: Registro = {
        descripcion: this.tareaActual?.trim() || 'Sin descripción',
        proyecto: this.proyectoSeleccionado,
        miembroId: session.userData?.id,
        miembroNombre: session.userData?.nombre,
        inicio: this.inicioTiempo,
        fin: finTiempo,
        duracion: this.formatearTiempo(diffMs),
        facturable: this.esFacturable,
        etiquetas: [...this.etiquetasSeleccionadas]
      };

      this.guardarRegistro(nuevoRegistro);
      this.cargarRegistros(); // vuelve a traer solo los del usuario
      this.agruparRegistros();
      localStorage.removeItem(this.STORAGE_TIMER_ACTIVO);

      this.tiempoTranscurrido = '00:00:00';
      this.tareaActual = '';
      this.proyectoSeleccionado = null;
      this.etiquetasSeleccionadas = [];
    }
  }

  // =========================
  // STORAGE
  // =========================

  cargarClientes(): void {
    this.clientes = this.clientesService.getClientes();
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
/*
  actualizarRegistrosStorage() {
    localStorage.setItem(this.STORAGE_REGISTROS, JSON.stringify(this.registros));
  }
*/

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

  seleccionarProyecto(proyecto: Proyecto, panel: any) {
    this.proyectoSeleccionado = proyecto;
    panel.hide();
  }

  alternarFacturable() {
    this.esFacturable = !this.esFacturable;
  }

  repetirTarea(r: any) {
    this.tareaActual = r.descripcion;
    this.proyectoSeleccionado = r.proyecto;
    this.etiquetasSeleccionadas = [...(r.etiquetas || [])];
    if (!this.corriendo) this.toggleTimer();
  }

  get totalHoy(): string {
    const hoy = new Date().toDateString();
    const msTotal = this.registros
      .filter(r => new Date(r.inicio).toDateString() === hoy)
      .reduce((acc, r) => acc + (new Date(r.fin).getTime() - new Date(r.inicio).getTime()), 0);
    return this.formatearTiempo(msTotal);
  }

  eliminarRegistro(registro: Registro) {
    
    this.registros = this.registros.filter(r => r !== registro);

    
    // Obtener todos los registros del localstorage
    const todosLosRegistros = JSON.parse(localStorage.getItem(this.STORAGE_REGISTROS) || '[]');
    
    
    
    const dataActualizada = todosLosRegistros.filter((r: any) => {
        return new Date(r.inicio).getTime() !== new Date(registro.inicio).getTime() || 
               r.descripcion !== registro.descripcion;
    });

    localStorage.setItem(this.STORAGE_REGISTROS, JSON.stringify(dataActualizada));

    // 3. Volver a agrupar para que la vista se actualice
    this.agruparRegistros();
  }
}