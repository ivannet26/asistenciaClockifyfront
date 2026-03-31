import { Component } from '@angular/core';
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
    DropdownModule
  ],
  templateUrl: './proyectos.component.html',
  styleUrl: './proyectos.component.css'
})
export class ProyectosComponent {
  // Controla la visibilidad del modal "Crear nuevo Proyecto"
  visible: boolean = false; 

  // Color seleccionado por defecto (Azul Clockify)
  selectedColor: string = '#03a9f4'; 

  // Paleta de colores para el selector (12 colores estilo Clockify)
  paletaColores: string[] = [
    '#ff4081', '#3f51b5', '#03a9f4', '#00bcd4', 
    '#009688', '#4caf50', '#8bc34a', '#cddc39', 
    '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'
  ];

  // Datos de ejemplo para la tabla
  proyectos = [
    { nombre: 'gm' }
  ];

  // Datos para los filtros de usuarios (opcional)
  usuarios = [
    { nombre: 'Alejandra', seleccionado: false }
  ];

  // Abre el modal
  showDialog() {
    this.visible = true;
  }

  // Cambia el color del proyecto y cierra el panel de colores
  selectColor(color: string, panel: any) {
    this.selectedColor = color;
    panel.hide(); 
  }
}