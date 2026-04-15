
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { LoginService } from '../../service/login.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { EmpresasxModulo, Login } from '../../model/Login';
import { DropdownModule } from 'primeng/dropdown';
import { GlobalService } from '../../service/global.service';
import { verMensajeInformativo } from '../utilities/funciones_utilitarias';
import { ConfigService } from '../../service/config.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [ToastModule, CommonModule, ReactiveFormsModule, CardModule, ButtonModule, InputTextModule, CheckboxModule, RouterModule, FormsModule, DropdownModule],
    templateUrl: './login.component.html',
    styleUrl: './login.component.css',
    providers: [MessageService]
})
export class LoginComponent implements OnInit {
    credencialesFRM: FormGroup;
    errorMessage: string = '';
    showDialog: boolean = false;
    recordarme: boolean = false;
    dialogMessage: string = '';
    Empresa: EmpresasxModulo[] = []
    selectedEmpresa: string = '';


    constructor(private globalservice: GlobalService, private fb: FormBuilder,
        private LoginServicio: LoginService, private router: Router,
        private messageService: MessageService, private link: Router, private configService: ConfigService) {
        this.credencialesFRM = fb.group({
            nombreusuario: ['', [Validators.required, Validators.maxLength(50)]],
            claveusuario: ['', [Validators.required, Validators.maxLength(50)]],
            codigoempresa: ['', [Validators.required, Validators.maxLength(50)]],

        });
    }
    ngOnInit(): void {

        this.LoginServicio.isAuthenticated().subscribe(isAuthenticated => {
            if (isAuthenticated) {
                this.link.navigate(['/Home']);
            } else {
                this.link.navigate(['/'])
            }
        });

        const savedUser = localStorage.getItem('rememberedUser');
        if (savedUser) {
            const { nombreusuario, claveusuario, codigoempresa } = JSON.parse(savedUser);
            this.credencialesFRM.patchValue({ nombreusuario, claveusuario, codigoempresa });
            this.recordarme = true;
        }
        this.loadEmpresa()
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

                        this.router.navigate(['/Home']);
                        if (this.recordarme) {
                            localStorage.setItem('rememberedUser', JSON.stringify({
                                nombreusuario: autenticacion.nombreusuario,
                                claveusuario: autenticacion.claveusuario,
                                codigoempresa: autenticacion.codigoempresa,
                            }));
                        } else {
                            localStorage.removeItem('rememberedUser');
                        }
                    } else {
                        console.log("Error en autenticaion");
                        console.log(response);
                        verMensajeInformativo(this.messageService, 'error', 'Credenciales inválidas', 'Usuario y/o clave incorrecta');

                    }

                }, error: (error) => {
                    verMensajeInformativo(this.messageService, 'error', 'Credenciales invalidas', 'Usuario y/o clave incorrecta');

                }
            });
        } else {
            verMensajeInformativo(this.messageService, 'warn', 'Campos incompletos', 'Por favor completa los campos correctamente.');
        }
    }

    loadEmpresa() {
        const codigomodulo = this.configService.getCodigoModulo()
        this.LoginServicio.getEmpresa(codigomodulo).subscribe(
            (data: EmpresasxModulo[]) => {
                this.Empresa = data;
                if (this.selectedEmpresa) {
                    const empresaEncontrada = this.Empresa.find(p => p.codigomodulo === this.selectedEmpresa);
                    // console.log(data);
                }
            }
        )
    }

    onEmpresaChallenge(event: any) {
        console.log("onEmpresaChallenge");
        this.credencialesFRM.patchValue({
            codigoempresa: event.value

        });

        console.log(event.value);
    }

}
