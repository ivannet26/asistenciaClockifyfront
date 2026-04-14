import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
/*import { LayoutService } from '../demo/components/service/app.layout.service';
import { PermisosxPerfil } from '../demo/model/permisosxperfil';
import { LoginService } from '../demo/service/login.service';
import { MenuxPerfil } from '../demo/model/MenuxPerfil';
import { GlobalService } from '../demo/service/global.service';
import { ConfigService } from '../demo/service/config.service';
*/
@Component({
    selector: 'app-menu',
    templateUrl: './app.menu.component.html',
})
export class AppMenuComponent implements OnInit {
    codigoPerfil: string = '';
    codigoModulo: string = '';
    selectedDate: Date = new Date();
    model: any[] = [];
    //permisos: MenuxPerfil;

    constructor(
        /* public permisosService: LoginService,
        layoutService: LayoutService,
        public gS: GlobalService,
        configService: ConfigService*/
    ) {
        this.selectedDate = new Date();
        /*this.codigoModulo = configService.getCodigoModulo();
        this.codigoPerfil = gS.getCodigoPerfil();*/
    }

    ngOnInit() {
        /*this.permisosService
            .TraerMenuxPerfil(this.codigoPerfil, this.codigoModulo)
            .subscribe({
                next: (data) => {
                    const datosMenu = data.data;
                    
                    this.loadMenu(datosMenu);
                },
                error: (error) => {
                    
                },
            });*/
    }

    onDateSelect(date: Date) {
        //this.gS.updateSelectedDate(date);
    }

    /*loadMenu(menuAsignados: PermisosxPerfil[]) {
        

        // Separar por niveles usando CodigoFormulario
        const superPadres = menuAsignados.filter(
            (el) => el.codigoFormulario.endsWith("0000") && el.codigoFormulario.length === 6
        );

        const nivel1 = menuAsignados.filter( 
            (el) =>
                el.codigoFormulario.endsWith("00") &&
                !el.codigoFormulario.endsWith("0000") &&
                el.codigoFormulario.length === 6
        );

        const nivel2 = menuAsignados.filter(
            (el) => !el.codigoFormulario.endsWith("00") && el.codigoFormulario.length === 6
        );

        

        // Construcción del menú dinámico
        this.model = superPadres.map((superPadre) => {
            const prefijoSuperPadre = superPadre.codigoFormulario.substring(0, 2);

            const itemsNivel1 = nivel1
                .filter((n1) => n1.codigoFormulario.startsWith(prefijoSuperPadre))
                .map((n1) => {
                    

                    const itemsNivel2 = nivel2
                        .filter((n2) => {
                            const prefijoNivel1 = n1.codigoFormulario.substring(0, 4);
                            return n2.codigoFormulario.startsWith(prefijoNivel1);
                        })
                        .map((n2) => {
                            
                            return {
                                label: n2.etiqueta,
                                icon: n2.nombreIcono || 'pi pi-fw pi-circle',
                                routerLink: n2.nombreFormulario ? [`/Home/${n2.nombreFormulario}`] : null,
                                _debug: {
                                    codigo: n2.codigoFormulario,
                                    formulario: n2.nombreFormulario
                                }
                            };
                        });

                    return {
                        label: n1.etiqueta,
                        icon: n1.nombreIcono || 'pi pi-fw pi-folder',
                        items: itemsNivel2
                    };
                });

            

            return {
                label: superPadre.etiqueta.toUpperCase(),
                icon: superPadre.nombreIcono || 'pi pi-fw pi-folder',
                items: itemsNivel1
            };
        });

        */
}

