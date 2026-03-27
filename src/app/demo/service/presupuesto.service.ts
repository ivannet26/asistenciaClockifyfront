import { Injectable , inject} from '@angular/core';
import { agregar_Pago, AnularComprobante, cabeceraPresupuesto, ComprobanteUpdateParams, Detallepresupuesto, insert_detalle, insert_presupuesto, proveedores_lista, VoucherContableCabecera, VoucherContableDetalle } from '../model/presupuesto';
import { HttpClient, HttpParams, HttpRequest, HttpResponse } from '@angular/common/http';
import { delay, map, Observable, of } from 'rxjs';
import { ConfigService } from './config.service';
import { RespuestaAPIBase } from '../components/utilities/funciones_utilitarias';
import { MedioPago } from '../model/presupuesto';
import { InterbankArchivoCab, InterbankArchivoDet } from '../model/InterbankArchivo';
import { BanbifArchivoCab } from '../model/BanbifArchivo';
import { BCPArchivoCab, BCPArchivoDet } from '../model/BCPArchivo';
@Injectable({
    providedIn: 'root',
})
export class PresupuestoService {
    private http = inject(HttpClient);

    private urlApi: string = '';
    private urlBase: string = '';
    apiUrl: any;
    constructor(
        private httpClient: HttpClient,
        private configService: ConfigService
    ) {
        this.apiUrl = configService.getApiUrl();
        const config = `${this.apiUrl}/Presupuesto`;
        this.urlApi = config;
        this.urlBase = `${this.apiUrl}`;
    }

    public obtenerPresupuesto(
        empresa: string,
        anio: string,
        mes: string
    ): Observable<cabeceraPresupuesto[]> {
        const params = new HttpParams()
            .set('empresa', empresa)
            .set('anio', anio)
            .set('mes', mes);

        return this.http
            .get<RespuestaAPIBase<cabeceraPresupuesto[]>>(
                `${this.urlApi}/SpList`,
                { params }
            )
            .pipe(map((response) => response.data));
    }
    public obtenerDetallePresupuesto(
        empresa: string,
        numerodocumento: string
    ): Observable<Detallepresupuesto[]> {
        const params = new HttpParams()
            .set('empresa', empresa)
            .set('numerodocumento', numerodocumento);
        return this.http
            .get<RespuestaAPIBase<Detallepresupuesto[]>>(
                `${this.urlApi}/SpListaDet`,
                { params }
            )
            .pipe(map((response) => response.data));
    }
    public obtenerProveedores(
        empresa: string
    ): Observable<proveedores_lista[]> {
        const params = new HttpParams().set('empresa', empresa);
        return this.http
            .get<RespuestaAPIBase<proveedores_lista[]>>(
                `${this.urlApi}/SpTraeProveedores`,
                { params }
            )
            .pipe(map((response) => response.data));
    }
    public obtenerDocPendiente(
        empresa: string,
        ruc: string,
        numerodocumento: string
    ): Observable<agregar_Pago[]> {
        const params = new HttpParams()
            .set('empresa', empresa)
            .set('ruc', ruc)
            .set('numerodocumento', numerodocumento);
        return this.http
            .get<RespuestaAPIBase<agregar_Pago[]>>(
                `${this.urlApi}/SpListaDocPendientes`,
                {
                    params,
                }
            )
            .pipe(map((response) => response.data));
    }
    public insertarDetallePresupuesto(
        detalle: insert_detalle
    ): Observable<any> {
       
        const params = new HttpParams()
            .set('Empresa', detalle.empresa)
            .set('numeropresupuesto', detalle.numeropresupuesto)
            .set('tipoaplicacion', detalle.tipoaplicacion)
            .set('fechapresupuesto', detalle.fechapresupuesto)
            .set('bcoliquidacion', detalle.bcoliquidacion)
            .set('xmlDetalle', detalle.xmlDetalle);
        return this.http.post<RespuestaAPIBase<any>>(
            `${this.urlApi}/SpInsertaDet`,
            null,
            { params }
        );
    }
    public insertarPresupuesto(
        presupuesto: insert_presupuesto
    ): Observable<any> {
        // console.log(presupuesto)
        return this.http.post(`${this.urlApi}/SpInserta`, presupuesto);
    }
    public actualizarPresupuesto(
        presupuesto: insert_presupuesto
    ): Observable<any> {
        return this.http.put(`${this.urlApi}/SpActualiza`, presupuesto);
    }
    public eliminarPresupuesto(
        empresa: string,
        numero: string
    ): Observable<any> {
        const params = new HttpParams()
            .set('empresa', empresa)
            .set('numero', numero);

        return this.http.delete(`${this.urlApi}/SpElimina`, { params });
    }

