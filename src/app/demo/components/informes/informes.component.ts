import { Component, OnInit } from '@angular/core';
import { TabMenuModule } from "primeng/tabmenu";
import { DropdownModule } from "primeng/dropdown";
import { CalendarModule } from "primeng/calendar";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CheckboxModule } from 'primeng/checkbox';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { CardModule } from "primeng/card";
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-informes',
  standalone: true,
  imports: [
    TabMenuModule,
    DropdownModule,
    CalendarModule,
    TableModule,
    FormsModule,
    CommonModule,
    CheckboxModule,
    ButtonModule,
    OverlayPanelModule, 
    CardModule
  ],
  templateUrl: './informes.component.html',
  styleUrl: './informes.component.css'
})
export class InformesComponent implements OnInit {
  selectedDate: Date = new Date();
  tipoInformeSeleccionado: string = '1';

  // IDs como strings para evitar errores de desaparición
  tabs = [
    { label: 'Resumido', id: '0' },
    { label: 'Detallado', id: '1' },
    { label: 'Semanal', id: '2' },
    { label: 'Compartido', id: '3' }
  ];

  equipos = [
    { 
      nombre: 'miembro equipo', 
      correo: 'miembro@equipo.com', 
      tarifa: '$50/hora', 
      tarifa_coste: '$30/hora', 
      rol: 'propietario', 
      grupo: 'Grupo 1' 
    }
  ];

  grupos = [
    { nombre: 'Grupo 1', acceso: 'miembro equipo' },
  ];

  opcionesInformes = [
    { label: 'INFORME DE TIEMPO', value: '1' },
    { label: 'INFORME DE EQUIPO', value: '2' },
    { label: 'INFORME DE GASTOS', value: '3' }
  ];

  tabactivo: any = this.tabs[0];

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    // Escuchamos el parámetro 'tab' de la URL enviado por el menú lateral
    this.route.queryParams.subscribe(params => {
      const tabId = params['tab'];
      if (tabId !== undefined) {
        const encontrado = this.tabs.find(t => t.id === tabId.toString());
        if (encontrado) {
          this.tabactivo = encontrado;
          this.sincronizarDropdown(tabId.toString());
        }
      } else {
        this.tabactivo = this.tabs[0];
      }
    });
  }

  CambioTab(event: any) {
    this.tabactivo = event;
    this.sincronizarDropdown(event.id);
  }

  sincronizarDropdown(id: string) {
    if (id === '0' || id === '1' || id === '2') {
      this.tipoInformeSeleccionado = '1';
    }
  }

  onDateSelect($event: any) {
    console.log($event);
  }
}