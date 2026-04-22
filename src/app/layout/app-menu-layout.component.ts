import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { PermissionService } from '../demo/service/permission.service';

@Component({
    selector: 'app-menu-layout',
    templateUrl: './app-menu-layout.component.html'
})
export class AppMenuLayoutComponent implements OnInit {

    model: any[] = [];

    constructor(private router: Router, private permissionService: PermissionService,) { }

    ngOnInit() {
        const puedeVerAdmin = this.permissionService.canDoSync('soloAdminODueno');
        this.model = [
            {
                label: 'GESTIONAR TIEMPO',
                items: [
                    { label: 'RASTREADOR', icon: 'pi pi-fw pi-clock', routerLink: ['/menu-layout/rastreador'] },
                    { label: 'CALENDARIO', icon: 'pi pi-fw pi-calendar', routerLink: ['/menu-layout/calendario'] }
                ]
            },
            {
                label: 'ANALIZAR',
                items: [
                    { label: 'PANEL', icon: 'pi pi-fw pi-th-large', routerLink: ['/menu-layout/panel'] },
                    ...(puedeVerAdmin ? [{
                        label: 'PANEL DE ADMINISTRACIÓN',
                        icon: 'pi pi-fw pi-th-large',
                        routerLink: ['/menu-layout/cerrar-asistencia']
                    }] : []),
                    {
                        label: 'INFORMES',
                        icon: 'pi pi-fw pi-chart-bar',
                        routerLink: ['/menu-layout/informes'],
                        
                        items: [
                            {
                                label: 'TIEMPO',
                                items: [
                                    { label: 'Resumido', icon: 'pi pi-fw pi-align-left', routerLink: ['/menu-layout/informes'], queryParams: { tipo:'tiempo', tab: '0' } },
                                    { label: 'Detallado', icon: 'pi pi-fw pi-list', routerLink: ['/menu-layout/informes'], queryParams: { tipo:'tiempo' , tab: '1' } },
                                    { label: 'Semanal', icon: 'pi pi-fw pi-calendar-minus', routerLink: ['/menu-layout/informes'], queryParams: { tipo:'tiempo' , tab: '2' } },
                                    { label: 'Compartido', icon: 'pi pi-fw pi-share-alt', routerLink: ['/menu-layout/informes'], queryParams: { tipo:'tiempo' ,tab: '3' } }
                                ]
                            },
                            {
                                label: 'EQUIPO',
                                items: [
                                    { label: 'Asistencia', icon: 'pi pi-fw pi-users', routerLink: ['/menu-layout/informes'], queryParams: { tipo:'equipo' , tab: '0' } },
                                    { label: 'Asignaciones', icon: 'pi pi-fw pi-user-plus', routerLink: ['/menu-layout/informes'], queryParams: { tipo:'equipo' , tab: '1' } }
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                label: 'GESTIONAR',
                items: [
                    { label: 'PROYECTOS', icon: 'pi pi-fw pi-file-pdf', routerLink: ['/menu-layout/proyectos'] },
                    { label: 'EQUIPO', icon: 'pi pi-fw pi-users', routerLink: ['/menu-layout/equipo'] },
                    { label: 'CLIENTES', icon: 'pi pi-fw pi-user', routerLink: ['/menu-layout/clientes'] },
                    { label: 'ETIQUETAS', icon: 'pi pi-fw pi-tag', routerLink: ['/menu-layout/etiquetas'] }
                ]
            }
        ];
    }
}