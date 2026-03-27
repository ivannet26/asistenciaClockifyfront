import { HttpClient, HttpParams, HttpErrorResponse } from "@angular/common/http";
import {
    catchError,
    map,
    Observable,
    throwError,
} from 'rxjs';
import { ConfigService } from './config.service';
import { formatDateForFilename, RespuestaAPIBase } from '../components/utilities/funciones_utilitarias';
import { Injectable, inject } from "@angular/core";
import { RetencionCab, RetencionDet, Retencion } from "../model/retencion";
@Injectable({
    providedIn: 'root',
})
export class RetencionService {

    private http = inject(HttpClient);
    urlAPI: string = ''; //
    apiUrl: any;

    constructor(private httpClient: HttpClient, private configService: ConfigService) {
        this.apiUrl = configService.getApiUrl();
        this.urlAPI = `${this.apiUrl}/Retencion`;
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

    public traeRetencion(empresa: string, anio: string, mes: string): Observable<RetencionCab[]> {
        let urlSolicitud = `${this.urlAPI}/SpTrae?empresa=${empresa}&anio=${anio}&mes=${mes}`;
        return this.http
            .get<RespuestaAPIBase<RetencionCab[]>>(urlSolicitud)
            .pipe(
                map((response: RespuestaAPIBase<RetencionCab[]>) => {
                    if (response.isSuccess && response.data) {
                        return response.data;
                    } else {
                        console.error('Error en la API:',
                            response.message,
                            response.messageException
                        );
                        return [];
                    }
                }),
                catchError(this.handleError)
            );
    }

    public traeRetencionDetalle(empresa: string, anio: string, mes: string
    ): Observable<RetencionDet[]> {
        let urlSolicitud = `${this.urlAPI}/SpTraeDetalle?empresa=${empresa}&anio=${anio}&mes=${mes}`;
        return this.http
            .get<RespuestaAPIBase<RetencionDet[]>>(urlSolicitud)
            .pipe(
                map((response: RespuestaAPIBase<RetencionDet[]>) => {
                    if (response.isSuccess && response.data) {
                        return response.data;
                    } else {
                        console.error('Error en la API:',
                            response.message,
                            response.messageException
                        );
                        return [];
                    }
                }),
                catchError(this.handleError)
            );
    }

    public insertRetencion(detramasiva: Retencion, file: File): Observable<any> {
        const formData = new FormData();
        formData.append('archivoOriginal', file);
        formData.append('request', JSON.stringify(detramasiva));
        return this.http.post<RespuestaAPIBase<any>>(`${this.urlAPI}/SpInserta`, formData);
    }
    public deleteRetencion(empresa: string, numeroPresupuesto: string): Observable<any> {
        const params = new HttpParams()
            .set('empresa', empresa)
            .set('numeroPresupuesto', numeroPresupuesto);
        return this.http.delete(`${this.urlAPI}/SpElimina`, { params });
    }

}