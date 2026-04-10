import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';

// Modelos
import { Proyecto } from '../../model/Proyecto';
import { Registro } from '../../model/Registro';

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

  // Claves de LocalStorage
  private STORAGE_PROYECTOS = 'proyectos';
  private STORAGE_REGISTROS = 'registros';
  private STORAGE_CLIENTES = 'clientes';
  private STORAGE_ETIQUETAS = 'etiquetas'; // Clave para etiquetas
  private STORAGE_TIMER_ACTIVO = 'timer_activo';

  // UI y Estado
  tareaActual: string = '';
  tiempoTranscurrido: string = '00:00:00';
  esFacturable: boolean = false;
  busquedaProyecto: string = '';
  proyectos: Proyecto[] = [];
  proyectoSeleccionado: Proyecto | null = null;
  mostrarModalProyecto: boolean = false;

  // --- NUEVO ESTADO ETIQUETAS ---
  etiquetasDisponibles: any[] = [];
  etiquetasSeleccionadas: string[] = [];
  busquedaEtiqueta: string = '';

  // Lógica de Tiempo
  intervalo: any = null;
  corriendo: boolean = false;
  inicioTiempo!: Date;
  registros: Registro[] = [];

  // Datos para Nuevo Proyecto
  nuevoProyecto: Proyecto = {
    nombre: '',
    cliente: null,
    color: '#2196F3',
    publico: true,
    plantilla: 'none'
  };

  clientes: any[] = [];
  plantillas = [
    { nombre: 'Sin plantilla', code: 'none' },
    { nombre: 'Desarrollo Software', code: 'dev' }
  ];

  constructor() {}

  ngOnInit() {
    this.cargarProyectos();
    this.cargarRegistros();
    this.cargarClientes();
    this.cargarEtiquetas(); // Cargar etiquetas al iniciar
    this.verificarTimerPersistente();
  }

  ngOnDestroy() {
    if (this.intervalo) {
      clearInterval(this.intervalo);
    }
  }

  // =============================================
  // LÓGICA DE ETIQUETAS
  // =============================================

  cargarEtiquetas() {
  // Obtenemos los datos. Si vienen de tu otra pantalla, serán objetos.
  const data = JSON.parse(localStorage.getItem(this.STORAGE_ETIQUETAS) || '[]');
  this.etiquetasDisponibles = data; // Ahora esto es un array de objetos [{nombre: 'Ale'}, ...]
}

