import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';

interface Proyecto {
  id?: number;
  nombre: string;
  cliente?: string | null;
  color: string;
  publico: boolean;
  plantilla?: 'none' | 'dev' | null;
}

interface Registro {
  descripcion: string;
  proyecto: Proyecto | null;
  inicio: Date;
  fin: Date;
  duracion: string;
  facturable: boolean;
}

@Component({
  selector: 'app-rastreador',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    ButtonModule,
    OverlayPanelModule,
    DialogModule,
    DropdownModule,
    CheckboxModule
  ],
  templateUrl: './rastreador.component.html',
  styleUrl: './rastreador.component.css'
})
export class RastreadorComponent implements OnInit {

  private STORAGE_PROYECTOS = 'proyectos';
  private STORAGE_REGISTROS = 'registros';
  tareaActual: string = '';
  tiempoTranscurrido: string = '00:00:00';
  esFacturable: boolean = false;
  busquedaProyecto: string = '';
  proyectos: Proyecto[] = [];
  proyectoSeleccionado: Proyecto | null = null;

  mostrarModalProyecto: boolean = false;

  nuevoProyecto: Proyecto = {
    nombre: '',
    cliente: null,
    color: '#5c6bc0',
    publico: true,
    plantilla: 'none'
  };

  clientes = [
    { nombre: 'Cliente A', code: 'A' },
    { nombre: 'Cliente B', code: 'B' }
  ];

  plantillas = [
    { nombre: 'Sin plantilla', code: 'none' },
    { nombre: 'Desarrollo Software', code: 'dev' }
  ];

  intervalo!: ReturnType<typeof setInterval>;
  corriendo: boolean = false;

  inicioTiempo!: Date;
  finTiempo!: Date;
  registros: Registro[] = [];
  modo: 'temporizador' | 'manual' | 'descanso' = 'temporizador';

  cambiarModo(nuevoModo: 'temporizador' | 'manual' | 'descanso') {
    this.modo = nuevoModo;
  }

  ngOnInit() {
    this.cargarProyectos();
    this.cargarRegistros();
  }

  cargarProyectos() {
    try {
      const data = JSON.parse(localStorage.getItem(this.STORAGE_PROYECTOS) || '[]');
      this.proyectos = Array.isArray(data) ? data : [];
    } catch {
      this.proyectos = [];
    }
  }

  guardarProyecto() {

    if (!this.nuevoProyecto.nombre?.trim()) {
      alert('El nombre del proyecto es obligatorio');
      return;
    }

    const proyectosExistentes: Proyecto[] = JSON.parse(
      localStorage.getItem(this.STORAGE_PROYECTOS) || '[]'
    );

    const nuevo: Proyecto = {
      ...this.nuevoProyecto,
      id: Date.now()
    };

    proyectosExistentes.push(nuevo);
    localStorage.setItem(this.STORAGE_PROYECTOS, JSON.stringify(proyectosExistentes));
    this.cargarProyectos();

    this.proyectoSeleccionado = nuevo;

    this.nuevoProyecto = {
      nombre: '',
      cliente: null,
      color: '#5c6bc0',
      publico: true,
      plantilla: 'none'
    };

    this.mostrarModalProyecto = false;
  }

  seleccionarProyecto(proyecto: Proyecto, panel: any) {
    this.proyectoSeleccionado = proyecto;
    panel.hide();
  }

  abrirModalNuevoProyecto() {
    this.mostrarModalProyecto = true;
  }

  cargarRegistros() {
    try {
      const data = JSON.parse(localStorage.getItem(this.STORAGE_REGISTROS) || '[]');

      this.registros = Array.isArray(data)
        ? data.map((r: any) => ({
            ...r,
            inicio: new Date(r.inicio),
            fin: new Date(r.fin)
          }))
        : [];
    } catch {
      this.registros = [];
    }
  }

  guardarRegistros() {
    localStorage.setItem(this.STORAGE_REGISTROS, JSON.stringify(this.registros));
  }

  toggleTimer() {

    if (!this.corriendo) {
      this.corriendo = true;
      this.inicioTiempo = new Date();

      this.intervalo = setInterval(() => {
        const ahora = new Date();
        const diff = ahora.getTime() - this.inicioTiempo.getTime();
        this.tiempoTranscurrido = this.formatearTiempo(diff);
      }, 1000);

    } else {
      this.corriendo = false;
      clearInterval(this.intervalo);

      this.finTiempo = new Date();

      const duracionMs = this.finTiempo.getTime() - this.inicioTiempo.getTime();

      const nuevoRegistro: Registro = {
        descripcion: this.tareaActual?.trim() || 'Sin descripción',
        proyecto: this.proyectoSeleccionado,
        inicio: this.inicioTiempo,
        fin: this.finTiempo,
        duracion: this.formatearTiempo(duracionMs),
        facturable: this.esFacturable
      };

      this.registros.unshift(nuevoRegistro);

      this.guardarRegistros();

      this.tiempoTranscurrido = '00:00:00';
      this.tareaActual = '';
      this.esFacturable = false;
    }
  }

  alternarFacturable() {
    this.esFacturable = !this.esFacturable;
  }

  formatearTiempo(ms: number): string {
    const totalSegundos = Math.floor(ms / 1000);
    const horas = Math.floor(totalSegundos / 3600);
    const minutos = Math.floor((totalSegundos % 3600) / 60);
    const segundos = totalSegundos % 60;

    return `${this.pad(horas)}:${this.pad(minutos)}:${this.pad(segundos)}`;
  }

  pad(num: number): string {
    return num < 10 ? '0' + num : num.toString();
  }

  formatearHora(fecha: Date): string {
    return fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  get totalHoy(): string {
    let total = 0;
    const hoy = new Date().toDateString();

    this.registros.forEach(r => {
      if (new Date(r.inicio).toDateString() === hoy) {
        total += new Date(r.fin).getTime() - new Date(r.inicio).getTime();
      }
    });

    if (this.corriendo && this.inicioTiempo?.toDateString() === hoy) {
      total += new Date().getTime() - this.inicioTiempo.getTime();
    }

    return this.formatearTiempo(total);
  }

  get totalSemana(): string {
    let total = 0;

    const hoy = new Date();
    const inicioSemana = new Date();
    inicioSemana.setDate(hoy.getDate() - hoy.getDay());

    this.registros.forEach(r => {
      const fecha = new Date(r.inicio);
      if (fecha >= inicioSemana) {
        total += new Date(r.fin).getTime() - fecha.getTime();
      }
    });

    if (this.corriendo && this.inicioTiempo >= inicioSemana) {
      total += new Date().getTime() - this.inicioTiempo.getTime();
    }

    return this.formatearTiempo(total);
  }

  onFocusDescripcion(r: Registro) {
    if (r.descripcion === 'Sin descripción') {
      r.descripcion = '';
    }
  }

  onBlurDescripcion(r: Registro) {
    if (!r.descripcion || !r.descripcion.trim()) {
      r.descripcion = 'Sin descripción';
    }
  }

}
