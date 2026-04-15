import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ConfirmationService, MessageService, PrimeNGConfig } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { PanelModule } from 'primeng/panel';
import { GlobalService } from 'src/app/demo/service/global.service';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { verMensajeInformativo } from 'src/app/demo/components/utilities/funciones_utilitarias';
import { ConfigService } from 'src/app/demo/service/config.service';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FacturaPorCobrar } from 'src/app/demo/model/CuentaxCobrar';
import { CobroFacturaService } from 'src/app/demo/service/cobrofactura.service';

@Component({
  selector: 'app-agrega-facturaxcobrar',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    ToastModule,
    PanelModule,
    TableModule,
    CommonModule,
    ButtonModule,
    RouterModule,
    InputTextModule,
    ConfirmDialogModule,
  ],
  templateUrl: './agrega-facturaxcobrar.component.html',
  styleUrl: './agrega-facturaxcobrar.component.css'
})
export class AgregaFacturaxcobrarComponent implements OnInit {
  filtroFRM: FormGroup;
  items: any[] = [];
  loading: boolean = false;
  listaFacturas: FacturaPorCobrar[] = [];
  selectedItems: FacturaPorCobrar[] = [];

  @Input() codigoCliente: string = '';
  @Input() nombreCliente: string = '';
  @Input() cobroNro: string = '';
  @Input() empresa: string = '';

  @Output() onClose = new EventEmitter<void>();
  @Output() xmlGenerado = new EventEmitter<string>();

  constructor(
    private link: Router,
    private primeng: PrimeNGConfig,
    private fb: FormBuilder,
    private globalService: GlobalService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private messageService: MessageService,
    private datePipe: DatePipe,
    private configService: ConfigService,
    private cobroService: CobroFacturaService
  ) {
    this.filtroFRM = fb.group({
      empresa: ['', [Validators.required]],
      ruc: ['', [Validators.required]],
      nrodoc: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.filtroFRM.reset();
    this.cargarAyudaFacturas();
  }

  cargarAyudaFacturas() {
    let codempresa = this.empresa || this.globalService.getCodigoEmpresa();

    if (!this.codigoCliente) {
      verMensajeInformativo(
        this.messageService,
        'warn',
        'Advertencia',
        'No se ha proporcionado código de cliente'
      );
      return;
    }

    this.loading = true;

    this.cobroService.getListaAyudaFacturaPorCobrar(
      codempresa,
      'sara',
      this.codigoCliente
    ).subscribe({
      next: (data) => {
        this.listaFacturas = data || [];
        this.loading = false;

        if (this.listaFacturas.length === 0) {
          verMensajeInformativo(
            this.messageService,
            'info',
            'Información',
            'No se encontraron facturas pendientes para este cliente'
          );
        }
      },
      error: (error) => {
        this.loading = false;
        verMensajeInformativo(
          this.messageService,
          'error',
          'Error',
          `Error al cargar facturas por cobrar: ${error.message}`
        );
      }
    });
  }

  onAddSelected() {
    if (this.selectedItems.length === 0) {
      verMensajeInformativo(
        this.messageService,
        'warn',
        'Advertencia',
        'Seleccione al menos una factura'
      );
      return;
    }

    const xmlDoc = document.implementation.createDocument(null, 'DataSet', null);

    this.selectedItems.forEach((item) => {
      const tblElement = xmlDoc.createElement('tbl');

      let soles = '0';
      let dolares = '0';

      // if (item.moneda === 'SOLES' || item.moneda === 'Soles') {
      //   soles = item.totalSoles?.toString() || '0';
      // } else if (item.moneda === 'DOLARES' || item.moneda === 'Dólares') {
      //   dolares = item.totalDolares?.toString() || '0';
      // }
      soles = item.totalSoles?.toString() ||  '0';
      dolares = item.totalDolares?.toString() ||  '0';
      const fields = {
        codigoTipDoc: item.codigoTipoDocumento || '01',
        numeroDocumento: item.numeroDocumento,
        soles: soles,
        dolares: dolares
      };

      for (const [key, value] of Object.entries(fields)) {
        const element = xmlDoc.createElement(key);
        element.textContent = value;
        tblElement.appendChild(element);
      }

      xmlDoc.documentElement.appendChild(tblElement);
    });
    console.log('valor xml detalle ayuda');
    
    const xmlString = new XMLSerializer().serializeToString(xmlDoc);
    console.log(xmlString);
    this.xmlGenerado.emit(xmlString);
    this.selectedItems = [];
  }

  onCancelSelection() {
    this.selectedItems = [];
    this.onClose.emit();
  }

  formatearMoneda(valor: number): string {
    return valor.toFixed(2);
  }
}