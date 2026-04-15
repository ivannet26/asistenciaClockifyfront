import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { PanelModule } from 'primeng/panel';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ObtenerInformacion, VoucherContableCabecera, VoucherContableDetalle} from '../../../model/presupuesto';
import { ConfirmationService, MessageService } from 'primeng/api';
import { PresupuestoService } from 'src/app/demo/service/presupuesto.service';
import { BreadcrumbService } from 'src/app/demo/service/breadcrumb.service';
import { ActualizarVouchercontableComponent } from "../actualizar-vouchercontable/actualizar-vouchercontable.component";
import { RegContableDetService } from 'src/app/demo/service/reg-contable-det.service';
import { verMensajeInformativo,formatDateWithTime } from 'src/app/demo/components/utilities/funciones_utilitarias';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { group } from '@angular/animations';

@Component({
    selector: 'app-vouchercontable',
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
        ActualizarVouchercontableComponent,
    ],
    templateUrl: './vouchercontable.component.html',
    styleUrl: './vouchercontable.component.css',
    providers: [MessageService, DatePipe],
})
export class VouchercontableComponent implements OnInit {
    @ViewChild(ActualizarVouchercontableComponent) actualizarvoucherComponent:ActualizarVouchercontableComponent;
    voucherContableDetalle: VoucherContableDetalle[] = [];
    voucherContableCabecera: VoucherContableCabecera[] = [];
    navigationData: any;
    items: any[] = [];
    libro: string;
    libro_numero: string;
    fechaString: string;
    groupTotals: any[] = [];
    load: boolean = false;
    displayAgregarModal: boolean = false;

    //variable para mostrar informacion de la tabla
    mostrarInfo: boolean = false;

    editingRow: VoucherContableDetalle | null = null;
    isAnyRowEditing: boolean = false;
    editingIndex: number | null = null; // Índice de la fila en edición
    // fecha hoy
    fechahoy: Date;
    detalleSelected: VoucherContableDetalle;
    informacionEnviar: ObtenerInformacion;

    verConfirmarActualizacion: boolean = false;
    selectedVoucherC: string;
    selectedOption: VoucherContableDetalle[] = []; // row selection multiple
    // esDetraccionMasiva:boolean = false;
    // esDetraccionIndiivudla:boolean = false;
    // esRetencion:boolean = false;
    // esPresupuesto:boolean = false;
    constructor(
        private messageService: MessageService,
        private presupuestoservice: PresupuestoService,
        private bs: BreadcrumbService,
        private router: Router,
        private regContableService: RegContableDetService,
        private mS: MessageService,
        private confirmationService: ConfirmationService
    ) {
        //variables de edición

        const navigation = router.getCurrentNavigation();
        if (navigation?.extras?.state) {
            this.navigationData = navigation.extras.state;
        } else {
            this.router.navigate(['Home/presupuesto']);
        }
    }

    ngOnInit(): void {
        this.bs.clearBreadcrumbs();

        // this.bs.setBreadcrumbs([
        //     { icon: 'pi pi-home', routerLink: '/Home' },
        //     { label: 'Presupuesto', routerLink: '/Home/presupuesto' },
        //     { label: 'Voucher contable', routerLink: '/Home/voucher_contable' },
        // ]);
        this.bs.setBreadcrumbs([
            { icon: 'pi pi-home', routerLink: '/Home' },
            { label: this.navigationData.menuOrigen, routerLink: this.navigationData.rutaOrigen },
            { label: 'Voucher contable', routerLink: '/Home/voucher_contable' },
            ]);
        
        this.bs.currentBreadcrumbs$.subscribe((bc) => {
            this.items = bc;
        });

        this.cargarDatos();

        // inicializar el pdfmake
        (<any>pdfMake).vfs = pdfFonts.pdfMake.vfs;
    }

    cargarDatos() {
        //cargar cabecera voucher contable
        this.presupuestoservice
            .obtenerVoucherContableCabecera(
                this.navigationData.empresa,
                this.navigationData.PagoNro
            )
            .subscribe({
                next: (data) => {
                    this.voucherContableCabecera = data;
                    this.libro = this.voucherContableCabecera[0]?.libro ?? '';

                    this.libro_numero =
                        this.voucherContableCabecera[0]?.numero ?? '';
                    // console.log(
                    //     'Cabecera data: ',
                    //     this.voucherContableCabecera
                    // );
                    if (data.length === 0) {
                        verMensajeInformativo(this.messageService,'warn', 'Advertencia', 'No se encontró libro de nro voucher');
                    }
                },
                error: (error) => {
                    verMensajeInformativo(this.messageService,'error', 'Error', `Error al cargar cabecera ${error.message}`);
                },
            });
        //cargar tabla detalle voucher contable
        this.load = true;
        this.presupuestoservice
            .obtenerVoucherContableDetalle(
                this.navigationData.empresa,
                this.navigationData.PagoNro
            ) //empresa y pago numero
            .subscribe({
                next: (data) => {
                    this.voucherContableDetalle = data;
                    // console.log(
                    //     'Voucher contable detalle data: ',
                    //     this.voucherContableDetalle
                    // );
                    if (data.length === 0) {
                        verMensajeInformativo(this.messageService,'warn', 'Advertencia', 'No se encontraron voucher contables');
                        this.load = false;
                    } else {
                        this.load = false;
                    }
                },
                error: (error) => {
                    verMensajeInformativo(this.messageService,'error', 'Error', `Error al cargar voucher contables: ${error.message}`);
                },
            });
    }

