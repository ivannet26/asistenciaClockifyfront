import { Component, EventEmitter, input, Input, OnInit, Output, ViewChild } from '@angular/core';
import { PanelModule } from 'primeng/panel';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { FileUpload, FileUploadModule } from 'primeng/fileupload';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { HttpClientModule } from '@angular/common/http';
import { PresupuestoService } from 'src/app/demo/service/presupuesto.service';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { GlobalService } from 'src/app/demo/service/global.service';
import { ConfigService } from 'src/app/demo/service/config.service';
import { verMensajeInformativo, formatDate } from 'src/app/demo/components/utilities/funciones_utilitarias';
import { DropdownModule } from "primeng/dropdown";
import { insert_presupuesto, mediopago_lista } from 'src/app/demo/model/presupuesto';
import { DetraccioMasivaDetalleRequest } from 'src/app/demo/model/DetraccionMasiva';
import { DetraccionService } from 'src/app/demo/service/detraccion.service';
import { DetraccionIndividualDocPen, DetraccionIndividualRequest } from 'src/app/demo/model/DetraccionIndividual';
import { Retencion } from 'src/app/demo/model/retencion';
import { RetencionService } from 'src/app/demo/service/retencion.service';
@Component({
    selector: 'app-confirmar-pago',
    standalone: true,
    imports: [PanelModule, ToastModule, ButtonModule, InputTextModule, CalendarModule, 
        FileUploadModule, CommonModule, FormsModule, TagModule, 
        TooltipModule, HttpClientModule, DialogModule,
    ConfirmDialogModule, ReactiveFormsModule, DropdownModule],
    templateUrl: './confirmar-pago.component.html',
    styleUrl: './confirmar-pago.component.css',
    providers: [MessageService, FileUploadModule, ConfirmationService]
})
export class ConfirmarPagoComponent implements OnInit {

    //por si acaso el nro de pago de la fila 
    @Input() pagoNumero: string = '';
    @Input() modoDetraccion:boolean = false;
    @Input() modoRetencion:boolean = false;
    @Input() modoPresupuesto:boolean = false;
    @ViewChild('fu') fileUpload!: FileUpload;
    @Output() onClose = new EventEmitter<void>();
    @Input() presupuestoCab:insert_presupuesto;
    @Input() numeroLote:string;
    @Input() seleccionadoDocPen:DetraccionIndividualDocPen;
    
    pagoForm: FormGroup;
    destinationPath: string = '';

    fechaEjecucionPago: Date | null = null;
    nroOperacion: string = '';
    rutaComprobante: string = '';

    // despliegue 
    archivoSeleccionado: File | null = null;
    cargandoArchivo: boolean = false;

    // Variables para el diálogo de confirmación
    mostrarDialogoExito: boolean = false;
    mensajeExito: string = '';
    rutaArchivoGuardado: string = '';
    rutaDoc: string = '';

    //combo general
    anio_combo: string = ""; apiUrl: any;
    mes_combo: string = "";
    urlApi: string = '';
    modoDetraccionIndividual :boolean = false;

    nuevoRetencion:Retencion={
        ban01empresa:'',
    ban01anio:'',
    ban01mes:'',    
    ban01descripcion: '',
    ban01fecha:'',
    ban01estado:'',
    ban01usuario:'',
    ban01pc:'',
    ban01fecharegistro:'',
    ban01mediopago:'',
    ban01motivopagocod:'',
    retencionMensualNro:'',
    numerooperacion:'',
    enlacepago:'',
    nombrearchivo:'',
    contenidoarchivo:'',
    flagoperacion:''

    }
    nuevoPresupuesto: insert_presupuesto={
        ban01Empresa: '',
        ban01Numero: '',
        ban01Anio: '',
        ban01Mes: '',
        ban01Descripcion: '',
        ban01Fecha: '',
        ban01Estado: this.configService.getEstado(),
        ban01Usuario: '',
        ban01Pc: '',
        ban01FechaRegistro: '',
        ban01mediopago: '',
    };
    
