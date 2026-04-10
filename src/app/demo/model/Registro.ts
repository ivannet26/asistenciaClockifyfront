import { Proyecto } from './Proyecto'; 

export interface Registro {
  id?: number;
  descripcion: string;
  proyecto: Proyecto | null; 
  inicio: Date;
  fin: Date;
  duracion: string;
  facturable: boolean;
  etiquetas?: string[];
}