toggleEtiqueta(etiquetaNombre: string) {
  const index = this.etiquetasSeleccionadas.indexOf(etiquetaNombre);
  if (index > -1) {
    this.etiquetasSeleccionadas.splice(index, 1);
  } else {
    this.etiquetasSeleccionadas.push(etiquetaNombre);
  }
  
}
get etiquetasFiltradas(): any[] {
  const busqueda = this.busquedaEtiqueta.toLowerCase().trim();
  if (!busqueda) {
    return this.etiquetasDisponibles;
  }
  // Añadimos (tag: any) para que no reclame por la propiedad .nombre
  return this.etiquetasDisponibles.filter((tag: any) => 
    tag.nombre.toLowerCase().includes(busqueda)
  );
}


  // =============================================
  // LÓGICA DEL CONTADOR (TIMER)
  // =============================================

  verificarTimerPersistente() {
    const guardado = localStorage.getItem(this.STORAGE_TIMER_ACTIVO);
    if (guardado) {
      const data = JSON.parse(guardado);
      this.corriendo = true;
      this.inicioTiempo = new Date(data.inicio);
      this.tareaActual = data.descripcion;
      this.proyectoSeleccionado = data.proyecto;
      this.esFacturable = data.facturable;
      this.etiquetasSeleccionadas = data.etiquetas || []; // Recuperar etiquetas

      this.iniciarIntervalo();
    }
  }

  actualizarReloj() {
    if (!this.inicioTiempo) return;
    const ahora = new Date().getTime();
    const inicio = this.inicioTiempo.getTime();
    const diffMs = ahora - inicio;
    this.tiempoTranscurrido = this.formatearTiempo(diffMs);
  }

  iniciarIntervalo() {
    if (this.intervalo) clearInterval(this.intervalo);
    this.actualizarReloj(); 
    this.intervalo = setInterval(() => {
      this.actualizarReloj();
    }, 500);
  }

  toggleTimer() {
    if (!this.corriendo) {
      // --- INICIAR ---
      this.corriendo = true;
      this.inicioTiempo = new Date();

      localStorage.setItem(this.STORAGE_TIMER_ACTIVO, JSON.stringify({
        inicio: this.inicioTiempo,
        descripcion: this.tareaActual,
        proyecto: this.proyectoSeleccionado,
        facturable: this.esFacturable,
        etiquetas: this.etiquetasSeleccionadas // Guardar etiquetas activas
      }));

      this.iniciarIntervalo();
    } else {
      // --- DETENER ---
      this.corriendo = false;
      if (this.intervalo) {
        clearInterval(this.intervalo);
        this.intervalo = null;
      }
      
      const finTiempo = new Date();
      const diffMs = finTiempo.getTime() - this.inicioTiempo.getTime();

      const nuevoRegistro: Registro = {
        descripcion: this.tareaActual?.trim() || 'Sin descripción',
        proyecto: this.proyectoSeleccionado,
        inicio: this.inicioTiempo,
        fin: finTiempo,
        duracion: this.formatearTiempo(diffMs),
        facturable: this.esFacturable,
        etiquetas: [...this.etiquetasSeleccionadas] // Guardar copia de etiquetas en el historial
      };

      this.registros.unshift(nuevoRegistro);
      this.actualizarRegistrosStorage();
      
      localStorage.removeItem(this.STORAGE_TIMER_ACTIVO);

      // Reset Interfaz
      this.tiempoTranscurrido = '00:00:00';
      this.tareaActual = '';
      this.proyectoSeleccionado = null;
      this.etiquetasSeleccionadas = []; // Limpiar selección
    }
  }

  // =============================================
  // GESTIÓN DE DATOS (STORAGE)
  // =============================================

  cargarClientes() {
    const data = JSON.parse(localStorage.getItem(this.STORAGE_CLIENTES) || '[]');
    this.clientes = data.map((c: any) => ({ nombre: c.nombre, code: c.nombre }));
  }

  cargarProyectos() {
    const data = JSON.parse(localStorage.getItem(this.STORAGE_PROYECTOS) || '[]');
    this.proyectos = data;
  }

  cargarRegistros() {
    const data = JSON.parse(localStorage.getItem(this.STORAGE_REGISTROS) || '[]');
    this.registros = data.map((r: any) => ({
      ...r,
      inicio: new Date(r.inicio),
      fin: new Date(r.fin),
      etiquetas: r.etiquetas || [] // Asegurar que existan las etiquetas
    }));
  }

  actualizarRegistrosStorage() {
    localStorage.setItem(this.STORAGE_REGISTROS, JSON.stringify(this.registros));
  }

  guardarProyecto() {
    if (!this.nuevoProyecto.nombre?.trim()) return;
    const nuevo: Proyecto = { ...this.nuevoProyecto, id: Date.now() };
    this.proyectos.push(nuevo);
    localStorage.setItem(this.STORAGE_PROYECTOS, JSON.stringify(this.proyectos));
    this.proyectoSeleccionado = nuevo;
    this.mostrarModalProyecto = false;
    this.nuevoProyecto = { nombre: '', cliente: null, color: '#2196F3', publico: true, plantilla: 'none' };
  }

  // =============================================
  // UTILIDADES Y UI
  // =============================================

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

  abrirModalNuevoProyecto() {
    this.cargarClientes();
    this.mostrarModalProyecto = true;
  }

  alternarFacturable() { 
    this.esFacturable = !this.esFacturable; 
  }

  repetirTarea(r: any) {
    this.tareaActual = r.descripcion;
    this.proyectoSeleccionado = r.proyecto;
    this.etiquetasSeleccionadas = [...(r.etiquetas || [])]; // Copiar etiquetas al repetir
    if (!this.corriendo) this.toggleTimer();
  }

  get totalHoy(): string {
    const hoy = new Date().toDateString();
    const msTotal = this.registros
      .filter(r => new Date(r.inicio).toDateString() === hoy)
      .reduce((acc, r) => {
        const dFin = new Date(r.fin).getTime();
        const dIni = new Date(r.inicio).getTime();
        return acc + (dFin - dIni);
      }, 0);
    return this.formatearTiempo(msTotal);
  }
}