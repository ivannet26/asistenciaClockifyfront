import { Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { PanelModule } from 'primeng/panel';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { FileUploadModule } from 'primeng/fileupload';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ProgressSpinnerModule} from 'primeng/progressspinner'
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { HttpClientModule } from '@angular/common/http';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InfoVoucherCompleto, ObtenerCuentaCorriente, ObtenerCuentaHaby, obtenerTipoDocumento, VoucherContableDetalle } from '../../../model/presupuesto';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { RegContableDetService } from 'src/app/demo/service/reg-contable-det.service';
import { GlobalService } from 'src/app/demo/service/global.service';

import { verMensajeInformativo } from 'src/app/demo/components/utilities/funciones_utilitarias';


@Component({
    selector: 'app-actualizar-vouchercontable',
    standalone: true,
    imports: [
        PanelModule,
        ToastModule,
        ButtonModule,
        InputTextModule,
        CalendarModule,
        FileUploadModule,
        CommonModule,
        FormsModule,
        TagModule,
        TooltipModule,
        HttpClientModule,
        DialogModule,
        ConfirmDialogModule,
        ReactiveFormsModule,
        CheckboxModule,
        DropdownModule,
        ProgressSpinnerModule
    ],
    templateUrl: './actualizar-vouchercontable.component.html',
    styleUrl: './actualizar-vouchercontable.component.css',
    providers: [MessageService, FileUploadModule, ConfirmationService],
})
export class ActualizarVouchercontableComponent implements OnInit {
    //por si acaso el nro de pago de la fila
    @Input() detalleSelected: VoucherContableDetalle;
    @Output() onClose = new EventEmitter<void>();

    vouchercontableForm: FormGroup;
    actVCForm: FormGroup;
    infoAdicional: InfoVoucherCompleto;

    // agregando spinner
    loading: boolean = true;

    // Variables para el diálogo de confirmación
    mostrarDialogoExito: boolean = false;
    mensajeExito: string = '';

    // Inicializamos  listas de los conboox o p-dropdown
    cuentas: any[] = [];
    cuentasCorrientes: any[] = [];
    tipoDocumentos: any[] = [];
    informacionDetallada: any;

    //checkbox
    afectoRetencion = false;

    //desactivar

    constructor(
        private fb: FormBuilder,
        private messageService: MessageService,
        private regContableService: RegContableDetService,
        private globalService: GlobalService,
    ) {}

    monedas: any[] = [
        { label: 'Soles', value: 'S' },
        { label: 'Dólares', value: 'D' },
    ];

    ngOnInit(): void {
        this.actVCForm = this.fb.group({
            cuenta: [''],
            cuenta2: [{ value: '', disabled: true }],
            comprobante: [''],
            glosa: [''],
            centroCosto: [{ value: '', disabled: true }],
            centroGestion: [{ value: '', disabled: true }],
            maquina: [{ value: '', disabled: true }],
            trabajoCurso: [{ value: '', disabled: true }],
            cuentaCorriente: [''],
            tipDoc: [''],
            nroDoc: [''],
            fechaDoc: [null],
            AnioDUA: [''],
            fechaVencim: [null],
            fechaPago: [null],
            numeroPago: [''],
            tipoDocDocModifica: [''],
            numeroDocModifica: [''],
            fechaDocModifica: [null],
            columna: [''],
            moneda: [''],
            tipoCambio: [''],
            debe: [{ value: ''}],
            debe2: [{ value: ''}],
            haber: [{ value: ''}],
            haber2: [{ value: '' }],
            afectoRet: [''],
            tipTranRet: [''],
            tipDocRet: [''],
            numeroRet: [''],
            fechaRet: [null],
            fechaPagoRet: [null],
        });

        this.obtenerCuentaCorriente().then(()=>{this.obtenerDatos()});
        this.obtenerCuenta(); // obtiene cuenta de HabyMov del Servicio Reg Contable
        this.obtenerTipoDocumento();
        this.cargarDatosActualizar();
    }

