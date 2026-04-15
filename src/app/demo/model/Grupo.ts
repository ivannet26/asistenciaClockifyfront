import { Miembros } from "./Miembro";

export interface Grupo {
    id: number;
    nombre: string;
    //espaciotrabajoId: number;
    miembros?: Miembros[];
    miembrosIds?: number[];
}