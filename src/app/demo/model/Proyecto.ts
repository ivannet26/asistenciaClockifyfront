export interface Proyecto {
  id?: number;
  nombre: string;
  clienteId?: number;
  color: string;
  publico: boolean;
  progreso: number;
  activo: boolean;
  fcreacion: Date ;
}

export const PROYECTO_SIN_PROYECTO: Proyecto = {
  id: 0,
  nombre: 'Sin Proyecto',
  clienteId: 0,
  color: '#9E9E9E',
  publico: true,
  progreso: 0,
  activo: true,
  fcreacion: new Date()
};