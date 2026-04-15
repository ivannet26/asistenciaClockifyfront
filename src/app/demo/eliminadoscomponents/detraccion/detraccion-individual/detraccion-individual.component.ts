import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';

import { DetraccionService } from '../../../service/detraccion.service';
import { DetraccionIndividual,
  DetraccionIndividualDocPen, DetraccionIndividualRequest } from 'src/app/demo/model/DetraccionIndividual';
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
import { DetraccionIndividualAyudaComponent } from "../detraccion-individual-ayuda/detraccion-individual-ayuda.component";
import { PresupuestoService } from 'src/app/demo/service/presupuesto.service';
import { HttpResponse } from '@angular/common/http';
import { TagModule } from 'primeng/tag';


@Component({
  selector: 'app-detraccion-individual',
  standalone: true,
  imports: [ToastModule, TableModule,
    ReactiveFormsModule, CommonModule, CardModule,
    InputTextModule, PanelModule, BreadcrumbModule,
    ConfirmDialogModule, FormsModule, DropdownModule,
    ButtonModule, CheckboxModule, ConfirmarPagoComponent, DialogModule,
    DetraccionIndividualAyudaComponent, TagModule],
  templateUrl: './detraccion-individual.component.html',
  styleUrl: './detraccion-individual.component.css',
  providers:[MessageService,ConfirmationService ]
})
export class DetraccionIndividualComponent implements OnInit {
detraccionIndividualList: DetraccionIndividual[] = [];
rowsPerPage : number = 10;
 confirmarpagocomponente: ConfirmarPagoComponent;
 verConfirmarPago: boolean = false;
 selectedPagoNumero: string = '';
 presupuestoCabDetraccion: insert_presupuesto;
 selectedNumeroLote: string  = '';
 anioPeriodo: string = '';
 mesPeriodo:string = '';
loading: boolean = false;
displayAgregarModal:boolean = false;
selectedOption: any | null = null; // row selection
//item para breadcrumb
items: any[] = [];


 constructor(private detraccionService: DetraccionService,
    private bs:BreadcrumbService,
    private globalService:GlobalService,
    private router:Router, private messageService:MessageService,
    private presupuestoService:PresupuestoService, 
    private confirmationService:ConfirmationService
  )
  {

  }
    ngOnInit(): void {
      this.bs.setBreadcrumbs([
          {icon:'pi pi-home', routerLink:'/Home'},
          {label:'Detraccion individual', routerLink:'/Home/detraccion_individual'}
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
      let motivoPagoCod = '02'
      this.detraccionService.GetallDetraccionIndividual(codigoEmpresa,
        anio, mes,motivoPagoCod)
        .subscribe({
          next:(data) =>{
            this.detraccionIndividualList = data;
            this.loading = false;

          },
          error:(e) =>{
            this.loading = false;
             verMensajeInformativo(
                              this.messageService,
                              'error',
                              'Error',
                              'Error al cargar documentos por pago'
                          );
          }

        })
    }
    onCloseModal() {
        if (this.confirmarpagocomponente) {
            this.confirmarpagocomponente.limpiar();
        }
        // this.verConfirmarPago = false;
        this.displayAgregarModal = false;
        //this.cargarMedioPago();
        this.globalService.selectedDate$.subscribe((date) => {
            if (date) {
                const year = date.getFullYear().toString();
                const month = (date.getMonth() + 1).toString().padStart(2, '0');
                this.cargar(this.anioPeriodo, this.mesPeriodo);
            }
        });
    }

     confirmaPagoPresupuesto() : void{

      // this.verConfirmarPago = true;
      this.displayAgregarModal = true;

     }
     verDetalle(registro: DetraccionIndividual): void{
        const navigationExtras ={
          state:{
            presupuestoCod:registro.ban01numero,
            anio:registro.ban01anio,
            mes:registro.ban01mes,
            empresa:registro.ban01empresa,
            fecha:registro.ban01fecha,
            nombreMedioPago: registro.nombreMedioPago,
            motivo:registro.ban01descripcion
          }
        }
        console.log("datos detraccioon individaul seleccionado:" , navigationExtras);

        this.router.navigate(['Home/detraccion_individual_det'], navigationExtras);

     }
     //abrir el documento pdf
     abrirdocumento(registro:DetraccionIndividual): void{
       this.presupuestoService
                  .obtenerArchivo(
                      this.globalService.getCodigoEmpresa(),
                      this.anioPeriodo,
                      this.mesPeriodo,
                      registro.ban01numero
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

     convertToDate(dateString: string): Date | null {
        if (!dateString) return null;

        // Si la fecha está en formato dd/MM/yyyy
        const parts = dateString.split('/');
        if (parts.length === 3) {
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1; // Los meses en JS van de 0-11
            const year = parseInt(parts[2], 10);
            return new Date(year, month, day);
        }

        return null;
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
  eliminarPagoPresupuesto(registro:DetraccionIndividual):void{
    console.log("evneto eleminar presupesto");
    console.log("empresa, numero :",registro.ban01empresa, "|",registro.ban01numero);
    
    this.confirmationService.confirm({
            message: `¿Está seguro que desea eliminar el registro <b>${registro.ban01numero}</b>?`,
            header: 'Confirmar Eliminación',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí',
            rejectLabel: 'No',
            acceptButtonStyleClass: 'p-button-danger',
            rejectButtonStyleClass: 'p-button',
            accept: () => {
                this.detraccionService.SpEliminaPresuDetraIndividual(registro.ban01empresa, registro.ban01numero).subscribe({
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

    verVouchercontable(registro: DetraccionIndividual) {
              const navigationExtras = {
                  state: {
                      empresa: this.globalService.getCodigoEmpresa(),
                      PagoNro: registro.ban01numero,
                      menuOrigen: 'Detraccion individual',
                      rutaOrigen:'/Home/detraccion_individual'
               },
              };
              this.router.navigate(['Home/voucher_contable'], navigationExtras);
      }
}
