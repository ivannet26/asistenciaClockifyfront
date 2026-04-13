import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
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
  duracionInicio: string = '00:00';
  duracionFin: string = '00:00';

  ngOnInit() {
    this.cargarDesdeLocalStorage();
    this.generarHoras();
    this.refrescarTodo();
  }

  cargarDesdeLocalStorage() {
    const dataReg = localStorage.getItem('registros');
    if (dataReg) {
      this.registros = JSON.parse(dataReg).map((reg: any) => ({
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
      this.duracionInicio = this.formatearHora(registroExistente.inicio);
      this.duracionFin = this.formatearHora(registroExistente.fin);
    } else {
      this.registroActivo = null;
      const f = new Date(dia.completa);
      const [h, m] = hora.split(':').map(Number);
      f.setHours(h, m, 0);
      this.fechaSeleccionada = f;
      this.duracionInicio = hora;
      this.duracionFin = this.sumarMinutos(hora, 30);
      this.descripcionTarea = '';
      this.proyectoSeleccionado = null;
      this.etiquetasSeleccionadas = [];
    }
    this.mostrarModal = true;
  }

  guardarEntrada() {
    const registroActualizado = {
      ...this.registroActivo,
      descripcion: this.descripcionTarea,
      proyecto: this.proyectoSeleccionado,
      inicio: this.registroActivo ? this.registroActivo.inicio : this.combinarFechaHora(this.fechaSeleccionada, this.duracionInicio),
      fin: this.registroActivo ? this.registroActivo.fin : this.combinarFechaHora(this.fechaSeleccionada, this.duracionFin),
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
    if (!this.registroActivo) {
        // Si es nuevo, calculamos entre duracionInicio y duracionFin (default 30 min)
        return "00:30:00";
    }
    const diffMs = this.registroActivo.fin.getTime() - this.registroActivo.inicio.getTime();
    const totalSegundos = Math.floor(diffMs / 1000);
    const hrs = Math.floor(totalSegundos / 3600);
    const mins = Math.floor((totalSegundos % 3600) / 60);
    const secs = totalSegundos % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  formatearHora = (date: Date) => `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  
  combinarFechaHora(fecha: Date, horaStr: string): Date {
    const d = new Date(fecha);
    const [h, m] = horaStr.split(':').map(Number);
    d.setHours(h, m, 0);
    return d;
  }

  calcularDuracion(reg: any): string {
    const diffMs = reg.fin.getTime() - reg.inicio.getTime();
    const hrs = Math.floor(diffMs / 3600000);
    const mins = Math.floor((diffMs % 3600000) / 60000);
    const secs = Math.floor((diffMs % 60000) / 1000);
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}h`;
  }

  calcularEstiloEvento(reg: any) {
    const minutosInicio = reg.inicio.getMinutes();
    const duracionMinutos = (reg.fin.getTime() - reg.inicio.getTime()) / (1000 * 60);
    const nombreP = reg.proyecto?.nombre || reg.proyecto;
    const infoP = this.listaProyectos.find(p => p.nombre === nombreP);
    return {
      'position': 'absolute', 'top': `${minutosInicio}px`, 'height': `${duracionMinutos}px`,
      'background-color': infoP?.color || '#64748b', 'width': '100%', 'z-index': '10',
      'border-left': '4px solid rgba(0,0,0,0.2)', 'padding': '4px', 'color': 'white',
      'font-size': '0.70rem', 'border-radius': '4px', 'pointer-events': 'auto', 'cursor': 'pointer'
    };
  }

  generarHoras() {
    this.horas = [];
    let int = this.zoomNivel === 1 ? 30 : this.zoomNivel === 2 ? 15 : this.zoomNivel === 3 ? 5 : 60;
    for (let min = 60; min < 24 * 60; min += int) {
      const h = Math.floor(min / 60);
      const m = min % 60;
      this.horas.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
    }
  }

  refrescarTodo() { this.generarDias(); this.actualizarTextoFecha(); }

  generarDias() {
    this.diasSemana = [];
    const nombres = ['lun.', 'mar.', 'mié.', 'jue.', 'vie.', 'sáb.', 'dom.'];
    const base = new Date(this.fechaActual);
    const ds = base.getDay();
    const diff = base.getDate() - (ds === 0 ? 6 : ds - 1);
    const lunes = new Date(base.setDate(diff));
    for (let i = 0; i < 7; i++) {
      const d = new Date(lunes); d.setDate(lunes.getDate() + i);
      this.diasSemana.push({ nombre: nombres[i], fecha: d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }), completa: d });
    }
  }

  actualizarTextoFecha() {
    const act = new Date(this.fechaActual);
    this.textoFecha = act.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  irHoy() { this.fechaActual = new Date(); this.refrescarTodo(); }
  irSiguiente() { this.fechaActual.setDate(this.fechaActual.getDate() + 1); this.refrescarTodo(); }
  irAnterior() { this.fechaActual.setDate(this.fechaActual.getDate() - 1); this.refrescarTodo(); }
  cambiarFecha(fecha: Date) { this.fechaActual = new Date(fecha); this.refrescarTodo(); }
  sumarMinutos(h: string, m: number): string {
    const [h1, m1] = h.split(':').map(Number);
    const d = new Date(); d.setHours(h1, m1 + m);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  }

  esMismoDia = (f1: Date, f2: Date) => f1.toDateString() === f2.toDateString();
  esMismaHora = (f: Date, hStr: string) => f.getHours() === parseInt(hStr.split(':')[0]);
  esHoy = (f: Date) => f.toDateString() === new Date().toDateString();
  aumentarZoom() { if (this.zoomNivel < 3) { this.zoomNivel++; this.generarHoras(); } }
  disminuirZoom() { if (this.zoomNivel > 0) { this.zoomNivel--; this.generarHoras(); } }
}