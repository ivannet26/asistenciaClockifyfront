import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiResponse } from '../model/api_response';
import { perfilxpermisos, permisosxperfilxtodo } from '../model/permisosxperfilxtodo';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class PermisosxperfilxtodoService {

    private apiUrl=''
    private urlAPI=''
    private apiUrl2=''
    private urlAPI2=''

    constructor(private http:HttpClient, private configService: ConfigService) 
    {
        this.apiUrl = configService.getApiUrl();
        this.urlAPI = `${this.apiUrl}/PermisosxPerfil`;
        this.apiUrl2 = configService.getApiUrl();
        this.urlAPI2 = `${this.apiUrl2}/Perfil/SpLista`;
    }

    getPermisosPorPerfilxtodo(codigoPerfil:string,codModulo:string):Observable<ApiResponse<permisosxperfilxtodo>>{
        const params = new HttpParams()
            .set('codigoPerfil',codigoPerfil)
            .set('codModulo',codModulo);
        return this.http.get<ApiResponse<permisosxperfilxtodo>>(`${this.urlAPI}/SpTodoMenuxPerfil`, { params });
    }

    insertarPermisos(codModulo:string,codigoPerfil:string,xmlPermisos:string):Observable<ApiResponse<permisosxperfilxtodo>>{
        const body={
            codModulo:codModulo
            ,codigoPerfil:codigoPerfil
            ,xmlPermisos:xmlPermisos
        };
        const headers=new HttpHeaders({
            'Content-Type':'application/json'
        })
        return this.http.post<ApiResponse<permisosxperfilxtodo>>(`${this.urlAPI}/SpInsertaMenuxPerfil`, body, { headers });

    }

    getPerfilesCombo():Observable<perfilxpermisos[]>{
        return this.http.get<ApiResponse<perfilxpermisos>>(this.urlAPI2).pipe(map(response => response.data));
    }
}
