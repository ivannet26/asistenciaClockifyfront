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
  selector: 'app-clientes',
  standalone: true,
  imports: [CardModule,
    CommonModule,
    ButtonModule,
    TableModule,
    DropdownModule,
    CheckboxModule,
    InputTextModule,
    FormsModule],
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.css']
})
export class ClientesComponent {
    //SOLO ESTA PARA PRUEBAS SOLAMENTE, NO HAY LÓGICA DE NEGOCIO REAL,
    //  SOLO PARA RENDERIZAR LA TABLA Y LOS FILTROS
    
    // Control visual
  mostrarLista = false;

  // Datos mock (solo para que la tabla renderice)
  clientes = [
    { nombre: 'Cliente Demo', direccion: 'Lima', moneda: 'USD' }
  ];

  opcionesFiltro = [
    { label: 'Mostrar activo', value: 'activo' },
    { label: 'Mostrar inactivos', value: 'inactivo' }
  ];

  filtroSeleccionado = 'activo';

  // Acción visual
  mostrarTabla() {
    this.mostrarLista = true;
  }
}
