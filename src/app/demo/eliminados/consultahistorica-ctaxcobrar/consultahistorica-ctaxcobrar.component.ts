import { Component, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { ConsultaDocPorPagoService } from '../../service/consulta-doc-por-pagar.service';
import { ConsultaDocPorPago } from '../../model/ConsultaDocPorPago';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BreadcrumbService } from '../../service/breadcrumb.service';
import { Router } from '@angular/router';
import { GlobalService } from '../../service/global.service';
import { verMensajeInformativo } from '../utilities/funciones_utilitarias';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { CommonModule } from '@angular/common';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { PanelModule } from 'primeng/panel';
import { PresupuestoService } from '../../service/presupuesto.service';
import { CobroFacturaService } from '../../service/cobrofactura.service';
import { HttpResponse } from '@angular/common/http';
import { Detallepresupuesto, agregar_Pago } from '../../model/presupuesto';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { formatDateForFilename } from 'src/app/demo/components/utilities/funciones_utilitarias';
import { ProgressBarModule } from 'primeng/progressbar';
import { DialogModule } from 'primeng/dialog';
import { TraeHistoricoCtaxCobra } from '../../model/CuentaxCobrar';
import { TagModule } from 'primeng/tag';
import { RegistroCobroDocSustento } from '../../model/CuentaxCobrar';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-consultahistorica-ctaxcobrar',
  standalone: true,
  imports: [
    ToastModule,
    TableModule,
    ReactiveFormsModule,
    CommonModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    PanelModule,
    BreadcrumbModule,
    ConfirmDialogModule,
    ProgressBarModule,
    DialogModule,
    FormsModule,
    TagModule,
    TooltipModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './consultahistorica-ctaxcobrar.component.html',
  styleUrl: './consultahistorica-ctaxcobrar.component.css'
})
export class ConsultahistoricaCtaxcobrarComponent implements OnInit {
  consultaDocPorPagoForm: FormGroup;
  consultaDocPorPagoList: ConsultaDocPorPago[] = [];
  traerHistoricoList: TraeHistoricoCtaxCobra[] = [];
  isEditing: boolean = false;
  items: any[] = [];
  isNew: boolean = false;
  textoBuscar: string = '';

  DetallePago: Detallepresupuesto[];
  load: boolean = false;
  groupTotals: any[] = [];
  ayudapago: agregar_Pago[] = [];

  searchPerformed: boolean = false;

  selectedOption: ConsultaDocPorPago[] = []; // row selection multiple

  // Variables para el modal de sustentos
  displayModalSustentos: boolean = false;
  listaSustentos: RegistroCobroDocSustento[] = [];
  loadingSustentos: boolean = false;
  registroSeleccionado: TraeHistoricoCtaxCobra | null = null;

  constructor(
    private consultaDocPorPagoService: ConsultaDocPorPagoService,
    private fb: FormBuilder,
    private breadcrumbService: BreadcrumbService,
    private router: Router,
    private globalService: GlobalService,
    private messageService: MessageService,
    private cobrarService: CobroFacturaService
  ) { }

  ngOnInit(): void {
    this.breadcrumbService.setBreadcrumbs([
      { icon: 'pi pi-home', routerLink: '/Home' },
      {
        label: 'Consulta Doc. Histórico - Ctaxcobrar',
        routerLink: '/Home/ConsultaDocPorPago',
      },
    ]);
    this.breadcrumbService.currentBreadcrumbs$.subscribe((bc) => {
      this.items = bc;
    });
    this.initForm();

    (<any>pdfMake).vfs = pdfFonts.pdfMake.vfs;
  }

  buscar(): void {
    const filtro = this.textoBuscar.trim();

    if (filtro === '') {
      verMensajeInformativo(
        this.messageService,
        'warn',
        'Advertencia',
        'Debes escribir el ruc o el nro doc'
      );
      return;
    }
    this.searchPerformed = true;
    this.load = true;
    this.listarconsultadocporpago();
  }

  initForm(): void {
    this.consultaDocPorPagoForm = this.fb.group({
      ban01Empresa: [
        this.globalService.getCodigoEmpresa(),
        Validators.required,
      ],
      ruc: ['', Validators.required],
      nombreEmpresa: ['', Validators.required],
      tipoDocumento: ['', Validators.required],
      nroDoc: ['', Validators.required],
      fechaDocumento: ['', Validators.required],
      moneda: ['', Validators.required],
      importeDocumento: ['', Validators.required],
      importePago: ['', Validators.required],
      fechaPago: ['', Validators.required],
    });
  }

