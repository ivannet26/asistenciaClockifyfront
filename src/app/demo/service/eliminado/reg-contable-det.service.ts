import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ConfigService } from './config.service';
import { InfoVoucherCompleto, ObtenerCuentaCorriente, ObtenerCuentaHaby, obtenerTipoDocumento } from '../model/presupuesto';
import { map, Observable, tap } from 'rxjs';
import { GlobalService } from './global.service';
import { RespuestaAPIBase } from '../components/utilities/funciones_utilitarias';

@Injectable({
    providedIn: 'root',
})
export class RegContableDetService {
    private http = inject(HttpClient);
    private urlApi: string = '';
    private urlBase: string = '';
    apiUrl: any;

    constructor(
        private httpClient: HttpClient,
        private configService: ConfigService,
        private globalService: GlobalService
    ) {
        this.apiUrl = configService.getApiUrl();
        const config = `${this.apiUrl}/CtaCtable`;
        this.urlApi = config;
        this.urlBase = `${this.apiUrl}`;
    }

    public obtenerCuenta(): Observable<ObtenerCuentaHaby[]> {
        const params = new HttpParams()
            .set('empresa', this.globalService.getCodigoEmpresa())
            .set('anio', '2024');

        return this.http
            .get<RespuestaAPIBase<ObtenerCuentaHaby[], ObtenerCuentaHaby[]>>(
                `${this.urlApi}/SpTraeAyudaHabyMov`,
                { params }
            )
            .pipe(map((response) => response.data));
    }

    public obtenerCuentaCorriente(): Observable<ObtenerCuentaCorriente[]> {
        const params = new HttpParams().set(
            'empresa',
            this.globalService.getCodigoEmpresa()
        );

        return this.http
            .get<
                RespuestaAPIBase<
                    ObtenerCuentaCorriente[],
                    ObtenerCuentaCorriente[]
                >
            >(`${this.urlApi}/SpTraeAyudaProveedor`, { params })
            .pipe(map((response) => response.data));
    }

    public obtenerTipoDocumentos(): Observable<obtenerTipoDocumento[]> {
        const params = new HttpParams().set(
            'empresa',
            this.globalService.getCodigoEmpresa()
        );

        return this.http
            .get<
                RespuestaAPIBase<obtenerTipoDocumento[], obtenerTipoDocumento[]>
            >(`${this.urlApi}/SpTraeAyudaTipoDocumentos`, { params })
            .pipe(map((response) => response.data));
    }

    public obtenerInformacionDetallada(
        anio,
        mes,
        libro,
        voucher,
        nroOrden
    ): Observable<InfoVoucherCompleto> {
        const params = new HttpParams()
            .set('empresa', this.globalService.getCodigoEmpresa())
            .set('anio', anio)
            .set('mes', mes)
            .set('libro', libro)
            .set('voucher', voucher)
            .set('nroOrden', nroOrden);

        return this.http
            .get<RespuestaAPIBase<InfoVoucherCompleto, InfoVoucherCompleto>>(
                `${this.urlApi}/SpTraeRegContableDet`,
                { params }
            )
            .pipe(map((response) => response.data));
    }

    public actualizarVoucher(
        voucherInfo
    ): Observable<any> {
        let urlModificarVoucher = this.urlApi + '/SpActualiza';
        return this.http.put<any>(urlModificarVoucher, voucherInfo);
    }

    public EliminarPago(
        anio: string,
        mes: string,
        libro: string,
        voucher: string,
        nroOrden: number
    ): Observable<any> {

        let urlEliminar = `${
            this.urlApi
        }/SpElimina?empresa=${this.globalService.getCodigoEmpresa()}&anio=${anio}&mes=${mes}&libro=${libro}&numeroVoucher=${voucher}&nroOden=${nroOrden}`;
        return this.http
            .delete<any>(urlEliminar);
    }
}
