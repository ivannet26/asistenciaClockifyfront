import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Imports de PrimeNG
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { CheckboxModule } from 'primeng/checkbox';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';

interface Proyecto {
  id?: number;
  nombre: string;
  cliente: string | null;
  color: string;
  publico: boolean;
  plantilla: string;
}

@Component({
  selector: 'app-proyectos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    DialogModule,
    CheckboxModule,
    OverlayPanelModule,
    TableModule,
    InputTextModule,
    DropdownModule,

  ],
  templateUrl: './proyectos.component.html',
  styleUrl: './proyectos.component.css'
})

export class ProyectosComponent implements OnInit {

  // Controla la visibilidad del modal "Crear nuevo Proyecto"
  mostrarModalProyecto: boolean = false;
  // Color seleccionado por defecto (Azul Clockify)
  //selectedColor: string = '#03a9f4';

  /* Paleta de colores para el selector (12 colores estilo Clockify)
  paletaColores: string[] = [
    '#ff4081', '#3f51b5', '#03a9f4', '#00bcd4',
    '#009688', '#4caf50', '#8bc34a', '#cddc39',
    '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'
  ];*/
  clientes: any[] = [];
  proyectos: Proyecto[] = [];
  proyectoSeleccionado: Proyecto | null = null;
  private STORAGE_PROYECTOS = 'proyectos';

  // Datos para los filtros de usuarios (opcional)
  usuarios = [
    { nombre: 'Alejandra', seleccionado: false }
  ];

  nuevoProyecto: Proyecto = {
    nombre: '',
    cliente: null,
    color: '#5c6bc0',
    publico: true,
    plantilla: 'none'
  };

  plantillas = [
    { nombre: 'Sin plantilla', code: 'none' },
    { nombre: 'Desarrollo Software', code: 'dev' }
  ];

  /* Abre el modal
  showDialog() {
    this.visible = true;
  }

  // Cambia el color del proyecto y cierra el panel de colores
  selectColor(color: string, panel: any) {
    this.selectedColor = color;
    panel.hide();
  }*/

  ngOnInit() {
    try {
      const data = localStorage.getItem('proyectos');
      this.proyectos = data ? JSON.parse(data) as Proyecto[] : [];
    } catch (error) {
      console.error('Error al leer localStorage', error);
      this.proyectos = [];
    }
  }

  abrirModalNuevoProyecto() {
    this.mostrarModalProyecto = true;
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

}