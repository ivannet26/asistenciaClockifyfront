import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ConfigService } from './config.service';
import { ApiResponse } from '../model/api_response';
import { PermisosxPerfil } from '../model/permisosxperfil';

@Injectable({
    providedIn: 'root',
})
export class PermisosxPerfilService {
    private http = inject(HttpClient);

    private urlAPI: string = '';
    apiUrl: any;
    constructor(
        private httpClient: HttpClient,
        private configService: ConfigService
    ) {
        this.apiUrl = configService.getApiUrl();
        this.urlAPI = `${this.apiUrl}/PermisosxPerfil`;
    }
    getPermisosPorPerfil(codigoPerfil:string,codModulo:string):Observable<ApiResponse<PermisosxPerfil>>{
        const url = `${this.apiUrl}/SpTraeMenuxPerfil`;
        const params =new HttpParams()
        .set('codigoPerfil',codigoPerfil).set('codModulo',codModulo);
        return this.http.get<ApiResponse<PermisosxPerfil>>(url, {params});
    }
}
