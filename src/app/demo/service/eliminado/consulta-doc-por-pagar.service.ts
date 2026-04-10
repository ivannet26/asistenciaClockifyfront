import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
//import { ConsultaDocPorPago } from './../model/ConsultaDocPorPago'; // Asegúrate de que la ruta sea correcta
import { HttpClient, HttpParams } from '@angular/common/http';
//import { ConfigService } from './config.service';
//import { RespuestaAPIBase } from '../components/utilities/funciones_utilitarias';
//import { GlobalService } from './global.service';

@Injectable({
  providedIn: 'root'
})
export class ConsultaDocPorPagoService {

  private http = inject(HttpClient);
  urlAPI: string = ''; //
  apiUrl: any;

  constructor(
    private httpClient: HttpClient,
    //private configService: ConfigService,
    //private globalService: GlobalService
  ) {
    this.apiUrl = //configService.getApiUrl();
      this.urlAPI = `${this.apiUrl}/Presupuesto`;
  }
  /*public GetConsultaDocPorPago(filtro:string): Observable<ConsultaDocPorPago[]> {
        return this.http.get<RespuestaAPIBase<ConsultaDocPorPago[]>>(`${this.urlAPI}/SpTraeDocPorPagarConsulta?empresa=${this.globalService.getCodigoEmpresa()}&filtro=${filtro}`).pipe(
          map(response => response.data));
      }s
*/
}
