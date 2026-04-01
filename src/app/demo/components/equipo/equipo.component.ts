import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { TabMenuModule } from 'primeng/tabmenu';


@Component({
  selector: 'app-equipo',
  standalone: true,
  imports: [CardModule,
    CommonModule,
    ButtonModule,
    TableModule,
    DropdownModule,
    CheckboxModule,
    TabMenuModule,
    InputTextModule,
    FormsModule],
  templateUrl: './equipo.component.html',
  styleUrl: './equipo.component.css'
})
export class EquipoComponent {
  mostrarLista = true;
  tabs = [
    { label: 'Miembros', id: 0 },
    { label: 'Grupos', id: 1 },
    { label: 'Recordatorios', id: 2 }
  ];

  tabactivo = this.tabs[0];  
  
  CambioTab(event: any) {
    this.tabactivo = event;
  }

  equipos = [
    { nombre: 'miembro equipo', 
      correo: 'miembro@equipo.com', 
      tarifa: '$50/hora', 
      tarifa_coste: '$30/hora', 
      rol: 'propietario', 
      grupo:'Grupo 1' }
  ];

  grupos = [
    { nombre: 'Grupo 1', acceso: 'miembro equipo' },
  ]

  opcionesFiltro = [
    { label: 'Mostrar activo', value: 'activo' },
    { label: 'Mostrar inactivos', value: 'inactivo' }
  ];

  filtroSeleccionado = 'activo';

    mostrarTabla() {
    this.mostrarLista = true;
  }

}