    public eliminarPresupuestoDetalle(
        empresa: string,
        numero: string,
        numeroDetalle: string
    ): Observable<any> {
        const params = new HttpParams()
            .set('empresa', empresa)
            .set('codigoDetallePresupuesto', numeroDetalle)
            .set('numeroPresupuesto', numero);
        return this.http.delete(`${this.urlApi}/SpEliminaDet`, { params });
    }

    public actualizarDetallePresupuesto(detalle: any): Observable<any> {
        return this.http.put(`${this.urlApi}/SpActualizaDet`, detalle);
    }

    public obtenerMedioPago(empresa: string): Observable<MedioPago[]> {
        const params = new HttpParams().set('empresa', empresa);
        /*https://192.168.1.38:7277/Presupuesto/SpTraeTipoPago?empresa=01*/
        return this.http
            .get<RespuestaAPIBase<MedioPago[]>>(
                `${this.urlApi}/SpTraeTipoPago`,
                {
                    params,
                }
            )
            .pipe(map((response) => response.data));
    }
   
 

    // metodo para  validar y retirar  ya  qe no es llamado a ninguna componente
   

    public anulaComprobante(
        params: AnularComprobante
    ):Observable<RespuestaAPIBase<any>>{
        const httpParams = new HttpParams()
            .set('empresa', params.empresa)
            .set('anio', params.anio)
            .set('mes', params.mes)
            .set('numeropresupuesto', params.numeropresupuesto);
        return this.http.put<RespuestaAPIBase<any>>(
            `${this.urlApi}/SpAnulaComprobante`,
            null,
            {params: httpParams}
        )
    }


    public actualizarComprobanteconArchivo(
        params: ComprobanteUpdateParams,
        file: File
    ): Observable<any> {
        const formData = new FormData();
        formData.append('archivoOriginal', file);

        const httpParams = new HttpParams()
            .set('empresa', params.empresa)
            .set('anio', params.anio)
            .set('mes', params.mes)
            .set('numeropresupuesto', params.numeropresupuesto)
            .set('flagOperacion', params.flagOperacion)
            .set('fechapago', params.fechapago)
            .set('numerooperacion', params.numerooperacion)
            .set('enlacepago', params.enlacepago);
        return this.http.put<RespuestaAPIBase<any>>(
            `${this.urlApi}/SpActualizaComprobante`,
            formData,
            { params: httpParams }
        );
    }

  
    // metodo para  validar y retirar  ya  qe no es llamado a ninguna componente
    // public EliminarArchivo(rutaArchivo: string): Observable<any> {
    //     const params = new HttpParams().set('rutaArchivo', rutaArchivo);
    //     return this.http.delete(`${this.urlApi}/EliminarArchivo`, {
    //         params,
    //     });
    // }

    ////obetener voucher contable////////////////
    public obtenerVoucherContableDetalle(
        empresa: string,
        numero: string
    ): Observable<VoucherContableDetalle[]> {
        const params = new HttpParams()
            .set('empresa', empresa)
            .set('numero', numero);
        return this.http
            .get<RespuestaAPIBase<VoucherContableDetalle[]>>(
                `${this.urlBase}/CtaCtable/SpTraeDetalle?`,
                {
                    params,
                }
            )
            .pipe(map((response) => response.data));
    }

    public obtenerVoucherContableCabecera(
        empresa: string,
        numero: string
    ): Observable<VoucherContableCabecera[]> {
        const params = new HttpParams()
            .set('empresa', empresa)
            .set('numero', numero);
        return this.http
            .get<RespuestaAPIBase<VoucherContableCabecera[]>>(
                `${this.urlBase}/CtaCtable/SpTraeCabecera?`,
                {
                    params,
                }
            )
            .pipe(map((response) => response.data));
    }

