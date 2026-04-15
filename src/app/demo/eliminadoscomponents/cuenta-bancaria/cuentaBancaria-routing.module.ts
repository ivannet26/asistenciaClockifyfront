import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CuentaBancariaComponent } from './cuenta-bancaria.component';

@NgModule({
    imports: [RouterModule.forChild([
        { path: '', component: CuentaBancariaComponent }
    ])],
    exports: [RouterModule]
})
export class CuentaBancariaRoutingModule { }