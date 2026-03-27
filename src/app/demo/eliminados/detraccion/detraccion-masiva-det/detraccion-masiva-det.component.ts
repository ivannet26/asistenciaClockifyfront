import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule,Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MessageService } from 'primeng/api';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PanelModule } from 'primeng/panel';
import { TableModule } from 'primeng/table';
import { BreadcrumbService } from 'src/app/demo/service/breadcrumb.service';
import { DetraccionService } from 'src/app/demo/service/detraccion.service';
import { GlobalService } from 'src/app/demo/service/global.service';
import { DetraccionMasivaDetalle } from 'src/app/demo/model/DetraccionMasivaDetalle';
import { verMensajeInformativo } from '../../utilities/funciones_utilitarias';
import { Router } from '@angular/router';
import { DropdownModule } from 'primeng/dropdown';
@Component({
  selector: 'app-detraccion-masiva-det',
  standalone: true,
  imports: [PanelModule,BreadcrumbModule,
    TableModule,ButtonModule,InputTextModule, 
    DropdownModule,CommonModule,FormsModule,ReactiveFormsModule],
  templateUrl: './detraccion-masiva-det.component.html',
  styleUrl: './detraccion-masiva-det.component.css',
  providers:[MessageService]
})
export class DetraccionMasivaDetComponent {

  listaDetraccionDet: DetraccionMasivaDetalle [] = [];
  items : any[] = [];
  loading:boolean = false;
  navigationData: any;
  rowsPerPage : number = 10;

constructor(private detraccionService:DetraccionService, 
  private globalService:GlobalService, 
  private messageService:MessageService,
private breadCrumbService:BreadcrumbService,
private router:Router)
{
const navigation = router.getCurrentNavigation();
  if(navigation?.extras?.state){
    console.log( "metodo constructor");
    console.log(navigation.extras.state);
      this.navigationData = navigation.extras.state;
  }else{
    //this.router.navigate(['/Home/Detraccion']);
  }
}


 formatearFecha(fechacadena:string): string {
   // 1. Crear un objeto Date a partir de la cadena de entrada
    const fecha = new Date(fechacadena);
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0'); // Los meses van de 0 a 11
    const anio = fecha.getFullYear();
    
    return `${dia}/${mes}/${anio}`;
}
formatearNumero(numero: number): string {
  if (numero === null || numero === undefined) {
    return '0.00';
  }
  
  // Convertir a número si es string
  const num = typeof numero === 'string' ? parseFloat(numero) : numero;
  
  // Formatear con 2 decimales y usar punto como separador decimal
  const numeroFormateado = num.toFixed(2);
  
  // Separar la parte entera y decimal
  const partes = numeroFormateado.split('.');
  const parteEntera = partes[0];
  const parteDecimal = partes[1];
  
  // Agregar comas para separar miles en la parte entera
  const parteEnteraConComas = parteEntera.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  
  // Retornar el número formateado
  return `${parteEnteraConComas}.${parteDecimal}`;
}
  ngOnInit():void{

    this.breadCrumbService.setBreadcrumbs([
      {icon:'pi pi-home', routerLink:'/Home'},
      {label:'Detraccion masiva detalle', 
        routerLink:'/Home/detraccion_masiva'},
        {label:'Ver detalle'}
    ]);
    this.breadCrumbService.currentBreadcrumbs$.subscribe(bc=>{
      this.items = bc;
    });
    this.cargar();
  } 

  cargar():void{
    
    
    this.loading = true;
    let codEmpresa = this.globalService.getCodigoEmpresa();
    let nroLote : string =this.navigationData.nroLote;
    console.log(this.navigationData.nroLote);
    this.detraccionService.GetallDetraccionDet(codEmpresa,this.navigationData.nroLote)
      .subscribe({
        next:(data) =>{
          this.listaDetraccionDet = data;
          this.loading = false;
          console.log("nro lote:" , nroLote);
          console.log("datos cargao de detraccion lista detalle");
          console.log(this.listaDetraccionDet);
        },
        error:(error) =>{
          verMensajeInformativo(this.messageService, 'Error', 'Error', 
            `Error al cargar detraccion detalle:${error.message}`
          );
          this.loading = false;
        }

      });
  }

  getTotalColumn(field: string): number {
          return this.listaDetraccionDet.reduce((total, item) => {
              const value = item[field as keyof DetraccionMasivaDetalle];
              return total + (typeof value === 'number' ? value : 0);
          }, 0);
      }



}