    // metodo para  validar y retirar  ya  qe no es llamado a ninguna componente
    // public eliminarVoucherContableDetalle(
    //     empresa: string,
    //     orden: number
    // ): Observable<any> {
    //     const params = new HttpParams()
    //         .set('empresa', empresa)
    //         .set('orden', orden.toString()); // Ajuste para que coincida con la interfaz

    //     return this.http.delete(`${this.urlApi}/SpEliminaDet`, { params });
    // }

    public obtenerArchivo(empresa: string, anio: string, mes: string, 
        numeroPresupuesto: string): Observable<HttpResponse<Blob>>{
        const params = new HttpParams()
        .set('empresa', empresa)
        .set('anio', anio)
        .set('mes', mes)
        .set('numeroPresupuesto', numeroPresupuesto);

        return this.http.get(`${this.urlApi}/spTraeDocumento`, {
            params,
            observe: 'response',
            responseType: 'blob',
        })
    }
    
//reporte documentos pediente de agregar pagos
    public obtenerDocPendienteReporte(
        empresa: string,
        filtro:string
    ): Observable<agregar_Pago[]> {
        const params = new HttpParams()
            .set('empresa', empresa)
            .set('filtro', filtro);
        return this.http
            .get<RespuestaAPIBase<agregar_Pago[]>>(
                `${this.urlApi}/SpListaDocPendientesReporte`,
                {
                    params,
                }
            )
            .pipe(map((response) => response.data));
    }
        public SpListaInterbankArchivoCab(
            empresa:string, nombreLote:string , numeroPresupuesto:string
        ): Observable<InterbankArchivoCab[]>
        {
                const params = new HttpParams()
                    .set('empresa', empresa )
                    .set('nombreLote', nombreLote)
                    .set('numeroPresupuesto', numeroPresupuesto);
                return this.http
                .get<RespuestaAPIBase<InterbankArchivoCab[]>>(
                    `${this.urlApi}/SpListaInterbankArchivoCab`,
                    {
                        params,
                    }
                )
                .pipe(map((response) => response.data));
            
        }
        public SpListaInterbankArchivoDet(empresa:string,
            numeroPresupuesto: string): Observable<InterbankArchivoDet[]>
        {
            const params = new HttpParams()
                .set('empresa', empresa)
                .set('numeroPresupuesto',numeroPresupuesto);
            return this.http.get<RespuestaAPIBase<InterbankArchivoDet[]>>(
                `${this.urlApi}/SpListaInterbankArchivoDet`, {params}
                ).pipe(map((response) => response.data));
                
            
        }
        public SpListaBanbifArchivoCab(empresa:string, 
            numeroPresupuesto:string) :Observable<BanbifArchivoCab[]>
        {
                  const params = new HttpParams()
                .set('empresa', empresa)
                .set('numeroPresupuesto',numeroPresupuesto);
            return this.http.get<RespuestaAPIBase<BanbifArchivoCab[]>>(
                `${this.urlApi}/SpListaBanbifArchivoCab`, {params}
                ).pipe(map((response) => response.data));
        }
        public SpListaBcpArchivoCab(empresa:string,numeroPresupuesto:string): Observable<BCPArchivoCab[]>
        {
               const params = new HttpParams()
                .set('empresa', empresa)
                .set('numeroPresupuesto',numeroPresupuesto);
              return this.http.get<RespuestaAPIBase<BCPArchivoCab[]>>(
                `${this.urlApi}/SpListaBcpCab`, {params}
                ).pipe(map((response) => response.data));                                    
        }

         public SpListaBcpArchivoDet(empresa:string,numeroPresupuesto:string): Observable<BCPArchivoDet[]>
        {
               const params = new HttpParams()
                .set('empresa', empresa)
                .set('numeroPresupuesto',numeroPresupuesto);
              return this.http.get<RespuestaAPIBase<BCPArchivoDet[]>>(
                `${this.urlApi}/SpListaBcpDet`, {params}
                ).pipe(map((response) => response.data));                                    
        }


}
