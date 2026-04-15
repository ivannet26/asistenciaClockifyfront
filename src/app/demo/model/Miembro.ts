
export enum RolNombre {
    OWNER = 'OWNER',
    ADMIN = 'ADMIN',
    USER = 'USER',
    SUPERVISOR = 'SUPERVISOR'
}

export interface Miembros {
    id: number;
    nombre: string;
    correo: string;
    contrasena: string;
    rol?: RolNombre | null;
    //espaciotrabajoId: number;
    grupoIds?: number[];
    activo: boolean;
}