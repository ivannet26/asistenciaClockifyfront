import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppAjustes } from '../../../demo/service/appajustes.service';
import { ConfigService } from '../../../demo/service/config.service'; // Inyectamos tu nuevo servicio
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
    CommonModule, FormsModule, ButtonModule, InputTextModule,
    TabViewModule, InputSwitchModule, DropdownModule, RadioButtonModule, TooltipModule
  ],
  templateUrl: './configuracion-espacios.component.html'
})
export class ConfiguracionEspaciosComponent implements OnInit {

  opcionesJerarquia1 = [
    { label: 'Cliente', value: 'cliente' },
    { label: 'Departamento', value: 'departamento' },
    { label: 'Categoria', value: 'categoria' }
  ];
  opcionesJerarquia2 = [
    { label: 'Proyecto', value: 'proyecto' },
    { label: 'Ubicación', value: 'ubicacion' },
    { label: 'Trabajo', value: 'trabajo' }
  ];
  opcionesJerarquia3 = [
    { label: 'Tarea', value: 'tarea' },
    { label: 'Actividad', value: 'actividad' },
    { label: 'Área de trabajo', value: 'areadetrabajo' }
  ];

  formatosHora = [
    { label: 'Completo (hh:mm:ss)', value: 'hh:mm:ss' },
    { label: 'Compacto (h:mm)', value: 'hh:mm' }
  ];

  // Variables enlazadas al HTML
  favoritosActivo = false;
  temporizadorForzado = false;
  formatoSeleccionado = 'hh:mm:ss';
  crearProyectos = 'GERENTE';
  crearEtiquetas = 'ADMINISTRADOR';
  crearTareas = 'all';
  agruparPor1 = 'cliente';
  agruparPor2 = 'proyecto';
  agruparPor3 = 'tarea';

  constructor(
    private appAjustes: AppAjustes,
    public configService: ConfigService // Inyección del servicio para el Pipe y Signals
  ) { }

  ngOnInit(): void {
    const savedForce = localStorage.getItem('force_timer');
    if (savedForce !== null) {
      this.temporizadorForzado = JSON.parse(savedForce);
    }

    this.appAjustes.config$.subscribe(config => {
      this.favoritosActivo = config.usuario.favoritesEnabled;
      this.formatoSeleccionado = config.usuario.durationFormat;
      this.agruparPor1 = config.usuario.grouping.primary;
      this.agruparPor2 = config.usuario.grouping.secondary;
      this.agruparPor3 = config.usuario.grouping.tertiary;
      this.crearProyectos = config.espacioTrabajo.projectCreationPermission;
      this.crearEtiquetas = config.espacioTrabajo.etiquetaCreationPermission;

      if (config.espacioTrabajo.forceTimer !== undefined) {
        this.temporizadorForzado = config.espacioTrabajo.forceTimer;
      }

      // Sincronización inicial del Pipe con el formato cargado
      if (this.formatoSeleccionado) {
        const currentFormat = this.formatosHora.find(f => f.value === this.formatoSeleccionado);
        this.configService.updateDurationFormat(currentFormat ? currentFormat.label : 'hh:mm:ss');
      }

      // Sincronización inicial de la jerarquía
      if (config.espacioTrabajo.jerarquia2Nombre) {
        this.configService.updateJerarquia2Nombre(config.espacioTrabajo.jerarquia2Nombre);
      }
    });
  }

  onFavoritosChange() {
    this.appAjustes.patchUsuario({ favoritesEnabled: this.favoritosActivo });
  }

  cambiarFormatoHora(event: any) {
    // 1. Lógica original de AppAjustes
    this.appAjustes.patchUsuario({ durationFormat: event.value });

    // 2. Notificar al ConfigService para que el Pipe reaccione en tiempo real
    const formato = this.formatosHora.find(h => h.value === event.value);
    if (formato) {
      this.configService.updateDurationFormat(formato.label);
    }
  }

  onAgruparChange() {
    // Obtener el label del valor seleccionado
    const label1 = this.opcionesJerarquia1.find(o => o.value === this.agruparPor1)?.label ?? this.agruparPor1;
    const label2 = this.opcionesJerarquia2.find(o => o.value === this.agruparPor2)?.label ?? this.agruparPor2;
    const label3 = this.opcionesJerarquia3.find(o => o.value === this.agruparPor3)?.label ?? this.agruparPor3;

    this.configService.updateJerarquia2Nombre(label2);

    this.appAjustes.patchUsuario({
      grouping: {
        primary: this.agruparPor1 as any,
        secondary: this.agruparPor2 as any,
        tertiary: this.agruparPor3 as any
      }
    });
    this.appAjustes.patchEspacioTrabajo({
      jerarquia1Nombre: label1,
      jerarquia2Nombre: label2,
      jerarquia3Nombre: label3
    });
  }

  onPermisosChangeP() {
    this.appAjustes.patchEspacioTrabajo({
      projectCreationPermission: this.crearProyectos as any
    });
  }

  onPermisosChangeE() {
    this.appAjustes.patchEspacioTrabajo({
      etiquetaCreationPermission: this.crearEtiquetas as any
    });
  }

  onPermisosChangeT() {
    // Lógica para el cambio de permisos de tareas
    console.log('Permisos de tareas cambiados a:', this.crearTareas);
  }

  onTemporizadorChange() {
    // Notificamos al servicio
    this.appAjustes.patchEspacioTrabajo({ forceTimer: this.temporizadorForzado });

    // PERSISTENCIA CLAVE: Guardamos en LocalStorage para que el Calendario lo detecte
    localStorage.setItem('force_timer', JSON.stringify(this.temporizadorForzado));

    console.log('Estado de Temporizador Forzado guardado:', this.temporizadorForzado);
  }
}