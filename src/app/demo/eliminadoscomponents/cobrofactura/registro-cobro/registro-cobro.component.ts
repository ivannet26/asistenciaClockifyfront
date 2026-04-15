import { Component, OnInit, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { PanelModule } from 'primeng/panel';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { CommonModule, DatePipe } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { InputTextModule } from 'primeng/inputtext';
import { GlobalService } from 'src/app/demo/service/global.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClienteconFactura, RegistroCobro } from 'src/app/demo/model/CuentaxCobrar';
import { mediopago_lista } from 'src/app/demo/model/presupuesto';
import { BreadcrumbService } from 'src/app/demo/service/breadcrumb.service';
import { ConfigService } from 'src/app/demo/service/config.service';
import { CobroFacturaService } from 'src/app/demo/service/cobrofactura.service';
import { verMensajeInformativo } from '../../utilities/funciones_utilitarias';
import { TraeRegistroCobro } from 'src/app/demo/model/CuentaxCobrar';
import { NgIf } from '@angular/common';
import { PresupuestoService } from 'src/app/demo/service/presupuesto.service';
import { proveedores_lista } from 'src/app/demo/model/presupuesto';

@Component({
  selector: 'app-registro-cobro',
  standalone: true,
  imports: [ConfirmDialogModule, ToastModule,
    CalendarModule,InputTextModule, DropdownModule,
  TableModule, FormsModule, ReactiveFormsModule,
  RouterModule,BreadcrumbModule,PanelModule, NgIf],
  templateUrl: './registro-cobro.component.html',
  styleUrl: './registro-cobro.component.css',
  providers:[ConfirmationService, MessageService, DatePipe]
})
export class RegistroCobroComponent implements OnInit{

  items: any[] = [];
  prueba!: any[];
  anioFecha: string = '';
  mesFecha: string = '';
  listaRegistroCobro: TraeRegistroCobro[] = [];
  loading: boolean = false;
  mostrarNuevaFila: boolean = false;
  botonesDeshabilitados: boolean = false;
  medioPagoLista: mediopago_lista[] = [];
  selectMedioPago: string | null = null;
  rowsPerPage: number = 10; // Numero de filas por página
  monedaOpciones : any[] = [];
  proveedores: proveedores_lista[];
  selectCliente:string | null =null;
  listaClientes:ClienteconFactura[] =[];
  selectedOption: proveedores_lista[] = []; // row selection multiple

 nuevoFormulario: RegistroCobro ={
    ban03Empresa : '',
    ban03Anio: '',
    ban03Mes: '',
    ban03Numero: '',
    ban03clientetipoanalisis: '01',
    ban03clienteruc: '',
    ban03Importe:0,
    ban03moneda: '',
    ban03FechaDeposito: '',
    ban03MedioPago: '',
    ban03Motivo: '',
    ban03VoucherLibroCod:'',
    ban03VoucherNumero:'',
  };
  
  editaFormulario:RegistroCobro ={
    ban03Empresa : '',
    ban03Anio: '',
    ban03Mes: '',
    ban03Numero: '',
    ban03clientetipoanalisis: '',
    ban03clienteruc: '',
    ban03Importe:0,
    ban03moneda: '',
    ban03FechaDeposito: '',
    ban03MedioPago: '',
    ban03Motivo: '',
    ban03VoucherLibroCod:'',
    ban03VoucherNumero:'',
  }

   iniciarNuevoRegistro():void{
    
    this.mostrarNuevaFila = true;
    this.botonesDeshabilitados = true;
    let  fechaActual = new Date();
        const fechaRegistroFormateada = this.datePipe.transform(
            fechaActual,
            'dd/MM/yyyy'
        ); //HH:mm:ss.SSS
    let  anioActual = fechaActual.getFullYear().toString();
    let mesActual = (fechaActual.getMonth() + 1)
            .toString()
            .padStart(2, '0');
       
        
    this.nuevoFormulario = {
      ban03Empresa : this.globalService.getCodigoEmpresa(),
      ban03Anio: anioActual,
      ban03Mes: mesActual,
      ban03Numero: '',
      ban03clientetipoanalisis: '01',
      ban03clienteruc: '',
      ban03Importe:0,
      ban03moneda: '',
      ban03FechaDeposito: fechaRegistroFormateada,
      ban03MedioPago: '',
      ban03Motivo: '',
      ban03VoucherLibroCod:'',
      ban03VoucherNumero:'',
    }
    //this.cargarproveedores();
    this.cargarCliente();
     this.cargarMedioPago();
     
     this.monedaOpciones = [
          { label: 'Soles', value: 'S' },
          { label: 'Dólares', value: 'D' }
      ];
            
  }
  editaRegistro(registro:RegistroCobro) :void{
    this.editingRegCobro[registro.ban03Numero] = true;
    this.monedaOpciones =[
       { label: 'Soles', value: 'S' },
          { label: 'Dólares', value: 'D' }
    ]
  }
  eliminaRegistro() :void{

  }
  cancelarRegistro(): void{
    this.mostrarNuevaFila = false;
    this.botonesDeshabilitados = false;

  }
 
  editingRegCobro: {[key:string]:boolean}={};
  registroSeleccionado: string = '';
 
  constructor(
    private globalService:GlobalService,
    private bs:BreadcrumbService,
    private confirmationService:ConfirmationService,
    private router:Router,
    private messageService:MessageService,
    private datePipe:DatePipe,
    private configService:ConfigService,
    private cobroService:CobroFacturaService
    ,private presupuestoService: PresupuestoService
  ){


  }
  ngOnInit(): void {
    
    this.bs.setBreadcrumbs([
      {icon:'pi pi-home', routerLink:'/Home'},
      {label:'Registro cobro', routerLink:'/Home/registro_cobro'}
    ]);
    this.bs.currentBreadcrumbs$.subscribe((bc) =>{
      this.items = bc;
    });

    this.cargarMedioPago();

    this.globalService.selectedDate$.subscribe((date)=>{
        if(date){
          const year = date.getFullYear().toString();
         const month = (date.getMonth() + 1).toString().padStart(2, '0');
                this.anioFecha = year;
                this.mesFecha = month;
        
                this.cargar();
              }

    });
    // this.cargarproveedores();
    
  }

  cargarMedioPago():void{
    const codempresa: string = this.globalService.getCodigoEmpresa();
        this.loading = true;
        
        this.presupuestoService.obtenerMedioPago(codempresa).subscribe({
          
            next: (data) => {
                
                this.medioPagoLista = data;
                
                this.loading = false;
             
            },
            error: (error) => {
                this.loading = false;
                verMensajeInformativo(
                    this.messageService,
                    'error',
                    'Error',
                    `Error al cargar presupuesto: ${error.message}`
                );
            },
        });
  }
  cargarproveedores() {
          const cod_empresa = this.globalService.getCodigoEmpresa();
          
          this.presupuestoService
              .obtenerProveedores(cod_empresa)
              .subscribe((data: proveedores_lista[]) => {
                  this.proveedores = data;
                
              });
      }

      cargarCliente(){
        const codempresa = this.globalService.getCodigoEmpresa();
        this.cobroService.getListaCliente(codempresa)
        .subscribe((data: ClienteconFactura[])=>{
          this.listaClientes = data;
          
        });
      }
  onMedioChange(event: any) {
        this.selectCliente = event.value;
  }
  cargar():void{
    let empresa = this.globalService.getCodigoEmpresa();
    this.loading = true;
    this.cobroService.getListaRegistroCobro(this.globalService.getCodigoEmpresa(),
                      this.anioFecha,this.mesFecha)
                      .subscribe({
                        next:(data) =>{
                          this.listaRegistroCobro = data;
                          this.loading = false;
                          
                        },
                        error:(error) =>{
                          this.loading = false;
                          verMensajeInformativo(this.messageService, 'error',
                            'Error', `Error al cargar presupuesto${error.message}`
                          )
                        }
                      })
  }
  actualizarFechaEdicion(event: Date) {
        if (event) {
            // Actualizar año y mes basado en la fecha seleccionada
            this.editaFormulario.ban03Anio = event.getFullYear().toString();
            this.editaFormulario.ban03Mes = (event.getMonth() + 1)
                .toString()
                .padStart(2, '0');
            this.editaFormulario.ban03FechaDeposito =
                this.datePipe.transform(event, 'dd/MM/yyyy') || '';
          }
    }
  guardarNuevo(){
    
      this.cobroService.insertRegistroCobro(this.nuevoFormulario)
      .subscribe({
          next:(response) =>{
            verMensajeInformativo(this.messageService, 
              'success', 'Exito', 
              'Registro guardardo');
              this.mostrarNuevaFila = false;
              this.botonesDeshabilitados = false;

              this.cargar();
              const nuevoCodigoRegistroCobro = response.item;

              //abrir la venta de factura la iniciar el formulario detALLE
              if(nuevoCodigoRegistroCobro){
                this.router.navigate(['/Home/registro_cobro_detalle'], {
                state: {
                  CobroNro: nuevoCodigoRegistroCobro,
                  Fecha: this.nuevoFormulario.ban03FechaDeposito,
                  Cliente: '',
                  ClienteCodigo:this.nuevoFormulario.ban03clienteruc,
                  Anio: this.nuevoFormulario.ban03Anio,
                  Mes: this.nuevoFormulario.ban03Mes,
                  verFacturas:true
                  
                  }
                });
              }

              // if(nuevoCodigoRegistroCobro){
              //   //cargar detalle con codigo recine  generado 

              // }
          }, 
          error:(error) =>{
            verMensajeInformativo(this.messageService, 
              'error', 'error', 
              'Error al insertar');
          }
      });
  }

  cancelarNuevo(){
    this.mostrarNuevaFila = false;
    this.botonesDeshabilitados = false; 
      this.nuevoFormulario = {
      ban03Empresa : this.globalService.getCodigoEmpresa(),
      ban03Anio: '',
      ban03Mes: '',
      ban03Numero: '',
      ban03clientetipoanalisis: '01',
      ban03clienteruc: '',
      ban03Importe:0,
      ban03moneda: '',
      ban03FechaDeposito: '',
      ban03MedioPago: '',
      ban03Motivo: '',
      ban03VoucherLibroCod:'',
      ban03VoucherNumero:'',
    }
  }

  guardarEdicion(nroRegistroCobro:string){
    this.cobroService.updateRegistroCobro(this.editaFormulario)
    .subscribe({
      next:(response) =>{
        verMensajeInformativo(this.messageService, 'succes', 
          'Exito', 'registro actualizado');
          //libera el registro  del arreglo de la lista de seleccionado
          delete this.editingRegCobro[nroRegistroCobro];
          this.botonesDeshabilitados = false; 
          this.cargar();
      },
      error:(error) =>{
        verMensajeInformativo(this.messageService,'error', 'error',`Error al actualizar ${error.mensaje} `);

      },
    });
  }
  cancelarEdicion(nroRegistroCobro:string){
    delete this.editingRegCobro[nroRegistroCobro];
    this.botonesDeshabilitados = false;
  }
  
  onCloseMolda(){

  }
  eliminar(registro:TraeRegistroCobro):void{
    
  }
  eliminarPago(registro: TraeRegistroCobro): void {
    
    // 1. Mostrar diálogo de confirmación
    this.confirmationService.confirm({
      message: `¿Estás seguro que deseas eliminar el registro de cobro Nro. ${registro.ban03numero}? Esta acción es irreversible.`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      
      accept: () => {
        this.cobroService
          .deleteRegistroCobro(
            this.globalService.getCodigoEmpresa(), 
            registro.ban03anio, 
            registro.ban03mes,  
            registro.ban03numero 
          )
          .subscribe({
            next: (response) => {
              if (response.isSuccess) {
                // 3. Manejo de éxito
                verMensajeInformativo(
                  this.messageService,
                  'success',
                  'Éxito',
                  `Registro ${registro.ban03numero} eliminado correctamente.`
                );
                this.cargar(); 
              } else {
                verMensajeInformativo(
                  this.messageService,
                  'error',
                  'Error al eliminar',
                  response.message || 'No se puedo realizar la eliminación'
                );
              }
            }
          });
      }
    });
  }

  iniciarEdicion(registro: TraeRegistroCobro): void {
    this.editingRegCobro[registro.ban03numero] = true;
    this.botonesDeshabilitados = true; 

    this.monedaOpciones = [
        { label: 'Soles', value: 'S' },
        { label: 'Dólares', value: 'D' }
    ];

    /*let obtenerMedioPago = this.medioPagoLista.find(
        (mp: any) => mp.ban01Descripcion === registro.medioPagoDescripcion
    );*/
    
    this.editaFormulario = {
        ban03Empresa: this.globalService.getCodigoEmpresa(),
        ban03Anio: registro.ban03anio,
        ban03Mes: registro.ban03mes,
        ban03Numero: registro.ban03numero,
        ban03clientetipoanalisis: '01',
        ban03clienteruc: registro.clienteCodigo,
        ban03Importe: registro.ban03Importe,
        ban03moneda: registro.Ban03Moneda === 'Soles' ? 'S' : 'D',  
        ban03FechaDeposito: registro.ban03FechaDeposito,
        ban03MedioPago: registro.medioPagoCodigo,  
        ban03Motivo: registro.ban03Motivo,
        ban03VoucherLibroCod: registro.ban03VoucherLibroCod,
        ban03VoucherNumero: registro.ban03VoucherNumero
    };
}

verDetalleNuevo(registro:RegistroCobro, nuevoCodigoRegistroCobro:boolean){

}
verDetalles(registro: TraeRegistroCobro,nuevoRegistro:boolean) {
 
  this.router.navigate(['/Home/registro_cobro_detalle'], {
    state: {
      CobroNro: registro.ban03numero,
      Fecha: registro.ban03FechaDeposito,
      Cliente: registro.clienteNombre,
      ClienteCodigo:registro.clienteCodigo,
      Anio: registro.ban03anio,
      Mes: registro.ban03mes,
      verFacturas:nuevoRegistro
      
      }
    });
    
  }
  onClienteRucChange(event: any) {
  this.selectCliente = event.value;
  // Sincroniza ambos dropdowns cuando se selecciona por RUC
  this.nuevoFormulario.ban03clienteruc = event.value;
}
}