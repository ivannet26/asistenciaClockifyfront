import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-calendario',
  standalone: true,
  imports: [
    CommonModule, TableModule, ButtonModule, FormsModule, CalendarModule,
    OverlayPanelModule, InputTextModule, DialogModule, DropdownModule,
    MultiSelectModule, InputSwitchModule, InputTextareaModule, TooltipModule
  ],
  templateUrl: './calendario.component.html',
  styleUrl: './calendario.component.css'
})
export class CalendarioComponent implements OnInit {
  diasSemana: any[] = [];
  horas: string[] = [];
  vista: 'semana' | 'dia' = 'semana';
  fechaActual: Date = new Date();
  textoFecha: string = '';
  zoomNivel: number = 0;

  registros: any[] = [];
  listaProyectos: any[] = [];
  listaEtiquetas: any[] = [];

  mostrarModal: boolean = false;
  registroActivo: any = null;
  descripcionTarea: string = '';
  proyectoSeleccionado: any = null;
  etiquetasSeleccionadas: any[] = [];
  fechaSeleccionada: Date = new Date();
  duracionInicio: string = '00:00:00';
  duracionFin: string = '00:00:00';

  constructor(private router: Router) { }

  ngOnInit() {
    this.cargarDesdeLocalStorage();
    this.generarHoras();
    this.refrescarTodo();
  }

  esEdicionBloqueada(): boolean {
    return JSON.parse(localStorage.getItem('force_timer') || 'false');
  }

  irAlRastreador() {
    this.router.navigate(['/menu-layout/rastreador']);
  }

  cargarDesdeLocalStorage() {
    const session = JSON.parse(localStorage.getItem('userSession') || '{}');
    const miembroId = session.userData?.id;

    const dataReg = localStorage.getItem('registros');
    if (dataReg) {
      this.registros = JSON.parse(dataReg)
        .filter((r: any) => r.miembroId === miembroId)
        .map((reg: any) => ({
          ...reg,
          inicio: new Date(reg.inicio),
          fin: new Date(reg.fin)
        }));
    }

    const dataProy = localStorage.getItem('proyectos');
    if (dataProy) this.listaProyectos = JSON.parse(dataProy);

    const dataEtq = localStorage.getItem('etiquetas');
    if (dataEtq) this.listaEtiquetas = JSON.parse(dataEtq);
  }

  onSlotClick(dia: any, hora: string, registroExistente?: any) {
    if (registroExistente) {
      this.registroActivo = registroExistente;
      this.descripcionTarea = registroExistente.descripcion;
      const nombreP = registroExistente.proyecto?.nombre || registroExistente.proyecto;
      this.proyectoSeleccionado = this.listaProyectos.find(p => p.nombre === nombreP);
      this.etiquetasSeleccionadas = registroExistente.etiquetas || [];
      this.fechaSeleccionada = new Date(registroExistente.inicio);
      this.duracionInicio = this.formatearHoraConSegundos(registroExistente.inicio);
      this.duracionFin = this.formatearHoraConSegundos(registroExistente.fin);
    } else {
      if (this.esEdicionBloqueada()) return;

      this.registroActivo = null;
      const f = new Date(dia.completa);
      const [h, m] = hora.split(':').map(Number);
      f.setHours(h, m, 0, 0);
      this.fechaSeleccionada = f;
      this.duracionInicio = `${hora}:00`;
      this.duracionFin = this.sumarMinutos(hora, 30) + ":00";
      this.descripcionTarea = '';
      this.proyectoSeleccionado = null;
      this.etiquetasSeleccionadas = [];
    }
    this.mostrarModal = true;
  }

  guardarEntrada() {
    const session = JSON.parse(localStorage.getItem('userSession') || '{}');
    const nuevaFechaInicio = this.combinarFechaHora(this.fechaSeleccionada, this.duracionInicio);
    const nuevaFechaFin = this.combinarFechaHora(this.fechaSeleccionada, this.duracionFin);

    if (nuevaFechaFin <= nuevaFechaInicio) {
      alert("La hora de fin debe ser mayor a la de inicio");
      return;
    }

    const registroActualizado = {
      ...this.registroActivo,
      descripcion: this.descripcionTarea,
      proyecto: this.proyectoSeleccionado,
      miembroId: session.userData?.id,
      miembroNombre: session.userData?.nombre,
      inicio: nuevaFechaInicio,
      fin: nuevaFechaFin,
      duracion: this.formatearDuracionParaStorage(nuevaFechaFin.getTime() - nuevaFechaInicio.getTime()),
      etiquetas: this.etiquetasSeleccionadas
    };

    if (this.registroActivo) {
      const index = this.registros.findIndex(r => r === this.registroActivo);
      if (index !== -1) this.registros[index] = registroActualizado;
    } else {
      this.registros.push(registroActualizado);
    }

    localStorage.setItem('registros', JSON.stringify(this.registros));
    this.mostrarModal = false;
    this.refrescarTodo();
  }

  getDuracionTotalModal(): string {
    try {
      const inicio = this.combinarFechaHora(this.fechaSeleccionada, this.duracionInicio);
      const fin = this.combinarFechaHora(this.fechaSeleccionada, this.duracionFin);
      const diffMs = fin.getTime() - inicio.getTime();
      return diffMs >= 0 ? this.formatearDuracionParaStorage(diffMs) : "00:00:00";
    } catch {
      return "00:00:00";
    }
  }

