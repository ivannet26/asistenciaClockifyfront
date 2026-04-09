import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';

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
export class RastreadorComponent implements OnInit {

  private STORAGE_PROYECTOS = 'proyectos';
  private STORAGE_REGISTROS = 'registros';
  private STORAGE_CLIENTES = 'clientes';

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

  // Esta lista se llenará con los datos del Storage
  clientes: any[] = [];

  plantillas = [
    { nombre: 'Sin plantilla', code: 'none' },
    { nombre: 'Desarrollo Software', code: 'dev' }
  ];

  intervalo!: any;
  corriendo: boolean = false;
  inicioTiempo!: Date;
  finTiempo!: Date;
  registros: Registro[] = [];
  modo: 'temporizador' | 'manual' | 'descanso' = 'temporizador';

  ngOnInit() {
    this.cargarProyectos();
    this.cargarRegistros();
    this.cargarClientes();
  }

  cargarClientes() {
    const data = JSON.parse(localStorage.getItem(this.STORAGE_CLIENTES) || '[]');
    // Mapeamos para mantener la compatibilidad con tu dropdown
    this.clientes = data.map((c: any) => ({
      nombre: c.nombre,
      code: c.nombre
    }));
  }

  cargarProyectos() {
    const data = JSON.parse(localStorage.getItem(this.STORAGE_PROYECTOS) || '[]');
    this.proyectos = data;
  }

  guardarProyecto() {
    if (!this.nuevoProyecto.nombre?.trim()) return;

    const nuevo: Proyecto = {
      ...this.nuevoProyecto,
      id: Date.now()
    };

    this.proyectos.push(nuevo);
    localStorage.setItem(this.STORAGE_PROYECTOS, JSON.stringify(this.proyectos));
    
    this.proyectoSeleccionado = nuevo;
    this.mostrarModalProyecto = false;
    this.nuevoProyecto = { nombre: '', cliente: null, color: '#5c6bc0', publico: true, plantilla: 'none' };
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
      const diffMs = this.finTiempo.getTime() - this.inicioTiempo.getTime();

      const nuevoRegistro: Registro = {
        descripcion: this.tareaActual?.trim() || 'Sin descripción',
        proyecto: this.proyectoSeleccionado,
        inicio: this.inicioTiempo,
        fin: this.finTiempo,
        duracion: this.formatearTiempo(diffMs),
        facturable: this.esFacturable
      };

      this.registros.unshift(nuevoRegistro);
      localStorage.setItem(this.STORAGE_REGISTROS, JSON.stringify(this.registros));

      this.tiempoTranscurrido = '00:00:00';
      this.tareaActual = '';
      this.proyectoSeleccionado = null;
    }
  }

  abrirModalNuevoProyecto() {
    this.cargarClientes(); // Actualizar antes de abrir
    this.mostrarModalProyecto = true;
  }

  seleccionarProyecto(proyecto: Proyecto, panel: any) {
    this.proyectoSeleccionado = proyecto;
    panel.hide();
  }

  formatearTiempo(ms: number): string {
    const totalS = Math.floor(ms / 1000);
    const h = Math.floor(totalS / 3600).toString().padStart(2, '0');
    const m = Math.floor((totalS % 3600) / 60).toString().padStart(2, '0');
    const s = (totalS % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  }

  cargarRegistros() {
    const data = JSON.parse(localStorage.getItem(this.STORAGE_REGISTROS) || '[]');
    this.registros = data.map((r: any) => ({
      ...r,
      inicio: new Date(r.inicio),
      fin: new Date(r.fin)
    }));
  }

  formatearHora(fecha: Date): string {
    return fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  alternarFacturable() { this.esFacturable = !this.esFacturable; }

  get totalHoy(): string {
    const hoy = new Date().toDateString();
    const ms = this.registros
      .filter(r => r.inicio.toDateString() === hoy)
      .reduce((acc, r) => acc + (r.fin.getTime() - r.inicio.getTime()), 0);
    return this.formatearTiempo(ms);
  }
}