    nuevoDetraccion: DetraccioMasivaDetalleRequest ={
        ban01Empresa: '',
        ban01Anio: '',
        ban01mes: '',
        ban01Descripcion: '',
        ban01Fecha: '',
        ban01Estado:'',
        ban01Usuario:'',
        ban01Pc:'',
        ban01FechaRegistro:'',
        ban01MedioPago:'',
        detraccionLote:'',
        ban01motivopagoCod:'',
        numerooperacion:'',
        enlacePago:'',
        nombreArchivo:'',
        flagOperacion:''
    };
    nuevaDetraccionIndividual: DetraccionIndividualRequest ={
        ban01empresa: '',
        ban01anio: '',
        ban01mes: '',
        ban01descripcion: '',
        ban01fecha:  '',
        ban01estado:'',
        ban01usuario:'',
        ban01pc:'',
        ban01fecharegistro:'',
        ban01mediopago:'',
        ban01motivopagocod:'',
        ban02ruc:'',
        ban02tipodoc:'',
        ban02nrodoc:'',
        ban02tipodetraccion:'',
        ban02tasadetraccion:'',
        ban02importedetraccionsoles:0,
        ban02importedetracciondolares:0,
        numerooperacion:'',
        enlacepago:'',
        nombrearchivo:'',
        contenidoarchivo:'',
        flagoperacion:''
        
        
    }
    medioPagoLista: mediopago_lista[] = [];
    constructor(private fb: FormBuilder, 
        private messageService: MessageService, 
        private pS: PresupuestoService, 
        private gS: GlobalService,
        private configService: ConfigService, 
        private detraccionService:DetraccionService
        ,private retencionService:RetencionService) {
        this.pagoForm = this.fb.group({
            fechaejecucion: [null, Validators.required],
            nroOperacion: ['', Validators.required],
            rutaComprobante: ['', Validators.required],
            medioPago:[''],
            motivoPago:['']
        });

        this.apiUrl = configService.getApiUrl();
        this.urlApi = this.apiUrl;
    }

    ngOnInit(): void {

        
        if(this.seleccionadoDocPen){
            this.modoDetraccionIndividual = true;
            
        }
        if (this.pagoNumero) {
            
            
            this.nroOperacion = this.pagoNumero;
        }
        this.gS.selectedDate$.subscribe(date => {
            if (date) {
                this.anio_combo = date.getFullYear().toString();
                this.mes_combo = (date.getMonth() + 1).toString().padStart(2, '0');
            }
        })
        this.destinationPath = this.configService.getRutaDoc();

        if(this.modoDetraccion == true || this.modoRetencion == true){
            this.cargarMedioPago();            
        }
                       
        
    }

    /*ngOnChanges(changes: SimpleChanges) {
        // Update nroOperacion whenever pagoNumero changes
        if (changes['pagoNumero'] && changes['pagoNumero'].currentValue) {
          this.nroOperacion = changes['pagoNumero'].currentValue;
        } por si se desea pasar el nro de pago
      }*/
     guardarRetencion():void{
        this.nuevoRetencion.ban01empresa = this.gS.getCodigoEmpresa();
        
          this.gS.selectedDate$.subscribe(date => {
            if (date) {
                this.anio_combo = date.getFullYear().toString();
                this.mes_combo = (date.getMonth() + 1).toString().padStart(2, '0');
            }
        });

        this.cargandoArchivo = true;
        this.nuevoRetencion.ban01anio = this.anio_combo;
        this.nuevoRetencion.ban01mes = this.mes_combo;
        //npmbre del presupesto
        this.nuevoRetencion.ban01descripcion = this.pagoForm.get('motivoPago')?.value; 
        //fecha del prespuesto generado 
        //formatear la fecha seleccionada
        let fechaPagoInput = this.pagoForm.get('fechaejecucion')?.value;
        let fechaPagoFormated = fechaPagoInput ? formatDate(new Date(fechaPagoInput)): null;
        let fileUrl = this.rutaComprobante;

        this.nuevoRetencion.ban01fecha= fechaPagoFormated;
        this.nuevoRetencion.ban01estado = '02'; //presupuesto pagado
        this.nuevoRetencion.ban01usuario = 'melissa';
        this.nuevoRetencion.ban01pc = 'PC';
        this.nuevoRetencion.ban01fecharegistro = fechaPagoFormated;
        this.nuevoRetencion.ban01mediopago = this.pagoForm.get('medioPago')?.value; 
        this.nuevoRetencion.retencionMensualNro = this.numeroLote;
        this.nuevoRetencion.ban01motivopagocod = '04'; //04 pago retencion masiva 
        this.nuevoRetencion.numerooperacion = this.pagoForm.get('nroOperacion')?.value;
        this.nuevoRetencion.enlacepago = fileUrl;
        this.nuevoRetencion.nombrearchivo =  this.archivoSeleccionado?.name;
        this.nuevoRetencion.flagoperacion='I';
        this.retencionService.insertRetencion(this.nuevoRetencion, 
            this.archivoSeleccionado).subscribe({
                next:(response) =>{
                    setTimeout(() => {
                        this.cargandoArchivo = false;
                        this.finalizarGuardado();
                    }, 500);
                },
                error:(error)=>{
                     this.cargandoArchivo = false;
                    verMensajeInformativo(
                        this.messageService,
                        'error',
                        'Error',
                        'No se pudo actualizar el comprobante:' + error
                    );
                    this.cargandoArchivo = false;
                }
            }); 
       
       
     }

