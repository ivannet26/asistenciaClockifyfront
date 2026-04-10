import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
    catchError,
    map,
    Observable,
    throwError,
} from 'rxjs';
import { Banco } from '../model/Banco';
import { ConfigService } from './config.service';
import { RespuestaAPIBase } from '../components/utilities/funciones_utilitarias';
@Injectable({
    providedIn: 'root',
})
export class BancoService {
    private http = inject(HttpClient);
    //apiUrl: string = ''; //
    urlAPI: string = ''; //
    apiUrl: any;

    constructor(
        private httpClient: HttpClient,
        private configService: ConfigService
    ) {
        this.apiUrl = configService.getApiUrl();
        this.urlAPI = `${this.apiUrl}/Banco`;
        // console.log(this.urlAPI);
    }

    //private urlAPI = `${this.apiUrl}/Banco`;

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

    // Ejemplo de cómo usar el método de verificación con GetBancos
    public GetBancos(): Observable<Banco[]> {
        return this.http
            .get<RespuestaAPIBase<Banco[]>>(this.urlAPI + '/SpList?empresa=01')
            .pipe(
                map((response: RespuestaAPIBase<Banco[]>) => {
                    if (response.isSuccess && response.data) {
                        // console.log(response.data);
                        return response.data;
                    } else {
                        console.error(
                            'Error en la API:',
                            response.message,
                            response.messageException
                        );
                        return [];
                    }
                }),
                catchError(this.handleError)
            );
    }

    public CrearBanco(banco: Banco): Observable<any> {
        return this.http.post<any>(this.urlAPI + '/SpCreate', banco);
    }

    public ActualizarBanco(banco: Banco): Observable<any> {
        let urlmodificada = this.urlAPI + '/SpUpdate';
        return this.http.put<any>(urlmodificada, banco);
    }

    public EliminarBanco(idempresa: string, idbanco: string): Observable<any> {
        let urlmodificada = `${this.urlAPI}/SpDelete?idempresa=${idempresa}&idbanco=${idbanco}`;
        return this.http.delete<any>(urlmodificada);
    }

    public getData(): Observable<Banco[]> {
        return this.http.get<Banco[]>(this.urlAPI);
    }

    ComboboxBancos(): Observable<Banco[]> {
        return this.httpClient.get<Banco[]>(this.urlAPI);
    }
}