    ActualizarVoucherContable(vc: VoucherContableDetalle) {
        this.detalleSelected = vc;
        this.verConfirmarActualizacion = true;
        // this.obtenerInformacion();
    }

    onCloseModal() {
        /*
        if (this.confirmarpagocomponente) {
            this.confirmarpagocomponente.limpiar();
        }
        this.verConfirmarActualizacion = false;
        this.cargarMedioPago();
        this.gS.selectedDate$.subscribe(date => {
            if (date) {
                const year = date.getFullYear().toString();
                const month = (date.getMonth() + 1).toString().padStart(2, '0');
                this.cargarPresupuesto(this.gS.getCodigoEmpresa(), year, month);
            }
        });
        */
        this.verConfirmarActualizacion = false; // Cierra el modal
        this.cargarDatos(); // Recarga los datos de la grilla
    }

    // Añade estos métodos a tu clase VouchercontableComponent

    // Métodos corregidos para la clase VouchercontableComponent

    calcularTotalDebe(): number {
        return this.voucherContableDetalle.reduce(
            (sum, item) => sum + (Number(item.importeDebe) || 0),
            0
        );
    }

    calcularTotalHaber(): number {
        return this.voucherContableDetalle.reduce(
            (sum, item) => sum + (Number(item.importeHaber) || 0),
            0
        );
    }

    calcularTotalCargo(): number {
        return this.voucherContableDetalle.reduce(
            (sum, item) => sum + (Number(item.importeDebeEquivalencia) || 0),
            0
        );
    }

    calcularTotalAbono(): number {
        return this.voucherContableDetalle.reduce(
            (sum, item) => sum + (Number(item.importeHaberEquivalencia) || 0),
            0
        );
    }

    eliminarPago(vc: VoucherContableDetalle) {
        // console.log(
        //     'EliminarPago parámetros:',
        //     vc.anio,
        //     vc.mes,
        //     vc.libro,
        //     vc.numeroVoucher,
        //     vc.orden
        // );

        this.detalleSelected = vc;
        this.confirmationService.confirm({
            message: `¿Está seguro que desea eliminar el pago? `,
            header: 'Confirmar Eliminación',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí',
            rejectLabel: 'No',
            acceptButtonStyleClass: 'p-button-danger',
            rejectButtonStyleClass: 'p-button',
            accept: () => {
                this.regContableService
                    .EliminarPago(
                        vc.anio,
                        vc.mes,
                        vc.libro,
                        vc.numeroVoucher,
                        vc.orden
                    )
                    .subscribe({
                        next: (m) => {
                            verMensajeInformativo(this.messageService,'success', 'Éxito', 'Registro eliminado');
                            // console.log(m)
                            this.cargarDatos();
                        },
                    });
            },
        });
    }