    guardarDetraccioMasivo():void{
        this.nuevoDetraccion.ban01Empresa = this.gS.getCodigoEmpresa();
        
          this.gS.selectedDate$.subscribe(date => {
            if (date) {
                this.anio_combo = date.getFullYear().toString();
                this.mes_combo = (date.getMonth() + 1).toString().padStart(2, '0');
            }
        });
        this.cargandoArchivo = true;
        this.nuevoDetraccion.ban01Anio = this.anio_combo;
        this.nuevoDetraccion.ban01mes = this.mes_combo;
        //npmbre del presupesto
        this.nuevoDetraccion.ban01Descripcion = this.pagoForm.get('motivoPago')?.value; 
        //fecha del prespuesto generado 
        //formatear la fecha seleccionada
        let fechaPagoInput = this.pagoForm.get('fechaejecucion')?.value;
        let fechaPagoFormated = fechaPagoInput ? formatDate(new Date(fechaPagoInput)): null;
        let fileUrl = this.rutaComprobante;

        this.nuevoDetraccion.ban01Fecha= fechaPagoFormated;
        this.nuevoDetraccion.ban01Estado = '02'; //presupuesto pagado
        this.nuevoDetraccion.ban01Usuario = 'melissa';
        this.nuevoDetraccion.ban01Pc = 'PC';
        this.nuevoDetraccion.ban01FechaRegistro = fechaPagoFormated;
        this.nuevoDetraccion.ban01MedioPago = this.pagoForm.get('medioPago')?.value; 
        this.nuevoDetraccion.detraccionLote = this.numeroLote;
        this.nuevoDetraccion.ban01motivopagoCod = '03'; //03 pago detraccion masiva , 02 pago detraccion individual, 02 pago
        this.nuevoDetraccion.numerooperacion = this.pagoForm.get('nroOperacion')?.value;
        this.nuevoDetraccion.enlacePago = fileUrl;
        this.nuevoDetraccion.nombreArchivo =  this.archivoSeleccionado?.name;
        this.nuevoDetraccion.flagOperacion='I';
        
        this.detraccionService.InsertarDetraccionMasiva(this.nuevoDetraccion, this.archivoSeleccionado).subscribe({
            next:(response) =>{
                
                setTimeout(() => {
                    this.cargandoArchivo = false;
                    this.finalizarGuardado();
                }, 500);
            },
            error:(error)=>{
                 this.cargandoArchivo = false;
                    verMensajeInformativo(
                        this.messageService,
                        'error',
                        'Error',
                        'No se pudo actualizar el comprobante:' + error
                    );
                    this.cargandoArchivo = false;
            }
        });
    }
    guardarDetraccionIndividual():void{
        this.nuevaDetraccionIndividual.ban01empresa = this.gS.getCodigoEmpresa();
        this.nuevaDetraccionIndividual.ban01anio = this.anio_combo;
        this.nuevaDetraccionIndividual.ban01mes = this.mes_combo;
        this.nuevaDetraccionIndividual.ban01descripcion = this.pagoForm.get('motivoPago')?.value;
        let fechaPagoInput = this.pagoForm.get('fechaejecucion')?.value;
        let fechaPagoFormated = fechaPagoInput ? formatDate(new Date(fechaPagoInput)): null;
        this.nuevaDetraccionIndividual.ban01fecha = fechaPagoFormated;
        this.nuevaDetraccionIndividual.ban01estado = '02'; //estado dpresupuesto pago
        this.nuevaDetraccionIndividual.ban01usuario = 'melissa';
        this.nuevaDetraccionIndividual.ban01pc = 'PC';
        this.nuevaDetraccionIndividual.ban01fecharegistro = fechaPagoFormated;
        this.nuevaDetraccionIndividual.ban01mediopago = this.pagoForm.get('medioPago')?.value;
        this.nuevaDetraccionIndividual.ban01motivopagocod = '02';
        this.nuevaDetraccionIndividual.ban02ruc = this.seleccionadoDocPen.ruc;
        this.nuevaDetraccionIndividual.ban02tipodoc = this.seleccionadoDocPen.codigotipodoc;
        this.nuevaDetraccionIndividual.ban02nrodoc = this.seleccionadoDocPen.numerodocumento;
        this.nuevaDetraccionIndividual.ban02tipodetraccion = this.seleccionadoDocPen.detratiposervicio;
        this.nuevaDetraccionIndividual.ban02tasadetraccion = this.seleccionadoDocPen.detraporcentaje;
        this.nuevaDetraccionIndividual.ban02importedetraccionsoles = this.seleccionadoDocPen.detraimpsol;
        this.nuevaDetraccionIndividual.ban02importedetracciondolares = this.seleccionadoDocPen.detraimpdol;
        this.nuevaDetraccionIndividual.numerooperacion = this.pagoForm.get('nroOperacion')?.value;

        let fileUrl = this.rutaComprobante;
        this.nuevaDetraccionIndividual.enlacepago = fileUrl;;
        this.nuevaDetraccionIndividual.nombrearchivo = this.archivoSeleccionado?.name;
        this.nuevaDetraccionIndividual.flagoperacion = 'I';
        
        this.detraccionService.SpInsertaDetraIndividual(this.nuevaDetraccionIndividual, this.archivoSeleccionado)
        .subscribe({
            next:(response)=>{
                 setTimeout(() => {
                    this.cargandoArchivo = false;
                    this.finalizarGuardado();
                }, 500);
            },
             error:(error)=>{
                 this.cargandoArchivo = false;
                    verMensajeInformativo(
                        this.messageService,
                        'error',
                        'Error',
                        'No se pudo actualizar el comprobante desde detraccion individual:' + error
                    );
                    this.cargandoArchivo = false;
            }
        });



        

    }
    guardarPresupuestoDetraccionPago():void{

        if(this.modoDetraccionIndividual == true){
            this.guardarDetraccionIndividual();
        }else{
            this.guardarDetraccioMasivo();
        }
        
      

    }

