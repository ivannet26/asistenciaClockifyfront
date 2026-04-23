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
    { label: 'Cliente',   value: 'cliente' },
    { label: 'Proyecto',  value: 'proyecto' },
    { label: 'Tarea',     value: 'tarea' }
  ];

  formatosHora = [
    { label: 'Completo (hh:mm:ss)', value: 'hh:mm:ss' },
    { label: 'Compacto (h:mm)',     value: 'hh:mm' }
  ];

  // Variables enlazadas al HTML
  favoritosActivo     = false;
  temporizadorForzado = false;
  formatoSeleccionado = 'hh:mm:ss';
  crearProyectos      = 'GERENTE';
  agruparPor1         = 'cliente';
  agruparPor2         = 'proyecto';
  agruparPor3         = 'tarea';

  constructor(private appAjustes: AppAjustes) {}

  ngOnInit(): void {
    // Leer config guardada (localStorage → assets/config.json)
    this.appAjustes.config$.subscribe(config => {
      this.favoritosActivo     = config.usuario.favoritesEnabled;
      this.formatoSeleccionado = config.usuario.durationFormat;
      this.agruparPor1         = config.usuario.grouping.primary;
      this.agruparPor2         = config.usuario.grouping.secondary;
      this.agruparPor3         = config.usuario.grouping.tertiary;
      this.crearProyectos      = config.espacioTrabajo.projectCreationPermission;
      this.temporizadorForzado = config.espacioTrabajo.forceTimer;
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
        primary:   this.agruparPor1 as any,
        secondary: this.agruparPor2 as any,
        tertiary:  this.agruparPor3 as any
      }
    });
  }

  onPermisosChange() {
    this.appAjustes.patchEspacioTrabajo({
      projectCreationPermission: this.crearProyectos as any
    });
  }

  onTemporizadorChange() {
    this.appAjustes.patchEspacioTrabajo({ forceTimer: this.temporizadorForzado });
  }
}