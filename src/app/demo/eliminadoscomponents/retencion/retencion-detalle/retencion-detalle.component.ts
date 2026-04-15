
import { Component, OnInit } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { PanelModule } from 'primeng/panel';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ConfirmationService, MessageService } from 'primeng/api';
import { GlobalService } from 'src/app/demo/service/global.service';
import { BreadcrumbService } from 'src/app/demo/service/breadcrumb.service';
import { verMensajeInformativo } from '../../utilities/funciones_utilitarias';
import { Router } from '@angular/router';
import { RetencionDet } from 'src/app/demo/model/retencion';
import { RetencionService } from 'src/app/demo/service/retencion.service';
import { CommonModule } from '@angular/common';
import { DropdownModule } from 'primeng/dropdown';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
@Component({
  selector: 'app-retencion-detalle',
  standalone: true,
  imports: [PanelModule,BreadcrumbModule,
      TableModule,ButtonModule,InputTextModule, CommonModule,
      FormsModule, ReactiveFormsModule,
    DropdownModule],
  templateUrl: './retencion-detalle.component.html',
  styleUrl: './retencion-detalle.component.css',
  providers:[MessageService, ConfirmationService]
})
export class RetencionDetalleComponent implements OnInit {
listaRetencionDet: RetencionDet[] = [];
load:boolean = false;
navigationdata:any;
anioPeriodo:string;
mesPeriodo:string;
rowsPerPage:number = 10;
items:any[] =[];
navigationData: any;
constructor(private globalService:GlobalService, 
  private breadCrumbService:BreadcrumbService, 
  private retencionSerice:RetencionService,
  private messageService:MessageService, 
  private router:Router){
  const navigation = router.getCurrentNavigation();
 
        if(navigation?.extras?.state){

          this.navigationData = navigation.extras.state; 
                    console.log("dato de nanvegacion  constructor detalle");
          console.log(this.navigationData);   
          this.anioPeriodo =  this.navigationData.anioRetencion;
          this.mesPeriodo = this.navigationData.mesRetencion;
          console.log("mes periodo");
          console.log(this.mesPeriodo);           
        }
}

  ngOnInit(): void {

     this.breadCrumbService.setBreadcrumbs([

      {
        icon:'pi pi-home',
        routerLink:'/Home'
      },
      {
        label:'Pago Retencion',
        routerLink:'/Home/pago_retencion'
      },
      {
        label:'Retencion detalle',
        routerLink:'/Home/retencion-detalle'
      }
    ]);
    this.breadCrumbService.currentBreadcrumbs$.subscribe(bc =>{
      this.items = bc;
    });
    this.anioPeriodo = this.navigationData.anioRetencion;
    this.mesPeriodo = this.navigationData.mesRetencion;
    this.cargar(this.anioPeriodo, this.mesPeriodo);
// this.globalService.selectedDate$.subscribe((date) =>{
//         if(date){
//           this.anioPeriodo = date.getFullYear().toString();
//           this.mesPeriodo = (date.getMonth()+1).toString().padStart(2,'0');
//           console.log("retencion selecicon periodo");
//           console.log(this.anioPeriodo);
//           console.log(this.mesPeriodo);
//           this.cargar(this.anioPeriodo, this.mesPeriodo);
//         }
//     });

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

  cargarCabecera():void{

  }
    
  cargar(anio:string, mes:string):void{
    this.retencionSerice.traeRetencionDetalle(this.globalService.getCodigoEmpresa(),
                        this.anioPeriodo, this.mesPeriodo)
                        .subscribe({
                          next:(data) =>{
                            this.listaRetencionDet = data;
                            this.load = false;
                            }, error:(error) =>{
                              verMensajeInformativo(this.messageService, 'Error', 'Error',
                              'Error al cargar detalle');
                            }
                        });
                        
  }

  getTotalColumn(field: string): number {
        
          return this.listaRetencionDet.reduce((total, item) => {
              const value = item[field as keyof RetencionDet];
              return total + (typeof value === 'number' ? value : 0);
          }, 0);
      }

}
