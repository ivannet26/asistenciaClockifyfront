
import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {  FormsModule, ReactiveFormsModule} from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { BreadcrumbService } from '../../service/breadcrumb.service';

import { TableModule } from 'primeng/table';

import { ConsultaDocPorPago } from '../../model/ConsultaDocPorPago';



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
import {formatDateForFilename} from 'src/app/demo/components/utilities/funciones_utilitarias'; 
import { InputNumberModule } from 'primeng/inputnumber';
@Component({
  selector: 'app-consulta-doc-pendiente-reporte',
  standalone: true,
  imports: [ToastModule,
        TableModule,
        ReactiveFormsModule,
        CommonModule,
        ButtonModule,
        CardModule,
        InputTextModule,
        PanelModule,
        BreadcrumbModule,
        ConfirmDialogModule,
        FormsModule,
        InputNumberModule
      ],
  providers:[MessageService,DatePipe],
  templateUrl: './consulta-doc-pendiente-reporte.component.html',
  styleUrl: './consulta-doc-pendiente-reporte.component.css'
})
export class ConsultaDocPendienteReporteComponent implements OnInit {

items: any[] = [];
textoBuscar: string='';
consultaDocPorPagoList: ConsultaDocPorPago[] = [];
ayudapago: agregar_Pago[] = [];
selectedOption: ConsultaDocPorPago[] = []; // row selection multiple
load: boolean = false;
  constructor(private presupuestoService:PresupuestoService, 
    private breadcrumbService:BreadcrumbService,
   private globalService: GlobalService,
  private messageService:MessageService ){}

  ngOnInit(): void {
    this.breadcrumbService.setBreadcrumbs([
            { icon: 'pi pi-home', routerLink: '/Home' },
            {
                label: 'Consulta doc.pendiente de pago',
                routerLink: '/Home/ConsultaDocPendienteReporte',
            },
        ]);
        this.breadcrumbService.currentBreadcrumbs$.subscribe((bc) => {
            this.items = bc;
        });
        this.initForm();
        (<any>pdfMake).vfs = pdfFonts.pdfMake.vfs;

  }
 initForm(): void {}

buscar():void{

    this.listarconsultadocporpago();
    console.log("consulkta doc pendiente reporte");
}


 listarconsultadocporpago(): void {
        this.load = true;
        let filtro = this.textoBuscar.trim();

        // if(filtro === ''){
        //     // No cargar nada si el filtro está vacío
        //     this.consultaDocPorPagoList = [];
        //     return;
        // }
        this.presupuestoService.obtenerDocPendienteReporte(this.globalService.getCodigoEmpresa(),
        filtro )
            .subscribe({
              next:(data) =>{
                this.ayudapago = data;
                if(this.ayudapago.length == 0){
                    this.load = false;
                }else{
                    this.load = false;
                }
              }
            ,
            error:()=>{
              verMensajeInformativo(this.messageService, 
                'error',
                'error', 'error al cargar documentos por pago');

            }
          });
        
        // this.presupuestoService.obtenerDocPendienteReporte(this.globalService.getCodigoEmpresa(), filtro,)                    
        //     .subscribe({
        //         next: (data) => {
        //             this.ayudapago = data;
        //         },
        //         error: () => {
        //             verMensajeInformativo(
        //                 this.messageService,
        //                 'error',
        //                 'Error',
        //                 'Error al cargar documentos por pago'
        //             );
        //         },
        //     });
    }

obtenerFacturaPendiente():void{
        //const nroDoc = this.filtroFRM.get('nrodoc').value ?? '';
        //const ruc = this.filtroFRM.get('ruc').value ?? '';
        console.log("metodo obtenr factura pendiente");
        const nroDoc = '';
        const filtro  =  this.textoBuscar.trim();
        this.presupuestoService.obtenerDocPendienteReporte(this.globalService.getCodigoEmpresa(),filtro)
        //this.presupuestoService.obtenerDocPendiente(filtro
          //  this.globalService.getCodigoEmpresa(),ruc,nroDoc )
            .subscribe({
                next:(data)=>{

                     this.ayudapago = data;
                     console.log("data de tra er documento pendiente");
                        // console.log(this.ayudapago);
                       this.generarPDFPendiente(this.ayudapago);
                    //this.loading = false;
                    if (data.length === 0) {
                        verMensajeInformativo(
                            this.messageService,
                            'warn',
                            'Advertencia',
                            'No se encontraron registros del proveedor'
                        );
                    }
                },error: (error) => {
                    //this.loading = false;
                    verMensajeInformativo(this.messageService, 'error', 'Error', `Error al cargar los registros ${error.message}`);
                },
            });

    } 

