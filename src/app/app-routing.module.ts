import { RouterModule } from '@angular/router';
import { Component, NgModule } from '@angular/core';
import { NotfoundComponent } from './demo/components/notfound/notfound.component';
import { AppLayoutComponent } from "./layout/app.layout.component";
import { LoginCComponent } from './demo/components/login-c/login-c.component';
import { RastreadorComponent } from './demo/components/rastreador/rastreador.component';
import { ClientesComponent } from './demo/components/clientes/clientes.component';
import { EtiquetasComponent } from './demo/components/etiquetas/etiquetas.component';
import { ProyectosComponent } from './demo/components/proyectos/proyectos.component';
import { EspaciotrabajoComponent } from './demo/components/espaciotrabajo/espaciotrabajo.component';
import { PanelComponent } from './demo/components/panel/panel.component';
import { EquipoComponent } from './demo/components/equipo/equipo.component';
import { CalendarioComponent } from './demo/components/calendario/calendario.component';
import { InformesComponent } from './demo/components/informes/informes.component';

@NgModule({
    imports: [
        RouterModule.forRoot([
            {
                path: '', redirectTo: 'Inicio_Sesion', pathMatch: 'full'
            },
            {
                path: 'Inicio_Sesion', component: LoginCComponent
            },
            {
                path: 'espaciotrabajo', component: EspaciotrabajoComponent
            },
            // NUEVA RUTA CON MENÚ ESPECIAL
            {
                path: 'menu-layout', // La ruta que quieres usar
                component: AppLayoutComponent,
                children: [
                    // Dejamos el path vacío para que no cargue nada en el centro (router-outlet)
                    { path: '', component: RastreadorComponent },
                    { path: 'calendario', component: CalendarioComponent},
                    { path: 'rastreador', component: RastreadorComponent },
                    { path: 'informes', component: InformesComponent},
                    { path: 'proyectos', component: ProyectosComponent },
                    { path: 'equipo', component: EquipoComponent },
                    { path: 'panel', component: PanelComponent },
                    { path: 'clientes', component: ClientesComponent },
                    { path: 'etiquetas', component: EtiquetasComponent },
                    
                ]
            },

            { path: 'notfound', component: NotfoundComponent },
            { path: '**', redirectTo: '/notfound' },
        ], { scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled', onSameUrlNavigation: 'reload' })
    ],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
