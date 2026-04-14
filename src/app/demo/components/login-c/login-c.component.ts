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

  constructor(private router: Router,
    private fb: FormBuilder,
    private loginServicio: LoginService,
    private messageService: MessageService) {

    this.credencialesFRM = fb.group({
      correo: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required, Validators.maxLength(20)]],
    });
    /*this.credencialesFRM = fb.group({
      nombreusuario: ['', [Validators.required, Validators.maxLength(50)]],
      claveusuario: ['', [Validators.required, Validators.maxLength(20)]],
      codigoempresa: ['01', [Validators.required, Validators.maxLength(20)]],
    });*/
  }

  ngOnInit(): void {

    this.loginServicio.isAuthenticated().subscribe(isAuthenticated => {
      if (isAuthenticated) {
        this.router.navigate(['/']);
      } else {
        this.router.navigate(['/Inicio_Sesion'])
      }
    });

    const guardado = localStorage.getItem('recordarusuario');
    if (guardado) {
      const { correo, contrasena } = JSON.parse(guardado);
      this.credencialesFRM.patchValue({ correo, contrasena });
      this.recordarme = true;
    }
  }

  iniciarSesion(): void {
        if (!this.credencialesFRM.valid) return;

        const { correo, contrasena } = this.credencialesFRM.value;
        const result = this.loginServicio.login(correo, contrasena);

        if (result) {
            // Guardar correo si el usuario marcó "recordarme"
            if (this.recordarme) {
                localStorage.setItem('recordarusuario', JSON.stringify({ correo, contrasena }));
            } else {
                localStorage.removeItem('recordarusuario');
            }

            // Mostrar toast de bienvenida
            this.messageService.add({
                severity: 'success',
                summary: 'Bienvenido',
                detail: result.nombre
            });

            this.router.navigate(['/espaciotrabajo']);
        } else {
            // Mostrar toast de error
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Correo o contraseña incorrectos'
            });
        }
    }

  /*
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

            this.router.navigate(['/espaciotrabajo']);
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
  }*/



}