  listarconsultadocporpago(): void {
    let filtro = this.textoBuscar.trim();

    if (filtro === '') {
      this.consultaDocPorPagoList = [];
      this.searchPerformed = false;
      this.load = false;
      return;
    }

    this.load = true;
    this.cobrarService.ListaHistoricoReporte(
      this.globalService.getCodigoEmpresa(),
      filtro
    ).subscribe({
      next: (data) => {
        this.traerHistoricoList = data;
        this.load = false;
        
        if (data.length === 0) {
          verMensajeInformativo(
            this.messageService,
            'info',
            'Información',
            'No se encontró el ruc o nro doc'
          );
        }
      },
      error: () => {
        this.load = false;
        verMensajeInformativo(
          this.messageService,
          'error',
          'Error',
          'Error al cargar documentos por pago'
        );
      }
    });
  }

  /**
   * Abre el modal con los sustentos asociados al registro de cobro
   */
  abrirModalSustentos(doc: TraeHistoricoCtaxCobra): void {
    // Validar que el documento tenga estado Cobrado o Pagado
    if (doc.estadopago !== 'Cobrado' && doc.estadopago !== 'Pagado' && doc.estadopago!=='Parcial') {
      verMensajeInformativo(
        this.messageService,
        'warn',
        'Advertencia',
        'Solo se pueden ver sustentos de documentos cobrados o pagados'
      );
      return;
    }
    
    // Validar que tenga numeroRegCobro
    if (!doc.numeroRegCobro || doc.numeroRegCobro.trim() === '') {
      verMensajeInformativo(
        this.messageService,
        'warn',
        'Advertencia',
        'Este documento no tiene un registro de cobro asociado. No se pueden mostrar sustentos.'
      );
      return;
    }

    this.registroSeleccionado = doc;
    this.displayModalSustentos = true;
    this.loadingSustentos = true;
    this.listaSustentos = [];

    // Llamar al servicio para obtener los sustentos
    this.cobrarService.listarSustento(
      this.globalService.getCodigoEmpresa(),
      doc.numeroRegCobro
    ).subscribe({
      next: (response) => {
        this.listaSustentos = response;
        this.loadingSustentos = false;

        if (!response || response.length === 0) {
          verMensajeInformativo(
            this.messageService,
            'info',
            'Información',
            'No se encontraron archivos de sustento para este registro'
          );
        }
      },
      error: (error) => {
        this.loadingSustentos = false;
        verMensajeInformativo(
          this.messageService,
          'error',
          'Error',
          `Error al cargar los sustentos: ${error.message || 'Error desconocido'}`
        );
      }
    });
  }

  /**
   * Cierra el modal de sustentos
   */
  cerrarModalSustentos(): void {
    this.displayModalSustentos = false;
    this.listaSustentos = [];
    this.registroSeleccionado = null;
  }

  /**
   * Abre/descarga un documento de sustento
   */
  abrirDocumentoSustento(sustento: RegistroCobroDocSustento): void {
    if (!this.registroSeleccionado || !this.registroSeleccionado.numeroRegCobro) {
      verMensajeInformativo(
        this.messageService,
        'error',
        'Error',
        'No se puede abrir el documento. Falta el número de registro de cobro.'
      );
      return;
    }

    this.cobrarService.traeDocumentoSustento(
      this.globalService.getCodigoEmpresa(),
      this.registroSeleccionado.numeroRegCobro,
      sustento.ban05Item
    ).subscribe({
      next: (response: HttpResponse<Blob>) => {
        const blob = response.body;
        if (blob && blob.size > 0) {
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
        verMensajeInformativo(
          this.messageService,
          'error',
          'Error',
          'Error al cargar el documento'
        );
      }
    });
  }

  /**
   * Determina si un registro tiene sustentos disponibles
   */
  tieneSustentosDisponibles(doc: TraeHistoricoCtaxCobra): boolean {
    return (doc.estadopago === 'Cobrado' || doc.estadopago === 'Pagado' || doc.estadopago==='Parcial') 
           && !!doc.numeroRegCobro 
           && doc.numeroRegCobro.trim() !== '';
  }
}