  private formatearDuracionParaStorage(ms: number): string {
    const totalS = Math.floor(ms / 1000);
    const h = Math.floor(totalS / 3600).toString().padStart(2, '0');
    const m = Math.floor((totalS % 3600) / 60).toString().padStart(2, '0');
    const s = (totalS % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  }

  formatearHoraConSegundos(date: Date): string {
    const h = date.getHours().toString().padStart(2, '0');
    const m = date.getMinutes().toString().padStart(2, '0');
    const s = date.getSeconds().toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  }

  formatearHora = (date: Date) => `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;

  combinarFechaHora(fecha: Date, horaStr: string): Date {
    const d = new Date(fecha);
    const partes = horaStr.split(':').map(Number);
    const h = partes[0] || 0;
    const m = partes[1] || 0;
    const s = partes[2] || 0;
    d.setHours(h, m, s, 0);
    return d;
  }

  calcularDuracion(reg: any): string {
    const diffMs = reg.fin.getTime() - reg.inicio.getTime();
    return this.formatearDuracionParaStorage(diffMs);
  }

  calcularEstiloEvento(reg: any) {
    const intervalo = this.zoomNivel === 1 ? 30 : this.zoomNivel === 2 ? 15 : this.zoomNivel === 3 ? 5 : 60;
    const minutosInicio = reg.inicio.getMinutes() % intervalo; 
    const duracionMinutos = (reg.fin.getTime() - reg.inicio.getTime()) / (1000 * 60);
    const alturaMinima = Math.max(duracionMinutos, 25);

    const nombreP = reg.proyecto?.nombre || reg.proyecto;
    const infoP = this.listaProyectos.find(p => p.nombre === nombreP);
    return {
      'position': 'absolute',
      'top': `${minutosInicio}px`,
      'height': `${alturaMinima}px`,
      'background-color': infoP?.color || '#64748b',
      'width': '100%', 'z-index': '10',
      'border-left': '4px solid rgba(0,0,0,0.2)',
      'padding': '4px', 'color': 'white',
      'font-size': '0.70rem', 'border-radius': '4px',
      'pointer-events': 'auto', 'cursor': 'pointer',
      'overflow': 'hidden'
    };
  }

  generarHoras() {
    this.horas = [];
    let int = this.zoomNivel === 1 ? 30 : this.zoomNivel === 2 ? 15 : this.zoomNivel === 3 ? 5 : 60;
    for (let min = 0; min < 24 * 60; min += int) {
      const h = Math.floor(min / 60);
      const m = min % 60;
      this.horas.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
    }
  }

  refrescarTodo() { this.generarDias(); this.actualizarTextoFecha(); }

  generarDias() {
    const nuevosDias = [];
    const nombres = ['lun.', 'mar.', 'mié.', 'jue.', 'vie.', 'sáb.', 'dom.'];
    const base = new Date(this.fechaActual);
    const diaSemana = base.getDay();
    const diff = base.getDate() - (diaSemana === 0 ? 6 : diaSemana - 1);
    const lunes = new Date(base.setDate(diff));
    lunes.setHours(0, 0, 0, 0);

    for (let i = 0; i < 7; i++) {
      const d = new Date(lunes);
      d.setDate(lunes.getDate() + i);
      nuevosDias.push({
        nombre: nombres[i],
        fecha: d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
        completa: d
      });
    }
    this.diasSemana = nuevosDias;
  }

  actualizarTextoFecha() {
    const act = new Date(this.fechaActual);
    this.textoFecha = act.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  irSiguiente() {
    const nuevaFecha = new Date(this.fechaActual);
    nuevaFecha.setDate(nuevaFecha.getDate() + (this.vista === 'semana' ? 7 : 1));
    this.fechaActual = nuevaFecha;
    this.refrescarTodo();
  }

  irAnterior() {
    const nuevaFecha = new Date(this.fechaActual);
    nuevaFecha.setDate(nuevaFecha.getDate() - (this.vista === 'semana' ? 7 : 1));
    this.fechaActual = nuevaFecha;
    this.refrescarTodo();
  }

  cambiarFecha(fecha: Date) { this.fechaActual = new Date(fecha); this.refrescarTodo(); }
  
  sumarMinutos(h: string, m: number): string {
    const [h1, m1] = h.split(':').map(Number);
    const d = new Date(); d.setHours(h1, m1 + m);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  }

  esMismoDia = (f1: Date, f2: Date) => f1.toDateString() === f2.toDateString();
  
  esMismaHora(fechaRegistro: Date, horaCelda: string): boolean {
    const [hCelda, mCelda] = horaCelda.split(':').map(Number);
    const minutosRegistro = fechaRegistro.getHours() * 60 + fechaRegistro.getMinutes();
    const minutosCelda = hCelda * 60 + mCelda;
    const intervalo = this.zoomNivel === 1 ? 30 : this.zoomNivel === 2 ? 15 : this.zoomNivel === 3 ? 5 : 60;
    return minutosRegistro >= minutosCelda && minutosRegistro < (minutosCelda + intervalo);
  }

  esHoy = (f: Date) => f.toDateString() === new Date().toDateString();
  aumentarZoom() { if (this.zoomNivel < 3) { this.zoomNivel++; this.generarHoras(); } }
  disminuirZoom() { if (this.zoomNivel > 0) { this.zoomNivel--; this.generarHoras(); } }
}