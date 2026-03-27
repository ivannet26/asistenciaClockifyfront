import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DetraccionMasiva} from '../../../model/DetraccionMasiva';
import { DetraccionService } from '../../../service/detraccion.service';
import { ToastModule } from 'primeng/toast';
import { TableModule } from 'primeng/table';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule,Validators } from '@angular/forms';
import { CommonModule,DatePipe } from '@angular/common';
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
import { PresupuestoService } from 'src/app/demo/service/presupuesto.service';
import { ConfigService } from 'src/app/demo/service/config.service';
import { HttpResponse } from '@angular/common/http';
import { TagModule } from 'primeng/tag';
@Component({
  selector: 'app-detraccion-masiva',
  standalone: true,
  imports: [ToastModule,TableModule,
    ReactiveFormsModule, CommonModule, CardModule,
    InputTextModule,PanelModule,BreadcrumbModule 
    ,ConfirmDialogModule,FormsModule,DropdownModule
    ,ButtonModule,CheckboxModule, ConfirmarPagoComponent,
    DialogModule, TagModule ],
  templateUrl: './detraccion-masiva.component.html',
  styleUrl: './detraccion-masiva.component.css',
  providers:[MessageService, ConfirmationService,DatePipe]
})
export class DetraccionMasivaComponent implements OnInit {
detraccionMasivaList: DetraccionMasiva[] = [];
rowsPerPage : number = 10;
 confirmarpagocomponente: ConfirmarPagoComponent;
 verConfirmarPago: boolean = false;
 selectedPagoNumero: string = '';
 presupuestoCabDetraccion: insert_presupuesto;
 selectedNumeroLote: string  = '';
 anioPeriodo: string = '';
 mesPeriodo:string = '';
loading: boolean = false;
selectedOption: DetraccionMasiva[] = []; // row selection multiple
//item para breadcrumb
items: any[] = [];

  constructor(private detraccionMasivaService: DetraccionService,
    private bs:BreadcrumbService, 
    private globalService:GlobalService,
    private router:Router, private messageService:MessageService, 
    private presupuestoService: PresupuestoService,
    private datePipe:DatePipe,
    private confirmationService:ConfirmationService
  )
  {
    
  }
  ngOnInit(): void {
    this.bs.setBreadcrumbs([
      {icon:'pi pi-home', routerLink:'/Home'},
      {label:'Detraccion masiva', routerLink:'/Home/detraccionmasiva'}
    ]);

    this.bs.currentBreadcrumbs$.subscribe(bs=>{
      this.items = bs;
    })

    this.globalService.selectedDate$.subscribe((date) =>{
        if(date){
          this.anioPeriodo = date.getFullYear().toString();
          this.mesPeriodo = (date.getMonth()+1).toString().padStart(2,'0');
          
          this.cargar(this.anioPeriodo, this.mesPeriodo);
        }
    });
    
    

  }

  cargar(anio:string, mes:string):void{
    this.loading = true;
    const codigoEmpresa: string = this.globalService.getCodigoEmpresa();
    //let anio :string= '';
    //let mes :string = '';
    let motivoPagoCod = '03'
    // this.globalService.selectedDate$.subscribe((date)=>{
    //   anio = date.getFullYear().toString();
    //   mes = (date.getMonth()+1).toString().padStart(2,'0');
      
    // });
    this.detraccionMasivaService.GetAllDetraccion(codigoEmpresa,anio, mes,motivoPagoCod)
    .subscribe({
      next:(data) =>{
        this.detraccionMasivaList = data;
      this.loading = false;
        
      },
      error:(e) => {
         this.loading = false;
       verMensajeInformativo(
                              this.messageService,
                              'error',
                              'Error',
                              'Error al cargar documentos por pago'
                          );
      }
    });
   

  }

  verDetalle(detra: DetraccionMasiva ):void{

    

    if(detra.presupuestoCod != '00000' ){
      
      const navigationExtras = {
        state:{
                         
          nroLote: detra.loteDetraccionNro,
          presupuestoCod: detra.presupuestoCod,
          anio:detra.anio,
          mes:detra.mes,
          empresa:detra.empresaCod,
          pagnro:detra.presupuestoCod,
          fecha:detra.fecha,
          nombreMedioPago:  detra.nombreMedioPago,
          motivo:detra.motivo
          
        }
      }
      
      //abrir detraccion con formato de presupuesto 
    this.router.navigate(['Home/detraccion_masiva_presupuesto_det'],navigationExtras );
    } else{
      
      
      //abrir detracccion
      let navigationExtras={
        state:{
          nroLote:detra.loteDetraccionNro,
          empresa:detra.empresaCod,
          pagnro:detra.presupuestoCod,
          fecha:detra.fecha,
          nombreMedioPago:  detra.nombreMedioPago,
          motivo:detra.motivo
          
        }
        
      }
      this.router.navigate(['Home/detraccion_masiva_det'],navigationExtras);  
      
    }
  }

  eliminarPagoPresupuesto(presupuesto:DetraccionMasiva):void{
    this.confirmationService.confirm({
            message: `¿Está seguro que desea eliminar el registro <b>${presupuesto.presupuestoCod}</b>?`,
            header: 'Confirmar Eliminación',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí',
            rejectLabel: 'No',
            acceptButtonStyleClass: 'p-button-danger',
            rejectButtonStyleClass: 'p-button',
            accept: () => {
                this.detraccionMasivaService.SpEliminaPresuDetraIndividual(this.globalService.getCodigoEmpresa(),
                   presupuesto.presupuestoCod).subscribe({
                    next: () => {
                        
                        verMensajeInformativo(this.messageService, 'success', 'Éxito', 'Registro Eliminado');
                        this.cargar(this.anioPeriodo, this.mesPeriodo);
                    }, 
                    error:(error) =>{
                       verMensajeInformativo(this.messageService, 'error', 'Error', `Error al eliminar el presupuesto: ${error.message}`);
                    }
                })
            }
        });
  }

  confirmarPagoPresupuesto(registro:DetraccionMasiva):void{
    this.selectedPagoNumero = '0001';

    this.verConfirmarPago=true;
    
    this.selectedNumeroLote = registro.loteDetraccionNro;
    
  }
onCloseModal() {
        if (this.confirmarpagocomponente) {
            this.confirmarpagocomponente.limpiar();
        }
        this.verConfirmarPago = false;
        //this.cargarMedioPago();
        this.globalService.selectedDate$.subscribe((date) => {
            if (date) {
                const year = date.getFullYear().toString();
                const month = (date.getMonth() + 1).toString().padStart(2, '0');
                this.cargar(this.anioPeriodo, this.mesPeriodo);
            }
        });
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

    abrirdocumento(registro:DetraccionMasiva): void{
           this.presupuestoService
                      .obtenerArchivo(
                          this.globalService.getCodigoEmpresa(),
                          this.anioPeriodo,
                          this.mesPeriodo,
                          registro.presupuestoCod
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
         verVouchercontable(registro: DetraccionMasiva) {
                     const navigationExtras = {
                         state: {
                             empresa: this.globalService.getCodigoEmpresa(),
                             PagoNro: registro.presupuestoCod,
                             menuOrigen: 'Detraccion masiva',
                             rutaOrigen:'/Home/detraccion_masiva'
                      },
                     };
                     this.router.navigate(['Home/voucher_contable'], navigationExtras);
             }


}
