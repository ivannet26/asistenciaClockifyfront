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

@Component({
    selector: 'app-agregar-pago',
    standalone: true,
    imports: [
        FormsModule,
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
    ],
    templateUrl: './agregar-pago.component.html',
    styleUrl: './agregar-pago.component.css',
    providers: [ConfirmationService, MessageService, DatePipe],
})
export class AgregarPagoComponent implements OnInit {
    filtroFRM: FormGroup;
    items: any[] = [];
    loading: boolean = false;
    ayudapago: agregar_Pago[] = [];
    proveedores: proveedores_lista[] = [];
    selectedItems: agregar_Pago[] = [];
    searchedByDocNumber: boolean = false; // Nueva propiedad
    //modal
    @Input() numeropresupuesto: string;
    @Input() fechapresupuesto: string;
    @Output() onClose = new EventEmitter<void>();

    //opciones del modificar
    isModificacion: boolean = false;
    numeropresupuestoMod: string = '';
    fechapresupuestoMod: string = '';

    constructor(
        private link: Router,
        private primeng: PrimeNGConfig,
        private fb: FormBuilder,
        private globalService: GlobalService,
        private bS: BreadcrumbService,
        private confirmationService: ConfirmationService,
        private router: Router,
        private presupuestoService: PresupuestoService,
        private messageService: MessageService,
        private datePipe: DatePipe,
        private configService: ConfigService
    ) {
        /*const navigation = this.router.getCurrentNavigation();
        if (navigation?.extras.state) {
            const state = navigation.extras.state as any;
            this.numeropresupuestoMod = state.pagonro;
            this.fechapresupuestoMod = state.fechaformateada;
        } else {
            this.router.navigate(['Home/detalle-presupuesto']);
        }*/

        this.filtroFRM = fb.group({
            empresa: ['', [Validators.required]],
            ruc: ['', [Validators.required]],
            nrodoc: ['', [Validators.required]],
        });
    }

    ngOnInit(): void {
        this.filtroFRM.reset();
        // console.log('evento on init agregarpago');
        // console.log(this.numeropresupuesto);
        // console.log(this.fechapresupuesto);
        // 

        this.numeropresupuestoMod = this.numeropresupuesto;
        this.fechapresupuestoMod = this.fechapresupuesto;
        this.primeng.setTranslation(calendario_traduccion());
        this.bS.setBreadcrumbs([
            { icon: 'pi pi-home', routerLink: '/Home' },
            { label: 'Presupuesto', routerLink: '/Home/presupuesto' },
            {
                label: 'Detalle Presupuesto',
                routerLink: '/Home//detalle-presupuesto',
            },
        ]);
        this.bS.currentBreadcrumbs$.subscribe((bc) => {
            this.items = bc;
        });
        this.cargarproveedores();
    }

    public resetForm(): void {
        this.filtroFRM.reset();
        this.filtroFRM.setValue({
            empresa: this.globalService.getCodigoEmpresa(),
            ruc: '',
            nrodoc: '',
        });
        this.cargarproveedores();
        this.selectedItems = [];
    }

    cargarayudaparaagregarpago(): void {
        this.loading = true;
        const nroDoc = this.filtroFRM.get('nrodoc').value ?? '';
        const ruc = this.filtroFRM.get('ruc').value ?? '';

        this.presupuestoService
            .obtenerDocPendiente(this.globalService.getCodigoEmpresa(), ruc, nroDoc)
            .subscribe({
                next: (data) => {
                    this.ayudapago = data;
                    this.loading = false;
                    
                    if (data.length === 0) {
                        if (this.searchedByDocNumber && nroDoc.trim() !== '') {
                            this.messageService.add({
                                severity: 'warn',
                                summary: 'Advertencia',
                                detail: 'No se encontró el Número de documento',
                                key: 'main',
                                life: 2000
                            });
                        } else {
                            verMensajeInformativo(
                                this.messageService,
                                'warn',
                                'Advertencia',
                                'No se encontraron registros del proveedor'
                            );
                        }
                    }
                },
                error: (error) => {
                    this.loading = false;
                    verMensajeInformativo(this.messageService, 'error', 'Error', `Error al cargar los registros ${error.message}`);
                },
            });
    }

