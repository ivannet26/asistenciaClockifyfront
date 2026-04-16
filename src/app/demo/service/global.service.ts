import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ConfigService } from './config.service';

@Injectable({
    providedIn: 'root',
})
export class GlobalService {
    private readonly Nombre_Usuario = 'nombre';
    //private readonly Codigo_Empresa = 'codigoempresa';
    //private readonly urlAPIServidor = 'urlapiservidor';
    private readonly CODIGO_PERFIL_KEY = 'codigoperfil';
    //private readonly Codigo_Modulo = 'codigoModulo';
    //private readonly TipoAplicacion = 'tipoAplicacion';
    //private readonly Estado = 'estado';
    private _selectedDate = new BehaviorSubject<Date>(new Date());
    selectedDate$ = this._selectedDate.asObservable();

    constructor(private configService: ConfigService) {}

    setCodigoPerfil(codigo: string) {
        // nuevo
        sessionStorage.setItem(this.CODIGO_PERFIL_KEY, codigo);
    }
    getCodigoPerfil(): string {
        // nuevo
        return sessionStorage.getItem(this.CODIGO_PERFIL_KEY) || '';
    }
    setNombreUsuario(nombre: string) {
        sessionStorage.setItem(this.Nombre_Usuario, nombre);
    }
    getNombreUsuario(): string {
        return sessionStorage.getItem(this.Nombre_Usuario);
    }
    /*setCodigoEmpresa(codigo: string) {
        sessionStorage.setItem(this.Codigo_Empresa, codigo);
    }
    getCodigoEmpresa(): string {
        console.log(sessionStorage.getItem(this.Codigo_Empresa));
        return sessionStorage.getItem(this.Codigo_Empresa);
    }
    setUrlApi(urlApi: string) {
        sessionStorage.setItem(this.urlAPIServidor, urlApi);
    }

    getUrlApi(): string {
        return sessionStorage.getItem(this.urlAPIServidor);
    }
*/
    updateSelectedDate(date: Date) {
        this._selectedDate.next(date);
    }

    clearSession() {
        sessionStorage.removeItem(this.CODIGO_PERFIL_KEY); //nuevo
        sessionStorage.removeItem(this.Nombre_Usuario);
        //sessionStorage.removeItem(this.Codigo_Empresa);
    }

    // Método para verificar si hay una sesión activa -- nuevo
    hasActiveSession(): boolean {
        return !!sessionStorage.getItem(this.CODIGO_PERFIL_KEY);
    }
}
