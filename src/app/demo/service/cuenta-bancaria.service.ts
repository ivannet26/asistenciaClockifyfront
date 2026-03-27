import { insertCuenta_Bancaria, updCuenta_Bancaria } from '../model/Cuenta_Bancaria';
import { ApiResponse } from './../model/api_response';

import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, catchError, throwError } from 'rxjs';
import { Cuenta_Bancaria } from '../model/Cuenta_Bancaria';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class CuentaBancariaService {
   private http = inject(HttpClient);
      apiUrl: string = ''; //
      urlAPI: string = ''; //

  constructor(private httpClient: HttpClient, private configService: ConfigService)
  {

    this.apiUrl = configService.getApiUrl();
    this.urlAPI= `${this.apiUrl}/CtaBancaria`;

   }

  // método para listar
  GetCuentasBancarias(idBanco:string): Observable<Cuenta_Bancaria[]> {
    return this.http.get<ApiResponse<Cuenta_Bancaria>>(`${this.urlAPI}/SpList?idempresa=01&idbanco=${idBanco}`)
      .pipe(map(response => response.data));
  }
  // método para crear una nueva cuenta bancaria
  CreateCuentaBancaria(cuentaBancaria: insertCuenta_Bancaria): Observable<string> {
    return this.http.post<ApiResponse<string>>(`${this.urlAPI}/SpCreate`, cuentaBancaria)
      .pipe(
        map(response => response.item || ''),
        catchError(error => {
          console.error('Error al crear el usuario:', error);
          return throwError(() => new Error('No se pudo crear al usuario. Intente nuevamente.'));
        })
      );
  }
  UpdateCuentaBancaria(cuentaBancariaActualizar: updCuenta_Bancaria): Observable<string> {
    return this.http.put<ApiResponse<string>>(`${this.urlAPI}/SpUpdate`, cuentaBancariaActualizar)
      .pipe(map(response => response.item));
  }
  DeleteCuentaBancaria(idBanco:string, idnro: string): Observable<void> {
    return this.http.delete<void>(`${this.urlAPI}/SpDelete?codigoempresa=01&idbanco=${idBanco}&idnro=${idnro}`)
      .pipe(
        catchError((error) => {
          console.error('Error al eliminar el usuario:', error);
          return throwError(error);
        })
      );
  }
  //   CreateCuentaBancaria(cuentaBancaria: insertCuenta_Bancaria): Observable<insertCuenta_Bancaria>{
  //     return this.http.post<insertCuenta_Bancaria>(`${this.urlAPI}/SpCreate`);

  // }
  // GetCuentasBancarias():Observable<Cuenta_Bancaria[]>{
  //     return this.http.get<Cuenta_Bancaria[]>(`${this.urlAPI}/SpList?idempresa=01&idbanco=01`);
  // }

  // método para listar por una empresa idbanco e idcuenta
  // GetCuentaBancaria(empresa:string,idbanco:string,idcuenta:string):Observable<Cuenta_Bancaria>{
  //     return this.http.get<Cuenta_Bancaria>(`${this.urlAPI}/${empresa}/${idbanco}/${idcuenta}`);
  // }



  // // método para actualizar una cuenta bancaria
  // UpdateCuentaBancaria(empresa: string, idbanco:string, idcuenta:string, cuentaBancaria:Cuenta_Bancaria):Observable<Cuenta_Bancaria>{
  //     return this.http.put<Cuenta_Bancaria>(`${this.urlAPI}/${empresa}/${idbanco}/${idcuenta}`, cuentaBancaria);
  // }

  // // método para eliminar una cuenta bancaria
  // DeleteCuentaBancaria(empresa:string, idbanco:string, idcuenta:string):Observable<void>{
  //     return this.http.delete<void>(`${this.urlAPI}/${empresa}/${idbanco}/${idcuenta}`);
  // }

}