    cargarproveedores() {
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

    onProveedorChallenge(event: any) {
        this.filtroFRM.patchValue({
            ruc: event.value,
        });
    }

    filtrar() {
        const nroDoc = this.filtroFRM.get('nrodoc')?.value?.trim() ?? '';
        const ruc = this.filtroFRM.get('ruc')?.value?.trim() ?? '';

        console.log('Filtrar - nroDoc:', nroDoc, 'ruc:', ruc); // Debug

        // Validar que al menos uno de los campos esté lleno
        if (!ruc && !nroDoc) {
            console.log('Mostrando mensaje de validación'); // Debug
            this.messageService.add({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'Escribir un Proveedor o Número de Documento',
                key: 'main',
                life: 2000
            });
            return;
        }

        // Determinar si la búsqueda es por número de documento (cuando hay documento pero no hay proveedor)
        this.searchedByDocNumber = nroDoc !== '' && ruc === '';

        this.cargarayudaparaagregarpago();
    }

    //checkbox
    onAddSelected() {
        if (this.selectedItems.length === 0) {
            verMensajeInformativo(this.messageService,'warn', 'Advertencia', 'Seleccione al menos un registro');
            return;
        }

        const xmlDoc = document.implementation.createDocument(
            null,
            'DataSet',
            null
        );

        this.selectedItems.forEach((item) => {
            const tblElement = xmlDoc.createElement('tbl');

            const fields = {
                ruc: item.ruc,
                //razonSocial: item.razonSocial,
                codigoTipDoc: item.coditoTipoDoc,
                //nombreTipoDoc: item.nombreTipoDOc,
                numeroDocumento: item.numeroDOcumento,
                monedaOriginal: item.monedaOriginal,
                soles: item.soles.toString(),
                dolares: item.dolares.toString(),
                fechaEmision: item.fechaEmision,
                fechaVencimiento: item.fechaVencimiento,
                //diasAtrazo: item.diasAtrazo.toString()
            };

            for (const [key, value] of Object.entries(fields)) {
                const element = xmlDoc.createElement(key);
                element.textContent = value;
                tblElement.appendChild(element);
            }

            xmlDoc.documentElement.appendChild(tblElement);
        });

        const xmlString = new XMLSerializer().serializeToString(xmlDoc);
        // console.log(xmlString);
        // console.log('--- component agregar pago typscript');
        // console.log(this.numeropresupuestoMod);
        // console.log(this.fechapresupuestoMod);
        // console.log('--- end component agregar pago typscript');
        const detallePresupuesto: insert_detalle = {
            empresa: this.globalService.getCodigoEmpresa(),
            numeropresupuesto: this.numeropresupuestoMod || '', // Si es null, enviar string vacío
            tipoaplicacion: this.configService.getTipoAplicacion(),
            fechapresupuesto: this.fechapresupuestoMod || '', // Si es null, enviar string vacío
            bcoliquidacion: '00',
            xmlDetalle: xmlString,
        };

        this.presupuestoService
            .insertarDetallePresupuesto(detallePresupuesto)
            .subscribe({
                next: (response) => {
                    verMensajeInformativo(this.messageService,'success', 'Éxito', 'Detalle insertado correctamente');

                    /*const formattedDate = this.fechapresupuestoMod
                    const navigationExtras = {
                        state: {
                            PagoNro: this.numeropresupuestoMod,
                            Fecha: formattedDate,
                        }
                    }*/

                    //this.router.navigate(['Home/detalle-presupuesto'], navigationExtras)
                    this.selectedItems = [];
                    this.ayudapago = [];
                    this.onClose.emit();
                },
                error: (error) => {
                    verMensajeInformativo(this.messageService,'error', 'Error', `Error al insertar el detalle: ${error.message}`);
                },
            });
    }

    onCancelSelection() {
        this.selectedItems = [];
    }
    onCerrar() {
        /*const formattedDate = this.fechapresupuestoMod
        const navigationExtras = {
            state: {
                PagoNro: this.numeropresupuestoMod,
                Fecha: formattedDate,
            }
        }
        this.selectedItems = [];
        this.router.navigate(['Home/detalle-presupuesto'], navigationExtras)*/
        this.selectedItems = []; // Limpia la selección de elementos
        this.ayudapago = [];
        //this.onClose.emit();
    }
}
