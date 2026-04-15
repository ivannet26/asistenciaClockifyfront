import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
/*import { ConfigService } from './config.service';
import { catchError, map, throwError } from 'rxjs';
import { ListarPerfil, Usuario, UsuarioCrear } from '../model/Usuario';
import { ApiResponse } from '../model/api_response';
*/

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private apiUrl = ''
  private urlAPI = ''
  private apiUrl2 = ''
  private apiUrlPerfil = ''

  constructor(private http:HttpClient, /*private configService: ConfigService*/) 
  {
    /*this.apiUrl = configService.getApiUrl();*/
    this.urlAPI = `${this.apiUrl}/Usuario`;
    /*this.apiUrl2 = configService.getApiUrl();*/
    this.apiUrlPerfil = `${this.apiUrl2}/Perfil`;
  }
/*
  getAllPerfil(): Observable<ListarPerfil[]> {
    return this.http.get<ApiResponse<ListarPerfil>>(`${this.apiUrlPerfil}/SpLista`)
      .pipe(map(response => response.data));
  }

  // para listar
  listar_usuarios(): Observable<Usuario[]>{
    return this.http.get<ApiResponse<Usuario>>(`${this.urlAPI}/SpLista`)
      .pipe(map(response => response.data));
  }

  // registrar un usuario
  crear_usuario(usuarioCrear: UsuarioCrear): Observable<string>{
    return this.http.post<ApiResponse<string>>(`${this.urlAPI}/SpInserta`, usuarioCrear)
      .pipe(
        map(response => response.item || ''),
        catchError(error => {
          console.error('Error al crear el usuario:', error);
          return throwError(() => new Error('No se pudo crear al usuario. Intente nuevamente.'));
        })
      );
  }
  // Actuzaliar usuario
  actualizar_usuario(usuarioActualizar: UsuarioCrear): Observable<string> {
    return this.http.put<ApiResponse<string>>(`${this.urlAPI}/SpActualiza`, usuarioActualizar)
      .pipe(map(response => response.item));
  }
  // Eliminar "Nombre como ID"
  eliminar_usuario(usuario: Usuario): Observable<void>{
    return this.http.delete<void>(`${this.urlAPI}/SpElimina?codigo=${usuario.codigo}&cuentacod=0000001&empresacod=00001`)
      .pipe(
        catchError((error) => {
          console.error('Error al eliminar el usuario:', error);
          return throwError(error);
        })
      );
  }*/
}
