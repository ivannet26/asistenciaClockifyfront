export interface RetencionCab{

    empresaCod:string;
    anio:string;
    mes:string;
    pagoNro:string;
    fecha:string;
    pagoMotivo:string;
    pagoMedio:string;
    facturasImporteSoles: number;
    retencionImporteSoles:number;
    estadoPresupuesto:string;
    fechaPago:string;
    nroOperacion:string;
    retencionesMensualesNro:string;
}

export interface RetencionDet{
    item:number;
    ban01Empresa:string;
    retencionNro:string;
    retencionFecha:string;
    proveedorDocTipo:string;
    proveedorDocNro:string;
    proveedorDescripcion:string;
    proveedorDocTipoTransa:string;
    proveedorDocNroDoc :string;
    proveedorDocFecha:string;
    proveedorDocImporteTotal:number;
    proveedorDocImporteRetenido:number;
}

export interface Retencion{
    ban01empresa:string;
    ban01anio:string;
    ban01mes:string;
    ban01descripcion:string;
    ban01fecha:string;
    ban01estado:string;
    ban01usuario:string;
    ban01pc:string;
    ban01fecharegistro:string;
    ban01mediopago:string;
    ban01motivopagocod:string;
    retencionMensualNro:string;
    numerooperacion:string;
    enlacepago:string;
    nombrearchivo:string;
    contenidoarchivo:string;
    flagoperacion:string;
}

