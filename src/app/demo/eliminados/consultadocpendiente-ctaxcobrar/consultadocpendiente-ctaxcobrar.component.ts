import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { BreadcrumbService } from '../../service/breadcrumb.service';
import { TableModule } from 'primeng/table';
import { ConsultaDocPorPago } from '../../model/ConsultaDocPorPago';
import { DocPendCtaxCobrar } from '../../model/DocPendCtaxCobrar';
import { GlobalService } from '../../service/global.service';
import { verMensajeInformativo } from '../utilities/funciones_utilitarias';
import { ToastModule } from 'primeng/toast';

import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { PanelModule } from 'primeng/panel';
import { PresupuestoService } from '../../service/presupuesto.service';

import { agregar_Pago } from '../../model/presupuesto';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { formatDateForFilename } from 'src/app/demo/components/utilities/funciones_utilitarias';
import { InputNumberModule } from 'primeng/inputnumber';

import { DialogModule } from 'primeng/dialog';
import { ProgressBarModule } from 'primeng/progressbar';

import { CobroFacturaService } from '../../service/cobrofactura.service';
import { TraeDocPendienteCtaxCobra } from '../../model/CuentaxCobrar';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-consultadocpendiente-ctaxcobrar',
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
    InputNumberModule,
    TagModule
  ],
  providers: [MessageService, DatePipe],
  templateUrl: './consultadocpendiente-ctaxcobrar.component.html',
  styleUrl: './consultadocpendiente-ctaxcobrar.component.css'
})
export class ConsultadocpendienteCtaxcobrarComponent implements OnInit {

  items: any[] = [];
  textoBuscar: string = '';
  consultaDocPagoList: TraeDocPendienteCtaxCobra[] = [];
  load: boolean = false;
  selectedOption: TraeDocPendienteCtaxCobra[] = []; // row selection multiple

  constructor(
    private presupuestoService: PresupuestoService,
    private breadcrumbService: BreadcrumbService,
    private globalService: GlobalService,
    private messageService: MessageService,
    private cobroFacturaService: CobroFacturaService
  ) { }

  ngOnInit(): void {
    this.breadcrumbService.setBreadcrumbs([
      { icon: 'pi pi-home', routerLink: '/Home' },
      {
        label: 'Consulta Doc.Pendiente de pago - Ctaxcobrar',
        routerLink: '/Home/ConsultaDocPendiente-Ctaxcobrar',
      },
    ]);
    this.breadcrumbService.currentBreadcrumbs$.subscribe((bc) => {
      this.items = bc;
    });
    this.initForm();
    (pdfMake as any).vfs = pdfFonts.pdfMake.vfs;
  }

  initForm(): void { }

  buscar(): void {
    this.listarconsultadocporpago();
  }

  listarconsultadocporpago(): void {
    this.load = true;
    const filtro = this.textoBuscar.trim();
    this.cobroFacturaService.ListaDocPendienteReporte(this.globalService.getCodigoEmpresa(), filtro)
      .subscribe({
        next: (data) => {
          this.consultaDocPagoList = data;
          this.load = false;
        }, 
        error: () => {
          verMensajeInformativo(
            this.messageService,
            'error',
            'error', 
            'error al cargar documentos por pago'
          );
          this.load = false;
        }
      });
  }

  obtenerFacturaPendiente(): void {
    console.log("metodo obtener factura pendiente");
    const filtro = this.textoBuscar.trim();

    this.cobroFacturaService.ListaDocPendienteReporte(this.globalService.getCodigoEmpresa(), filtro)
      .subscribe({
        next: (data) => {
          console.log("data de traer documento pendiente");
          console.log(data);

          if (data.length === 0) {
            verMensajeInformativo(
              this.messageService,
              'warn',
              'Advertencia',
              'No se encontraron registros'
            );
            return;
          }

          this.generarPDFPendiente(data);
        },
        error: (error) => {
          verMensajeInformativo(
            this.messageService,
            'error',
            'Error',
            `Error al cargar los registros: ${error.message}`
          );
        },
      });
  }

  calculateGroupTotal(ruc: string, field: string): number {
    const filtered = this.consultaDocPagoList.filter((item: any) => item.ruc === ruc);

    const total = filtered.reduce((sum: number, item: any) => {
      const value = item[field];
      const numValue = typeof value === 'number' ? value : parseFloat(value) || 0;
      return sum + numValue;
    }, 0);

    return total;
  }

