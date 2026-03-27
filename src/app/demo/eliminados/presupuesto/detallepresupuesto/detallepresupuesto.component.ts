import { CommonModule, DatePipe, getLocaleCurrencyName } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { PanelModule } from 'primeng/panel';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { BreadcrumbService } from 'src/app/demo/service/breadcrumb.service';
import { Detallepresupuesto, mediopago_lista } from '../../../model/presupuesto';
import { PresupuestoService } from 'src/app/demo/service/presupuesto.service';
import { InputNumberModule } from 'primeng/inputnumber';
import { GlobalService } from 'src/app/demo/service/global.service';
import { DialogModule } from 'primeng/dialog';
import { AgregarPagoComponent } from '../agregar-pago/agregar-pago.component';
import { saveAs } from 'file-saver';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { InterbankArchivoCab, InterbankArchivoDet } from 'src/app/demo/model/InterbankArchivo';
import { verMensajeInformativo, formatDate, formatDateForFilename, formatDateWithTime } from 'src/app/demo/components/utilities/funciones_utilitarias';
import { BanbifArchivoCab } from 'src/app/demo/model/BanbifArchivo';
import { BCPArchivoCab, BCPArchivoDet } from 'src/app/demo/model/BCPArchivo';
@Component({
    selector: 'app-detallepresupuesto',
    standalone: true,
    imports: [
        BreadcrumbModule,
        RouterModule,
        ToastModule,
        ConfirmDialogModule,
        TableModule,
        PanelModule,
        CalendarModule,
        InputTextModule,
        InputNumberModule,
        ButtonModule,
        CommonModule,
        FormsModule,
        DialogModule,
        AgregarPagoComponent,
    ],
    templateUrl: './detallepresupuesto.component.html',
    styleUrl: './detallepresupuesto.component.css',
    providers: [ConfirmationService, MessageService, DatePipe],
})
export class DetallepresupuestoComponent implements OnInit {
    @ViewChild(AgregarPagoComponent) agregarPagoComponent: AgregarPagoComponent;
    DetallePago: Detallepresupuesto[] = [];
    navigationData: any;
    items: any[] = [];
    pagnro: string;
    fechaString: string;
    fecha: Date;
    motivo: string;
    medio: string;
    bancoCodMedioPago:string;
    groupTotals: any[] = [];
    load: boolean = false;
    displayAgregarModal: boolean = false;

    editingRow: Detallepresupuesto | null = null;
    isAnyRowEditing: boolean = false;
    editingIndex: number | null = null; // Índice de la fila en edición
    selectedOption: Detallepresupuesto[] = []; // row selection multiple
    // fecha hoy
    fechahoy: Date;
    //generar txt
    constructor(
        private messageService: MessageService,
        private presupuestoservice: PresupuestoService,
        private bs: BreadcrumbService,
        private router: Router,
        private ms: MessageService,
        private datePipe: DatePipe,
        private confirmationService: ConfirmationService,
        private globalService: GlobalService
    ) {
        //variables de edición

        /*

        */
        const navigation = router.getCurrentNavigation();
        if (navigation?.extras?.state) {
            this.navigationData = navigation.extras.state;
             this.bancoCodMedioPago = this.navigationData.bancoCodMedioPago;
            
        } else {
            this.router.navigate(['Home/presupuesto']);
        }
    }

    ngOnInit(): void {
        this.bs.setBreadcrumbs([
            { icon: 'pi pi-home', routerLink: '/Home' },
            {
                label: 'Presupuesto',
                routerLink:
                    '/Home/presupuesto' /*, command: () => this.volverAListado()*/,
            },
            {
                label: 'Detalle presupuesto',
                routerLink: '/Home/detalle-presupuesto',
            },
        ]);
        this.bs.currentBreadcrumbs$.subscribe((bc) => {
            this.items = bc;
        });
        this.cargarDetalles();
        this.valoresCampos();
        this.calculateGroupTotals();
        // inicializar el pdfmake
        (<any>pdfMake).vfs = pdfFonts.pdfMake.vfs;
    }

