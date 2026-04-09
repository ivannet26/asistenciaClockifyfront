export interface InterbankArchivoCab{

    codigoRegistro: string;
    rubro:string;
    codigoEmpresa:string;
    codigoServicio:string;
    cuentaCargo:string;
    tipoCuentaCargo:string;
    monedaCuentaCargo:string;
    nombreSolicitudLote:string;
    fechahoraCreacion:string;
    tipoProceso:string;
    fechaProceso:string;
    nroRegistro:string;
    totalSoles:string;
    totalDolares:string;
    versionMacro:string;


}

export interface InterbankArchivoDet{
    codigoRegistro:string;
    codigoBeneficiario:string;
    tipoDocumentoPago:string;
    numeroDocumentoPago:string;
    fechaVencimientoDocumento:string;
    monedaAbono:string;
    montoAbono:string;
    indicadorBanco:string;
    tipoAbono:string;
    tipoCuenta:string;
    monedaCuenta:string;
    oficinaCuenta:string;
    numeroCuenta:string;
    tipoPersona:string;
    tipoDocumentoIdentidad:string;
    numeroDocumentoIdentidad:string;
    nombreBeneficiario:string;
    monedaMontoIntagibleCTS:string;
    montoIntangibleCTS:string;
    filler:string;
    numeroCelular:string;
    correoElectronico:string;



}