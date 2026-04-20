
export enum RolNombre {
    OWNER = 'OWNER',
    ADMINISTRADOR = 'ADMINISTRADOR',
    EMPLEADO= 'EMPLEADO',
    GERENTE = 'GERENTE'
}

export interface Miembros {
    id: number;
    nombre: string;
    correo: string;
    contrasena: string;
    rol?: RolNombre | null;
    grupoIds?: number[];
    activo: boolean;
}