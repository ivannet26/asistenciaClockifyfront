export interface BCPArchivoCab{

        tipoRegistro:string;
       cantidadAbonoPlanilla:string;
       fechaProceso:string;
       tipoCuentaCargo:string;
       monedaCuentaCargo:string;
       numeroCuentaCargo:string
       montoTotalPlanilla:string;
       referenciaPlaanilla:string;
       flagexoneracionitf:string;
       totalControl:string;


}
export interface BCPArchivoDet{
   tipoRegistro:string;
       tipoCuentaAbono:string;
       nroCuentaAbono:string;
       modalidadPago:string;
       tipoDocumentoProveedor:string;
       numeroDocuProveedor:string;
       correlativoProveedor:string;
       nombreProveedor:string;
       referenciabeneficiario:string;
       referenciaempresa:string;
       monedaImporteAbonar:string;
       importeAbonar:string;
       flagValidarIDC:string;
}