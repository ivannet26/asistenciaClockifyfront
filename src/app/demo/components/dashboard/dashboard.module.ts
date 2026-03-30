import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardComponent } from './dashboard.component';
import { ChartModule } from 'primeng/chart';
import { MenuModule } from 'primeng/menu';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { StyleClassModule } from 'primeng/styleclass';
import { PanelMenuModule } from 'primeng/panelmenu';
import { DashboardsRoutingModule } from './dashboard-routing.module';
import { BancoComponent } from '../banco/banco.component';
import { RouterModule } from '@angular/router';
import { LoginCComponent } from '../login-c/login-c.component';
import { UsuarioComponent } from '../usuario/usuario/usuario.component';
import { CuentaBancariaComponent } from '../cuenta-bancaria/cuenta-bancaria.component';
@NgModule({
    imports: [RouterModule.forChild([
        { path: '', component: DashboardComponent, canActivate:[] },
        { path: 'banco', component: BancoComponent, canActivate:[] },
        { path: 'usuario', component: UsuarioComponent, canActivate:[] },
        { path: 'cuentas_bancarias', component: CuentaBancariaComponent, canActivate:[]}
        ])], exports:[RouterModule]
    // imports: [
    //     CommonModule,
    //     FormsModule,
    //     ChartModule,
    //     MenuModule,
    //     TableModule,
    //     StyleClassModule,
    //     PanelMenuModule,
    //     ButtonModule,
    //     DashboardsRoutingModule
    // ],
    // declarations: [DashboardComponent]
})
export class DashboardModule { }
