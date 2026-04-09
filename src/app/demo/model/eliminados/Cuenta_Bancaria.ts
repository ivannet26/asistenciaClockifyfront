export interface insertCuenta_Bancaria {
    ban01Empresa: string;
    ban01IdBanco: string;
    ban01IdCuenta: string;
    ban01IdNro?: string;
    ban01Moneda?:string;
    ban01Descripcion?:string;
    ban01CuentaContable?:string;
    ban01Itf?: string;
    ban01Prefijo?: string;
    ban01CtaDet?: string;
}
export interface Cuenta_Bancaria{
    idEmpresa: string;
    idBanco: string;
    id: string;
    idCuenta: string;
    nombreBanco: string;
    moneda: string;
    nombreCuentaBancaria: string;
    ctaContable: string;
    ctaITF: string;
    pref: string;
    ctaGastos: string;
}
export interface updCuenta_Bancaria{
        ban01Empresa: string,
        ban01IdBanco: string,
        ban01IdCuenta: string,
        ban01IdNro: string,
        ban01Moneda: string,
        ban01Descripcion: string,
        // ban01CuentaContable: string,
        // ban01Itf: string,
        // ban01Prefijo: string,
        // ban01CtaDet: string
  
}
export interface delCuenta_Bancaria{
    codigoempresa: string,
    idbanco: string,
    idnro: string,
}
