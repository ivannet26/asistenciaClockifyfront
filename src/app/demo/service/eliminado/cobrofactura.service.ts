import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { inject, Injectable } from '@angular/core';
import {
    catchError,
    map,
    Observable,
    throwError,
    switchMap,
    forkJoin,
    of,
    expand,
    takeWhile,
    delay
} from 'rxjs';
import { ConfigService } from './config.service';
import { RespuestaAPIBase } from '../components/utilities/funciones_utilitarias';
import { 
    RegistroCobro, 
    RegistroCobroDetalle, 
    RegistroCobroDocSustento,
    FacturaPorCobrar, 
    TraeRegistroCobroDetalle,
    TraeRegistroCobro,
    ClienteconFactura, 
    TraeHistoricoCtaxCobra,
    TraeDocPendienteCtaxCobra
} from "../model/CuentaxCobrar";
import { HttpParams } from "@angular/common/http";
import { MedioPago, proveedores_lista } from "../model/presupuesto";
import { observableToBeFn } from "rxjs/internal/testing/TestScheduler";
import { HttpResponse } from "@angular/common/http";

@Injectable({
    providedIn:'root'
})
export class CobroFacturaService{
    private http = inject(HttpClient);
    urlAPI: string = '';
    apiUrl: any;

    constructor(
        private httpClient: HttpClient,
        private configService: ConfigService
    ) {
        this.apiUrl = configService.getApiUrl();
        this.urlAPI = `${this.apiUrl}/CobroFactura`;
    }

    // ==================== MÉTODOS CABECERA ====================
    
    public getListaRegistroCobro(empresa:string, anio:string, mes:string):Observable<TraeRegistroCobro[]>{
        let urlObtener = `${this.urlAPI}/Lista?empresa=${empresa}&anio=${anio}&mes=${mes}`;
        return this.http
            .get<RespuestaAPIBase<TraeRegistroCobro[]>>(urlObtener)
            .pipe(
                map((response: RespuestaAPIBase<TraeRegistroCobro[]>) => {
                    if(response.isSuccess && response.data){
                        return response.data;
                    }else{
                        return [];
                    }
                }), 
                catchError(this.handleError)
            );
    }

    public insertRegistroCobro(registro:RegistroCobro):Observable<any>{
        return this.http.post<any>(this.urlAPI + '/Inserta', registro);
    }

    public updateRegistroCobro(registro:RegistroCobro):Observable<any>{
        return this.http.put<any>(this.urlAPI + '/Actualiza', registro);
    }

    public deleteRegistroCobro(empresa:string, anio:string, mes:string, numero:string):Observable<any>{ 
        let urlElimina = `${this.urlAPI}/Elimina?empresa=${empresa}&anio=${anio}&mes=${mes}&numero=${numero}`;
        return this.http.delete<any>(urlElimina);
    }

    // ==================== MÉTODOS DETALLE ====================

    public insertarDetalleXML(data: any): Observable<any> {
        return this.http.post<any>(`${this.urlAPI}/InsertaDetalle`, data, {
            headers: {
                'Content-Type': 'application/json'
            }
        }).pipe(
            map(response => {
                if (response.isSuccess === false) {
                    const errorMsg = response.messageException || response.message || 'Error en servidor';
                    throw new Error(errorMsg);
                }
                return response;
            }),
            catchError((error) => {
                let errorMessage = 'Error desconocido';
                
                if (error instanceof Error) {
                    errorMessage = error.message;
                } else if (error.error) {
                    errorMessage = error.error.messageException 
                        || error.error.message 
                        || error.error.Message 
                        || JSON.stringify(error.error);
                }
                
                return throwError(() => new Error(errorMessage));
            })
        );
    }

    public actualizaDetalle(
        empresa: string,
        numeroRegistroCobroCab: string,
        item: number,
        tipodoc: string,
        nroDocumento: string,
        pagoSoles: number,
        pagoDolares: number,
        observacion: string
    ): Observable<any> {
        const params = new HttpParams()
            .set('empresa', empresa)
            .set('numeroRegistroCobroCab', numeroRegistroCobroCab)
            .set('item', item.toString())
            .set('tipodoc', tipodoc)
            .set('nroDocumento', nroDocumento)
            .set('pagoSoles', pagoSoles.toString())
            .set('pagoDolares', pagoDolares.toString())
            .set('observacion', observacion);
        
        return this.http.put<any>(`${this.urlAPI}/ActualizaDetalle`, null, { params }).pipe(
            map(response => response),
            catchError(this.handleError)
        );
    }

