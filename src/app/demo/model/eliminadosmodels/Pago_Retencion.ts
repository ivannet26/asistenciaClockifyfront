export interface PagoRetencion{
    pagoNro: string,
    fecha: string,
    motivo: string,
    medioPago?: string,
    importeFactura: number,
    importeRetencion: number,
    operacionNro?: string
}