    actualizarPresupuestoPago(){
//guardar confirmacion Pago desde origen Prespuesto  u origen Detraccion

        // const codMedioPago = this.pagoForm.get('cboMedioPago').value;
        //insertar presupuesto
        
      

        // Verificar que todos los campos esten llenos
        this.pagoForm.markAllAsTouched();
        if (this.pagoForm.invalid) {
            verMensajeInformativo(this.messageService, 'error', 'Error', 'Por favor complete los campos requeridos');
            return;
        }

        this.cargandoArchivo = true;
        const originalFileName = this.archivoSeleccionado?.name || '';
        const fileName = originalFileName.split('.').length > 1
            ? originalFileName
            : originalFileName + '.' + originalFileName.split('.').pop();

        const fileUrl = this.rutaComprobante;

        const fechaPagoInput = this.pagoForm.get('fechaejecucion')?.value;
        const fechaPagoFormatted = fechaPagoInput
            ? formatDate(new Date(fechaPagoInput))
            : null;

        // Parametros
        const updateParams = {
            empresa: this.gS.getCodigoEmpresa(),
            anio: this.anio_combo,
            mes: this.mes_combo,
            numeropresupuesto: this.pagoNumero,
            flagOperacion: 'I',
            fechapago: fechaPagoFormatted, // Fecha formateada como dd/mm/yyyy
            numerooperacion: this.pagoForm.get('nroOperacion')?.value,
            enlacepago: fileUrl,
        };
        

        // Actualizamos el comprobante con archivo
        this.pS
            .actualizarComprobanteconArchivo(
                updateParams,
                this.archivoSeleccionado
            )
            .subscribe({
                next: (response) => {
                    setTimeout(() => {
                        this.cargandoArchivo = false;
                        this.finalizarGuardado();
                    }, 500);
                },
                error: (error) => {
                    this.cargandoArchivo = false;
                    verMensajeInformativo(
                        this.messageService,
                        'error',
                        'Error',
                        'No se pudo actualizar el comprobante'
                    );
                    this.cargandoArchivo = false;
                },
            });
    }
    guardarConfirmacion() {

        if(this.modoDetraccion == false && this.modoRetencion == false){
            this.actualizarPresupuestoPago();
            console.log("modo  detraccion");
        }else if(this.modoRetencion == true && this.modoDetraccion==false){
            this.guardarRetencion();
            console.log("modo retencion");
        }else if(this.modoDetraccion == true && this.modoRetencion == false){
            //modo crear  presupuesto de detraccion y actualizar el pago de la detraccion recien creada
            this.guardarPresupuestoDetraccionPago();
            console.log("modo presupuesto");
        }

    }

