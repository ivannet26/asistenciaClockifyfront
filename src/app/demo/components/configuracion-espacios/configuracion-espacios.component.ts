import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Importación del servicio
import { ConfigService } from '../../../demo/service/config.service';
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
    { label: 'Completo (hh:mm:ss)', value: 'Completo (hh:mm:ss)' },
    { label: 'Compacto (h:mm)', value: 'Compacto (h:mm)' }
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
  formatoSeleccionado: string = 'Completo (hh:mm:ss)';
  agruparPor1: string = 'cliente';
  agruparPor2: string = 'proyecto';
  agruparPor3: string = 'tarea';

  // Variables para la pestaña de "Permisos" (Radio Buttons)
  crearProyectos: string = 'admin';
  crearTareas: string = 'admin';
  crearEtiquetas: string = 'admin';

  constructor(private configService: ConfigService) { }

  ngOnInit(): void {
    // Sincronizar el dropdown con el estado actual del servicio al cargar
    const actual = this.configService.durationFormat();
    this.formatoSeleccionado = actual === 'full' ? 'Completo (hh:mm:ss)' : 'Compacto (h:mm)';
  }

  // Método para actualizar el formato en el servicio global
  cambiarFormatoHora(event: any) {
    this.configService.updateDurationFormat(event.value);
    console.log('Formato global actualizado a:', this.configService.durationFormat());
  }

  guardarCambios() {
    console.log('Configuración actualizada:', {
      nombre: this.espacios[0].nombre,
      permisosProyectos: this.crearProyectos,
      formatoHora: this.formatoSeleccionado
    });
  }
}