    generarPDF(){

        // Definimos las cabeceras
        const headers = [
            [
                /** 
                { text: 'Orden', rowSpan: 2, style: 'tableHeader' },
                { text: 'Tipo cuenta', rowSpan: 2, style: 'tableHeader' },
                { text: 'Cuenta desc.', rowSpan: 2, style: 'tableHeader' },
                { text: 'Cuenta Cte. Cod.', rowSpan: 2, style: 'tableHeader' },
                { text: 'Cuenta Cte. Desc.', rowSpan: 2, style: 'tableHeader' },
                { text: 'Tipo Doc. Desc.', rowSpan: 2, style: 'tableHeader' },
                { text: 'Num. Doc.', rowSpan: 2, style: 'tableHeader' },
                { text: 'Fecha Emisión', rowSpan: 2, style: 'tableHeader' },
                { text: 'Fecha Vencimiento', rowSpan: 2, style: 'tableHeader' },
                { text: 'Tipo Cambio', rowSpan: 2, style: 'tableHeader' }, // 10
                { text: 'Debe', rowSpan: 2, style: 'tableHeader' }, 
                { text: 'Haber', rowSpan: 2, style: 'tableHeader' }, 
                { text: 'Cargo', rowSpan: 2, style: 'tableHeader' }, 
                { text: 'Abono', rowSpan: 2, style: 'tableHeader' }, 
                { text: 'Debe', rowSpan: 2, style: 'tableHeader' }, 

                */

                { text: 'Tipo', style: 'tableHeader' },
                { text: 'Cuenta', style: 'tableHeader' },
                { text: 'Cuenta Desc', style: 'tableHeader' },
                { text: 'Cuenta Cte. Cod.', style: 'tableHeader' },
                { text: 'Cuenta Cte. Desc.', style: 'tableHeader' },
                { text: 'Tipo Doc. Desc.', style: 'tableHeader' },
                { text: 'Num. Doc.', style: 'tableHeader' },
                { text: 'Fecha Emisión', style: 'tableHeader' },
                { text: 'Fecha Vencimiento', style: 'tableHeader' },
                { text: 'TC', style: 'tableHeader' },
                { text: 'Debe', style: 'tableHeader' },
                { text: 'Haber', style: 'tableHeader' },
                { text: 'Cargo', style: 'tableHeader' },
                { text: 'Abono', style: 'tableHeader' },
            ],
            
        ];

        const formatNumber=(num)=>{
            const numero = Number(num);
            if(isNaN(numero)) return '0.00';
            return numero.toLocaleString('es-PE', {
                minimumFractionDigits:2,
                maximumFractionDigits:2
            });

        };

        const formatCell=(value:any)=>({
            text:formatNumber(value),
            alignment:'right'
        });

        const body:any[] = [...headers];

        let totalDebe = 0;
        let totalHaber = 0;
        let totalCargo = 0;
        let totalAbono = 0;

        const convertirNumero = (valor:any) => {
            const numero = Number(valor);
            return isNaN(numero) ? 0 : numero;
        };

        //const groupedData = {};

        this.voucherContableDetalle.forEach((item)=>{
            body.push([
                item.amarre ?? '',
                item.cuenta ?? '',
                item.ctaCbleDesc ?? '',
                item.ctactecod ?? '',
                item.ctaCteDesc ?? '',
                item.tipDocDes ?? '',
                item.numDoc ?? '',
                {text:item.fechaDoc ?? '', alignment:'center'},
                {text:item.fechaVencimiento ?? '', alignment:'center'},
                formatCell(item.tipoCambio),
                formatCell(item.importeDebe),
                formatCell(item.importeHaber),
                formatCell(item.importeDebeEquivalencia),
                formatCell(item.importeHaberEquivalencia),
            ]);

            totalDebe += convertirNumero(item.importeDebe);
            totalHaber += convertirNumero(item.importeHaber);
            totalCargo += convertirNumero(item.importeDebeEquivalencia)
            totalAbono += convertirNumero(item.importeHaberEquivalencia);
        });

        body.push([
                { text: 'Total:', style: 'total', colSpan: 10, alignment: 'right' },
                '','','','','','','','','',

                { text: formatNumber(totalDebe), style: 'total', alignment: 'right' },
                { text: formatNumber(totalHaber), style: 'total', alignment: 'right' },
                { text: formatNumber(totalCargo), style: 'total', alignment: 'right' },
                { text: formatNumber(totalAbono), style: 'total', alignment: 'right' },
            ]);
        
        // Estructura y estilos del pdf
        const docDefinition = {
            pageOrientation:'landscape',
            pageMargins:[10, 10, 10, 10],
            content:[

                //titulo
                {text: 'Voucher Contable Detalle', style:'header'},
                
                {
                      columns: [
                        {
                            width: 'auto',
                            text: [
                                { text: 'Libro de NroVoucher:  ', style: 'label' },
                                { text: this.libro, style: 'value' },
                                { text: '     ', style: 'value' },
                                { text: this.libro_numero, style: 'value' },
                                
                            ],
                             align: 'left',
                        },
                    ],
                    margin: [0, 0, 0, 6],

                },

                //table
                {
                    table:{
                        headerRows:1,
                        widths:[
                            20,35,90,40,70,40,45,55,55,23,58,58,58,58
                        ],
                        body:body,
                        alignment: 'center',
                    },

                    layout:{
                        hLineWidth: function (i, node) {
                            return i === 0 ||
                                i === 1 ||
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

        const fileName = 'VoucherContableDetalle' +
                 '_' +
                 formatDateWithTime((this.fechahoy = new Date())) +
                 '.pdf';

        pdfMake.createPdf(docDefinition).open({
                    filename: fileName
        });

    }
}
