export interface Proyecto {
  id?: number;
  nombre: string;
  cliente?: string | null;
  color: string;
  publico: boolean;
  plantilla?: string | null;
}