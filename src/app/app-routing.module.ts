import { RouterModule } from '@angular/router';
import { Component, NgModule } from '@angular/core';
import { NotfoundComponent } from './demo/components/notfound/notfound.component';
import { AppLayoutComponent } from "./layout/app.layout.component";
import { LoginCComponent } from './demo/components/login-c/login-c.component';
import { CuentaBancariaComponent } from './demo/components/cuenta-bancaria/cuenta-bancaria.component';
import { BancoComponent } from './demo/components/banco/banco.component';
import { PerfilComponent } from './demo/components/perfil/perfil.component';
import { PermisosxperfilxtodoComponent } from './demo/components/permisosxperfilxtodo/permisosxperfilxtodo.component';
import { ConsultaDocPorPagoComponent } from './demo/components/consulta-doc-por-pago/consulta-doc-por-pago.component';
import { CuentaComponent } from './demo/components/cuenta/cuenta.component';
import { ConsultaDocPendienteReporteComponent } from './demo/components/consulta-doc-pendiente-reporte/consulta-doc-pendiente-reporte.component';

import { ConsultadocpendienteCtaxcobrarComponent } from './demo/components/consultadocpendiente-ctaxcobrar/consultadocpendiente-ctaxcobrar.component';
import { ConsultahistoricaCtaxcobrarComponent } from './demo/components/consultahistorica-ctaxcobrar/consultahistorica-ctaxcobrar.component';
import { RegistroCobroComponent } from './demo/components/cobrofactura/registro-cobro/registro-cobro.component';
import { RegistroCobroDetalleComponent } from './demo/components/cobrofactura/registro-cobro-detalle/registro-cobro-detalle.component';
import { AgregaFacturaxcobrarComponent } from './demo/components/cobrofactura/agrega-facturaxcobrar/agrega-facturaxcobrar.component';

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
                path: 'Home', component: AppLayoutComponent, //canActivate:[AuthGuard],
                children: [
                    { path: '', loadChildren: () => import('./demo/components/dashboard/dashboard.module').then(m => m.DashboardModule) },
                    { path: 'banco', component: BancoComponent },
                    { path: 'cuentas_bancarias', component: CuentaBancariaComponent },
                    { path: 'perfil', component: PerfilComponent },
                    { path: 'asignarpermiso', component: PermisosxperfilxtodoComponent },
                    { path: 'ConsultaDocPorPago', component: ConsultaDocPorPagoComponent },
                    { path: 'cuenta', component: CuentaComponent },
                    { path: 'ConsultaDocPendienteReporte', component: ConsultaDocPendienteReporteComponent },
                    { path: 'consultadocpendiente_ctaxcobrar', component: ConsultadocpendienteCtaxcobrarComponent },
                    { path: 'consultahistorica_ctaxcobrar', component: ConsultahistoricaCtaxcobrarComponent }
                    , { path: 'registro_cobro', component: RegistroCobroComponent }
                    , { path: 'registro_cobro_detalle', component: RegistroCobroDetalleComponent }
                    , { path: 'agrega_facturaxcobrar', component: AgregaFacturaxcobrarComponent }
                ]
            },
            // NUEVA RUTA CON MENÚ ESPECIAL
            {
                path: 'menu-layout', // La ruta que quieres usar
                component: AppLayoutComponent,
                children: [
                    // Dejamos el path vacío para que no cargue nada en el centro (router-outlet)
                    { path: '', component: NotfoundComponent }
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
