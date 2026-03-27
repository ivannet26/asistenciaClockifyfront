import { Component, OnInit } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { PanelModule } from 'primeng/panel';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { MessageService } from 'primeng/api';

import { GlobalService } from 'src/app/demo/service/global.service';
import { BreadcrumbService } from 'src/app/demo/service/breadcrumb.service';

import { verMensajeInformativo } from '../../utilities/funciones_utilitarias';
import { Router } from '@angular/router';
import { Detallepresupuesto } from 'src/app/demo/model/presupuesto';
import { PresupuestoService } from 'src/app/demo/service/presupuesto.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-retencion-detalle-presupuesto',
  standalone: true,
  imports: [PanelModule,BreadcrumbModule,
      TableModule,ButtonModule,InputTextModule, CommonModule],
  templateUrl: './retencion-detalle-presupuesto.component.html',
  styleUrl: './retencion-detalle-presupuesto.component.css',
  providers:[MessageService]
})
export class RetencionDetallePresupuestoComponent implements OnInit {
  detallePresupuesto: Detallepresupuesto[] = [];
  items : any[] = [];
  load:boolean = false;
  navigationData: any;
    groupTotals: any[] = [];
  pagonro:string;
  fechaString:string;
  medio:string;
  motivo:string;
  bancoCodMedioPago:string;
    constructor(private globalService: GlobalService,
                private breadcrumbService: BreadcrumbService,
                private messageService: MessageService, 
                private router:Router, 
                private presupuestoService:PresupuestoService)
    {
      const navigation = router.getCurrentNavigation();
 
        if(navigation?.extras?.state){
          
      
          this.navigationData = navigation.extras.state; 
              
        }

    }

     ngOnInit(): void {
       this.breadcrumbService.setBreadcrumbs([
        {icon:'pi pi-home', routerLink:'/Home'},
        {label:'Pago retencion', routerLink:'/Home/pago_retencion'},
        {label:'Retencion presupuedo detalle', routerLink:'/Home/retencion-presupuesto-detalle'},
        
       ]);
       this.breadcrumbService.currentBreadcrumbs$.subscribe(bc =>{
          this.items = bc;
       });
       this.cargarCabecera();
       this.cargarDetalle();
     }

      formatearNumero(numero: number): string 
        {
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
       this.pagonro = this.navigationData?.pagonro || '';
        this.fechaString = this.navigationData?.fecha;
        this.motivo = this.navigationData?.motivo || '';
        
        this.medio = this.navigationData?.nombreMedioPago || '';
        
        this.bancoCodMedioPago = this.navigationData?.bancoCodMedioPago;
      }
      cargarDetalle():void{
          this.load = true;
        console.log(this.navigationData.pagonro);
          this.presupuestoService
              .obtenerDetallePresupuesto(
                  this.globalService.getCodigoEmpresa(),
                  this.navigationData?.pagonro 
              )
              .subscribe({
                  next: (data) => {
                    
                      this.detallePresupuesto = data;
                      
                      if (data.length === 0) {
                          //verMensajeInformativo(
                          //    this.messageService,
                          //    'warn',
                          //    'Advertencia',
                          //    'No se encontraron detalles del presupuesto'
                          //);
                          this.load = false;
                      } else {
                          this.load = false;
                      }
                  },
                  error: (error) => {
                      verMensajeInformativo(
                          this.messageService,
                          'error',
                          'Error',
                          `Error al cargar presupuesto: ${error.message}`
                      );
                  },
              });
      }
       calculateGroupTotals() {
        const groupedTotals = this.detallePresupuesto.reduce((acc, item) => {
            if (!acc[item.ban02Ruc]) {
                acc[item.ban02Ruc] = {
                    ruc: item.ban02Ruc,
                    razonsocial: item.razonsocial,
                    totalSoles: 0,
                    totalDolares: 0,
                    totalMontoPagarSoles: 0,
                    totalMontoPagarDolares: 0,
                    totalImporte: 0,
                    totalRetencion: 0,
                    totalPercepcion: 0,
                    totalNetoPagarSoles: 0,
                    totalNetoPagarDolares: 0,
                };
            }
            acc[item.ban02Ruc].totalSoles += item.ban02Soles || 0;
            acc[item.ban02Ruc].totalDolares += item.ban02Dolares || 0;
            acc[item.ban02Ruc].totalMontoPagarSoles += item.ban02PagoSoles || 0;
            acc[item.ban02Ruc].totalMontoPagarDolares +=
                item.ban02PagoDolares || 0;
            acc[item.ban02Ruc].totalImporte +=
                item.importeDetraccion || 0;
            acc[item.ban02Ruc].totalRetencion +=
                item.ban02ImporteRetencionSoles || 0;
            acc[item.ban02Ruc].totalPercepcion +=
                item.ban02ImporteSolesPercepcion || 0;
            acc[item.ban02Ruc].totalNetoPagarSoles += item.ban02SolesNeto || 0;
            acc[item.ban02Ruc].totalNetoPagarDolares +=
                item.ban02DolaresNeto || 0;

            return acc;
        }, {});

        this.groupTotals = Object.values(groupedTotals);
    }


    getTotalColumn(field: string): number {
      
        return this.detallePresupuesto.reduce((total, item) => {
            const value = item[field as keyof Detallepresupuesto];
            return total + (typeof value === 'number' ? value : 0);
        }, 0);
    }

// También puedes agregar este método para obtener totales por grupos si lo necesitas
calculateGroupTotal(ruc: string, field: string): number {
    return this.detallePresupuesto
        .filter(item => item.ban02Ruc === ruc)
        .reduce((total, item) => {
            const value = item[field as keyof Detallepresupuesto];
            return total + (typeof value === 'number' ? value : 0);
        }, 0);
}

      


}