    public eliminarDetale(
        empresa: string, 
        numeroRegistroCobroCab: string, 
        item: number, 
        tipodoc: string, 
        nroDocumento: string
    ): Observable<any> {
        const params = new HttpParams()
            .set('empresa', empresa)
            .set('numeroRegistroCobroCab', numeroRegistroCobroCab)
            .set('item', item.toString())
            .set('tipodoc', tipodoc)
            .set('nroDocumento', nroDocumento);
        
        return this.http.delete<any>(`${this.urlAPI}/EliminaDetalle`, { params }).pipe(
            map(response => response),
            catchError(this.handleError)
        );
    }

    public eliminarDetalePorDocumento(
        empresa: string, 
        numeroRegistroCobroCab: string, 
        nroDocumento: string
    ): Observable<any> {
        let intentos = 0;
        const maxIntentos = 10;
        
        return this.eliminarUnaVez(empresa, numeroRegistroCobroCab, nroDocumento, 1).pipe(
            expand(() => {
                intentos++;
                if (intentos >= maxIntentos) {
                    return of(null);
                }
                
                return this.getListaDetalle(empresa, numeroRegistroCobroCab).pipe(
                    delay(300),
                    switchMap(detalles => {
                        const existe = detalles.some(d => d.nroDocumento === nroDocumento);
                        if (existe) {
                            return this.eliminarUnaVez(empresa, numeroRegistroCobroCab, nroDocumento, intentos + 1);
                        } else {
                            return of(null);
                        }
                    })
                );
            }),
            takeWhile(result => result !== null, true),
            map(() => ({ success: true, intentos: intentos + 1 }))
        );
    }

    private eliminarUnaVez(
        empresa: string,
        numeroRegistroCobroCab: string,
        nroDocumento: string,
        intento: number
    ): Observable<any> {
        const params = new HttpParams()
            .set('empresa', empresa)
            .set('numeroRegistroCobroCab', numeroRegistroCobroCab)
            .set('item', '1')
            .set('tipodoc', '01')
            .set('nroDocumento', nroDocumento);
        
        return this.http.delete<any>(`${this.urlAPI}/EliminaDetalle`, { params }).pipe(
            map(response => response),
            catchError(error => of({ success: false }))
        );
    }

    public getListaDetalle(
    empresa: string, 
    numeroRegistroCobroCab: string
): Observable<TraeRegistroCobroDetalle[]> {
    const params = new HttpParams()
        .set('empresa', empresa)
        .set('numeroRegistroCobroCab', numeroRegistroCobroCab)
        .set('_t', Date.now().toString());
    
    return this.http.get<RespuestaAPIBase<TraeRegistroCobroDetalle[]>>(
        `${this.urlAPI}/ListaDetalle`, 
        { 
            params,
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        }
    ).pipe(
        map((response) => {
            if(response.isSuccess && response.data){
                
                return response.data.map(detalle => {
                    
                    // Convertir importes a número para una comparación segura
                    const importeSoles = parseFloat(detalle.importeOriginalSoles || '0');
                    const importeDolares = parseFloat(detalle.importeOriginalDolares || '0');
                    const pagoSoles = parseFloat(detalle.importePagadoSoles || '0');
                    const pagoDolares = parseFloat(detalle.importePagadoDolares || '0');
                    
                    let monedaInferida: string;

                    // Lógica de inferencia: si hay algún importe (original o pagado) en Soles, es Soles.
                    if (importeSoles > 0 || pagoSoles > 0) {
                        monedaInferida = 'SOLES';
                    } 
                    // Si hay algún importe (original o pagado) en Dólares, es Dólares.
                    else if (importeDolares > 0 || pagoDolares > 0) {
                        monedaInferida = 'DÓLARES';
                    } 
                    //  usar el valor que vino del backend por defecto.
                    else {
                        monedaInferida = detalle.moneda;
                    }
                    
                    return {
                        ...detalle,
                        moneda: monedaInferida 
                    } as TraeRegistroCobroDetalle;
                });

            } else {
                return [];
            }
        }),
        catchError(this.handleError)
    );
}

    // === REPORTE ============
    public ListaHistoricoReporte(empresa:string, filtro:string): Observable<TraeHistoricoCtaxCobra[]>
    {
        const params = new HttpParams().set('empresa', empresa).set('filtro',filtro);
        return this.http.get<RespuestaAPIBase<TraeHistoricoCtaxCobra[]>>(
            `${this.urlAPI}/ListaHistoricoReporte`,{params}
        ).pipe(
            map((response)=>response.data),catchError(this.handleError)
        );
    }
    public ListaDocPendienteReporte(empresa:string, 
        filtro:string): Observable<TraeDocPendienteCtaxCobra[]>
        
