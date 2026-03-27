import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DetraccionMasiva} from '../../../model/DetraccionMasiva';
import { DetraccionService } from '../../../service/detraccion.service';
import { ToastModule } from 'primeng/toast';
import { TableModule } from 'primeng/table';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule,Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { PanelModule } from 'primeng/panel';
import { CardModule } from 'primeng/card';
import { ConfirmationService, Message, MessageService } from 'primeng/api';
import { BreadcrumbService } from '../../../service/breadcrumb.service';
import { GlobalService } from '../../../service/global.service';
import {Router} from '@angular/router';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CheckboxModule } from 'primeng/checkbox';
import { verMensajeInformativo } from '../../utilities/funciones_utilitarias';
import { ConfirmarPagoComponent } from '../../presupuesto/confirmar-pago/confirmar-pago.component';
import { DialogModule } from 'primeng/dialog';
import { insert_presupuesto } from '../../../model/presupuesto';
import { PagoRetencion } from '../../../model/Pago_Retencion';
import { RetencionService } from '../../../service/retencion.service';
import { Retencion, RetencionCab } from '../../../model/retencion';
import { PresupuestoService } from 'src/app/demo/service/presupuesto.service';
import { HttpResponse } from '@angular/common/http';
import { TagModule } from 'primeng/tag';
@Component({
  selector: 'app-pago-retencion',
  standalone: true,
  imports: [ToastModule,TableModule,
      ReactiveFormsModule, CommonModule, CardModule,
      InputTextModule,PanelModule,BreadcrumbModule
      ,ConfirmDialogModule,FormsModule,DropdownModule
      ,ButtonModule,CheckboxModule, ConfirmarPagoComponent,
      DialogModule, TagModule ],
  templateUrl: './pago-retencion.component.html',
  styleUrl: './pago-retencion.component.css',
  providers: [MessageService, ConfirmationService]

})
export class PagoRetencionComponent {
    //item para breadcrumb
    items: any[] = [];

    rowsPerPage : number = 10;
    loading: boolean = false;

    verConfirmarPago: boolean = false;
    confirmarpagocomponente: ConfirmarPagoComponent;
    selectedPagoNumero: string = '';
    selectedNumeroOperacion: string  = '';
    numeroLote:string = '';
    anioPeriodo: string = '';
    mesPeriodo:string = '';
    retencionCabLista: RetencionCab[] = [];

  

    constructor(
        private bs: BreadcrumbService,
        private globalService: GlobalService,
        private router: Router,
        private messageService: MessageService,
        private retencionService:RetencionService,
        private confirmationService:ConfirmationService,
        private presupuestoService:PresupuestoService

    ){

    }

    ngOnInit(){
        //Breadcrumb
        this.bs.setBreadcrumbs([
        {icon:'pi pi-home', routerLink:'/Home'},
        {label:'Pago retencion', routerLink:'/Home/pago_retencion'}
        ]);

        this.bs.currentBreadcrumbs$.subscribe(bs=>{
            this.items = bs;
        });

        this.globalService.selectedDate$.subscribe((date) =>{
            if(date){
                this.anioPeriodo = date.getFullYear().toString();
                this.mesPeriodo = (date.getMonth()+1).toString().padStart(2,'0');
                this.cargar();

            }
        });

    }
    cargar():void{
        this.loading = true;
        this.retencionService.traeRetencion(this.globalService.getCodigoEmpresa(),this.anioPeriodo, this.mesPeriodo)
        .subscribe({
            next:(data)=>{
                this.retencionCabLista = data;
                console.log("valor de retorno de pago retencion:" + data);
                
                this.loading = false;
            },
            error:(e)=>{
                this.loading= false;
                verMensajeInformativo(this.messageService,'error', 
                    'Error', 'Error al cargar');
            }
        });
    }

    verDetalle(retencion: RetencionCab):void {
        
     if(retencion.pagoNro !="00000"){
        const navigationExtras ={
            state:{
                    nroLote: retencion.retencionesMensualesNro,
                    anio:retencion.anio,
                    mes:retencion.mes,
                    empresa:retencion.empresaCod,
                    pagonro:retencion.pagoNro,
                    fecha:retencion.fecha,
                    nombreMedioPago:  retencion.pagoMedio,
                    motivo:retencion.pagoMotivo
          }
        }
        
        //detalle de presupuesto
        this.router.navigate(['Home/retencion-presupuesto-detalle'], navigationExtras);        
     }else{

         const navigationExtras ={
            state:{
                    anioRetencion: retencion.anio,
                    mesRetencion:retencion.mes
                
          }
        }
        //detalle de retencion sin presupuesto
        this.router.navigate(['Home/retencion-detalle'],navigationExtras);
     }
        
    }

    confirmarPagoPresupuesto(registro:RetencionCab):void{
        
        //this.selectedPagoNumero = '0001';
        this.selectedNumeroOperacion = registro.retencionesMensualesNro;
        this.verConfirmarPago=true;
         //this.numeroLote =  registro.retencionesMensualesNro;
        
        
    }


    onCloseModal(){
        if (this.confirmarpagocomponente) {
            this.confirmarpagocomponente.limpiar();
        }
        this.verConfirmarPago = false;
        //this.cargarMedioPago();
        this.globalService.selectedDate$.subscribe((date) => {
            if (date) {
                const year = date.getFullYear().toString();
                const month = (date.getMonth() + 1).toString().padStart(2, '0');
                this.cargar();
            }
        });
    }


    //Función para formatear los numeros mayores a 1000
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

    eliminarPagoPresupuesto(registro:RetencionCab){
        this.confirmationService.confirm({
            message: `¿Está seguro que desea eliminar el registro <b>${registro.pagoNro}</b>?`,
            header: 'Confirmar Eliminación',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí',
            rejectLabel: 'No',
            acceptButtonStyleClass: 'p-button-danger',
            rejectButtonStyleClass: 'p-button',
            accept: () => {
                
                this.retencionService.deleteRetencion(this.globalService.getCodigoEmpresa(), registro.pagoNro).subscribe({
                    next: () => {
                        
                        verMensajeInformativo(this.messageService, 'success', 'Éxito', 'Registro Eliminado');
                        this.cargar();
                    }, 
                    error:(error) =>{
                       verMensajeInformativo(this.messageService, 'error', 'Error', `Error al eliminar el presupuesto: ${error.message}`);
                    }
                })
            }
        });
    }

    abrirdocumento(registro:RetencionCab): void{
               this.presupuestoService
                          .obtenerArchivo(
                              this.globalService.getCodigoEmpresa(),
                              this.anioPeriodo,
                              this.mesPeriodo,
                              registro.pagoNro
                          )
                          .subscribe({
                              next: (response: HttpResponse<Blob>) => {
                                  const blob = response.body;
                                  if (blob) {
                                      const url = window.URL.createObjectURL(blob);
                                      window.open(url, '_blank');
                                  } else {
                                      verMensajeInformativo(
                                          this.messageService,
                                          'error',
                                          'Error',
                                          'No se encontró el documento'
                                      );
                                  }
                              },
                              error: (err) => {
                                  console.error('Error al obtener el documento: ', err);
                              },
                          });
    }

    verVouchercontable(registro: RetencionCab) {
            const navigationExtras = {
                state: {
                    empresa: this.globalService.getCodigoEmpresa(),
                    PagoNro: registro.pagoNro,
                    menuOrigen: 'Pago retencion',
                    rutaOrigen:'/Home/pago_retencion'
             },
            };
            this.router.navigate(['Home/voucher_contable'], navigationExtras);
    }

}
