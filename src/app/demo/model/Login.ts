export interface Usuario {
    Sistema: string | null;           // NULL, máximo 10 caracteres
    Nombre: string;            // máximo 8 caracteres
    Clave: string;     // máximo 8 caracteres
    NombreComp?: string | null; // NULL, máximo 40 caracteres
    Cargo?: string | null;     // NULL, máximo 20 caracteres
    AccPerCerr?: string | null; // NULL, 1 carácter
    Periodo?: string | null;   // NULL, máximo 8 caracteres
    Moneda?: string | null;    // NULL, 1 carácter
    Saldos?: string | null;    // NULL, 1 carácter
    TipoImp?: string | null;   // NULL, 1 carácter
    Ajuste?: string | null;    // NULL, 1 carácter
    AccPerCon?: string | null; // NULL, 1 carácter
    VarImpChe?: string | null; // NULL, 1 carácter
    CenCosto?: string | null;  // NULL, máximo 12 caracteres
    Tipo?: string | null;      // NULL, máximo 2 caracteres
    AccArea?: string | null;   // NULL, máximo 10 caracteres
  }

export interface EmpresasxModulo{
    codigomodulo: string;
    nombre: string;
    empresaCod: string;
    razonSocial: string;
    ruc: string;
    direccion: string;
}

export interface Login{
    nombrestring;
    contrasena:string;
    //codigoempresa:string;
    //codigoPerfil:string;
}