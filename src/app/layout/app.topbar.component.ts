import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MenuItem, PrimeNGConfig } from 'primeng/api';
import { LayoutService } from "../demo/components/service/app.layout.service";
import { Router } from '@angular/router';
import { GlobalService } from '../demo/service/global.service';
import { LoginService } from '../demo/service/login.service';
import { calendario_traduccion } from 'src/app/shared/Calendarios';
import { SplitButtonModule} from 'primeng/splitbutton';
import { OverlayPanelModule } from 'primeng/overlaypanel';


@Component({
    standalone: true,
    imports: [SplitButtonModule,OverlayPanelModule],
    selector: 'app-topbar',
    templateUrl: './app.topbar.component.html',
})

export class AppTopBarComponent implements OnInit {

    proyectos!: MenuItem[];

    @ViewChild('menubutton') menuButton!: ElementRef;

    @ViewChild('topbarmenubutton') topbarMenuButton!: ElementRef;

    @ViewChild('topbarmenu') menu!: ElementRef;

    constructor(public layoutService: LayoutService,private link:Router,private gS:GlobalService,private aS:LoginService,private primeng: PrimeNGConfig) {
        this.primeng.setTranslation(calendario_traduccion());
    }

    ngOnInit(): void {
        this.nombre = this.gS.getNombreUsuario() ?? '';
        this.proyectos = [
            { label: 'Proyecto 1', icon: 'pi pi-fw pi-file', command: () => this.link.navigate(['/menu-layout']) },
            { label: 'Proyecto 2', icon: 'pi pi-fw pi-file', command: () => this.link.navigate(['/Home']) }
        ];
    }

    nombre:string=this.gS.getNombreUsuario();

    cerrarSesion(){
        this.aS.logout();
        this.gS.clearSession();
        this.link.navigate(['/Inicio_Sesion']);
    }

    espaciostrabajo(){
        this.link.navigate(['/espaciotrabajo']);
    }


}
