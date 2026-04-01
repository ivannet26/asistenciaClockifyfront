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
import { LoginCComponent } from './demo/components/login-c/login-c.component'; // Importación arriba
import { HttpClientModule } from '@angular/common/http';
import { TagModule } from 'primeng/tag';
import { PanelComponent } from './demo/components/panel/panel.component';
import { DropdownModule } from 'primeng/dropdown';
import { ChartModule } from 'primeng/chart';
import { ProgressBarModule } from 'primeng/progressbar';

@NgModule({
    declarations: [
        AppComponent,
        NotfoundComponent,
        PanelComponent

    ],
    imports: [
        AppRoutingModule,
        AppLayoutModule,
        FormsModule,
        BrowserModule,
        ReactiveFormsModule,
        ToastModule,
        TagModule,
        LoginCComponent,
        DropdownModule,
        ChartModule,
        ProgressBarModule
    ],
    providers: [
        { provide: LocationStrategy, useClass: PathLocationStrategy },
        ConfirmationService,
        HttpClientModule
    ],
    bootstrap: [AppComponent],
})
export class AppModule { }
