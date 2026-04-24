import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppAjustes } from '../../../demo/service/appajustes.service';
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

  opcionesJerarquia = [
    { label: 'Cliente', value: 'cliente' },
    { label: 'Proyecto', value: 'proyecto' },
    { label: 'Tarea', value: 'tarea' }
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
  crearTareas = 'all'; // Variable añadida para el control de tareas
  agruparPor1 = 'cliente';
  agruparPor2 = 'proyecto';
  agruparPor3 = 'tarea';

  constructor(private appAjustes: AppAjustes) { }

  ngOnInit(): void {
    // 1. Sincronización inicial con LocalStorage para el estado del switch
    const savedForce = localStorage.getItem('force_timer');
    if (savedForce !== null) {
      this.temporizadorForzado = JSON.parse(savedForce);
    }

    // 2. Leer config guardada del servicio
    this.appAjustes.config$.subscribe(config => {
      this.favoritosActivo = config.usuario.favoritesEnabled;
      this.formatoSeleccionado = config.usuario.durationFormat;
      this.agruparPor1 = config.usuario.grouping.primary;
      this.agruparPor2 = config.usuario.grouping.secondary;
      this.agruparPor3 = config.usuario.grouping.tertiary;
      this.crearProyectos = config.espacioTrabajo.projectCreationPermission;
      this.crearEtiquetas = config.espacioTrabajo.etiquetaCreationPermission;
      
      // Solo actualizamos si el servicio trae un valor nuevo
      if (config.espacioTrabajo.forceTimer !== undefined) {
        this.temporizadorForzado = config.espacioTrabajo.forceTimer;
      }
    });
  }

  onFavoritosChange() {
    this.appAjustes.patchUsuario({ favoritesEnabled: this.favoritosActivo });
  }

  cambiarFormatoHora(event: any) {
    this.appAjustes.patchUsuario({ durationFormat: event.value });
  }

  onAgruparChange() {
    this.appAjustes.patchUsuario({
      grouping: {
        primary: this.agruparPor1 as any,
        secondary: this.agruparPor2 as any,
        tertiary: this.agruparPor3 as any
      }
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

  // FUNCIÓN CORREGIDA PARA HACER FUNCIONAR EL BLOQUEO
  onTemporizadorChange() {
    // Notificamos al servicio
    this.appAjustes.patchEspacioTrabajo({ forceTimer: this.temporizadorForzado });

    // PERSISTENCIA CLAVE: Guardamos en LocalStorage para que el Calendario lo detecte
    localStorage.setItem('force_timer', JSON.stringify(this.temporizadorForzado));
    
    console.log('Estado de Temporizador Forzado guardado:', this.temporizadorForzado);
  }
}