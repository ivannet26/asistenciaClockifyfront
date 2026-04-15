import { Component, OnInit } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { PanelModule } from 'primeng/panel';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DetraccionService } from 'src/app/demo/service/detraccion.service';
import { GlobalService } from 'src/app/demo/service/global.service';
import { BreadcrumbService } from 'src/app/demo/service/breadcrumb.service';
import { DetraccionMasivaDetalle } from 'src/app/demo/model/DetraccionMasivaDetalle';
import { verMensajeInformativo } from '../../utilities/funciones_utilitarias';
import { Router } from '@angular/router';
import { Detallepresupuesto } from 'src/app/demo/model/presupuesto';
import { PresupuestoService } from 'src/app/demo/service/presupuesto.service';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-detraccion-individual-det',
  standalone: true,
    imports: [PanelModule,BreadcrumbModule,
      TableModule,ButtonModule,InputTextModule, CommonModule],

  templateUrl: './detraccion-individual-det.component.html',
  styleUrl: './detraccion-individual-det.component.css',
  providers:[MessageService, ConfirmationService]
})
export class DetraccionIndividualDetComponent implements OnInit {
 items : any[] = [];
  load:boolean = false;
  navigationData: any;
  DetallePago: Detallepresupuesto[] = [];

  pagnro: string;
  fechaString: string;
  fecha: Date;
  motivo: string;
  medio: string;
  bancoCodMedioPago:string;

constructor(private globalService:GlobalService,
  private messageService:MessageService,
private breadCrumbService:BreadcrumbService,
private router:Router, private presupuestoservice:PresupuestoService)
{
  const navigation = router.getCurrentNavigation();
  this.navigationData = navigation.extras.state;
}

  ngOnInit(): void {
    this.breadCrumbService.setBreadcrumbs([

      {icon:'pi pi-home',routerLink:'/Home/detraccion_individual'},
      {label:'Detraccion individual',routerLink:'/Home/detraccion_individual'},
      {label:'Detraccion individual  detalle',routerLink:'/Home/detraccion_individual_det'}
    ]);
    this.breadCrumbService.currentBreadcrumbs$.subscribe(bc =>{
      this.items = bc;
    });

    this.valoresCampos();
    this.cargar();
  }

getTotalColumn(field: string): number {
        return this.DetallePago.reduce((total, item) => {
            const value = item[field as keyof Detallepresupuesto];
            return total + (typeof value === 'number' ? value : 0);
        }, 0);
    }
  cargar():void{
    this.load = true;
    
    this.presupuestoservice.obtenerDetallePresupuesto(
      this.globalService.getCodigoEmpresa(),
      this.navigationData.presupuestoCod
    )
    .subscribe({
      next:(data) =>{
        this.DetallePago = data;
        this.load = false;
      }, error:(error) =>{
        verMensajeInformativo(this.messageService, 'error',
                        'Error',
                        `Error al cargar presupuesto:
                        ${error.message}`);
      }
    });
  }

  valoresCampos():void{
      this.pagnro =  this.navigationData?.presupuestoCod || '';
    this.fechaString = this.navigationData.fecha;
    this.motivo = this.navigationData?.motivo || '';
    this.medio = this.navigationData?.nombreMedioPago || '';
    this.bancoCodMedioPago = '';
  }
  calculateTotal(field: string): number {
  return this.DetallePago.reduce((total, item) => {
    const value = item[field] || 0;
    return total + (typeof value === 'number' ? value : parseFloat(value) || 0);
  }, 0);
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


}