    calculateGroupTotal(ruc: string, field: string): number {
        return this.ayudapago.filter((item) => item.ruc === ruc).reduce(
            (sum, item) => sum + (item[field] || 0),
            0
        );
    }
 generarPDFPendiente(dataReporte: agregar_Pago[]):void{

        //this.obtenerFacturaPendiente();


        
          if (!dataReporte || dataReporte.length === 0) {
            // verMensajeInformativo(this.messageService,'warn', 'Advertencia', 'No hay datos para exportar');
            console.log("No retoarn datoa de ayuda pago");
            return;
        }
        dataReporte.sort((a, b) => {
                if (a.ruc < b.ruc) return -1;
                if (a.ruc > b.ruc) return 1;
                // Si el RUC es igual, ordenar por fechaEmision DESC
                const fechaA = new Date(a.fechaEmision);
                const fechaB = new Date(b.fechaEmision);
                return fechaB.getTime() - fechaA.getTime();
        });
        var resultados  =dataReporte;
    
        // Definimos las cabeceras
        const headers = [
            [
                
                { text: 'RUC',  style: 'tableHeader' },//1
                { text: 'Razon Social',  style: 'tableHeader' },//2
                { text: 'Tipo Doc',  style: 'tableHeader' }, //3
                { text: 'Numero',  style: 'tableHeader' },       //4          
                { text: 'Fecha emision',  style: 'tableHeader' }, //5
                { text: 'Fecha vencimiento',  style: 'tableHeader' }, //6
                { text: 'Moneda Original',  style: 'tableHeader' }, //7
                { text: 'Importe Total S/.',  style: 'tableHeader' },//8
                { text: 'Importe Total US$',  style: 'tableHeader' },//9
                
                { text: 'Detraccion',  style: 'tableHeader' }, //10     
                { text: 'Retencion',  style: 'tableHeader' },//11
                
            ],
                      
        ];
       
        // Agrupamos por RUC
        const groupedData = {};
        this.ayudapago.forEach((item) => {
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
        const body = [...headers];

        Object.keys(groupedData).forEach((ruc) => {
             const groupItems = groupedData[ruc];

            groupItems.forEach((item) => {
                body.push([
                    item.ruc,        //1            
                    item.razonSocial, //2
                    item.nombreTipoDOc, //3
                    item.numeroDOcumento, //4
                    item.fechaEmision, //5
                    item.fechaVencimiento, //6
                    item.monedaOriginal, //7
                    formatCell(item.soles), //8
                    formatCell(item.dolares),   //9                  
                    item.afectoDetraccion || '', //10
                    item.afectoRetencion || '' //11
                    
                ]);
            });
            
             const solesSubtotal = this.calculateGroupTotal(ruc, 'soles');
            const dolaresSubtotal = this.calculateGroupTotal(ruc, 'dolares');

            body.push(this.getSubtotalRow(ruc, solesSubtotal, dolaresSubtotal));
       

            // body.push([
            // { text: 'Subtotal RUC ' + ruc, colSpan: 8, style: 'subtotal' }, // columnas 1–8
            // {}, {}, {}, {}, {}, {}, {},                                     // vacíos para completar el colSpan
            // { text: formatNumber(solesSubtotal), alignment: 'right' },      // columna 9
            // { text: formatNumber(dolaresSubtotal), alignment: 'right' },    // columna 10
            // { text: '', alignment: 'right' }                                // columna 11
            // ]);
    
           
        } ); 

        //suma totales
        // Calcular total general y añadir fila al final
        const totalGeneral = this.getTotalGeneral(this.ayudapago);
        body.push(this.getTotalRow(totalGeneral.solesTotal, totalGeneral.dolaresTotal));
            // body.push([
            // { text: 'TOTAL GENERAL', colSpan: 7, style: 'total' },
            // { text: '' }, { text: '' }, { text: '' }, { text: '' },
            // { text: '' }, { text: '' },
            // { text: this.formatNumber(totalGeneral.solesTotal), alignment: 'right' },
            // { text: this.formatNumber(totalGeneral.dolaresTotal), alignment: 'right' },
            // { text: '', alignment: 'right' },
            // { text: '', alignment: 'right' }
            // ]);
         const docDefinition = {
                    pageOrientation: 'landscape',
                    pageMargins: [20, 20, 20, 20],
                    content: [
                        //title
                        { text: 'Lista de Documentos Pendiente de pago', style: 'header' },
                        //description
                        // {
                        //     columns: [
                        //         {
                        //             width: 'auto',
                        //             text: [
                        //                 { text: 'Numero de Pago: ', style: 'label' },
                        //                 //{ text: this.pagnro, style: 'value' },
                        //                 { text:'001', style: 'value' },
                        //             ],
                        //         },
                        //         {
                        //             width: 'auto',
                        //             text: [
                        //                 { text: 'Fecha: ', style: 'label' },
                        //                 // { text: this.fechaString, style: 'value' },
                        //                 { text:'15/07/2025', style: 'value' },
                        //             ],
                        //             margin: [20, 0, 0, 0],
                        //         },
                        //         {
                        //             width: 'auto',
                        //             text: [
                        //                 { text: 'Motivo: ', style: 'label' },
                        //                 //{ text: this.motivo, style: 'value' },
                        //                 { text: 'motivo', style: 'value' },
                        //             ],
                        //             margin: [20, 0, 0, 0],
                        //         },
                        //         {
                        //             width: 'auto',
                        //             text: [
                        //                 { text: 'Medio Pago: ', style: 'label' },
                        //                 //{ text: this.medio, style: 'value' },
                        //                 { text: 'medio pago', style: 'value' },
                        //             ],
                        //             margin: [20, 0, 0, 0],
                        //         },
                        //     ],
                        //     margin: [0, 0, 0, 10],
                        // },
                        //table
                        {
                            table: {
                                headerRows: 1,
                                widths: [
                                    40, //1 // ruc
                                    270,  //2  razon social
                                    30,  //3 tipo documento
                                    50,  //4 numero del documento  factura
                                    40, //5 fecha emision 
                                    40,  //6 fecha vencimiento 
                                    33, //7 moneda original
                                    60, //8 importe total S/
                                    60, //9 importe total $
                                    40, //10 detraccion 
                                    40 //11 retencion
                                    
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
                                        : 0.5;
                                },
                                vLineWidth: function (i, node) {
                                    return 0.5;
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
                const fileName = 'DetallePrespuesto_' + '00001' +formatDateForFilename(new Date())+  '.pdf';
                
        
                pdfMake.createPdf(docDefinition).open({
                    filename: fileName
                });

    }
    //metodos de la clase
   formatNumber = (num) => {
            const numero = Number(num);
            if (isNaN(numero)) return '0.00';

            return numero.toLocaleString('es-PE', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            });
        };
     getSubtotalRow(ruc: string, soles: number, 
        dolares: number): any[] 
        {
            return [
                { text: 'Subtotal ', colSpan: 7, style: 'subtotal' },
                { text: '' }, { text: '' }, { text: '' }, { text: '' },
                { text: '' }, { text: '' },  // 7 celdas vacías para completar el colSpan
                { text: this.formatNumber(soles), alignment: 'right' },
                { text: this.formatNumber(dolares), alignment: 'right' },
                { text: '', alignment: 'right' }, { text: '', alignment: 'right' }
            ];
        }
        getTotalRow(soles:number, dolares:number): any[] {
            return [
                { text: 'total ', colSpan: 7, style: 'subtotal' },
                { text: '' }, { text: '' }, { text: '' }, { text: '' },
                { text: '' }, { text: '' },  // 7 celdas vacías para completar el colSpan
                { text: this.formatNumber(soles), alignment: 'right' },
                { text: this.formatNumber(dolares), alignment: 'right' },
                { text: '', alignment: 'right' }, { text: '', alignment: 'right' }
            ];
        }
        getTotalGeneral(data: agregar_Pago[]): { solesTotal: number, dolaresTotal: number } {
            let solesTotal = data.reduce((sum, item) => sum + (item.soles || 0), 0);
            let dolaresTotal = data.reduce((sum, item) => sum + (item.dolares || 0), 0);
            return { 
                solesTotal, 
                dolaresTotal 
            };

         
}

         getTotalTabla(field: 'soles' | 'dolares'): number {
            return this.ayudapago.reduce((sum, item) => sum + (item[field] || 0), 0);
            };
            

      
 

}

