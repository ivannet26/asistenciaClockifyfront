import { Component } from '@angular/core';
import { CardModule } from "primeng/card";
import { ToastModule } from "primeng/toast";
import { MessageService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-micuenta',
  standalone: true,
  imports: [
        CardModule,
        ToastModule,
        ButtonModule,
        FormsModule,
        ReactiveFormsModule,
  ],
  providers: [MessageService],
  templateUrl: './micuenta.component.html',
  styleUrl: './micuenta.component.css'
})
export class MicuentaComponent {

}
