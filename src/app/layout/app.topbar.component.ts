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
import { TimerService } from '../demo/service/timer.service';

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
    correo: string = '';

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
        private permissionService: PermissionService,
        private timerService: TimerService
    ) {
        this.canVerConfig$ = this.permissionService.canDo('soloAdminODueno');
        this.primeng.setTranslation(calendario_traduccion());
    }

    ngOnInit(): void {
        this.nombre = this.gS.getNombreUsuario() ?? '';
        this.correo = JSON.parse(localStorage.getItem('userSession') || '{}')?.userData?.correo ?? '';

        this.proyectos = [
            { label: 'Proyecto 1', icon: 'pi pi-fw pi-file', command: () => this.link.navigate(['/menu-layout']) },
            { label: 'Proyecto 2', icon: 'pi pi-fw pi-file', command: () => this.link.navigate(['/Home']) }
        ];

        this.opcionesTuerca = [
            {
                label: 'Configurar espacios de trabajo',
                icon: 'pi pi-briefcase',
                command: () => this.abrirConfiguracionEspacios()
            }
        ];
    }

    getIniciales(): string {
        const nombre = this.gS.getNombreUsuario() ??
            JSON.parse(localStorage.getItem('userSession') || '{}')?.userData?.nombre ?? '';
        return nombre
            .split(' ')
            .map((n: string) => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
    }
    abrirConfiguracionEspacios() {
        this.link.navigate(['/menu-layout/configuracion-espacios']);
    }

    cerrarSesion() {
        const timerActivo = localStorage.getItem('timer_activo');
        const sessionStr = localStorage.getItem('userSession');

        if (timerActivo && sessionStr) {
            const data = JSON.parse(timerActivo);
            const session = JSON.parse(sessionStr);

            const inicio = new Date(data.inicio);
            const fin = new Date();
            const diffMs = fin.getTime() - inicio.getTime();

            const nuevoRegistro: any = {
                descripcion: data.descripcion || 'Sin descripción',
                proyecto: data.proyecto,
                miembroId: session.userData?.id,
                miembroNombre: session.userData?.nombre,
                inicio: inicio,
                fin: fin,
                duracion: this.formatearDuracion(diffMs),
                facturable: data.facturable || false,
                etiquetas: data.etiquetas || []
            };

            const historial = JSON.parse(localStorage.getItem('registros') || '[]');
            const existe = historial.find((r: any) => new Date(r.inicio).getTime() === inicio.getTime());

            if (!existe) {
                historial.unshift(nuevoRegistro);
                localStorage.setItem('registros', JSON.stringify(historial));
            }
        }

        this.timerService.forceStop();
        localStorage.removeItem('timer_activo');
        this.aS.logout();
        this.gS.clearSession();
        this.link.navigate(['/Inicio_Sesion']);
    }

    private formatearDuracion(ms: number): string {
        const totalS = Math.floor(ms / 1000);
        const h = Math.floor(totalS / 3600).toString().padStart(2, '0');
        const m = Math.floor((totalS % 3600) / 60).toString().padStart(2, '0');
        const s = (totalS % 60).toString().padStart(2, '0');
        return `${h}:${m}:${s}`;
    }

    espaciostrabajo() {
        this.link.navigate(['/espaciotrabajo']);
    }

    micuenta() {
        this.link.navigate(['/menu-layout/micuenta']);
    }
}