    cargarDetalles() {
        this.load = true;

        this.presupuestoservice
            .obtenerDetallePresupuesto(
                this.globalService.getCodigoEmpresa(),
                this.navigationData.PagoNro
            )
            .subscribe({
                next: (data) => {
                    
                    this.DetallePago = data;
                    //);
                        
                    if (data.length === 0) {
                        //verMensajeInformativo(
                        //    this.messageService,
                        //    'warn',
                        //    'Advertencia',
                        //    'No se encontraron detalles del presupuesto'
                        
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
        this.pagnro = this.navigationData?.PagoNro || '';
        this.fechaString = this.navigationData?.Fecha;

        if (this.fechaString) {
            const [day, month, year] = this.fechaString.split('/').map(Number);
            this.fecha = new Date(year, month - 1, day); // Mes comienza desde 0
        } else {
            this.fecha = null; // O un valor predeterminado
        }
        this.motivo = this.navigationData?.motivo || '';

        this.medio = this.navigationData?.nombreMedioPago || '';
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

    calculateGroupTotal(ruc: string, field: string): number {
        return this.DetallePago.filter((item) => item.ban02Ruc === ruc).reduce(
            (sum, item) => sum + (item[field] || 0),
            0
        );
    }

    getTotalColumn(field: string): number {
        return this.DetallePago.reduce(
            (sum, item) => sum + (item[field] || 0),
            0
        );
    }

    DatosdeRegistro() {
        this.displayAgregarModal = true;
    }
    onCloseModal() {
        if (this.agregarPagoComponent) {
            this.agregarPagoComponent.resetForm();
        }
        this.displayAgregarModal = false;
        this.agregarPagoComponent.onCerrar();
        this.cargarDetalles();
    }

    esEditablePagoSoles: boolean = false;
    esEditablePagoDolares: boolean = false;

    startEditing(detalle: Detallepresupuesto, index: number) {
        if (this.isAnyRowEditing) {
            //verMensajeInformativo(this.messageService,'warn', 'Advertencia', 'Termina la edición actual antes de editar otra fila.');
            return;
        }
        //editar la columna  pago segun el tipo de moneda

        this.editingRow = { ...detalle }; // Copia los datos para editar
        this.editingIndex = index; // Guarda el índice de la fila
        this.isAnyRowEditing = true;
        //const tipoMoneda =  this.editingRow.ban02Moneda;

        if (detalle.nombremoneda === 'SOLES') {
            this.esEditablePagoSoles = true;
            this.esEditablePagoDolares = false;
        } else if (detalle.nombremoneda === 'DOLARES') {
            this.esEditablePagoSoles = false;
            this.esEditablePagoDolares = true;
        } else {
            // Si no es ninguno de los dos, editar los dos xD
            this.esEditablePagoSoles = true;
            this.esEditablePagoDolares = true;
        }
    }

    cancelEditing() {
        this.editingRow = null;
        this.editingIndex = null;
        this.isAnyRowEditing = false;
    }

    saveEditing() {
        if (this.editingRow && this.editingIndex !== null) {
            const payload = this.buildBackendPayload(this.editingRow);

            this.presupuestoservice
                .actualizarDetallePresupuesto(payload)
                .subscribe({
                    next: (response) => {
                        // Actualiza la fila en la lista original
                        this.DetallePago[this.editingIndex] = {
                            ...this.editingRow,
                        };
                        verMensajeInformativo(this.messageService, 'success', 'Éxito', 'Detalle actualizado correctamente');
                        this.cancelEditing();
                        this.cargarDetalles();
                    },
                    error: (error) => {
                        verMensajeInformativo(this.messageService, 'error', 'Error', `Error al actualizar: ${error.message}`);
                    },
                });
        }
    }

    buildBackendPayload(detalle: Detallepresupuesto): any {


        return {
            ban02Empresa: this.globalService.getCodigoEmpresa(),
            ban02Ruc: detalle.ban02Ruc,
            ban02Tipodoc: detalle.nombreTipoDocumento || '01',
            ban02NroDoc: detalle.ban02NroDoc,
            ban02Codigo: detalle.ban02Codigo || 'COD001',
            razonSocial: detalle.razonsocial,
            nombreMoneda: detalle.nombremoneda,
            nombreTipoDocumento: detalle.nombreTipoDocumento,
            ban02Numero: this.pagnro || 'NUM001',
            ban02Fecha: this.datePipe.transform(new Date(), 'dd/MM/yyyy'),
            ban02TipoCambio: 0,
            ban02TipoAplic: '01',
            ban02Moneda: detalle.ban02Moneda || 'PEN',
            ban02Soles: detalle.ban02Soles,
            ban02Dolares: detalle.ban02Dolares,
            ban02SolesVale: 0,
            ban02DolaresVale: 0,
            ban02Concepto: detalle.razonsocial,
            ban02GiroOrden: 'No se',
            ban02BcoLiquidacion: '00',
            ban02Redondeo: '0',
            ban02Usuario: this.globalService.getNombreUsuario(),
            ban02Pc: 'PC001',
            ban02FechaRegistro: this.datePipe.transform(
                new Date(),
                'yyyy-MM-dd'
            ),
            ban02Estado: 'ElabP',
            ban02EstadoTemp: 'P',
            ban02pagosoles: detalle.ban02PagoSoles,
            ban02PagoDolares: detalle.ban02PagoDolares,
            ban02TasaDetraccion: detalle.ban02Tasadetraccion,
            //importeDetraccion: detalle.importeDetraccion,
            ban02ImporteDetraccionSoles: detalle.ban02ImporteDetraccionSoles,
            // ban02ImporteDetraccionSoles:196,
            ban02ImporteDetraccionDolares: detalle.ban02ImporteDetraccionDolares,
            ban02TasaRetencion: detalle.ban02TasaRetencion,
            ban02ImporteRetencionSoles: detalle.ban02ImporteRetencionSoles,
            ban02ImporteRetencionDolares: detalle.ban02ImporteRetencionDolares,
            ban02TasaPercepcion: detalle.ban02TasaPercepcion,
            ban02ImportePercepcionSoles: detalle.ban02ImportePercepcionSoles,
            ban02ImportePercepcionDolares:
                detalle.ban02ImportePercepcionDolares,
            ban02NetoSoles: detalle.ban02NetoSoles,
            ban02NetoDolares: detalle.ban02NetoDolares,
        };
    }

    eliminarPago(detalle: Detallepresupuesto) {
        this.confirmationService.confirm({
            message: `
                <p style="text-align: center;">
                    ¿Está seguro de eliminar el presupuesto?
                </p>
                <div style="text-align: center; margin-top: 10px;">
                    <p>
                        <strong>Número documento: </strong>${detalle.ban02NroDoc
                }
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
                //const numero = presupuesto.pagoNumero;

                const numeroPresupuesto = this.navigationData.PagoNro;
                const numeroPresupuestoDetalle = detalle.ban02Codigo;
                this.presupuestoservice
                    .eliminarPresupuestoDetalle(
                        empresa,
                        numeroPresupuesto,
                        numeroPresupuestoDetalle
                    )
                    .subscribe({
                        next: (response) => {
                            if (response.isSuccess) {
                                verMensajeInformativo(this.messageService, 'success', 'Éxito', 'Presupuesto detalle eliminado correctamente');
                                this.cargarDetalles();
                            } else {
                                verMensajeInformativo(this.messageService, 'error', 'Error', response.message || 'Error al eliminar el presupuesto');
                            }
                        },
                        error: (error) => {
                            verMensajeInformativo(this.messageService, 'error', 'Error', `Error al eliminar el presupuesto: ${error.message}`);
                        },
                    });
            },
        });
    }

    calcularNetoPago(detalle: Detallepresupuesto, monedaEdicion: string) {
        //let tipoCambio = this.editingRow.ban02TipoCambio;
        const tipoCambio = detalle.ban02TipoCambio;
        let importeNetoSoles: number = 0;
        let montoPagoSoles: number = this.editingRow.ban02PagoSoles;
        let montoPagoDolares: number = this.editingRow.ban02PagoDolares;
      
        const tasaRetencion = this.editingRow.ban02TasaRetencion;
        const tasaDetraccion = this.editingRow.ban02Tasadetraccion;
        const tasaPercepcion = this.editingRow.ban02TasaPercepcion;

  

        let importeDetraccionSoles: number = 0,
            importeRetencionSoles: number = 0,
            importePercepcionSoles: number = 0;
        let importeDetraccionDolares: number = 0,
            importeRetencionDolares: number = 0,
            importePercepcionDolares: number = 0;

        let netoSoles = 0,
            netoDolares = 0;
 
        let numeroTipoCambio: number = Number(tipoCambio);
        if (monedaEdicion == 'S') {
            //calculo de importe en soles de afectaciones
            importeDetraccionSoles = (tasaDetraccion / 100) * montoPagoSoles;

            importeRetencionSoles = (tasaRetencion / 100) * montoPagoSoles;
            importePercepcionSoles = (tasaPercepcion / 100) * montoPagoSoles;

            netoSoles =
                montoPagoSoles -
                (importeDetraccionSoles +
                    importeRetencionSoles +
                    importePercepcionSoles);


            montoPagoDolares = montoPagoSoles / numeroTipoCambio;
       
            importeDetraccionDolares =
                (tasaDetraccion / 100) * montoPagoDolares;
            importeRetencionDolares = (tasaRetencion / 100) * montoPagoDolares;
            importePercepcionDolares = (tasaRetencion / 100) * montoPagoDolares;
            netoDolares =
                montoPagoDolares -
                (importeDetraccionDolares +
                    importeRetencionDolares +
                    importePercepcionDolares);
        } else if (monedaEdicion == 'D') {
            importeDetraccionDolares =
                (tasaDetraccion / 100) * montoPagoDolares;
            importeRetencionDolares = (tasaRetencion / 100) * montoPagoDolares;
            importePercepcionDolares =
                (tasaPercepcion / 100) * montoPagoDolares;


            netoDolares =
                montoPagoDolares -
                (importeDetraccionDolares +
                    importeRetencionDolares +
                    importePercepcionDolares);

            //cambio en soles soles
            //Convertir segun el tiop de cambio mont de pago dolares a monto pago soles ;
            montoPagoSoles = montoPagoDolares * numeroTipoCambio;
   
            importeDetraccionSoles = (tasaDetraccion / 100) * montoPagoSoles;
            importeRetencionSoles = (tasaRetencion / 100) * montoPagoSoles;
            importePercepcionSoles = (tasaRetencion / 100) * montoPagoSoles;
            netoSoles =
                montoPagoSoles -
                (importeDetraccionSoles +
                    importeRetencionSoles +
                    importePercepcionSoles);
            // montoPagoSoles = montoPagoDolares*numeroTipoCambio;
            // montoPagoDolares =  montoPagoSoles/ numeroTipoCambio;
        }

        //asignar valor de improte detraccion
        if (monedaEdicion == 'S') {
            detalle.importeDetraccion = importeDetraccionSoles;
        } else if (monedaEdicion == 'D') {
            detalle.importeDetraccion = importeDetraccionDolares;
        }



        this.editingRow.ban02PagoDolares = montoPagoDolares;
        this.editingRow.ban02PagoSoles = montoPagoSoles;

        if (monedaEdicion == 'S') {
            this.editingRow.importeDetraccion = importeDetraccionSoles;
        } else if (monedaEdicion == 'D') {
            this.editingRow.importeDetraccion = importeDetraccionDolares;
        }

        //this.editingRow.importeDetraccion = importeDetraccionSoles;

      
        detalle.ban02ImporteDetraccionSoles = importeDetraccionSoles;

        detalle.ban02ImporteRetencionSoles = importeRetencionSoles;
        detalle.ban02ImportePercepcionSoles = importePercepcionSoles;

        this.editingRow.ban02ImportePercepcionSoles = importePercepcionSoles;
        this.editingRow.ban02ImporteRetencionSoles = importeRetencionSoles;
        this.editingRow.ban02ImporteDetraccionSoles = importeDetraccionSoles;

        this.editingRow.ban02ImporteRetencionDolares = importeRetencionDolares;
        this.editingRow.ban02ImporteDetraccionDolares =
            importeDetraccionDolares;
        this.editingRow.ban02ImportePercepcionDolares =
            importePercepcionDolares;
        this.editingRow.ban02NetoDolares = netoDolares;
   
        this.editingRow.ban02NetoSoles = netoSoles;

        detalle.ban02NetoDolares = netoDolares;

  
        detalle.ban02NetoSoles = netoSoles;
    }
    
    exportarPDFPendiente(){

        
    }

    exportarPDF() {
        if (!this.DetallePago || this.DetallePago.length === 0) {
            // verMensajeInformativo(this.messageService,'warn', 'Advertencia', 'No hay datos para exportar');
            return;
        }
        // Definimos las cabeceras
        const headers = [
            [
                { text: 'Item', rowSpan: 2, style: 'tableHeader' },
                { text: 'RUC', rowSpan: 2, style: 'tableHeader' },
                { text: 'Razon Social', rowSpan: 2, style: 'tableHeader' },
                { text: 'Tipo Doc', rowSpan: 2, style: 'tableHeader' },
                { text: 'Numero', rowSpan: 2, style: 'tableHeader' },
                { text: 'Moneda Original', rowSpan: 2, style: 'tableHeader' },
                { text: 'Fecha emision', rowSpan: 2, style: 'tableHeader' },
                { text: 'Fecha vencimiento', rowSpan: 2, style: 'tableHeader' },
                { text: 'Importe Total S/.', rowSpan: 2, style: 'tableHeader' },
                { text: 'Importe Total US$', rowSpan: 2, style: 'tableHeader' }, // 10
                { text: '', colSpan: 2, style: 'tableHeader' }, // 11  , 12
                '', // 13
                { text: 'Detraccion', colSpan: 4, style: 'tableHeader' }, // 3 a 4 = 14,15,16,17
                '',
                '',
                '',
                { text: 'Retencion', colSpan: 2, style: 'tableHeader' },
                '',
                { text: 'Percepcion', colSpan: 2, style: 'tableHeader' },
                '',
                { text: 'Neto a Pagar', colSpan: 2, style: 'tableHeader' },
                '',
            ],
            [
                '',
                '',
                '',
                '',
                '',
                '',
                '',
                '',
                '',
                '', // 10
                { text: 'Monto a Pagar S/.', style: 'tableHeader' }, // 11
                { text: 'Monto a Pagar $', style: 'tableHeader' }, // 12
                { text: 'Tipo', style: 'tableHeader' }, // 13 
                { text: 'Tasa', style: 'tableHeader' }, // 14
                { text: 'Importe Soles', style: 'tableHeader' },
                { text: 'Importe Dolares', style: 'tableHeader' }, // NUEVA COLUMNA Importe Dolares
                { text: 'Importe Soles', style: 'tableHeader' },
                { text: 'Importe Dolares', style: 'tableHeader' }, // NUEVA COLUMNA Retencion Dolares
                { text: 'Importe Soles', style: 'tableHeader' },
                { text: 'Importe Dolares', style: 'tableHeader' }, // NUEVA COLUMNA Percepcion Dolares
                { text: 'S/.', style: 'tableHeader' },
                { text: 'US$', style: 'tableHeader' },
            ],
        ];

        // Agrupamos por RUC
        const groupedData = {};
        this.DetallePago.forEach((item) => {
            if (!groupedData[item.ban02Ruc]) {
                groupedData[item.ban02Ruc] = [];
            }
            groupedData[item.ban02Ruc].push(item);
        });

        // Formato para los numeros
        const formatNumber = (num) => {
            const numero = Number(num);
            if (isNaN(numero)) return '0.00';

            return numero.toLocaleString('es-PE', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            });
        };

        const formatCell = (value: any) => ({
            text: formatNumber(value),
            alignment: 'right'
        })


        // Cuerpo de la tabla
        const body = [...headers];

        Object.keys(groupedData).forEach((ruc) => {
            const groupItems = groupedData[ruc];
            groupItems.forEach((item) => {
                body.push([
                    item.item,
                    item.ban02Ruc,
                    item.razonsocial,
                    item.nombreTipoDocumento,
                    item.ban02NroDoc,
                    item.nombremoneda,
                    item.ban02FechaEmision,
                    item.ban02FechaVencimiento,
                    formatCell(item.ban02Soles),
                    formatCell(item.ban02Dolares),
                    formatCell(item.ban02PagoSoles),
                    formatCell(item.ban02PagoDolares),
                    item.ban02TipoDetraccion || '',
                    item.ban02Tasadetraccion || '',
                    formatCell(item.ban02ImporteDetraccionSoles),
                    formatCell(item.ban02ImporteDetraccionDolares), // Nuevo campo Importe Dolares
                    formatCell(item.ban02ImporteRetencionSoles),
                    formatCell(item.ban02ImporteRetencionDolares), // NUEVA COLUMNA RETENCION DÓLARES
                    formatCell(item.ban02ImportePercepcionSoles),
                    formatCell(item.ban02ImportePercepcionDolares), // NUEVA COLUMNA PERCEPCIÓN DÓLARES
                    formatCell(item.ban02NetoSoles),
                    formatCell(item.ban02NetoDolares),
                ]);
            });

            // NUEVO SUBTOTAL Importe Dolares
            const detraccionDolaresSubtotal = this.calculateGroupTotal(
                ruc, 'ban02ImporteDetraccionDolares'
            );

            const solesSubtotal = this.calculateGroupTotal(ruc, 'ban02Soles');
            const dolaresSubtotal = this.calculateGroupTotal(
                ruc,
                'ban02Dolares'
            );

            const detraccionSubtotal = this.calculateGroupTotal(
                ruc,
                'ban02ImporteDetraccionSoles'
            );
            const retencionSubtotal = this.calculateGroupTotal(
                ruc,
                'ban02ImporteRetencionSoles'
            );
            // NUEVO SUBTOTAL RETENCION DÓLARES
            const retencionDolaresSubtotal = this.calculateGroupTotal(
                ruc,
                'ban02ImporteRetencionDolares'
            );

            const percepcionSubtotal = this.calculateGroupTotal(
                ruc,
                'ban02ImportePercepcionSoles'
            );
            // NUEVO SUBTOTAL PERCEPCIÓN DÓLARES
            const percepcionDolaresSubtotal = this.calculateGroupTotal(
                ruc,
                'ban02ImportePercepcionDolares'
            );
            const netoSolesSubtotal = this.calculateGroupTotal(
                ruc,
                'ban02NetoSoles'
            );
            const netoDolaresSubtotal = this.calculateGroupTotal(
                ruc,
                'ban02NetoDolares'
            );

            body.push([
                { text: '', colSpan: 8, style: 'subtotal' },
                '',
                '',
                '',
                '',
                '',
                '',
                '',
                {
                    text: formatNumber(solesSubtotal),
                    style: 'subtotal',
                    colSpan: 1,
                },
                {
                    text: formatNumber(dolaresSubtotal),
                    style: 'subtotal',
                    colSpan: 1,
                },
                { text: '', style: 'subtotal', colSpan: 1 },
                { text: '', style: 'subtotal', colSpan: 1 },
                { text: '', style: 'subtotal', colSpan: 1 },
                { text: '', style: 'subtotal', colSpan: 1 },
                {
                    text: formatNumber(detraccionSubtotal),
                    style: 'subtotal',
                    colSpan: 1,
                },
                {
                    text: formatNumber(detraccionDolaresSubtotal), // Nuevo subtotal Detraccion Dolares
                    style: 'subtotal',
                    colSpan: 1,
                },
                {
                    text: formatNumber(retencionSubtotal),
                    style: 'subtotal',
                    colSpan: 1,
                },
                {
                    text: formatNumber(retencionDolaresSubtotal), // NUEVO SUBTOTAL RETENCION DÓLARES
                    style: 'subtotal',
                    colSpan: 1,
                },
                {
                    text: formatNumber(percepcionSubtotal),
                    style: 'subtotal',
                    colSpan: 1,
                },
                {
                    text: formatNumber(percepcionDolaresSubtotal), // NUEVO SUBTOTAL PERCEPCIÓN DÓLARES
                    style: 'subtotal',
                    colSpan: 1,
                },
                {
                    text: formatNumber(netoSolesSubtotal),
                    style: 'subtotal',
                    colSpan: 1,
                },
                {
                    text: formatNumber(netoDolaresSubtotal),
                    style: 'subtotal',
                    colSpan: 1,
                },
            ]);
        });


        const totalSoles = this.getTotalColumn('ban02Soles');
        const totalDolares = this.getTotalColumn('ban02Dolares');
        const totalDetraccion = this.getTotalColumn(
            'ban02ImporteDetraccionSoles'
        );
        // Nuevo total Detraccion Dolares
        const totalDetraccionDolares = this.getTotalColumn(
            'ban02ImporteDetraccionDolares'
        );
        const totalRetencion = this.getTotalColumn(
            'ban02ImporteRetencionSoles'
        );
        // NUEVO TOTAL RETENCIÓN DÓLARES
        const totalRetencionDolares = this.getTotalColumn(
            'ban02ImporteRetencionDolares'
        );
        const totalPercepcion = this.getTotalColumn(
            'ban02ImportePercepcionSoles'
        );
        // NUEVO TOTAL PERCEPCIÓN DÓLARES
        const totalPercepcionDolares = this.getTotalColumn(
            'ban02ImportePercepcionDolares'
        );
        const totalNetoSoles = this.getTotalColumn('ban02NetoSoles');
        const totalNetoDolares = this.getTotalColumn('ban02NetoDolares');

        body.push([
            { text: '', colSpan: 7, style: 'total' },
            '',
            '',
            '',
            '',
            '',
            '',
            { text: 'Sumas', style: 'total', colSpan: 1, alignment: 'left' } as any,
            { text: formatNumber(totalSoles), style: 'total', colSpan: 1 },
            { text: formatNumber(totalDolares), style: 'total', colSpan: 1 },
            { text: '', style: 'total', colSpan: 1 },
            { text: '', style: 'total', colSpan: 1 },
            { text: '', style: 'total', colSpan: 1 },
            { text: '', style: 'total', colSpan: 1 },
            { text: formatNumber(totalDetraccion), style: 'total', colSpan: 1 },
            { text: formatNumber(totalDetraccionDolares), style: 'total', colSpan: 1 }, // Importe Dolares
            { text: formatNumber(totalRetencion), style: 'total', colSpan: 1 },
            { text: formatNumber(totalRetencionDolares), style: 'total', colSpan: 1 }, // NUEVO TOTAL RETENCION DOLARES
            { text: formatNumber(totalPercepcion), style: 'total', colSpan: 1 },
            { text: formatNumber(totalPercepcionDolares), style: 'total', colSpan: 1 }, // NUEVO TOTAL PERCEPCIÓN DÓLARES
            { text: formatNumber(totalNetoSoles), style: 'total', colSpan: 1 },
            {
                text: formatNumber(totalNetoDolares),
                style: 'total',
                colSpan: 1,
            },
        ]);




        // Estructura y estilos del pdf, medio complicado es
        const docDefinition = {
            pageOrientation: 'landscape',
            pageMargins: [15, 15, 15, 15],
            content: [
                //title
                { text: 'Detalle de Presupuesto', style: 'header' },
                //description
                {
                    columns: [
                        {
                            width: 'auto',
                            text: [
                                { text: 'Numero de Pago: ', style: 'label' },
                                { text: this.pagnro, style: 'value' },
                            ],
                        },
                        {
                            width: 'auto',
                            text: [
                                { text: 'Fecha: ', style: 'label' },
                                { text: this.fechaString, style: 'value' },
                            ],
                            margin: [20, 0, 0, 0],
                        },
                        {
                            width: 'auto',
                            text: [
                                { text: 'Motivo: ', style: 'label' },
                                { text: this.motivo, style: 'value' },
                            ],
                            margin: [20, 0, 0, 0],
                        },
                        {
                            width: 'auto',
                            text: [
                                { text: 'Medio Pago: ', style: 'label' },
                                { text: this.medio, style: 'value' },
                            ],
                            margin: [20, 0, 0, 0],
                        },
                    ],
                    margin: [0, 0, 0, 10],
                },
                //table
                {
                    table: {
                        headerRows: 2,
                        widths: [
                            15, 38, 58, 26, 40, 26, 32, 39, 30, 31, 30, 30, 15,
                            15, 24, 25 , 24 , 25 , 25 , 25 ,  31 , 31,
                        ],
                        body: body,
                        alignment: 'center',
                    },
                    layout: {
                        hLineWidth: function (i, node) {
                            return i === 0 ||
                                i === 1 ||
                                i === 2 ||
                                i === node.table.body.length
                                ? 1
                                : 0.3;
                        },
                        vLineWidth: function (i, node) {
                            return 0.3;
                        },
                        hLineColor: function (i, node) {
                            return i === 0 ||
                                i === 1 ||
                                i === 2 ||
                                i === node.table.body.length
                                ? 'black'
                                : '#aaa';
                        },
                        vLineColor: function (i, node) {
                            return '#aaa';
                        },
                        paddingTop: function (i) {
                            return 4;
                        },
                        paddingBottom: function (i) {
                            return 4;
                        },
                    },
                },
            ],
            styles: {
                header: {
                    fontSize: 15,
                    bold: true,
                    alignment: 'center',
                    margin: [0, 0, 0, 11],
                },
                label: {
                    bold: true,
                    fontSize: 8,
                },
                value: {
                    fontSize: 8,
                },
                tableHeader: {
                    bold: true,
                    fontSize: 7,
                    alignment: 'center',
                    fillColor: '#eeeeee',
                    margin: [0, 5],
                },
                subtotal: {
                    bold: true,
                    fontSize: 6,
                    alignment: 'right',
                },
                total: {
                    bold: true,
                    fontSize: 6,
                    alignment: 'right',
                },
            },
            defaultStyle: {
                fontSize: 6,
                alignment: 'left',
            },
        };

        // Generamos el pdf
        //pdfMake.createPdf(docDefinition).download('DetallePrespupuesto_' + this.pagnro + '.pdf');

        const fileName = 'DetallePrespupuesto_' +
            this.pagnro +
            '_' +
            formatDateWithTime((this.fechahoy = new Date())) +
            '.pdf';

        pdfMake.createPdf(docDefinition).open({
            filename: fileName
        });
        /*pdfMake.createPdf(docDefinition).getBlob((blob) => {
            const blobUrl = URL.createObjectURL(blob);
            window.open(blobUrl, '_blank');

            setTimeout(() => {
                URL.revokeObjectURL(blobUrl);
            }, 100);
        });*/
    }
    
    generarArchivoPago(){
        
        if(this.bancoCodMedioPago == '01'){
             //banco interbank
                 
             this.generaArchivoInterbankCab();
            this.generaArchivoInterbankDet();
       
        }else if(this.bancoCodMedioPago == '02'){
            //banco banbif , codigo implementado pero con observaciones del resultado
            this.generaArchivoBIFCab();
            //this.generaArchivoBIFDet();
        }else if(this.bancoCodMedioPago == '03'){
            //banco BCP  falta implementa codigo en los metodo
            this.generaArchivoBCPCab();
            this.generaArchivoBCPDet();
        }else if(this.bancoCodMedioPago == '04'){
            //banco BBVA falta definir metodos  y codificacion  para el archivo 

        }
    }
    generaArchivoBIFCab(){
        //BanbifArchivoCab
        var listaCab: BanbifArchivoCab[] = [];
           if (!this.DetallePago || this.DetallePago.length === 0) {
            verMensajeInformativo(this.messageService,'warn', 'Advertencia', 'No hay datos para exportar');
             return;
        }

        const codigoEmpresa = this.globalService.getCodigoEmpresa();
        const numeroPresupesto = this.pagnro;
        const fechaActual:Date = new Date();
        const dia: number = fechaActual.getDate();
        const mes: number = fechaActual.getMonth() + 1;
        this.presupuestoservice.SpListaBanbifArchivoCab(codigoEmpresa, numeroPresupesto).subscribe({
            next:(data) =>{
                        try{

                            listaCab = data;

                                    if(data.length > 0){
                                        let contenido = '';
                                        listaCab.forEach((registro : BanbifArchivoCab) =>{
                                                    const linea = `${registro.tipoDocumentoProveedor}${registro.numeroDocumentoProveedor}${registro.nombreProveedor}`
                                                    +`${registro.tipoDocumentoPago}${registro.numeroDocumentoPago}${registro.monedaDocumentoPago}${registro.importePagar}`
                                                    +`${registro.fechaPago}${registro.codigoDocumentoPropioCliente}${registro.formaPago}`
                                                    +`${registro.codigoBanco}${registro.monedaCuenta}${registro.numeroCuenta}${registro.numDocAplicarNotaCredito}`
                                                    +`${registro.fechaAdelanto}${registro.constante}\n`;
                                                    contenido += linea;
                                            });
                                            const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
                                            const fechaActual = new Date();
                                            const nombreArchivo = `archivocarga_${formatDateForFilename(fechaActual)}.txt`;
                                            saveAs(blob, nombreArchivo);
                                            verMensajeInformativo(this.messageService, 'success', 'Éxito', 'Archivo TXT generado correctamente');
                                    }
                
                            }catch(error){
                                console.error('Error al generar archivo txt:', error);
                                    verMensajeInformativo(this.messageService, 'error', 'Error', 'Ocurrió un error al generar el archivo TXT');
                        
                            }
                        
                        
              
                },
                error:(error) =>{
                     verMensajeInformativo(
                        this.messageService,
                        'error',
                        'Error',
                        `Error al cargar archivo banco: ${error.message}`
                    );
                }
        });
    }
    generaArchivoBIFDet(){

    }
    generaArchivoBCPCab(){
          var listaCab : BCPArchivoCab[] = [];
        var registroCab : BCPArchivoCab;
        if (!this.DetallePago || this.DetallePago.length === 0) {
            verMensajeInformativo(this.messageService,'warn', 'Advertencia', 'No hay datos para exportar');
             return;
        }

        const codigoEmpresa = this.globalService.getCodigoEmpresa();
        const numeroPresupesto = this.pagnro;
        const nombreLotePresupuesto = 'Prov3007';

        this.presupuestoservice.SpListaBcpArchivoCab(codigoEmpresa, numeroPresupesto).subscribe({
                 next: (data) => { 
            try{
                    listaCab = data;
                    if(data.length > 0 ){
                        let contenido = '';
                        listaCab.forEach((registro: BCPArchivoCab)=>{
                            const linea = `${registro.tipoRegistro}${registro.cantidadAbonoPlanilla}`
                            +`${registro.fechaProceso}${registro.tipoCuentaCargo}${registro.monedaCuentaCargo}`
                            +`${registro.numeroCuentaCargo}${registro.montoTotalPlanilla}${registro.referenciaPlaanilla}`
                            +`${registro.flagexoneracionitf}${registro.totalControl}\n`;
                            contenido += linea;
                        });

                        const blob = new Blob([contenido],{type:'text/plain;charset=utf-8'});
                        const fechaActual = new Date();
                        const nombreArchivo = `BCPCab_${formatDateForFilename(fechaActual)}.txt`;
                        saveAs(blob, nombreArchivo);
                         verMensajeInformativo(this.messageService, 'success', 'Éxito', 'Archivo TXT generado correctamente');
                    }
                }catch(error){
                        console.error('Error al generar archivo txt:', error);
                            verMensajeInformativo(this.messageService, 'error', 'Error', 'Ocurrió un error al generar el archivo TXT');
                
                }
            }
        });

    }
    generaArchivoBCPDet(){
        let listaDet:  BCPArchivoDet[] = [];
        const codigoEmpresa = this.globalService.getCodigoEmpresa();
        const numeroPresupuesto = this.pagnro;
        console.log("evento cargar detalle bcp");
        this.presupuestoservice.SpListaBcpArchivoDet(codigoEmpresa, numeroPresupuesto)
            .subscribe({
                next:(data)=>{
                    try{
                        listaDet = data;
                        console.log("informacion de detalle bcp");
                        console.log(data);
                        if (data.length >0){
                            let contenido = '';
                            listaDet.forEach((registro:BCPArchivoDet)=>{
                            const linea = `${registro.tipoRegistro}${registro.tipoCuentaAbono}`
                            +`${registro.nroCuentaAbono}${registro.modalidadPago}`
                            +`${registro.tipoDocumentoProveedor}${registro.numeroDocuProveedor}`
                            +`${registro.correlativoProveedor}${registro.nombreProveedor}`
                            +`${registro.referenciabeneficiario}${registro.referenciaempresa}`
                            +`${registro.monedaImporteAbonar}${registro.importeAbonar}`
                            +`${registro.flagValidarIDC}\n`;
                            contenido +=linea;
                                console.log(linea);
                            });
                            console.log("valor de contenido");
                            console.log(contenido);
                            const blob = new Blob([contenido], {type:'text/plain;charset=utf-8'});
                            const fechaActual = new Date();
                            const nombreArchivo = `archivoBcpDet_${formatDateForFilename(fechaActual)}.txt`;
                            saveAs(blob, nombreArchivo);
                            verMensajeInformativo(this.messageService, 'success', 'Éxito', 'Archivo TXT generado correctamente');
                        }
                    }catch(error){
                        verMensajeInformativo(this.messageService, 
                                'error', 'Error', 'Ocurrió un error al generar el archivo TXT');
                    }
                }
            })
    }
    //generar archivo segun el banco
    generaArchivoInterbankCab(){
        var listaCab : InterbankArchivoCab[] = [];
        var registroCab : InterbankArchivoCab;
        if (!this.DetallePago || this.DetallePago.length === 0) {
            verMensajeInformativo(this.messageService,'warn', 'Advertencia', 'No hay datos para exportar');
             return;
        }
        const codigoEmpresa = this.globalService.getCodigoEmpresa();
        const numeroPresupesto = this.pagnro;
        const nombreLotePresupuesto = 'Prov3007';
         this.presupuestoservice.SpListaInterbankArchivoCab(codigoEmpresa, 
            nombreLotePresupuesto, numeroPresupesto ).subscribe({
                next: (data) => {

                    try{

                         listaCab = data;
                    if(data.length > 0)
                    {
                        let contenido = '';
                        listaCab.forEach((registro : InterbankArchivoCab) =>{
                                const linea = `${registro.codigoRegistro}${registro.rubro}${registro.codigoEmpresa}`
                                +`${registro.codigoServicio}${registro.cuentaCargo}${registro.tipoCuentaCargo}${registro.monedaCuentaCargo}`
                                +`${registro.nombreSolicitudLote}${registro.fechahoraCreacion}${registro.tipoProceso}`
                                +`${registro.fechaProceso}${registro.nroRegistro}${registro.totalSoles}${registro.totalDolares}`
                                +`${registro.versionMacro}\n`;
                                contenido += linea;
                        });
                        const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
                        const fechaActual = new Date();
                        const nombreArchivo = `archivocarga_${formatDateForFilename(fechaActual)}.txt`;
                        saveAs(blob, nombreArchivo);
                        verMensajeInformativo(this.messageService, 'success', 'Éxito', 'Archivo TXT generado correctamente');
                
                    }
                    }catch(error){
                        console.error('Error al generar archivo txt:', error);
                            verMensajeInformativo(this.messageService, 'error', 'Error', 'Ocurrió un error al generar el archivo TXT');
                
                    }
                   

                  
                },
                error:(error) =>{
                     verMensajeInformativo(
                        this.messageService,
                        'error',
                        'Error',
                        `Error al cargar archivo banco: ${error.message}`
                    );
                }
            });

            //archivo detalle
    }
    generaArchivoInterbankDet(){
        let listaDet: InterbankArchivoDet[] = [];
        //banco codigo 

        const codigoEmpresa = this.globalService.getCodigoEmpresa();
        const numeroPresupuesto = this.pagnro;
        this.presupuestoservice.SpListaInterbankArchivoDet(codigoEmpresa, numeroPresupuesto)
                .subscribe({
                    next:(data) =>{
                        try{
                            listaDet = data;
                            if(data.length> 0){
                                let contenido = '';
                                listaDet.forEach((registro: InterbankArchivoDet)=> {
                                    const linea = `${registro.codigoRegistro}${registro.codigoBeneficiario}${registro.tipoDocumentoPago}`
                                          +`${registro.numeroDocumentoPago}${registro.fechaVencimientoDocumento}${registro.monedaAbono}`
                                          +`${registro.montoAbono}${registro.indicadorBanco}${registro.tipoAbono}${registro.tipoCuenta}`
                                          +`${registro.monedaCuenta}${registro.oficinaCuenta}${registro.numeroCuenta}${registro.tipoPersona}`
                                          +`${registro.tipoDocumentoIdentidad}${registro.numeroDocumentoIdentidad}`
                                          +`${registro.nombreBeneficiario}${registro.monedaMontoIntagibleCTS}${registro.montoIntangibleCTS}`
                                          +`${registro.filler}${registro.numeroCelular}${registro.correoElectronico}\n`;
                                    contenido += linea;
                                });
                            const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
                        const fechaActual = new Date();
                        const nombreArchivo = `archivocargadet_${formatDateForFilename(fechaActual)}.txt`;
                        saveAs(blob, nombreArchivo);
                        verMensajeInformativo(this.messageService, 'success', 'Éxito', 'Archivo TXT generado correctamente');
                            }
                           
                        }catch(error){
                            verMensajeInformativo(this.messageService, 
                                'error', 'Error', 'Ocurrió un error al generar el archivo TXT');
                
                        }
                    }
                });
    }
    generarTXT() {
        if (!this.DetallePago || this.DetallePago.length === 0) {
            // verMensajeInformativo(this.messageService,'warn', 'Advertencia', 'No hay datos para exportar');
            return;
        }
        const codempresa = this.globalService.getCodigoEmpresa();
        this.presupuestoservice.obtenerMedioPago(codempresa).subscribe(
            (mediosPago: mediopago_lista[]) => {
                try {

                    const medioPagoEncontrado = mediosPago.find(m => m.ban01Descripcion === this.medio);
                    const idTipoPago = medioPagoEncontrado ? medioPagoEncontrado.ban01IdTipoPago : '00';
                    let contenido = '';
                    this.DetallePago.forEach((detalle: Detallepresupuesto) => {
                        const linea = `${detalle.item}|${idTipoPago}|${detalle.ban02NroDoc}|${this.formatearFecha(detalle.ban02FechaEmision)}|${this.formatearNumero(detalle.ban02Soles)}|${this.formatearNumero(detalle.ban02Dolares)}|${this.formatearNumero(detalle.ban02PagoSoles)}|${this.formatearNumero(detalle.ban02PagoDolares)}|${this.formatearNumero(detalle.ban02NetoSoles)}\n`;
                        // const linea = `${detalle.item}|${idTipoPago}|${detalle.ban02NroDoc}|${this.formatearFecha(detalle.ban02FechaEmision)}|${this.formatearNumero(detalle.ban02Soles)}|${this.formatearNumero(detalle.ban02Dolares)}|${this.formatearNumero(detalle.ban02PagoSoles)}|${this.formatearNumero(detalle.ban02PagoDolares)}|
                        // ${this.formatearNumero(detalle.nombremoneda === "SOLES" ? detalle.ban02Soles - detalle.importeDetraccion : detalle.ban02Dolares - detalle.importeDetraccion)}\n`;
                        contenido += linea;
                    });
                    const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
                    const fechaActual = new Date();
                    const nombreArchivo = `archivocarga_${formatDateForFilename(fechaActual)}.txt`;
                    //ejecuta los comandos en la terminal
                    //npm install file-saver --legacy-peer-deps
                    //npm install @types/file-saver --save-dev --legacy-peer-deps
                    saveAs(blob, nombreArchivo);
                    verMensajeInformativo(this.messageService, 'success', 'Éxito', 'Archivo TXT generado correctamente');
                } catch (error) {
                    console.error('Error al generar el archivo TXT:', error);
                    verMensajeInformativo(this.messageService, 'error', 'Error', 'Ocurrió un error al generar el archivo TXT');
                }
            })
    }

    //esto es para dar formato de fecha en el txt
    private formatearFecha(fecha: string | Date): string {
        if (!fecha) return '';
        const fechaObj = fecha instanceof Date ? fecha : new Date(fecha);
        if (isNaN(fechaObj.getTime())) return '';

        return formatDate(fechaObj);
    }
    //esto para dar formato a los numeros decimales
    private formatearNumero(valor: number | string): string {
        if (valor === null || valor === undefined || valor === '') return '0.00';
        const numero = typeof valor === 'string' ? parseFloat(valor) : valor;
        if (isNaN(numero)) return '0.00';

        return numero.toFixed(2);
    }

}
