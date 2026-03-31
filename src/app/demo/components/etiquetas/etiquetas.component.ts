import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-etiquetas',
  standalone: true,
  imports: [CardModule,
    CommonModule,
    ButtonModule,
    TableModule,
    DropdownModule,
    CheckboxModule,
    InputTextModule,
    FormsModule],
  templateUrl: './etiquetas.component.html',
  styleUrl: './etiquetas.component.css'
})
export class EtiquetasComponent {
    //SOLO ESTA PARA PRUEBAS SOLAMENTE, NO HAY LÓGICA DE NEGOCIO REAL,
    //  SOLO PARA RENDERIZAR LA TABLA Y LOS FILTROS

    // Control visual
 mostrarLista = false;

  // Datos mock
  etiquetas = [
    { nombre: 'Etiqueta Demo' }
  ];

  opcionesFiltro = [
    { label: 'Mostrar activo', value: 'activo' },
    { label: 'Mostrar inactivos', value: 'inactivo' }
  ];

  filtroSeleccionado = 'activo';

  mostrarTabla() {
    this.mostrarLista = true;
  }

}
