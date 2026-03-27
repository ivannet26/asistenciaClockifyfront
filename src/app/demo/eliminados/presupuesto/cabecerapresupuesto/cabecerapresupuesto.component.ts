import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { PanelModule } from 'primeng/panel';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { BreadcrumbService } from 'src/app/demo/service/breadcrumb.service';
import { cabeceraPresupuesto, insert_presupuesto, mediopago_lista } from '../../../model/presupuesto';
import { ButtonModule } from 'primeng/button';
import { Router, RouterModule } from '@angular/router';
import { PresupuestoService } from 'src/app/demo/service/presupuesto.service';
import { GlobalService } from 'src/app/demo/service/global.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { ConfirmarPagoComponent } from '../confirmar-pago/confirmar-pago.component';
import { DialogModule } from 'primeng/dialog';
import { FileUploadModule } from 'primeng/fileupload';
import { verMensajeInformativo } from 'src/app/demo/components/utilities/funciones_utilitarias';
import { HttpResponse } from '@angular/common/http';
import { ConfigService } from 'src/app/demo/service/config.service';
import { ContextMenuModule } from 'primeng/contextmenu';
import { MenuItem } from 'primeng/api';

@Component({
    selector: 'app-cabecerapresupuesto',
    standalone: true,
    imports: [
        BreadcrumbModule,
        ToastModule,
        PanelModule,
        ConfirmDialogModule,
        TableModule,
        CommonModule,
        ButtonModule,
        RouterModule,
        FormsModule,
        CalendarModule,
        InputTextModule,
        InputNumberModule,
        DropdownModule,
        ReactiveFormsModule,
        ConfirmarPagoComponent,
        DialogModule,
        FileUploadModule,
        ContextMenuModule
    ],
    templateUrl: './cabecerapresupuesto.component.html',
    styleUrl: './cabecerapresupuesto.component.css',
    providers: [ConfirmationService, MessageService, DatePipe],
})
export class CabecerapresupuestoComponent implements OnInit {
    @ViewChild(ConfirmarPagoComponent)
    confirmarpagocomponente: ConfirmarPagoComponent;
    //breadcrumb
    items: any[] = [];
    prueba!: any[];
    anioFecha: string = '';
    mesFecha: string = '';
    presupuesto: cabeceraPresupuesto[] = [];
    loading: boolean = false;
    mostrarNuevaFila: boolean = false;
    botonesDeshabilitados: boolean = false;
    medioPagoLista: mediopago_lista[] = [];
    selectMedioPago: string | null = null;
    verConfirmarPago: boolean = false;
    rowsPerPage: number = 10; // Numero de filas por página
    selectedOption: any | null = null; // row selection
    menuItems:MenuItem[] = []; // menu
    
