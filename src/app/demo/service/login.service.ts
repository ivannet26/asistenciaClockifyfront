import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';
import { EmpresasxModulo, Login } from '../model/Login';
//import { MenuxPerfil } from '../model/MenuxPerfil';
import { ConfigService } from './config.service';
import { RespuestaAPIBase } from '../components/utilities/funciones_utilitarias';
import { MiembrosService } from './miembros.service';
import { Miembros } from '../model/Miembro';
import { GlobalService } from './global.service';

import { SessionService } from './session.service';

interface LoginResponse {
    token: string;
}

@Injectable({
    providedIn: 'root',
})
export class LoginService {
    //private http = inject(HttpClient);

    //private urlAPI: string = '';
    //private entidadUrl: string = '';

    //private apiUrl: string = '';

    correo: string = '';
    contrasena: string = '';
    error: string = '';

    private isAuthenticatedSubject = new BehaviorSubject<boolean>(
        this.checkAuthStatus()
    );

    constructor(
        //private httpClient: HttpClient,
        //private configService: ConfigService,
        private miembrosService: MiembrosService,
        private globalService: GlobalService,
        private sessionService: SessionService,
    ) {

        /*this.apiUrl = configService.getApiUrl();
        this.urlAPI = `${this.apiUrl}/Autenticacion`;

        window.addEventListener('beforeunload', () => {
            this.logout();
        });

        // Agregar listener para el evento unload
        window.addEventListener('unload', () => {
            this.logout();
        });*/
    }
    /*
        autenticacion(autenticacion: Login): Observable<RespuestaAPIBase<Login[], Login>> {
            const url = `${this.urlAPI}/SpList`;
    
            return this.http.post<RespuestaAPIBase<Login[], Login>>(url, autenticacion).pipe(
                tap((response) => {
                    if (response.isSuccess) {
                        localStorage.setItem(
                            'userSession',
                            JSON.stringify({
                                isAuthenticated: true,
                                userData: response.data[0],
                            })
                        );
                        this.isAuthenticatedSubject.next(true);
                        localStorage.setItem(
                            'sesionStartTime',
                            new Date().toISOString()
                        );
                        // console.log(response.data);
                    }
                })
            );
        }
        //codigoPerfil, string codModulo
        TraerMenuxPerfil(codigoPerfil: string, codModulo: string) {
            //?codigoPerfil=03&codModulo=01
            let urlAcceso = `${this.urlAPI}/SpTraeMenuxPerfil?codigoPerfil=${codigoPerfil}&codModulo=${codModulo}`;
            //return this.http.get<MenuxPerfil>(urlAcceso);
        }
        logout(): void {
            localStorage.removeItem('userSession');
            localStorage.removeItem('sessionStartTime');
            this.isAuthenticatedSubject.next(false);
        }
    
        isAuthenticated(): Observable<boolean> {
            return this.isAuthenticatedSubject.asObservable();
        }
    
        private checkAuthStatus(): boolean {
            const session = localStorage.getItem('userSession');
            return session ? JSON.parse(session).isAuthenticated : false;
        }
    
        private checkSessionExpiration(): boolean {
            const startTime = localStorage.getItem('sessionStartTime');
            if (!startTime) return false;
    
            const currentTime = new Date();
            const sessionStart = new Date(startTime);
            const diffHours =
                (currentTime.getTime() - sessionStart.getTime()) / (1000 * 60 * 60);
    
            // Por ejemplo, cerrar sesión después de 24 horas
            return diffHours >= 4;
        }
        getEmpresa(codigomodulo: string): Observable<EmpresasxModulo[]> {
            // console.log('url api', this.apiUrl);
    
            //let ippuerto = this.configService.getApiUrl;
            //let ipPuerto : string = this.configService.getConfigValue().apiUrl;
    
            const params = new HttpParams().set('codigomodulo', codigomodulo);
    
            return this.http
                .get<RespuestaAPIBase<EmpresasxModulo[], EmpresasxModulo>>(
                    `${this.urlAPI}/SpTraeEmpresasxModulo`,
                    { params }
                )
                .pipe(map((response) => response.data));
            //  return this.http.get<RespuestaAPI<EmpresasxModulo>>(`https://192.168.1.38:7277/Autenticacion/SpTraeEmpresasxModulo`,
            // {params}).pipe(map(response=>response.data));
        }
    */
    login(correo: string, contrasena: string): Miembros | null {
        const result = this.miembrosService.login(correo, contrasena);

        if (result) {
            if (!result.activo) {
                return null;
            }

            localStorage.setItem('userSession', JSON.stringify({
                isAuthenticated: true,
                userData: result
            }));
            localStorage.setItem('sesionStartTime', new Date().toISOString());
            this.isAuthenticatedSubject.next(true);
            this.globalService.setNombreUsuario(result.nombre);
            this.sessionService.setUser(result);
        }

        return result;
    }

    buscarPorCorreo(correo: string): Miembros | null {
        const miembros: Miembros[] = JSON.parse(localStorage.getItem('miembros') || '[]');
        return miembros.find(m => m.correo === correo) ?? null;
    }


    logout(): void {
        localStorage.removeItem('userSession');
        localStorage.removeItem('sesionStartTime');
        this.isAuthenticatedSubject.next(false);

        this.sessionService.clearUser();
    }

    isAuthenticated(): Observable<boolean> {
        return this.isAuthenticatedSubject.asObservable();
    }

    private checkAuthStatus(): boolean {
        const session = localStorage.getItem('userSession');
        return session ? JSON.parse(session).isAuthenticated : false;
    }
}

