import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MenuItem, PrimeNGConfig } from 'primeng/api';
import { LayoutService } from "../demo/components/service/app.layout.service";
import { Router } from '@angular/router';
import { GlobalService } from '../demo/service/global.service';
import { LoginService } from '../demo/service/login.service';
import { calendario_traduccion } from 'src/app/shared/Calendarios';
import { SplitButtonModule } from 'primeng/splitbutton';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { PermissionService } from '../demo/service/permission.service';

@Component({
    standalone: true,
    imports: [
        SplitButtonModule,
        OverlayPanelModule,
        TieredMenuModule,
        CommonModule
    ],
    selector: 'app-topbar',
    templateUrl: './app.topbar.component.html',
})
export class AppTopBarComponent implements OnInit {

    proyectos!: MenuItem[];
    opcionesTuerca!: MenuItem[];
    nombre: string = '';

    @ViewChild('menubutton') menuButton!: ElementRef;
    @ViewChild('topbarmenubutton') topbarMenuButton!: ElementRef;
    @ViewChild('topbarmenu') menu!: ElementRef;

    canVerConfig$: Observable<boolean>;

    constructor(
        public layoutService: LayoutService,
        private link: Router,
        private gS: GlobalService,
        private aS: LoginService,
        private primeng: PrimeNGConfig,
        private permissionService: PermissionService
    ) {
        this.canVerConfig$ = this.permissionService.canDo('soloAdminODueno');
        this.primeng.setTranslation(calendario_traduccion());
    }

    ngOnInit(): void {
        this.nombre = this.gS.getNombreUsuario() ?? '';

        // Configuración de proyectos (SplitButton)
        this.proyectos = [
            { label: 'Proyecto 1', icon: 'pi pi-fw pi-file', command: () => this.link.navigate(['/menu-layout']) },
            { label: 'Proyecto 2', icon: 'pi pi-fw pi-file', command: () => this.link.navigate(['/Home']) }
        ];

        // CONFIGURACIÓN DE LA TUERCA 

        this.opcionesTuerca = [
            {
                label: 'Configurar espacios de trabajo',
                icon: 'pi pi-briefcase',
                command: () => this.abrirConfiguracionEspacios()
            }
        ];
    }

    // Función CORREGIDA: Navega en la MISMA pestaña
    abrirConfiguracionEspacios() {

        this.link.navigate(['/menu-layout/configuracion-espacios']);
    }

    cerrarSesion() {
        this.aS.logout();
        this.gS.clearSession();
        this.link.navigate(['/Inicio_Sesion']);
    }

    espaciostrabajo() {
        this.link.navigate(['/espaciotrabajo']);
    }

    micuenta() {
        this.link.navigate(['/menu-layout/micuenta']);
    }


}