    //Inicializamos los datos del servicio para los dropdown
    ayudaHabyMovList: ObtenerCuentaHaby[] = [];
    ayudaCuentaCorriente: ObtenerCuentaCorriente[] = [];
    ayudaTipoDocumento: obtenerTipoDocumento[] = [];

    obtenerCuenta() {
        this.regContableService.obtenerCuenta().subscribe({
            next: (data) => {
                this.ayudaHabyMovList = data;
                this.cuentas = this.ayudaHabyMovList.map((item) => ({
                    labelCuenta: item.ccm01des,
                    valueCuenta: item.ccm01cta,
                }));
            },
            error: (err) => {
                console.error('Error al obtener datos:', err);
            },
        });
    }

    obtenerCuentaCorriente(): Promise<void> {

        this.loading = true;
    return new Promise((resolve) => {
        this.regContableService.obtenerCuentaCorriente().subscribe({
            next: (data) => {
                this.ayudaCuentaCorriente = data;
                this.cuentasCorrientes = this.ayudaCuentaCorriente.map(
                    (item) => ({
                        labelCCorriente: item.ccm02nom,
                        valueCCorriente: item.ccm02cod,
                    })
                );
                // console.log('Cuentas corrientes cargadas:', this.cuentasCorrientes);
                resolve();
            },
            error: (err) => {
                console.error('Error al obtener datos de cuentas corrientes:', err);
                resolve(); // Resolvemos la promesa incluso en error para no bloquear la carga
            },
        });
    });
    }


    obtenerTipoDocumento() {
        this.regContableService.obtenerTipoDocumentos().subscribe({
            next: (data) => {
                this.ayudaTipoDocumento = data;
                this.tipoDocumentos = this.ayudaTipoDocumento.map((item) => ({
                    labelTDocumento: item.ccb02des,
                    valueTDocumento: item.ccb02cod,
                }));
                // console.log('Tipo doc: ', this.tipoDocumentos);
            },
            error: (err) => {
                console.error('Error al obtener datos:', err);
            },
        });
    }

    cargarDatosAdicionales() {
        this.regContableService
            .obtenerInformacionDetallada(
                this.detalleSelected.anio,
                this.detalleSelected.mes,
                this.detalleSelected.libro,
                this.detalleSelected.numeroVoucher,
                this.detalleSelected.orden
            )
            .subscribe({
                next: (data: InfoVoucherCompleto) => {
                    this.infoAdicional = data;
                },
            });
        return this.infoAdicional;
    }

    cargarDatosActualizar() {
        // console.log('Detalle recibido:', this.detalleSelected); // Verifica si los datos llegan correctamente

        const fechaVenc = this.formatFecha(
            this.detalleSelected.fechaVencimiento
        );

        this.obtenerDatos();
    }

