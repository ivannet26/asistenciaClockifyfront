import { Miembros } from "./Miembro";

export interface Grupo {
    id: number;
    nombre: string;
    miembros?: Miembros[];
    miembrosIds?: number[];
}