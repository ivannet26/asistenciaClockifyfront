import { CommonModule, DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import {ConfirmationService, MessageService, PrimeNGConfig} from 'primeng/api';
import { BreadcrumbService } from 'src/app/demo/service/breadcrumb.service';
import { GlobalService } from 'src/app/demo/service/global.service';
import { PresupuestoService } from 'src/app/demo/service/presupuesto.service';
import {agregar_Pago, insert_detalle, proveedores_lista,} from '../../../model/presupuesto';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ToastModule } from 'primeng/toast';
import { PanelModule } from 'primeng/panel';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import { calendario_traduccion } from 'src/app/shared/Calendarios';
import { InputTextModule } from 'primeng/inputtext';
import { verMensajeInformativo } from 'src/app/demo/components/utilities/funciones_utilitarias';
import { ConfigService } from 'src/app/demo/service/config.service';
import { DialogModule } from 'primeng/dialog';
import { DetraccionService } from 'src/app/demo/service/detraccion.service';
import { DetraccionIndividualDocPen } from 'src/app/demo/model/DetraccionIndividual';
import { DocPendienteDetra } from 'src/app/demo/model/DetraccionIndividual';
@Component({
  selector: 'app-detraccion-individual-ayuda',
  standalone: true,
  imports: [  FormsModule,
        ReactiveFormsModule,
        BreadcrumbModule,
        ToastModule,
        PanelModule,
        ConfirmDialogModule,
        TableModule,
        CommonModule,
        ButtonModule,
        RouterModule,
        CalendarModule,
        DropdownModule,
        InputTextModule,
      
         DialogModule],
  templateUrl: './detraccion-individual-ayuda.component.html',
  styleUrl: './detraccion-individual-ayuda.component.css',
  providers: [ConfirmationService, MessageService, DatePipe],
})
export class DetraccionIndividualAyudaComponent implements OnInit {

  loading: boolean = false;
  proveedores: proveedores_lista[] =[];
selectedItems:agregar_Pago[] = [];
ayudapago: agregar_Pago[] = [];
selectedPagoNumero: string = '';
selectedNumeroLote:string = '';
verConfirmarPago: boolean = false;
listaDocumentoPendiente : DetraccionIndividualDocPen[] = [];
listaDocendientedtra: DocPendienteDetra[] =[];
seleccionDetraIndividual:DetraccionIndividualDocPen = null;
selectedOption: proveedores_lista[] = []; // row selection multiple
filtroFRM: FormGroup;
constructor(private detraccionService: DetraccionService, 
  private config:ConfigService, 
  private globalService:GlobalService,
private mesageService: MessageService,
private presupuestoService: PresupuestoService,
private fb:FormBuilder){
  this.filtroFRM = fb.group ({
      ruc: [''],
      nrodoc: ['']
    });
  }
//cargar datos en dura:
  cargarDatosTablas(){
    let registro1  : agregar_Pago ={
      clave:'xxx',
      ruc:'',
      razonSocial:'',
      coditoTipoDoc:'',
      nombreTipoDOc:'',
      numeroDOcumento:'',
      monedaOriginal:'',
      soles:0,
      dolares:0,
      fechaEmision:'',
      fechaVencimiento:'',
      diasAtrazo:0,
      afectoDetraccion:'S',
      afectoRetencion:'N'

    }
    this.ayudapago.push(registro1);
  }
  onProveedorChallenge(event:any){

  }
  cargarProvedores(){
     const cod_empresa = this.globalService.getCodigoEmpresa();
        this.presupuestoService
            .obtenerProveedores(cod_empresa)
            .subscribe((data: proveedores_lista[]) => {
                this.proveedores = data;
                if (data.length > 0) {
                    // this.filtroFRM.patchValue({
                    //     ruc: data[0].ruc
                    // });
                    // Cargamos los datos iniciales
                    //this.cargarayudaparaagregarpago();
                }
            });
  }
  filtrar(){
  let ruc: string = '';
    let nroDoc:string = '';
    
    nroDoc = this.filtroFRM.get('nrodoc').value?? '';
    ruc = this.filtroFRM.get('ruc').value?? '';
    
    this.loading = true;
     this.detraccionService.GetAyudaDetraccionIndividual(this.globalService.getCodigoEmpresa(),
      ruc, nroDoc).subscribe({
        next:(data) => this.listaDocendientedtra = data,
        error:(error) => 
        {
          
           verMensajeInformativo(this.mesageService,'error', 'Error', 'Error al cargar bancos' + error);
        }
         
      });
      this.loading = false;
  }
  onAddSelected(){

  }
  onCancelSelection():void{

  }

  ngOnInit(): void {
    this.filtroFRM.reset();
      //this.cargarDatosTablas();
      this.cargarProvedores();
      this.cargarDocPendiente();
  }
  confirmarPagoPresupuesto(registro: DetraccionIndividualDocPen):void{
    this.seleccionDetraIndividual = registro;
    this.verConfirmarPago = true;
    
    
  }

  cargarDocPendiente() :void{
    let ruc: string = '';
    let nroDoc:string = '';
    
    
    this.loading = true;
     this.detraccionService.GetAyudaDetraccionIndividual(this.globalService.getCodigoEmpresa(),
      ruc, nroDoc).subscribe({
        next:(data) => this.listaDocendientedtra = data,
        error:(error) => 
        {
          
           verMensajeInformativo(this.mesageService,'error', 'Error', 'Error al cargar bancos' + error);
        }
         
      });
      this.loading = false;
  }
onCloseModal() {
        // if (this.confirmarpagocomponente) {
        //     this.confirmarpagocomponente.limpiar();
        // }
        this.verConfirmarPago = false;
        this.filtrar();
        // this.displayAgregarModal = false;
        //this.cargarMedioPago();
        // this.globalService.selectedDate$.subscribe((date) => {
        //     if (date) {
        //         const year = date.getFullYear().toString();
        //         const month = (date.getMonth() + 1).toString().padStart(2, '0');
        //         this.cargar(this.anioPeriodo, this.mesPeriodo);
        //     }
        // });
    }

  
}
