export interface DetraccionIndividual{
    ban01numero: string;
    ban01empresa: string;
    ban01anio: string;
    ban01mes: string;
    ban01descripcion: string;
    ban01fecha: string;
    ban02ruc: string;
    ban02tipodoc: string;
    ban02nrodoc: string;
    co05moneda: string;
    co05fecha: string;
    co05fecven: string;
    importebrutosoles: number;
    importebrutodolares: number;
    ban02tipodetraccion: string;
    ban02tasadetraccion: string;
    
    pagodetracionsoles: number;
    pagodetraciondolares: number;
    nombreproveedor:string;
    nombreMedioPago:string;
    estadopresupuesto:string;
    fechaejecucionpago:string;
    nrooperacion:string;
    
}
export interface DetraccionIndividualDocPen{
    clave:string;
    ruc:string;
    razonsocial:string;
    codigotipodoc:string;
    nombretipodoc:string;
    numerodocumento:string;
    monedaoriginal:string;
    origsoles:number;
    origdolares:number;
    fechaemision:Date;
    afectodetraccion:string;
    detratiposervicio:string;
    detraporcentaje:string;
    detraimpsol:number;
    detraimpdol:number;
}

export interface DocPendienteDetra{
        clave: string;
        ruc:string;
        razonsocial:string;
        codigotipodoc:string;
        nombretipodoc:string;
        numerodocumento:string;
        monedaoriginal:string;
        origsoles:number;
        origdolares:number;
        fechaemision:string;
        afectodetraccion:string;
        detratiposervicion:string;
        detraporcentaje:number;
        detraimpsol:number;
        detraimpdol:number;
}

export interface DetraccionIndividualRequest{
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
    ban02ruc:string;
    ban02tipodoc:string;
    ban02nrodoc:string;
    ban02tipodetraccion:string;
    ban02tasadetraccion:string;
    ban02importedetraccionsoles:number;
    ban02importedetracciondolares:number;
    numerooperacion:string;
    enlacepago:string;
    nombrearchivo:string;
    contenidoarchivo:string;
        flagoperacion:string;
        
}
/*

public string ban01empresa { get; set; }
public string ban01anio { get; set; }
public string ban01mes { get; set; }
public string ban01descripcion { get; set; }
public string ban01fecha { get; set; }
public string ban01estado { get; set; }
public string ban01usuario { get; set; }
public string ban01pc { get; set; }
public string ban01fecharegistro { get; set; }
public string ban01mediopago { get; set; }

public string ban01motivopagocod { get; set; }

public string ban02ruc { get; set; }
public string ban02tipodoc { get; set; }
public string ban02nrodoc { get; set; }

public string ban02tipodetraccion { get; set; }
public double ban02tasadetraccion { get; set; }
public double ban02importedetraccionsoles { get; set; }
public double ban02importedetracciondolares { get; set; }

public string numerooperacion { get; set; }
public string enlacepago { get; set; }
public string nombreArchivo { get; set; }      
public byte[] contenidoArchivo { get; set; }
public string flagOperacion { get; set; }
  
*/ 
