import { NgModule } from '@angular/core';
import { LocationStrategy, PathLocationStrategy } from '@angular/common';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AppLayoutModule } from './layout/app.layout.module';
import { NotfoundComponent } from './demo/components/notfound/notfound.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { HttpClientModule } from '@angular/common/http';
import { TagModule } from 'primeng/tag';

// --- IMPORTACIONES DE PRIMENG ---
import { DropdownModule } from 'primeng/dropdown';
import { ChartModule } from 'primeng/chart';
import { ProgressBarModule } from 'primeng/progressbar';

// --- TUS COMPONENTES ---
import { LoginCComponent } from './demo/components/login-c/login-c.component';
import { PanelComponent } from './demo/components/panel/panel.component';

@NgModule({
    declarations: [
        AppComponent,
        NotfoundComponent
           // <--- SE QUEDA AQUÍ (porque no es standalone)
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        AppLayoutModule,
        FormsModule,
        ReactiveFormsModule,
        ToastModule,
        TagModule,
        HttpClientModule,
        LoginCComponent,
         // <--- REGRESA AQUÍ (porque es standalone)
        // Módulos de PrimeNG
        DropdownModule, 
        PanelComponent,
        ChartModule,   
        ProgressBarModule
    ],
    providers: [
        { provide: LocationStrategy, useClass: PathLocationStrategy },
        ConfirmationService
    ],
    bootstrap: [AppComponent],
})
export class AppModule { }