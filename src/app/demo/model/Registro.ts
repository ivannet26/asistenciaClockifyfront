import { Proyecto } from './Proyecto'; 

export interface Registro {
  id?: number;
  descripcion: string;
  proyecto: Proyecto | null; 
  miembroId: number;
  miembroNombre: string;
  inicio: Date;
  fin: Date;
  duracion: string;
  facturable: boolean;
  etiquetas?: string[];
}