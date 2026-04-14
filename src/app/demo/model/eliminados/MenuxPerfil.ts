//import { PermisosxPerfil } from "./permisosxperfil";

export interface MenuxPerfil{


message: string;
  messageException: string | null;
  isSuccess: boolean;
  item: any | null;
  //data: PermisosxPerfil[]; // O un tipo más específico si conoces la estructura de 'data'
  total: number;
  mensajeRetorno: string | null;
  flagRetorno: number;

}
