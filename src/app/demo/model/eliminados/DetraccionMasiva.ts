export interface DetraccionMasiva{
  empresaCod :string; /*presupuesto */
  anio:string; /*presupuesto */
  mes:string; /*presupuesto */
 loteDetraccionNro:string;
 presupuestoCod:string; /*presupuesto */
 facturaImporteSol:string;
 detraccionImporteSoles:string;
 detraccionImporteDolares:string;
fecha:string;  /*presupuesto*/
motivo:string;  /*presupuesto, nombre del presupeusto*/
medio:string; /*presupuesto id*/
nombreMedioPago: string;
bancoCodMedioPago:string; /* id  banco por el cual se realizar medio pago*/
bancoMedioPago: string; //* nombre del banco  */
moneda:string;
estadopresupuesto:string;	
fechaejecucionpago:string;	
nrooperacion:string;

      }
export interface DetraccioMasivaDetalleRequest{
        ban01Empresa:string;
        ban01Anio: string;
        ban01mes: string;
        ban01Descripcion: string;
        ban01Fecha: string;
        ban01Estado: string;
        ban01Usuario: string;
        ban01Pc: string;
        ban01FechaRegistro: string;
        ban01MedioPago: string;
        detraccionLote: string;
        ban01motivopagoCod: string;
        numerooperacion: string;
        enlacePago: string;
        nombreArchivo: string;
        
        flagOperacion: string;
}
    
