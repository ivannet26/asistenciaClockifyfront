import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { InputGroupModule } from 'primeng/inputgroup';
import { Login } from '../../model/Login';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { LoginService } from '../../service/login.service';
import { GlobalService } from '../../service/global.service';
import { ToastModule } from "primeng/toast";
import { MessageService } from 'primeng/api';


@Component({
  selector: 'app-login-c',
  standalone: true,
  imports: [
    RouterModule,
    InputTextModule,
    PasswordModule,
    CheckboxModule,
    ButtonModule,
    RippleModule,
    InputGroupModule,
    FormsModule,
    ReactiveFormsModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './login-c.component.html',
  styleUrl: './login-c.component.css'
})
export class LoginCComponent implements OnInit {

  credencialesFRM: FormGroup;
  recordarme: boolean = false;

  constructor(private globalservice: GlobalService, private router: Router, private fb: FormBuilder, private LoginServicio: LoginService) {

    this.credencialesFRM = fb.group({
      nombreusuario: ['', [Validators.required, Validators.maxLength(50)]],
      claveusuario: ['', [Validators.required, Validators.maxLength(20)]],
      codigoempresa: ['01', [Validators.required, Validators.maxLength(20)]],
    });
  }

  ngOnInit(): void {

    this.LoginServicio.isAuthenticated().subscribe(isAuthenticated => {
      if (isAuthenticated) {
        this.router.navigate(['/']);
      } else {
        this.router.navigate(['/Inicio_Sesion'])
      }
    });

    const guardarusuario = localStorage.getItem('recordarusuario');
    if (guardarusuario) {
      const { nombreusuario, claveusuario, codigoempresa } = JSON.parse(guardarusuario);
      this.credencialesFRM.patchValue({ nombreusuario, claveusuario, codigoempresa });
      this.recordarme = true;
    }
  }

  //Método para manejar el envió del form
  iniciarSesion() {
    console.log(this.credencialesFRM.value);
    if (this.credencialesFRM.valid) {
      const autenticacion: Login = this.credencialesFRM.value;
      this.LoginServicio.autenticacion(autenticacion).subscribe({
        next: (response) => {
          if (response.isSuccess) {
            this.globalservice.setNombreUsuario(autenticacion.nombreusuario)
            this.globalservice.setCodigoEmpresa(autenticacion.codigoempresa)
            this.globalservice.setCodigoPerfil(response.data[0].codigoPerfil);

            console.log("autenticacion exitosa");

            this.router.navigate(['/menu-layout']);
            if (this.recordarme) {
              localStorage.setItem('recordarusuario', JSON.stringify({
                nombreusuario: autenticacion.nombreusuario,
                claveusuario: autenticacion.claveusuario,
                codigoempresa: autenticacion.codigoempresa,
              }));
            } else {
              localStorage.removeItem('recordarusuario');
            }
          } else {
            console.log("Error en autenticaion");
            console.log(response);

          }

        }, error: (error) => {
          console.log(error);
        }
      });
    } else {

    }
  }

}
