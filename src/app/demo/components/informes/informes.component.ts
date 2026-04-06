import { Component } from '@angular/core';
import { TabMenuModule } from "primeng/tabmenu";
import { DropdownModule } from "primeng/dropdown";
import { CalendarModule } from "primeng/calendar";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-informes',
  standalone: true,
  imports: [TabMenuModule, DropdownModule, CalendarModule, TableModule,FormsModule,CommonModule],
  templateUrl: './informes.component.html',
  styleUrl: './informes.component.css'
})
export class InformesComponent {
  selectedDate: Date = new Date();
  onDateSelect($event: any) {
    throw new Error('Method not implemented.');
  }
  tabs = [
    { label: 'Resumido', id: 0 },
    { label: 'Detallado', id: 1 },
    { label: 'Semanal', id: 2 },
    { label: 'Compartido', id: 3 }
  ];

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

  tabactivo = this.tabs[0];

  CambioTab(event: any) {
    this.tabactivo = event;
  }

}