    finalizarGuardado() {
        this.mensajeExito = `El archivo ${this.archivoSeleccionado?.name} se ha guardado correctamente`;
        this.mostrarDialogoExito = true;
    }

    onConfirmOk() {
        this.mostrarDialogoExito = false;
        // Limpiamos y cerramos al confirmar el diálogo
        this.limpiarCampos();
        this.onClose.emit();
    }

    onFileSelected(event: any) {
        if (event && event.files && event.files.length > 0) {
            this.archivoSeleccionado = event.files[0];
            this.rutaComprobante = event.files[0].name;
            // actualizar el valor
            this.pagoForm.patchValue({
                rutaComprobante: this.rutaComprobante
            });
        }
    }

    limpiarArchivo() {
        this.rutaComprobante = '';
        if (this.fileUpload) {
            this.fileUpload.clear();
        }
    }

    limpiarCampos() {
        this.pagoForm.reset();
        this.fechaEjecucionPago = null;
        this.nroOperacion = '';
        this.rutaComprobante = '';
        this.archivoSeleccionado = null;
        if (this.fileUpload) {
            this.fileUpload.clear();
        }
    }

    cancelar() {
        this.limpiarCampos();
        this.onClose.emit();
    }

    public limpiar(): void {
        this.pagoForm.reset();
        this.fechaEjecucionPago = null;
        this.nroOperacion = '';
        this.rutaComprobante = '';
        this.archivoSeleccionado = null;
        if (this.fileUpload) {
            this.fileUpload.clear();
        }
    }

    cargarMedioPago():void{
        const codempresa: string = this.gS.getCodigoEmpresa();
        //this.loading = true;
        this.pS.obtenerMedioPago(codempresa).subscribe({
            next: (data) => {
                
                this.medioPagoLista = data;
                
                //this.loading = false;
                //if (data.length === 0) {
                //    verMensajeInformativo(
                //        this.messageService,
                //        'warn',
                //        'Advertencia',
                //        'No se encontraron registros de presupuesto'
                //    );
                //}
            },
            error: (error) => {
                //this.loading = false;
                verMensajeInformativo(
                    this.messageService,
                    'error',
                    'Error',
                    `Error al cargar presupuesto: ${error.message}`
                );
            },
        });
    }

}
