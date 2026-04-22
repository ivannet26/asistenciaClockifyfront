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
import { TooltipModule } from 'primeng/tooltip';

// Modelos y Servicios
import { Proyecto, PROYECTO_SIN_PROYECTO } from '../../model/Proyecto';
import { Registro } from '../../model/Registro';
import { ClientesService } from '../../service/clientes.service';
import { Clientes } from '../../model/Clientes';
import { ProyectosService } from '../../service/proyectos.service';
import { TimerService } from '../../service/timer.service';

@Component({
  selector: 'app-rastreador',
  standalone: true,
  imports: [
    CommonModule, FormsModule, InputTextModule, ButtonModule,
    OverlayPanelModule, DialogModule, DropdownModule, CheckboxModule, TooltipModule
  ],
  templateUrl: './rastreador.component.html',
  styleUrl: './rastreador.component.css'
})
export class RastreadorComponent implements OnInit, OnDestroy {

  private readonly STORAGE_REGISTROS = 'registros';
  private readonly STORAGE_ETIQUETAS = 'etiquetas';

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
    public timerService: TimerService 
  ) { }

  ngOnInit() {
    this.cargarProyectos();
    this.cargarRegistros();
    this.cargarClientes();
    this.cargarEtiquetas();
    this.agruparRegistros();

    // === LÓGICA DE CONTROL: CIERRE VS REFRESCO (Límite 5s) ===
    const timerGuardado = localStorage.getItem('timer_activo');
    if (timerGuardado) {
      const data = JSON.parse(timerGuardado);
      const ahora = new Date().getTime();
      const ultimaSenal = new Date(data.fin).getTime();

      // Cálculo de inactividad
      const segundosDeSilencio = (ahora - ultimaSenal) / 1000;

      if (segundosDeSilencio > 3) { 
        
        console.log("Sesión finalizada detectada. Guardando registro...");
        
        const session = JSON.parse(localStorage.getItem('userSession') || '{}');
        const inicio = new Date(data.inicio);
        const fin = new Date(data.fin); 
        const diffMs = fin.getTime() - inicio.getTime();

        const registroRecuperado: any = {
          descripcion: data.descripcion ,
          proyecto: data.proyecto,
          miembroId: session.userData?.id,
          miembroNombre: session.userData?.nombre,
          inicio: inicio,
          fin: fin,
          duracion: this.formatearTiempo(diffMs),
          facturable: data.facturable,
          etiquetas: data.etiquetas || []
        };

        this.guardarRegistro(registroRecuperado);
        this.timerService.stop(); // Detiene cronómetro y limpia storage
        this.cargarRegistros();
        this.agruparRegistros();
      } else {
        // SI PASARON MENOS DE 5 SEGUNDOS: Fue un F5, continuar cronómetro
        this.timerService.remanecer(data);
        this.tareaActual = this.timerService.tareaActual();
        this.proyectoSeleccionado = this.timerService.proyectoSeleccionado();
      }
    }
  }

  ngOnDestroy() {}

  toggleTimer() {
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
    // Evitar duplicados exactos
    const existe = data.find((r: any) => 
      new Date(r.inicio).getTime() === new Date(nuevo.inicio).getTime() && 
      r.descripcion === nuevo.descripcion
    );
    if (!existe) {
      data.unshift(nuevo);
      localStorage.setItem(this.STORAGE_REGISTROS, JSON.stringify(data));
    }
  }

  resetearFormulario() {
    this.tareaActual = '';
    this.proyectoSeleccionado = PROYECTO_SIN_PROYECTO;
    this.etiquetasSeleccionadas = [];
    this.esFacturable = false;
  }

  // --- Lógica de Carga y UI ---

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
        new Date(r.inicio).getTime() !== new Date(registro.inicio).getTime() || 
        r.descripcion !== registro.descripcion
    );
    localStorage.setItem(this.STORAGE_REGISTROS, JSON.stringify(filtrados));
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

  get etiquetasFiltradas() {
    const b = this.busquedaEtiqueta.toLowerCase();
    return b ? this.etiquetasDisponibles.filter(t => t.nombre.toLowerCase().includes(b)) : this.etiquetasDisponibles;
  }

  repetirTarea(r: any) {
    this.tareaActual = r.descripcion;
    this.proyectoSeleccionado = r.proyecto;
    this.etiquetasSeleccionadas = [...(r.etiquetas || [])];
    if (!this.timerService.corriendo()) this.toggleTimer();
  }

  toggleEtiqueta(nombre: string) {
    const i = this.etiquetasSeleccionadas.indexOf(nombre);
    if (i > -1) this.etiquetasSeleccionadas.splice(i, 1);
    else this.etiquetasSeleccionadas.push(nombre);
  }

  cargarProyectos() { this.proyectos = this.proyectosService.getProyectos(); }
  cargarClientes() { this.clientes = this.clientesService.getClientes(); }
  cargarEtiquetas() { this.etiquetasDisponibles = JSON.parse(localStorage.getItem(this.STORAGE_ETIQUETAS) || '[]'); }
  seleccionarProyecto(proyecto: Proyecto, panel: any) { this.proyectoSeleccionado = proyecto; panel.hide(); }
  abrirModalNuevoProyecto() { this.mostrarModalProyecto = true; }
  
  guardarProyecto() {
    if (!this.nuevoProyecto.nombre?.trim()) return;
    this.proyectos = this.proyectosService.agregarProyecto(
      this.nuevoProyecto.nombre, this.nuevoProyecto.cliente?.id ?? 0, 
      this.nuevoProyecto.color, this.nuevoProyecto.publico, 0, true, false, new Date()
    );
    this.proyectoSeleccionado = this.proyectos[this.proyectos.length - 1];
    this.mostrarModalProyecto = false;
    this.nuevoProyecto = { nombre: '', cliente: null, color: '#2196F3', publico: true };
  }
}