    obtenerDatos(): void {
        if (!this.detalleSelected) {
            console.error('No hay detalle seleccionado');
            this.loading = false;
            return;
        }

        this.loading = true;


        this.actVCForm.patchValue({
            cuenta: this.detalleSelected.cuenta || '',
        });

        this.regContableService
            .obtenerInformacionDetallada(
                this.detalleSelected.anio,
                this.detalleSelected.mes,
                this.detalleSelected.libro,
                this.detalleSelected.numeroVoucher,
                this.detalleSelected.orden
            )
            .subscribe({
                next: (data: InfoVoucherCompleto) => {
                    this.infoAdicional = data;
                    // console.log('infoAdicional', this.infoAdicional);

                    const cuentaCorrienteValor =
                        this.infoAdicional[0].cuentaCorriente;
                    // console.log('Valor cuentaCorriente a asignar:',cuentaCorrienteValor);

                    // Verificar si el valor existe en las opciones del dropdown
                    const existeEnDropdown = this.cuentasCorrientes.some(
                        (cc) => cc.valueCCorriente === cuentaCorrienteValor
                    );
                    // console.log('¿Existe en dropdown?', existeEnDropdown);
                    // console.log(
                    //     'Opciones disponibles:',
                    //     this.cuentasCorrientes.map((cc) => cc.valueCCorriente)
                    // );

                    if (!existeEnDropdown && cuentaCorrienteValor) {
                        console.warn(
                            'La cuenta corriente no existe en el dropdown:',
                            cuentaCorrienteValor
                        );
                    }
                    setTimeout(()=>{

                    this.actVCForm.patchValue({
                        glosa: this.infoAdicional[0].glosa || '',
                        comprobante: this.infoAdicional[0].comprobante || '',
                        centroCosto: this.infoAdicional[0].cencos || '',
                        centroGestion: this.infoAdicional[0].cenges || '',
                        maquina: this.infoAdicional[0].codigoMaquina || '',
                        trabajoCurso: [''],
                        cuentaCorriente:
                            this.infoAdicional[0].cuentaCorriente || '',
                        tipDoc: this.infoAdicional[0].tipoDocumento || '',
                        nroDoc: this.infoAdicional[0].numDoc || '',
                        fechaDoc: this.infoAdicional[0].fechaDoc || '',
                        AnioDUA: this.infoAdicional[0].anioDua || '',
                        fechaVencim:
                            this.infoAdicional[0].fechaVencimiento || '',
                        fechaPago: this.infoAdicional[0].fechaRetencion || '',
                        numeroPago: this.infoAdicional[0].nroPago || '',
                        tipoDocDocModifica:
                            this.infoAdicional[0].docModTipo || '',
                        numeroDocModifica:
                            this.infoAdicional[0].docModNumero || '',
                        fechaDocModifica:
                            this.infoAdicional[0].docModFecha || '',
                        columna: this.infoAdicional[0].afecto || '',
                        moneda: this.infoAdicional[0].moneda || '',
                        tipoCambio:
                            Number(this.infoAdicional[0].tipoCambio).toFixed(2),
                        debe:
                            Number(this.infoAdicional[0].importeDebe).toFixed(2),
                        debe2:
                            Number(
                                this.infoAdicional[0].importeDebeEquivalencia
                            ).toFixed(2) || '',
                        haber:
                            Number(this.infoAdicional[0].importeHaber).toFixed(
                                2
                            ) || '',
                        haber2:
                            Number(
                                this.infoAdicional[0].importeHaberEquivalencia
                            ).toFixed(2) || '',
                        tipTranRet: this.infoAdicional[0].numDoc || '',
                        tipDocRet: this.infoAdicional[0].tipoDocRetencion || '',
                        numeroRet: this.infoAdicional[0].numDoc || '',
                        fechaRet: this.infoAdicional[0].fechaRetencion || '',
                        fechaPagoRet:
                            this.infoAdicional[0].fechaPagoRetencion || '',
                    });
                    this.loading = false;
                }, 3000)
                },
                error: (err) => {
                    console.error('Error al obtener los datos', err);
                    this.loading = false;
                },
            });
    }

