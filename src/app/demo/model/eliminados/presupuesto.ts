export interface cabeceraPresupuesto {
    pagoNumero: string;
    fecha: string;
    mediopago: string;
    motivo: string;
    impBrutoSoles: number;
    impBrutoDolares: number;
    impDetraccionSoles: number;
    impRetencionSoles: number;
    impPercepcionSoles: number;
    netoPagaSoles: number;
    netoPagoDolares: number;
    estado: string;
    nombreMedioPago: string;
    ban01FechaEjecucionPago: string;
    ban01NroOperacion: string;
    ban01EnlacePago: string;
    bancoCodMedioPago : string;
}

export interface Detallepresupuesto {
    item: number;
    ban02Empresa: string;
    ban02Codigo: string;
    ban02Ruc: string;
    ban02numero: string;
    ban02Fecha: string;
    ban02Proveedor: string | null;
    ban02TipoCambio: string;
    ban02TipoAplic: string;
    ban02Tipodoc: string;
    ban02NroDoc: string;
    ban02Moneda: string;
    ban02Soles: number;
    ban02Dolares: number;
    ban02SolesVale: string;
    ban02PagoSoles: number;
    ban02PagoDolares: number;
    tipoDetraccion: string;
    ban02TasaDet: number;
    ban02ImporteSolesDet: number;
    ban02ImporteSolesPercepcion: number;
    ban02ImporteSolesRet: number;
    ban02SolesNeto: number;
    ban02DolaresNeto: number;
    nombreTipDoc: string;
    razonsocial: string;
    nombreTipoDocumento: string | null;
    nombremoneda: string | null;
    ban02TipoDetraccion: string | null;

    ban02Tasadetraccion: number;
    ban02ImporteDetraccionSoles: number;
    ban02ImporteDetraccionDolares: number;

    ban02TasaRetencion: number;
    ban02ImporteRetencionSoles: number;
    ban02ImporteRetencionDolares: number;

    ban02TasaPercepcion: number;
    ban02ImportePercepcionSoles: number;
    ban02ImportePercepcionDolares: number;
    
    ban02NetoSoles: number;
    ban02NetoDolares: number;
    ban02FechaEmision: string;
    ban02FechaVencimiento: string;

    importeDetraccion: number;

    importecomprobantedolares:number;
    importecomprobantesoles:number;
}

export interface agregar_Pago {
    clave: string;
    ruc: string;
    razonSocial: string;
    coditoTipoDoc: string;
    nombreTipoDOc: string;
    numeroDOcumento: string;
    monedaOriginal: string;
    soles: number;
    dolares: number;
    fechaEmision: string;
    fechaVencimiento: string;
    diasAtrazo: number;
    afectoDetraccion: string;
    afectoRetencion: string;
}

export interface proveedores_lista {
    ruc: string;
    razonsocial: string;
}
export interface mediopago_lista {
    ban01Empresa: string;
    ban01IdTipoPago: string;
    ban01Descripcion: string;
    ban01CtaBanBancoCod:string;
}
export interface insert_detalle {
    empresa: string;
    numeropresupuesto: string;
    tipoaplicacion: string;
    fechapresupuesto: string;
    bcoliquidacion: string;
    xmlDetalle: string;
}

export interface insert_presupuesto {
    ban01Empresa: string;
    ban01Numero: string;
    ban01Anio: string;
    ban01Mes: string;
    ban01Descripcion: string;
    ban01Fecha: string;
    ban01Estado: string;
    ban01Usuario: string;
    ban01Pc: string;
    ban01FechaRegistro: string;
    ban01mediopago: string;
}

export interface ComprobanteUpdateParams {
    empresa: string;
    anio: string;
    mes: string;
    numeropresupuesto: string;
    fechapago?: string;
    numerooperacion?: string;
    enlacepago?: string;
    nombreArchivo?: string;
    contenidoArchivo?: string;
    flagOperacion: string;
}

export interface AnularComprobante {
    empresa: string;
    anio: string;
    mes: string;
    numeropresupuesto: string;
}




export interface VoucherContableDetalle{
    orden: number;
  amarre: string;
  cuenta: string;
  ctaCbleDesc: string;
  concepto: string;
  ctactecod: string;
  ctaCteDesc: string;
  afecto: string;
  moneda: string;
  tipoDocumento: string;
  tipDocDes: string;
  numDoc: string;
  fechaDoc: string;
  fechaVencimiento: string;
  tipoCambio: number;
  importeDebe: number;
  importeHaber: number;
  importeDebeEquivalencia: number;
  importeHaberEquivalencia: number;
  cencos: string;
  cCostoDesc: string;
  cenGes: string;
  cGestionDesc: string;
  totalRecords: number;

  anio: string;
  mes: string;
  libro: string;
  numeroVoucher: string;
}


export interface VoucherContableCabecera{
    empresa:string;
    anio:string;
    mes:string;
    libro:string;
    numero:string;
    fecha:string;
    detalle:string;
    flag:string;
    asientotipo:string;
    transaccion:string;
    totalRecords:number;
}

export interface ObtenerCuentaHaby{
    ccm01cta: string;
    ccm01des: string;
    ccm01dn: string;
    ccm01ana: string;
    ccm01cc: string;
    ccm01cg: string;
}

export interface ObtenerCuentaCorriente{
    ccm02emp: string,
    ccm02tipana: string,
    ccm02cod: string,
    ccm02nom: string,
    ccm02dir: string
}

export interface obtenerTipoDocumento{
    ccb02cod: string,
    ccb02des: string
}

export interface DatosSeleccionados{
    anio: string,
    mes: string,
    libro: string,
    voucher: string,
    nroOrden: number
}

export interface ObtenerInformacion{
    codigoEmpresa: string,
    orden: string,
    cuenta: string,
    comprobante: string,
    glosa: string,
    cencos: string,
    cenges: string,
    codigoMaquina: string,
    codigotrabajoCurs: string,
    cuentaCorriente: string,
    tipoDocumento: string,
    numDoc: string,
    fechaDoc: string,
    anioDua: string,
    fechaVcimiento: string,
    fechaRetencion: string,
    nroPago: string,
    docModTipo: string,
    docModNumero: string,
    docModFecha: string,
    afecto: string,
    moneda: string,
    tipoCambio: number,
    importeDebe: number,
    importeHaber: number,
    importeDebeEquivalencia: number,
    importeHaberEquivalencia: number
}


export interface InfoVoucherCompleto {
    codigoEmpresa?: string;
    anio?: string;
    mes?: string;
    libro?: string;
    numeroVoucher?: string;
    cuenta?: string;
    importeDebe?: number;
    importeHaber?: number;
    glosa?: string;
    tipoDocumento?: string;
    numDoc?: string;
    fechaDoc?: string;
    fechaVencimiento?: string;
    cuentaCorriente?: string;
    moneda?: string;
    tipoCambio?: number;
    afecto?: string;
    cenCos?: string;
    cenGes?: string;
    asientoTipo?: string;
    valida?: string;
    fechaVoucher?: string;
    amarre?: string;
    importeDebeEquivalencia?: number;
    importeHaberEquivalencia?: number;
    transa?: string;
    orden?: number;
    nroPago?: string;
    fechaPago?: string;
    porcentaje?: string;
    docModTipo?: string;
    docModNumero?: string;
    docModFecha?: string;
}


//service

export interface MedioPago {
    ban01Empresa: string;
    ban01IdTipoPago: string;
    ban01Descripcion: string;
    ban01CtaBanBancoCod:string;
}


