import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { ApiResponse } from '../model/api_response';
import { ConfigService } from './config.service';
import { Perfil } from '../model/perfil';

@Injectable({
  providedIn: 'root'
})
export class PerfilService {

  private apiUrl = ''
  urlAPI: string = '';

  constructor(
    private http: HttpClient,
    private configService: ConfigService) 
    {
      this.apiUrl = configService.getApiUrl();
      this.urlAPI = `${this.apiUrl}/Perfil`;
    }

  //listar todo
  getAll(): Observable<Perfil[]> {
    return this.http.get<ApiResponse<Perfil>>(`${this.urlAPI}/SpLista`)
      .pipe(map(response => response.data));
  }
  //crear
  create(perfil: Perfil): Observable<string> {
    return this.http.post<ApiResponse<string>>(`${this.urlAPI}/SpInserta`, perfil)
      .pipe(
        map(response => response.item || ''),
        catchError(error => {
          console.error('Error al crear el perfil:', error);
          return throwError(() => new Error('No se pudo crear el perfil. Intente nuevamente.'));
        })
      );
  }
  //actualizar
  update(Codigo: string, perfil: Perfil): Observable<string> {
    return this.http.put<ApiResponse<string>>(`${this.urlAPI}/SpActualiza`, perfil)
      .pipe(map(response => response.item));
  }
  // Eliminar
  delete(Codigo: string): Observable<void> {
    return this.http.delete<void>(`${this.urlAPI}/SpElimina?codigo=${Codigo}`).pipe(
      catchError((error) => {
        console.error('Error al eliminar el registro:', error);
        return throwError(error);
      })
    );
  }
}