    nuevoPresupuesto: insert_presupuesto = {
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

    editingPresupuesto: { [key: string]: boolean } = {};
    editForm: insert_presupuesto = {
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
    //para pasar el pagonro
    selectedPagoNumero: string = '';

    constructor(
        private globalService: GlobalService,
        private bS: BreadcrumbService,
        private confirmationService: ConfirmationService,
        private router: Router,
        private presupuestoService: PresupuestoService,
        private messageService: MessageService,
        private datePipe: DatePipe,
        private configService: ConfigService
    ) {}

    cargarMedioPago(): void {
        const codempresa: string = this.globalService.getCodigoEmpresa();
        this.loading = true;
        this.presupuestoService.obtenerMedioPago(codempresa).subscribe({
            next: (data) => {
                
                this.medioPagoLista = data;
                
                this.loading = false;
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

    onMedioChange(event: any) {
        this.selectMedioPago = event.value;
    }

    ngOnInit(): void {
        this.bS.setBreadcrumbs([
            { icon: 'pi pi-home', routerLink: '/Home' },
            { label: 'Presupuesto', routerLink: '/Home/presupuesto' },
        ]);
        this.bS.currentBreadcrumbs$.subscribe((bc) => {
            this.items = bc;
        });

        this.globalService.selectedDate$.subscribe((date) => {
            if (date) {
                const year = date.getFullYear().toString();
                const month = (date.getMonth() + 1).toString().padStart(2, '0');
                this.anioFecha = year;
                this.mesFecha = month;
                this.cargarPresupuesto(
                    this.globalService.getCodigoEmpresa(),
                    year,
                    month
                );
            }
        });

        this.menuItems = [
            { 
                label: 'Ver Detalles', 
                icon: 'pi pi-fw pi-search', 
                command: () => {
                    if(this.selectedOption) this.verDetalles(this.selectedOption);
                } 
            },

            { 
                label: 'Eliminar', 
                icon: 'pi pi-fw pi-times', 
                command: () => {
                    if(!this.selectedOption) this.eliminarPago(this.selectedOption);
                } }
        ];
        this.cargarMedioPago();
    }
    cargarPresupuesto(empresa: string, anio: string, mes: string): void {
        this.loading = true;
        this.presupuestoService
            .obtenerPresupuesto(empresa, anio, mes)
            .subscribe({
                next: (data) => {
                    this.presupuesto = data;
                    
                    this.loading = false;
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
    verDetalles(presupuesto: cabeceraPresupuesto) {
        const formattedDate = this.datePipe.transform(
            presupuesto.fecha,
            'dd/MM/yyyy'
        );

        const navigationExtras = {
            state: {
                PagoNro: presupuesto.pagoNumero,
                Fecha: formattedDate,
                motivo: presupuesto.motivo,
                nombreMedioPago: presupuesto.nombreMedioPago,
                bancoCodMedioPago: presupuesto.bancoCodMedioPago
                //codigoMedioPago:presupuesto.
            },
            
        };
        console.log("datos de cabecera navigation :");
        console.log(navigationExtras);
        this.router.navigate(['Home/detalle-presupuesto'], navigationExtras);
    }
    verVouchercontable(presupuesto: cabeceraPresupuesto) {
        const navigationExtras = {
            state: {
                empresa: this.globalService.getCodigoEmpresa(),
                PagoNro: presupuesto.pagoNumero,
                menuOrigen: 'Presupuesto',
                rutaOrigen:'/Home/presupuesto'
            },
        };
        this.router.navigate(['Home/voucher_contable'], navigationExtras);
    }
    iniciarNuevoPresupuesto() {
        this.mostrarNuevaFila = true;
        this.botonesDeshabilitados = true;

        const fechaActual = new Date();
        const fechaRegistroFormateada = this.datePipe.transform(
            fechaActual,
            'dd/MM/yyyy'
        ); //HH:mm:ss.SSS
        const anioActual = fechaActual.getFullYear().toString();
        const mesActual = (fechaActual.getMonth() + 1)
            .toString()
            .padStart(2, '0');

        this.nuevoPresupuesto = {
            ban01Empresa: this.globalService.getCodigoEmpresa(),
            ban01Numero: ' ',
            ban01Anio: anioActual, // Set year from current date
            ban01Mes: mesActual, // Set month from current date
            ban01Descripcion: '',
            ban01Fecha: fechaRegistroFormateada,
            ban01Estado: this.configService.getEstado(),
            ban01Usuario: this.globalService.getNombreUsuario(),
            ban01Pc: 'PC',
            ban01FechaRegistro: fechaRegistroFormateada,
            ban01mediopago: '',
        };
    }

    cancelarNuevo() {
        this.mostrarNuevaFila = false;
        this.botonesDeshabilitados = false;
        this.nuevoPresupuesto = {
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
    }

    guardarNuevoPresupuesto() {
        this.presupuestoService
            .insertarPresupuesto(this.nuevoPresupuesto)
            .subscribe({
                next: (response) => {
                    verMensajeInformativo(
                        this.messageService,
                        'success',
                        'Éxito',
                        'Presupuesto guardado correctamente'
                    );
                    this.mostrarNuevaFila = false;
                    this.botonesDeshabilitados = false;
                    this.cargarPresupuesto(
                        this.nuevoPresupuesto.ban01Empresa,
                        this.nuevoPresupuesto.ban01Anio,
                        this.nuevoPresupuesto.ban01Mes
                    );

                    const nuevoPagoNumero = response.item;
                    if (nuevoPagoNumero) {
                        const fechaOriginal = this.nuevoPresupuesto.ban01Fecha;
                        const fechaConvertida =
                            typeof fechaOriginal === 'string'
                                ? this.convertirStringADate(fechaOriginal)
                                : fechaOriginal;
                        const formattedDate = this.datePipe.transform(
                            fechaConvertida,
                            'dd/MM/yyyy'
                        );

                        let nombreMedioPago = '';
                        let codigoBancoPago = '';
                        if (this.nuevoPresupuesto.ban01mediopago) {
                            const medioPago = this.medioPagoLista.find(
                                (mp) =>
                                    mp.ban01IdTipoPago ===
                                    this.nuevoPresupuesto.ban01mediopago
                            );
                            if (medioPago) {
                                nombreMedioPago = medioPago.ban01Descripcion;
                                codigoBancoPago =  medioPago.ban01CtaBanBancoCod;
                                
                            }
                        }
                        const navigationExtras = {
                            state: {
                                PagoNro: nuevoPagoNumero,
                                Fecha: formattedDate,
                                motivo: this.nuevoPresupuesto.ban01Descripcion,
                                nombreMedioPago: nombreMedioPago,
                                bancoCodMedioPago: codigoBancoPago
                            },
                        };
                        console.log("datao de navegacion guardarNuevoPresupuesto");
                        console.log(navigationExtras);
                        this.router.navigate(
                            ['Home/detalle-presupuesto'],
                            navigationExtras
                        );
                    }
                },
                error: (error) => {
                    verMensajeInformativo(
                        this.messageService,
                        'error',
                        'Error',
                        `Error al guardar el presupuesto: ${error.message}`
                    );
                },
            });
    }

    convertirStringADate(fechaStr: string): Date {
        // Asumiendo formato dd/MM/yyyy
        const partes = fechaStr.split('/');
        const dia = parseInt(partes[0], 10);
        const mes = parseInt(partes[1], 10) - 1; // los meses en JS empiezan desde 0
        const anio = parseInt(partes[2], 10);
        return new Date(anio, mes, dia);
    }

    actualizarFecha(event: Date) {
        if (event) {
            this.nuevoPresupuesto.ban01Anio = event.getFullYear().toString();
            this.nuevoPresupuesto.ban01Mes = (event.getMonth() + 1)
                .toString()
                .padStart(2, '0');
            this.nuevoPresupuesto.ban01Fecha =
                this.datePipe.transform(event, 'dd/MM/yyyy') || '';
        }
    }

    iniciarEdicion(presupuesto: cabeceraPresupuesto) {
        this.editingPresupuesto[presupuesto.pagoNumero] = true;
        this.botonesDeshabilitados = true;

        const fechaSeleccionada = new Date(presupuesto.fecha);
        const foundMedioPago = this.medioPagoLista.find(
            (mp) => mp.ban01Descripcion === presupuesto.nombreMedioPago
        );
        
        this.editForm = {
            ban01Empresa: this.globalService.getCodigoEmpresa(),
            ban01Numero: presupuesto.pagoNumero,
            ban01Anio: fechaSeleccionada.getFullYear().toString(),
            ban01Mes: (fechaSeleccionada.getMonth() + 1)
                .toString()
                .padStart(2, '0'),
            ban01Descripcion: presupuesto.motivo,
            ban01Fecha:
                this.datePipe.transform(fechaSeleccionada, 'dd/MM/yyyy') || '',
            ban01Estado: this.configService.getEstado(),
            ban01Usuario: this.globalService.getNombreUsuario(),
            ban01Pc: 'PC',
            ban01FechaRegistro:
                this.datePipe.transform(new Date(), 'dd/MM/yyyy') || '',
            ban01mediopago:
      foundMedioPago?.ban01IdTipoPago ||
      presupuesto.mediopago ||
      presupuesto.bancoCodMedioPago ||
      '',
        };
    }

    cancelarEdicion(pagoNumero: string) {
        delete this.editingPresupuesto[pagoNumero];
        this.botonesDeshabilitados = false;
    }

    actualizarFechaEdicion(event: Date) {
        if (event) {
            // Actualizar año y mes basado en la fecha seleccionada
            this.editForm.ban01Anio = event.getFullYear().toString();
            this.editForm.ban01Mes = (event.getMonth() + 1)
                .toString()
                .padStart(2, '0');
            this.editForm.ban01Fecha =
                this.datePipe.transform(event, 'dd/MM/yyyy') || '';
            this.editForm.ban01FechaRegistro =
                this.datePipe.transform(new Date(), 'dd/MM/yyyy') || '';
        }
    }
    guardarEdicion(pagoNumero: string) {
        // Asegurar que la fecha de registro sea la actual al momento de guardar
        this.editForm.ban01FechaRegistro =
            this.datePipe.transform(new Date(), 'dd/MM/yyyy') || '';

        this.presupuestoService.actualizarPresupuesto(this.editForm).subscribe({
            next: (response) => {
                verMensajeInformativo(
                    this.messageService,
                    'success',
                    'Éxito',
                    'Presupuesto actualizado correctamente'
                );
                delete this.editingPresupuesto[pagoNumero];
                this.cargarPresupuesto(
                    this.editForm.ban01Empresa,
                    this.editForm.ban01Anio,
                    this.editForm.ban01Mes
                );
            },
            error: (error) => {
                verMensajeInformativo(
                    this.messageService,
                    'error',
                    'Error',
                    `Error al actualizar el presupuesto ${error.message}`
                );
            },
        });
        this.botonesDeshabilitados = false;
    }

    eliminarPago(presupuesto: cabeceraPresupuesto) {
        this.presupuestoService.obtenerDetallePresupuesto(this.globalService.getCodigoEmpresa(), presupuesto.pagoNumero).subscribe({
            next: (detalles) => {
                if (detalles.length > 0) {
                    this.messageService.add({
                        severity: 'warn',
                        summary: 'Advertencia',
                        detail: `Debe eliminar los detalles de presupuesto antes de eliminar el número de pago: ${presupuesto.pagoNumero}`,
                        life: 5000
                    });
                    return;
                }

                this.confirmationService.confirm({
                    message: `
                        <p style=\"text-align: center;\">
                            ¿Está seguro de eliminar el presupuesto?
                        </p>
                        <div style=\"text-align: center; margin-top: 10px;\">
                            <p>
                                Número de pago:${presupuesto.pagoNumero}
                            </p>
                            <p>
                                <strong>Fecha:</strong> ${this.datePipe.transform(presupuesto.fecha, 'dd/MM/yyyy')}
                            </p>
                        </div>
                    `,
                    header: 'Confirmar Eliminación',
                    icon: 'pi pi-exclamation-triangle',
                    acceptLabel: 'Sí',
                    rejectLabel: 'No',
                    acceptButtonStyleClass: 'p-button-danger',
                    rejectButtonStyleClass: 'p-button',
                    accept: () => {
                        const empresa = this.globalService.getCodigoEmpresa();
                        const numero = presupuesto.pagoNumero;

                        this.presupuestoService.eliminarPresupuesto(empresa, numero).subscribe({
                            next: (response) => {
                                if (response.isSuccess) {
                                    this.messageService.add({
                                        severity: 'success',
                                        summary: 'Éxito',
                                        detail: 'Presupuesto eliminado correctamente',
                                        life: 5000
                                    });
                                    const fecha = new Date();
                                    this.cargarPresupuesto(
                                        empresa,
                                        fecha.getFullYear().toString(),
                                        (fecha.getMonth() + 1).toString().padStart(2, '0')
                                    );
                                } else {
                                    this.messageService.add({
                                        severity: 'error',
                                        summary: 'Error',
                                        detail: response.message || 'Error al eliminar el presupuesto',
                                        life: 5000
                                    });
                                }
                            },
                            error: (error) => {
                                this.messageService.add({
                                    severity: 'error',
                                    summary: 'Error',
                                    detail: `Error al eliminar el presupuesto: ${error.message}`,
                                    life: 5000
                            });
                            },
                        });
                    },
                });
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: `Error al verificar los detalles del presupuesto: ${error.message}`,
                    life: 5000
                });
            },
        });
    }
    confirmarPago(presupuesto: cabeceraPresupuesto) {
        this.selectedPagoNumero = presupuesto.pagoNumero;
        
        this.verConfirmarPago = true;
    }
    onCloseModal() {
        if (this.confirmarpagocomponente) {
            this.confirmarpagocomponente.limpiar();
        }
        this.verConfirmarPago = false;
        this.cargarMedioPago();
        this.globalService.selectedDate$.subscribe((date) => {
            if (date) {
                const year = date.getFullYear().toString();
                const month = (date.getMonth() + 1).toString().padStart(2, '0');
                this.cargarPresupuesto(
                    this.globalService.getCodigoEmpresa(),
                    year,
                    month
                );
            }
        });
    }
    uploadFunction() {}

    abrirdocumento(numeroPresupuesto: string): void {
        this.presupuestoService
            .obtenerArchivo(
                this.globalService.getCodigoEmpresa(),
                this.anioFecha,
                this.mesFecha,
                numeroPresupuesto
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

    anio_dato: string = '';
    mes_dato: string = '';

    anularPago(presupuesto: cabeceraPresupuesto) {
        this.confirmationService.confirm({
            message: `
                <p style="text-align: center;">
                    ¿Está seguro de anular?
                </p>
                <div style="text-align: center; margin-top: 10px;">
                    <p>
                        <strong>Número de pago: </strong>${presupuesto.pagoNumero}
                    </p>
                </div>
            `,
            header: 'Anular comprobante de pago',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí',
            rejectLabel: 'No',
            acceptButtonStyleClass: 'p-button-danger ',
            rejectButtonStyleClass: 'p-button',
            accept: () => {
                this.globalService.selectedDate$.subscribe((date) => {
                    if (date) {
                        this.anio_dato = date.getFullYear().toString();
                        this.mes_dato = (date.getMonth() + 1)
                            .toString()
                            .padStart(2, '0');
                    }
                });
                const parametrosanulacion = {
                    empresa: this.globalService.getCodigoEmpresa(),
                    anio: this.anio_dato,
                    mes: this.mes_dato,
                    numeropresupuesto: presupuesto.pagoNumero,
                };
                this.presupuestoService
                    .anulaComprobante(parametrosanulacion)
                    .subscribe({
                        next: (response) => {
                            if (response.isSuccess) {
                                verMensajeInformativo(
                                    this.messageService,
                                    'success',
                                    'Éxito',
                                    'Pago anulado correctamente'
                                );
                                this.globalService.selectedDate$.subscribe(
                                    (date) => {
                                        if (date) {
                                            const year = date
                                                .getFullYear()
                                                .toString();
                                            const month = (date.getMonth() + 1)
                                                .toString()
                                                .padStart(2, '0');
                                            this.cargarPresupuesto(
                                                this.globalService.getCodigoEmpresa(),
                                                year,
                                                month
                                            );
                                        }
                                    }
                                );
                            } else {
                                verMensajeInformativo(
                                    this.messageService,
                                    'error',
                                    'Error',
                                    response.message ||
                                        `Error al anular el pago`
                                );
                            }
                        },
                        error: (error) => {
                            verMensajeInformativo(
                                this.messageService,
                                'error',
                                'Error',
                                `Error al anular el pago: ${error.message}`
                            );
                        },
                    });
            },
            reject: () => {
                verMensajeInformativo(
                    this.messageService,
                    'info',
                    'Cancelado',
                    'Anulación de pago cancelada'
                );
            },
        });
    }
    generarArchivoInterbank():void{
        

    }

}
