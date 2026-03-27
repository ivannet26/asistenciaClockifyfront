import { Component } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { PanelModule } from 'primeng/panel';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { MessageService } from 'primeng/api';
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
  selector: 'app-detraccion-masiva-presupuesto-det',
  standalone: true,
  imports: [PanelModule,BreadcrumbModule,
      TableModule,ButtonModule,InputTextModule, CommonModule],
  templateUrl: './detraccion-masiva-presupuesto-det.component.html',
  styleUrl: './detraccion-masiva-presupuesto-det.component.css',
  providers:[MessageService]
})
export class DetraccionMasivaPresupuestoDetComponent {

  listaDetraccionDet: DetraccionMasivaDetalle [] = [];
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

   groupTotals: any[] = [];
constructor(private detraccionService:DetraccionService, 
  private globalService:GlobalService, 
  private messageService:MessageService,
private breadCrumbService:BreadcrumbService, 
private router:Router, private presupuestoservice:PresupuestoService)
{
  const navigation = router.getCurrentNavigation();
  if(navigation?.extras?.state){
    
      this.navigationData = navigation.extras.state;
  }else{
    //this.router.navigate(['/Home/Detraccion']);
  }
}


 ngOnInit():void{

    this.breadCrumbService.setBreadcrumbs([
      {icon:'pi pi-home', routerLink:'/Home/Detraccion'},
      {label:'Detraccion masiva', routerLink:'/Home/detraccion_masiva'},
      {label:'Detraccion masiva presupuesto detalle', routerLink:'/Home/detraccion_masiva_presupuesto_det'}
    ]);
    this.breadCrumbService.currentBreadcrumbs$.subscribe(bc=>{
      this.items = bc;
    });
    console.log("ng On Init");
    this.cargar();
    this.valoresCampos();
  } 

  cargar():void{

   this.load = true;

        this.presupuestoservice
            .obtenerDetallePresupuesto(
                this.globalService.getCodigoEmpresa(),
                this.navigationData.pagnro
            )
            .subscribe({
                next: (data) => {
                    this.DetallePago = data;
                    console.log("datos de obtener detalle presuupuesto");
                    console.log(this.DetallePago);
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

   valoresCampos() {
        this.pagnro = this.navigationData?.pagnro || '';
        this.fechaString = this.navigationData?.fecha;

        // if (this.fechaString) {
            // this.fecha = this.fechaString;
            //const [day, month, year] = this.fechaString.split('/').map(Number);
        //     //this.fecha = new Date(year, month - 1, day); // Mes comienza desde 0
        // } else {
        //     this.fecha = null; // O un valor predeterminado
        // }

        this.motivo = this.navigationData?.motivo || '';
        
        this.medio = this.navigationData?.nombreMedioPago || '';
        console.log("valor de medio pago desde navigationData. "+ this.navigationData?.BancoCodMedioPago); 
        this.bancoCodMedioPago = this.navigationData?.bancoCodMedioPago;
    }

    calculateGroupTotals() {
        const groupedTotals = this.DetallePago.reduce((acc, item) => {
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
        return this.DetallePago.reduce((total, item) => {
            const value = item[field as keyof Detallepresupuesto];
            return total + (typeof value === 'number' ? value : 0);
        }, 0);
    }

// También puedes agregar este método para obtener totales por grupos si lo necesitas
calculateGroupTotal(ruc: string, field: string): number {
    return this.DetallePago
        .filter(item => item.ban02Ruc === ruc)
        .reduce((total, item) => {
            const value = item[field as keyof Detallepresupuesto];
            return total + (typeof value === 'number' ? value : 0);
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
