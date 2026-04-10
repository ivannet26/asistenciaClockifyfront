import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
    catchError,
    map,
    Observable,
    throwError,
} from 'rxjs';
import { ConfigService } from './config.service';
import { DetraccionMasiva } from '../model/DetraccionMasiva';
import { formatDateForFilename, RespuestaAPIBase } from '../components/utilities/funciones_utilitarias';
import { DetraccionMasivaDetalle } from '../model/DetraccionMasivaDetalle';
import { DetraccioMasivaDetalleRequest } from '../model/DetraccionMasiva';
import { DetraccionIndividual, DetraccionIndividualDocPen, DetraccionIndividualRequest } from '../model/DetraccionIndividual';
import { DocPendienteDetra } from '../model/DetraccionIndividual';
@Injectable({
    providedIn: 'root',
})
export class DetraccionService{

    private http=inject(HttpClient);
  urlAPI: string = ''; //
    apiUrl: any;

    constructor(private httpClient: HttpClient, private configService:ConfigService)
    {
        this.apiUrl = configService.getApiUrl();
        this.urlAPI = `${this.apiUrl}/Detraccion`;
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
    
    public GetAllDetraccion(empresa:string, anio:string, mes:string,
         motivoPago:string): Observable<DetraccionMasiva[]>{
        let urlSolicitud =`${this.urlAPI}/SpListMasivo?empresa=${empresa}&anio=${anio}&mes=${mes}&motivoPago=${motivoPago}`;
        return this.http
            .get<RespuestaAPIBase<DetraccionMasiva[]>>(urlSolicitud)
            .pipe(
                map((response:RespuestaAPIBase<DetraccionMasiva[]>)=>
                {
                    if(response.isSuccess && response.data){
                        return response.data;
                    }else{
                        console.error('Error en la API:',
                            response.message,
                            response.messageException
                        );
                        return[];
                    }
                }),
                catchError(this.handleError)
            );
    }
    public GetallDetraccionDet(empresa:string, numeroLote:string):Observable<DetraccionMasivaDetalle[]>
    {
        let urlSolicitud =`${this.urlAPI}/SpListMasivoDet?empresa=${empresa}&numeroLote=${numeroLote}`;
         return this.http
            .get<RespuestaAPIBase<DetraccionMasivaDetalle[]>>(urlSolicitud)
            .pipe(
                map((response:RespuestaAPIBase<DetraccionMasivaDetalle[]>)=>
                {
                    if(response.isSuccess && response.data){
                        return response.data;
                    }else{
                        console.error('Error en la API:',
                            response.message,
                            response.messageException
                        );
                        return[];
                    }
                }),
                catchError(this.handleError)
            );
    }

    public InsertarDetraccionMasiva(detramasiva:DetraccioMasivaDetalleRequest, file : File): Observable<any>{
        const formData = new FormData();
        formData.append('archivoOriginal',file);
        formData.append('request', JSON.stringify(detramasiva));
        return this.http.post<RespuestaAPIBase<any>>(`${this.urlAPI}/SpInsertaPresupuestoDetraMasiva`,formData );
    }
    
    public GetallDetraccionIndividual(empresa:string, anio:string, 
        mes:string, motivoPagoCod:string):Observable<DetraccionIndividual[]>
    {
        let urlsolicitud = `${this.urlAPI}/SpTraeIndividual?empresa=${empresa}&anio=${anio}&mes=${mes}&motivoPagoCod=${motivoPagoCod}`;
        return this.http
            .get<RespuestaAPIBase<DetraccionIndividual[]>>(urlsolicitud)
            .pipe(
                map((response:RespuestaAPIBase<DetraccionIndividual[]>)=>
                    {
                        if(response.isSuccess && response.data){
                            return response.data;
                        }else{
                                console.error('Error en la API:',
                                response.message,
                                response.messageException
                            );
                            return[];
                        }
                    }), catchError(this.handleError)
                );
                
                

    }
    public GetAyudaDetraccionIndividual(empresa:string, 
        ruc:string, numeroDocumento:string ):Observable<DocPendienteDetra[]>
    {
        let urlSolicitud = `${this.urlAPI}/SpTraeDocPendiente?empresa=${empresa}&ruc=${ruc}&numeroDocumento=${numeroDocumento}`;
        return this.http
            .get<RespuestaAPIBase<DocPendienteDetra[]>>(urlSolicitud)
            .pipe(
                map((response:RespuestaAPIBase<DocPendienteDetra[]>) =>{
                    if(response.isSuccess && response.data){
                        return response.data;
                        }else{
                             console.error('Error en la API:',
                                response.message,
                                response.messageException
                            );
                            return[];
                        }
                    })
                );
            
    }
    public SpInsertaDetraIndividual(detraccionindividual:DetraccionIndividualRequest, file:File):Observable<any>
    {
        const formData = new FormData();
        formData.append('archivoOriginal',file);
        formData.append('request', JSON.stringify(detraccionindividual));
        return this.http.post<RespuestaAPIBase<any>>(`${this.urlAPI}/SpInsertaDetraIndividual`,formData );
    }

    public SpEliminaPresuDetraIndividual(empresa:string, 
        numeropresupuesto:string):Observable<any>
    {
        const params = new HttpParams()
        .set('empresa',empresa)
        .set('nropresupuesto',numeropresupuesto)
        return this.http.delete( `${this.urlAPI}/SpEliminaPresuDetraIndividual`,{params});
    }


}