export interface Usuario{
    codigo:string;
    nombreUsuario:string;
    claveUsuario:string;
    codigoperfil:string;
    nomPerfil: string;
}
export interface UsuarioCrear{
    codigo:string,
    cuentaCod:string,
    nombreUsuario:string,
    claveUsuario:string,
    codigoPerfil:string,
    codigoempresa:string
}
export interface ListarPerfil{
    codigo:string,
    nombre: string,
    descripcion: string
}