    {
        const params = new HttpParams().set('empresa', empresa) .set('filtro', filtro);
        return this.http.get<RespuestaAPIBase<TraeDocPendienteCtaxCobra[]>>(
             `${this.urlAPI}/ListaDocPendienteReporte`,{params}).pipe(
                map((response) => response.data), catchError(this.handleError)
             );
        
    }
    // ==================== MÉTODOS SUSTENTOS ====================

    public SubirArchivo(empresa:string, numeroRegCobCab:string, archivosSeleccionados:File[]):Observable<any>{
        const formData = new FormData();
        formData.append('empresa', empresa);
        formData.append('numeroRegCobroCab', numeroRegCobCab);
        
        archivosSeleccionados.forEach(file => {
            formData.append('archivosOriginales', file, file.name);
        });
        return this.http.post<any>(`${this.urlAPI}/InsertarSustentoArchivo`, formData);
    }

    public listarSustento(empresa:string, numeroRegistroCobroCab:string):Observable<RegistroCobroDocSustento[]>{
        const params = new HttpParams().set('empresa', empresa).set('numeroRegistroCobroCab', numeroRegistroCobroCab);
        return this.http.get<RespuestaAPIBase<RegistroCobroDocSustento[]>>(
            `${this.urlAPI}/ListaSustento`,
            { params }
        ).pipe( 
            map((response)=> response.data),
            catchError(this.handleError)
        );
    }

    public traeDocumentoSustento(empresa:string, numeroRegistroCobroCab:string, item:number):Observable<HttpResponse<Blob>>{
        const url = `${this.urlAPI}/TraeDocumentoSustento?empresa=${empresa}&numeroRegistroCobroCab=${numeroRegistroCobroCab}&item=${item}`;
        return this.http.get(url,{ observe:'response', responseType:'blob' });
    }

    public actualizarDocumentoSustento(registro:RegistroCobroDocSustento ){
        return this.http.put<any>(`${this.urlAPI}/ActualizaSustento`, registro);
    }

    public eliminarDocumentoSustento(empresa:string, numeroRegCobroCab, item:number){
        return this.http.delete<any>(`${this.urlAPI}/EliminaSustento?empresa=${empresa}&numeroRegCobroCab=${numeroRegCobroCab}&item=${item}`)
    }

    // ==================== MÉTODOS AUXILIARES ====================

    public getListaMedioPago(empresa: string): Observable<MedioPago[]> {
        const params = new HttpParams().set('empresa', empresa);
        return this.http
            .get<RespuestaAPIBase<MedioPago[]>>(
                `/Presupuesto/SpTraeTipoPago`,
                { params }
            )
            .pipe(
                map((response) => response.data),
                catchError(this.handleError)
            );
    }

    public getListaAyudaFacturaPorCobrar(
        empresa:string,
        usuario:string, 
        clientecodigo:string
    ):Observable<FacturaPorCobrar[]>{
        const params = new HttpParams()
            .set('empresa', empresa)
            .set('usuario', usuario)
            .set('clientecodigo', clientecodigo);
        
        return this.http
            .get<RespuestaAPIBase<FacturaPorCobrar[]>>(
                `${this.urlAPI}/TraeFacturaPorCobrar`,
                { params }
            )
            .pipe(
                map((response) => response.data),
                catchError(this.handleError)
            );
    } 

    public getListaProveedores(empresa: string): Observable<proveedores_lista[]> {
        const params = new HttpParams().set('empresa', empresa);
        return this.http
            .get<RespuestaAPIBase<proveedores_lista[]>>(
                `/Presupuesto/SpTraeProveedores`,
                { params }
            )
            .pipe(
                map((response) => response.data),
                catchError(this.handleError)
            );
    }

    public getListaCliente(empresa:string):Observable<ClienteconFactura[]>{
        const params = new HttpParams().set('empresa', empresa);
        return this.http.get<RespuestaAPIBase<ClienteconFactura[]>>(
            `${this.urlAPI}/TraeClienteconFactura`,
            { params }
        ).pipe(
            map((response) => response.data),
            catchError(this.handleError)
        );
    }

    // ==================== MANEJO DE ERRORES ====================

    private handleError(error: HttpErrorResponse) {
        let errorMessage = 'Error desconocido';
        if (error.error instanceof ErrorEvent) {
            errorMessage = `Error: ${error.error.message}`;
        } else {
            errorMessage = `Código: ${error.status}\nMensaje: ${error.message}`;
        }
        return throwError(() => new Error(errorMessage));
    }
}
