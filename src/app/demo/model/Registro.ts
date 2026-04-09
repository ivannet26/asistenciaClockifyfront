import { Proyecto } from './Proyecto';
export interface Registro {
    descripcion: string;
    proyecto: Proyecto | null;
    inicio: Date;
    fin: Date;
    duracion: string;
    facturable: boolean;
}