  generarPDFPendiente(dataReporte: TraeDocPendienteCtaxCobra[]): void {
    if (!dataReporte || dataReporte.length === 0) {
      console.log("No hay datos para el reporte");
      return;
    }

    // Ordenar por RUC y fecha de factura
    dataReporte.sort((a: any, b: any) => {
      if (a.ruc < b.ruc) return -1;
      if (a.ruc > b.ruc) return 1;
      // Si el RUC es igual, ordenar por fechaFactura DESC
      const fechaA = new Date(a.fechaFactura);
      const fechaB = new Date(b.fechaFactura);
      return fechaB.getTime() - fechaA.getTime();
    });

    // Definir las cabeceras
    const headers = [
      [
        { text: 'RUC', style: 'tableHeader' },
        { text: 'Razón Social', style: 'tableHeader' },
        { text: 'Tip.Doc', style: 'tableHeader' },
        { text: 'Número', style: 'tableHeader' },
        { text: 'Moneda', style: 'tableHeader' },
        { text: 'Fecha Fact.', style: 'tableHeader' },
        { text: 'Fecha Venc.', style: 'tableHeader' },
        { text: 'Días atraso', style: 'tableHeader' },
        { text: 'Imp.Fact.', style: 'tableHeader' },
        { text: 'Fec.Pago', style: 'tableHeader' },
        { text: 'Pago S/.', style: 'tableHeader' },
        { text: 'Pago $', style: 'tableHeader' },
        { text: 'Saldo S/.', style: 'tableHeader' },
        { text: 'Saldo $', style: 'tableHeader' },
        { text: 'Estado', style: 'tableHeader' },
      ],
    ];

    // Agrupar por RUC
    const groupedData: any = {};
    dataReporte.forEach((item: any) => {
      if (!groupedData[item.ruc]) {
        groupedData[item.ruc] = [];
      }
      groupedData[item.ruc].push(item);
    });

    const formatCell = (value: any) => ({
      text: this.formatNumber(value),
      alignment: 'right'
    });

    // Cuerpo de la tabla
    const body: any[] = [...headers];

    Object.keys(groupedData).forEach((ruc: string) => {
      const groupItems = groupedData[ruc];

      groupItems.forEach((item: any) => {
        body.push([
          item.ruc,
          item.razonSocial,
          item.tipoDocDesc,
          item.nroComprobante,
          item.monedaFactura,
          item.fechaFactura,
          item.fecVencimiento,
          item.diasAtraso?.toString() || '',
          formatCell(item.importeFactura),
          item.fechapago || '',
          formatCell(item.importePagoSoles),
          formatCell(item.importePagoDolares),
          formatCell(item.saldoSoles),
          formatCell(item.saldoDolares),
          item.estadopago,
        ]);
      });

      // Subtotales por grupo
      const importeFacturaSubtotal = this.calculateGroupTotal(ruc, 'importeFactura');
      const pagoSolesSubtotal = this.calculateGroupTotal(ruc, 'importePagoSoles');
      const pagoDolaresSubtotal = this.calculateGroupTotal(ruc, 'importePagoDolares');
      const saldoSolesSubtotal = this.calculateGroupTotal(ruc, 'saldoSoles');
      const saldoDolaresSubtotal = this.calculateGroupTotal(ruc, 'saldoDolares');

      body.push([
        { text: 'Subtotal', colSpan: 8, style: 'subtotal' },
        {}, {}, {}, {}, {}, {}, {},
        { text: this.formatNumber(importeFacturaSubtotal), alignment: 'right', style: 'subtotal' },
        {},
        { text: this.formatNumber(pagoSolesSubtotal), alignment: 'right', style: 'subtotal' },
        { text: this.formatNumber(pagoDolaresSubtotal), alignment: 'right', style: 'subtotal' },
        { text: this.formatNumber(saldoSolesSubtotal), alignment: 'right', style: 'subtotal' },
        { text: this.formatNumber(saldoDolaresSubtotal), alignment: 'right', style: 'subtotal' },
        {}
      ]);
    });

    // Total general
    const totalImporteFactura = this.getTotalTabla('importeFactura');
    const totalPagoSoles = this.getTotalTabla('importePagoSoles');
    const totalPagoDolares = this.getTotalTabla('importePagoDolares');
    const totalSaldoSoles = this.getTotalTabla('saldoSoles');
    const totalSaldoDolares = this.getTotalTabla('saldoDolares');

    body.push([
      { text: 'TOTAL GENERAL', colSpan: 8, style: 'total' },
      {}, {}, {}, {}, {}, {}, {},
      { text: this.formatNumber(totalImporteFactura), alignment: 'right', style: 'total' },
      {},
      { text: this.formatNumber(totalPagoSoles), alignment: 'right', style: 'total' },
      { text: this.formatNumber(totalPagoDolares), alignment: 'right', style: 'total' },
      { text: this.formatNumber(totalSaldoSoles), alignment: 'right', style: 'total' },
      { text: this.formatNumber(totalSaldoDolares), alignment: 'right', style: 'total' },
      {}
    ]);

    const docDefinition: any = {
      pageOrientation: 'landscape',
      pageMargins: [20, 20, 20, 20],
      content: [
        { text: 'Lista de Documentos Pendientes - Cuentas por Cobrar', style: 'header' },
        {
          table: {
            headerRows: 1,
            widths: [40, 120, 30, 50, 30, 40, 40, 30, 50, 40, 45, 45, 45, 45, 40],
            body: body,
            alignment: 'center',
          },
          layout: {
            hLineWidth: function (i: number, node: any) {
              return i === 0 || i === 1 || i === node.table.body.length ? 1 : 0.5;
            },
            vLineWidth: function (i: number, node: any) {
              return 0.5;
            },
            hLineColor: function (i: number, node: any) {
              return i === 0 || i === 1 || i === node.table.body.length ? 'black' : '#aaa';
            },
            vLineColor: function (i: number, node: any) {
              return '#aaa';
            },
            paddingTop: function (i: number) {
              return 4;
            },
            paddingBottom: function (i: number) {
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
          fontSize: 7,
          alignment: 'right',
          fillColor: '#e0e0e0',
        },
      },
      defaultStyle: {
        fontSize: 6,
        alignment: 'left',
      },
    };

    const fileName = 'DocHistorico_CtaxCobrar_' + formatDateForFilename(new Date()) + '.pdf';

    pdfMake.createPdf(docDefinition).open({
      filename: fileName
    });
  }

  // Métodos auxiliares
  formatNumber = (num: any): string => {
    const numero = Number(num);
    if (isNaN(numero)) return '0.00';

    return numero.toLocaleString('es-PE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  getTotalTabla(field: 'importePagoSoles' | 'importePagoDolares' | 'importeFactura' | 'saldoSoles' | 'saldoDolares'): number {
    return this.consultaDocPagoList.reduce((sum: number, item: any) => {
      const value = item[field];
      const numValue = typeof value === 'number' ? value : parseFloat(value) || 0;
      return sum + numValue;
    }, 0);
  }
}