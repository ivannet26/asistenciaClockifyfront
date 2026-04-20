import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG Modules
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TabViewModule } from 'primeng/tabview';
import { InputSwitchModule } from 'primeng/inputswitch';
import { DropdownModule } from 'primeng/dropdown';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-configuracion-espacios',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    TabViewModule,
    InputSwitchModule,
    DropdownModule,
    RadioButtonModule,
    TooltipModule
  ],
  templateUrl: './configuracion-espacios.component.html'
})
export class ConfiguracionEspaciosComponent implements OnInit {

  // Opciones para los Dropdowns de la pestaña "General"
  opcionesJerarquia: any[] = [
    { label: 'Cliente', value: 'cliente' },
    { label: 'Proyecto', value: 'proyecto' },
    { label: 'Tarea', value: 'tarea' }
  ];

  formatosHora: any[] = [
    { label: 'Completo (hh:mm:ss)', value: 'completo' },
    { label: 'Compacto (h:mm)', value: 'compacto' }
  ];

  // Datos del espacio de trabajo
  espacios: any[] = [
    { nombre: 'Ninguna', miembros: 1, tipo: 'Gratis' }
  ];

  // Variables de estado para los Switches
  planillaActiva: boolean = false;
  quioscoActivo: boolean = false;
  favoritosActivo: boolean = true;
  temporizadorForzado: boolean = false;

  // Variables para los Dropdowns
  formatoSeleccionado: string = 'completo';
  agruparPor1: string = 'cliente';
  agruparPor2: string = 'proyecto';
  agruparPor3: string = 'tarea';

  // Variables para la pestaña de "Permisos" (Radio Buttons)
  crearProyectos: string = 'admin';
  crearTareas: string = 'admin';
  crearEtiquetas: string = 'admin';

  constructor() { }

  ngOnInit(): void {
    // Aquí podrías inicializar datos desde un servicio si fuera necesario
  }

  guardarCambios() {
    console.log('Configuración actualizada:', {
      nombre: this.espacios[0].nombre,
      permisosProyectos: this.crearProyectos,
      formatoHora: this.formatoSeleccionado
    });
  }
}