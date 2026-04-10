import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ConfigService } from './config.service';
import { map, Observable, throwError } from 'rxjs';
import { MedioPago } from '../model/mediopago';
import { RespuestaAPIBase } from '../components/utilities/funciones_utilitarias';

@Injectable({
  providedIn: 'root',
})
export class MediopagoService {

  private http = inject(HttpClient);
  urlAPI: string = ''; //
  apiUrl: any;

  constructor(
    private httpClient: HttpClient,
    private configService: ConfigService
  ) {

    this.apiUrl = configService.getApiUrl();
    this.urlAPI = `${this.apiUrl}/MedioPago`;
    //   console.log(this.urlAPI);
  }


  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Error desconocido';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Código de error: ${error.status}\nMensaje: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  //AQUI SE CAMBIA///////////////////
  public GetMediosPago(empresa: string): Observable<MedioPago[]> {
    const params = new HttpParams()
      .set('empresa', empresa)
    return this.http.get<RespuestaAPIBase<MedioPago[]>>(`${this.urlAPI}/SpTrae`, { params }).pipe(
      map(response => response.data));
  }

  public CrearMedioPago(mediopago: MedioPago): Observable<any> {
    //   console.log(mediopago)
    return this.http.post<any>(this.urlAPI + '/SpInserta', mediopago);
  }

  public ActualizarMedioPago(mediopago: MedioPago): Observable<any> {

    let urlmodificada = this.urlAPI + '/SpActualiza';
    return this.http.put<any>(urlmodificada, mediopago);
  }

  public EliminarMedioPago(idempresa: string, idtipopago: string): Observable<any> {
    let urlmodificada = `${this.urlAPI}/SpElimina?empresa=${idempresa}&idtipopago=${idtipopago}`;
    return this.http.delete<any>(urlmodificada);
  }

  public getData(): Observable<MedioPago[]> {
    return this.http.get<MedioPago[]>(this.urlAPI);
  }

  ComboboxMedioPago(): Observable<MedioPago[]> {
    return this.httpClient.get<MedioPago[]>(this.urlAPI);
  }
}
