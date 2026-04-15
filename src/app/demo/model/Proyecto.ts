export interface Proyecto {
  id?: number;
  nombre: string;
  //espaciotrabajoId: number;
  clienteId?: number;
  color: string;
  publico: boolean;
  progreso: number;
  registrado: Date;
  activo: boolean;
}