    guardarConfirmacion() {
        // const cuentaCorrienteSeleccion = this.cuentasCorrientes.find(mp => mp.)
        const datosActualizar = {
            codigoEmpresa: this.globalService.getCodigoEmpresa(),
            anio: this.retornarInfo(this.detalleSelected.anio),
            mes: this.retornarInfo(this.detalleSelected.mes),
            libro: this.retornarInfo(this.detalleSelected.libro),
            numeroVoucher: this.retornarInfo(
                this.detalleSelected.numeroVoucher
            ),
            cuenta: this.retornarInfo(this.actVCForm.value.cuenta),
            importeDebe:
                parseFloat(this.actVCForm.value.debe) ||
                Number(this.infoAdicional[0].importeDebe).toFixed(2),
            importeHaber:
                parseFloat(this.actVCForm.value.haber) ||
                Number(this.infoAdicional[0].importeHaber).toFixed(2),
            glosa: this.retornarInfo(this.actVCForm.value.glosa),
            tipoDocumento: this.retornarInfo(this.actVCForm.value.tipDoc),
            numDoc: this.retornarInfo(this.actVCForm.value.nroDoc),
            fechaDoc: this.formatFechaString(this.actVCForm.value.fechaDoc),
            fechaVencimiento: this.formatFechaString(
                this.actVCForm.value.fechaVencim
            ),
            cuentaCorriente: this.retornarInfo(
                this.actVCForm.value.cuentaCorriente
            ),
            moneda: this.retornarInfo(this.actVCForm.value.moneda),
            tipoCambio: parseFloat(this.actVCForm.value.tipoCambio) || 0,
            afecto: this.retornarInfo(this.actVCForm.value.columna),
            cenCos: this.retornarInfo(this.actVCForm.value.centroCosto),
            cenGes: this.retornarInfo(this.actVCForm.value.centroGestion),
            asientoTipo: this.retornarInfo(this.actVCForm.value.asientoTipo),
            valida: this.retornarInfo(this.actVCForm.value.valida),
            fechaVoucher: this.formatFechaString(
                this.actVCForm.value.fechaVoucher
            ),
            amarre: this.retornarInfo(this.detalleSelected.amarre || ''),
            importeDebeEquivalencia:
                parseFloat(this.actVCForm.value.debe2) ||
                Number(this.infoAdicional[0].importeDebeEquivalencia).toFixed(
                    2
                ),
            importeHaberEquivalencia:
                parseFloat(this.actVCForm.value.haber2) ||
                Number(this.infoAdicional[0].importeHaberEquivalencia).toFixed(
                    2
                ),
            transa: this.retornarInfo(this.actVCForm.value.transa),
            orden: this.retornarInfo(this.detalleSelected.orden),
            nroPago: this.retornarInfo(this.actVCForm.value.numeroPago),
            fechaPago: this.formatFechaString(this.actVCForm.value.fechaPago),
            porcentaje: this.retornarInfo(this.actVCForm.value.porcentaje),
            docModTipo: this.retornarInfo(
                this.actVCForm.value.tipoDocDocModifica
            ),
            docModNumero: this.retornarInfo(
                this.actVCForm.value.numeroDocModifica
            ),
            docModFecha: this.retornarInfo(
                this.actVCForm.value.fechaDocModifica
            ),
        };

        // console.log('Datos enviados: ', datosActualizar);

        this.regContableService.actualizarVoucher(datosActualizar).subscribe({
            next: (respuesta) => {
                verMensajeInformativo(this.messageService,'success', 'Éxito', 'El voucher contable fue actualizado correctamente');
                // console.log('Enviado correctamente: ', respuesta);
                this.mostrarDialogoExito = true;
                this.mensajeExito = 'Actualización exitosa.';
                //this.onClose.emit();
            },
            error: (err) => {
                console.error('Error al actualizar el voucher: ', err);
                verMensajeInformativo(this.messageService,'error','Error','No se pudo actualizar el voucher');
            },
        });
    }

    finalizarGuardado() {
        this.mostrarDialogoExito = true;
    }

    onConfirmOk() {
        this.mostrarDialogoExito = false;
        // Limpiamos y cerramos al confirmar el diálogo
        this.onClose.emit();
    }

    limpiarCampos() {
        this.actVCForm.reset();
    }

    cancelar() {
        this.limpiarCampos();
        this.onClose.emit();
    }

    //Convierte una fecha de "dd/mm/aaaa" a "yyyy-mm-dd" para input type="date"

    formatFecha(fecha: string): Date | null {
        if (!fecha) return null; // Si la fecha es null o vacía, retornamos null
        const partes = fecha.split('/');
        if (partes.length !== 3) return null; // Validamos que tenga tres partes
        const [dia, mes, anio] = partes.map(Number); // Convertimos los valores a números
        if (isNaN(dia) || isNaN(mes) || isNaN(anio)) return null; // Validamos que sean números válidos
        return new Date(dia, mes - 1, anio); // Retornamos un objeto Date (mes en base 0)
    }

    formatFechaString(fecha: Date | string | null): string | null {
        if (!fecha || (typeof fecha === 'string' && fecha.trim() === '')) {
            return '';
        }
        if (typeof fecha === 'string') return fecha;

        const year = fecha.getFullYear();
        const month = (fecha.getMonth() + 1).toString().padStart(2, '0');
        const day = fecha.getDate().toString().padStart(2, '0');
        return `${day}/${month}/${year}`;
    }

    retornarInfo(value){
        if(value === null || value === undefined){
            return ''
        }
        return value
    }
}
