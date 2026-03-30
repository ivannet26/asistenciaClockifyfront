import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-menu-layout',
    templateUrl: './app-menu-layout.component.html'
})
export class AppMenuLayoutComponent implements OnInit {

    model: any[] = [];

    ngOnInit() {
    this.model = [
        {
            label: '',
            items: [
                { label: 'RASTRADOR', icon: 'pi pi-fw pi-clock', routerLink: ['/menu-layout/rastreador'] },
                { label: 'CALENDARIO', icon: 'pi pi-fw pi-calendar', routerLink: ['/menu-layout/calendario'] }
            ]
        },
        {
            label: 'ANALIZAR',
            items: [
                { label: 'PANEL', icon: 'pi pi-fw pi-th-large', routerLink: ['/menu-layout/panel'] },
                { 
                    label: 'INFORMES', 
                    icon: 'pi pi-fw pi-chart-bar',
                    items: [
                        { label: 'TIEMPO', separator: true }, // Encabezado pequeño en el submenú
                        { label: 'Resumido', icon: 'pi pi-fw pi-align-left', routerLink: ['/menu-layout/informes/resumido'] },
                        { label: 'Detallado', icon: 'pi pi-fw pi-list', routerLink: ['/menu-layout/informes/detallado'] },
                        { label: 'Semanal', icon: 'pi pi-fw pi-calendar-minus', routerLink: ['/menu-layout/informes/semanal'] },
                        { label: 'Compartido', icon: 'pi pi-fw pi-share-alt', routerLink: ['/menu-layout/informes/compartido'] },
                        { label: 'EQUIPO', separator: true },
                        { label: 'Asistencia', icon: 'pi pi-fw pi-users', routerLink: ['/menu-layout/informes/asistencia'] },
                        { label: 'Asignaciones', icon: 'pi pi-fw pi-user-plus', routerLink: ['/menu-layout/informes/asignaciones'] }
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