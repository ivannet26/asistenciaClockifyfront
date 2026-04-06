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
@Component({
  selector: 'app-calendario',
  standalone: true,
  imports: [CommonModule,
    TableModule,
    ButtonModule,
    FormsModule,
    CalendarModule,
    OverlayPanelModule,
    InputTextModule,
    DialogModule,
    DropdownModule,
    MultiSelectModule,
    InputSwitchModule,
    InputTextareaModule ],
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
  ngOnInit() {
    this.generarHoras();
    this.refrescarTodo();
  }

generarHoras() {
  this.horas = [];

  let intervalo = 60;
  let inicio = 60;

   if (this.zoomNivel === 1) {
    intervalo = 30;
    inicio = 30;
  }

  if (this.zoomNivel === 2) {
    intervalo = 15;
    inicio = 15;
  }

    if (this.zoomNivel === 3) {
    intervalo = 5;
    inicio = 5;
  }


  for (let minutos = inicio; minutos < 23 * 60; minutos += intervalo) {
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;

    const horaStr = `${horas.toString().padStart(2, '0')}:${mins
      .toString()
      .padStart(2, '0')}`;

    this.horas.push(horaStr);
  }
}

aumentarZoom() {
  if (this.zoomNivel < 3) {
    this.zoomNivel++;
    this.generarHoras();
  }
}

disminuirZoom() {
  if (this.zoomNivel > 0) {
    this.zoomNivel--;
    this.generarHoras();
  }
}

  generarDias() {
    this.diasSemana = [];

    const nombres = ['lun.', 'mar.', 'mié.', 'jue.', 'vie.', 'sáb.', 'dom.'];
    const base = new Date(this.fechaActual);

    const primerDiaSemana =
      base.getDate() - (base.getDay() === 0 ? 6 : base.getDay() - 1);

    for (let i = 0; i < 7; i++) {
      const fecha = new Date(base);
      fecha.setDate(primerDiaSemana + i);

      this.diasSemana.push({
        nombre: nombres[i],
        fecha: fecha.toLocaleDateString('es-ES', {
          day: '2-digit',
          month: 'short'
        }),
        completa: fecha
      });
    }
  }

  refrescarTodo() {
    this.generarDias();
    this.actualizarTextoFecha();
  }

  actualizarTextoFecha() {
    const hoy = new Date();
    const actual = new Date(this.fechaActual);

    const diff = Math.floor(
      (actual.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diff === 0) {
      this.textoFecha = 'Hoy';
    } else if (diff === -1) {
      this.textoFecha = 'Ayer';
    } else if (diff === 1) {
      this.textoFecha = 'Mañana';
    } else {
      this.textoFecha = actual.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    }
  }

  irSiguiente() {
    this.fechaActual = new Date(this.fechaActual);
    this.fechaActual.setDate(this.fechaActual.getDate() + 1);
    this.refrescarTodo();
  }

  irAnterior() {
    this.fechaActual = new Date(this.fechaActual);
    this.fechaActual.setDate(this.fechaActual.getDate() - 1);
    this.refrescarTodo();
  }

  irHoy() {
    this.fechaActual = new Date();
    this.refrescarTodo();
  }

  cambiarFecha(fecha: Date) {
    this.fechaActual = new Date(fecha);
    this.refrescarTodo();
  }

  esHoy(fecha: Date): boolean {
    return (
      fecha.getDate() === this.fechaActual.getDate() &&
      fecha.getMonth() === this.fechaActual.getMonth() &&
      fecha.getFullYear() === this.fechaActual.getFullYear()
    );
  }

  esVisible(dia: any): boolean {
    if (this.vista === 'semana') return true;
    return this.esHoy(dia.completa);
  }

  mostrarModal: boolean = false;

fechaSeleccionada: Date = new Date();
horaSeleccionada: string = '00:00:00';
duracionInicio: string = '00:00';
duracionFin: string = '00:30';

onSlotClick(dia: any, hora: string) {
  const [h, m] = hora.split(':').map(Number);

  const fecha = new Date(dia.completa);
  fecha.setHours(h);
  fecha.setMinutes(m);
  fecha.setSeconds(0);

  this.fechaSeleccionada = fecha;
  this.horaSeleccionada = `${hora}:00`;

  this.duracionInicio = hora;
  this.duracionFin = this.sumarMinutos(hora, this.getIntervaloActual());;

  this.mostrarModal = true;
}
sumarMinutos(hora: string, minutosExtra: number): string {
  const [h, m] = hora.split(':').map(Number);

  const fecha = new Date();
  fecha.setHours(h);
  fecha.setMinutes(m + minutosExtra);

  return `${fecha.getHours().toString().padStart(2, '0')}:${fecha
    .getMinutes()
    .toString()
    .padStart(2, '0')}`;
}

facturable: boolean = false;
getIntervaloActual(): number {
  if (this.zoomNivel === 0) return 60;
  if (this.zoomNivel === 1) return 30;
  if (this.zoomNivel === 2) return 15;
  if (this.zoomNivel === 3) return 5;
  return 30;
}

}
