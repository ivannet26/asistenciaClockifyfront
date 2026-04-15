import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { PanelModule } from 'primeng/panel';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CommonModule } from '@angular/common';
import { ConfirmationService, MessageService } from 'primeng/api';
import { BreadcrumbService } from '../../service/breadcrumb.service';
import { Router } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { MedioPago } from '../../model/mediopago';
import { MediopagoService } from '../../service/mediopago.service';
import { GlobalService } from '../../service/global.service';
import { verMensajeInformativo } from '../utilities/funciones_utilitarias';
import { DropdownModule } from 'primeng/dropdown';
import { BancoService } from '../../service/banco.service';
import { Banco } from '../../model/Banco';
import { CuentaBancariaService } from '../../service/cuenta-bancaria.service';
import { CheckboxModule } from 'primeng/checkbox';
import { ContextMenuModule } from 'primeng/contextmenu';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-mediopago',
  standalone: true,
  templateUrl: './mediopago.component.html',
  styleUrl: './mediopago.component.css',
  imports: [
    ToastModule, TableModule, ReactiveFormsModule, CommonModule, 
    ButtonModule, CardModule,
    InputTextModule, PanelModule, BreadcrumbModule,
     ConfirmDialogModule, FormsModule, DropdownModule, CheckboxModule,
     ContextMenuModule
  ],
  providers: [MessageService, ConfirmationService]
})
export class MediopagoComponent implements OnInit {
  mediopagoForm: FormGroup;
  mediopagoList: MedioPago[] = [];
  isEditing: boolean = false;
  editingMedioPago: MedioPago | null = null;
  isEditingAnyRow: boolean = false;
  items: any[] = [];
  isNew: boolean = false;
  rowsPerPage: number = 10; // Numero de filas por página
  bancosOptions: any[] = [];
  cuentasOptions: any[] = [];
  cuentasOptionsRow: { [key: string]: any[] } = {}; // Initialize as an empty object
  monedaOptions: any[] = []; // Opciones para el dropdown de moneda
  selectedOption: any | null = null; // row selection
  menuItems:MenuItem[] = [];

  constructor(
    private mediopagoService: MediopagoService,
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private breadcrumbService: BreadcrumbService,
    private router: Router,
    private globalService: GlobalService,
    private bancoService: BancoService,
    private cuentaBancariaService: CuentaBancariaService
  ) {}

  ngOnInit(): void {
    this.breadcrumbService.setBreadcrumbs([
      { icon: 'pi pi-home', routerLink: '/Home' },
      { label: 'Medios de Pago', routerLink: '/Home/medio_pago' }
    ]);
    this.breadcrumbService.currentBreadcrumbs$.subscribe(bc => {
      this.items = bc;
    });

    this.menuItems = [
            { 
                label: 'Eliminar', 
                icon: 'pi pi-fw pi-times', 
                command: () => {
                    if(!this.selectedOption) return;
                    const index=this.mediopagoList.findIndex(b=>
                      b.ban01Empresa === this.selectedOption!.ban01Empresa &&
                      b.ban01IdTipoPago === this.selectedOption!.ban01IdTipoPago);
                    if(index>=0) this.onDelete(this.selectedOption!,index);
                } }
        ];
        
    this.initForm();
    this.cargarMediosPago();
    this.cargarBancos(); // <-- Agregado
  }

  initForm(): void {
    this.mediopagoForm = this.fb.group({
        ban01Empresa: [
            this.globalService.getCodigoEmpresa(),
            Validators.required,
        ],
        ban01IdTipoPago: ['', Validators.required],
        ban01Descripcion: ['', Validators.required],
        ban01AsiConPrefijo: ['', Validators.required],
        ban01AsiConCtaBanco: ['', Validators.required],
        ban01AsiConCtaITF: ['', Validators.required],
        ban01AsiConDiario: ['', Validators.required],
        ban01Moneda: ['', Validators.required],
        ban01AsiConCtaComiOtrosBancos: ['', Validators.required],
        ban01AsiConFlagITF: ['', Validators.required],
        ban01CtaBanBancoCod: ['', Validators.required], 
        ban01CtaBanCod: ['', Validators.required],      
    });
  }

  cargarMediosPago(): void {
    const codigoEmpresa: string = this.globalService.getCodigoEmpresa();
    this.mediopagoService.GetMediosPago(codigoEmpresa).subscribe({
        next: (data) => {
            this.mediopagoList = data.map(item => ({
                ...item,
                ban01AsiConFlagITF: item.ban01AsiConFlagITF || null // Handle null values
            }));
        },
        error: () => {
            verMensajeInformativo(this.messageService, 'error', 'Error', 'Error al cargar medios de pago');
        }
    });
  }

  cargarBancos(): void {
    this.bancoService.GetBancos().subscribe({
      next: (data: Banco[]) => {
        this.bancosOptions = data.map(banco => ({
          label: banco.ban01Descripcion,
          value: banco.ban01IdBanco
        }));
      },
      error: () => {
        verMensajeInformativo(this.messageService, 'error', 'Error', 'Error al cargar bancos');
      }
    });
  }

  onBancoChange(event: any) {
    const bancoId = event.value;
    if (bancoId) {
        this.cuentaBancariaService.GetCuentasBancarias(bancoId).subscribe({
            next: (data) => {
                this.cuentasOptions = data.map(cuenta => ({
                    label: cuenta.nombreCuentaBancaria,
                    value: cuenta.nombreCuentaBancaria
                }));

                if (!this.cuentasOptions.some(opt => opt.value === this.mediopagoForm.get('ban01CtaBanCod')?.value)) {
                    this.mediopagoForm.patchValue({ ban01CtaBanCod: '' });
                }
            },
            error: () => {
                this.cuentasOptions = [];
                this.mediopagoForm.patchValue({ ban01CtaBanCod: '' });
            }
        });
    } else {
        this.cuentasOptions = [];
        this.mediopagoForm.patchValue({ ban01CtaBanCod: '' });
    }
  }

  onBancoChangeRow(event: any, mediopago: MedioPago): void {
    const bancoId = event.value;
    if (bancoId) {
        this.cuentaBancariaService.GetCuentasBancarias(bancoId).subscribe({
            next: (data) => {
                this.cuentasOptionsRow[mediopago.ban01IdTipoPago] = data.map(cuenta => ({
                    label: cuenta.nombreCuentaBancaria,
                    value: cuenta.nombreCuentaBancaria
                }));

                if (!this.cuentasOptionsRow[mediopago.ban01IdTipoPago].some(opt => opt.value === mediopago.ban01CtaBanCod)) {
                    mediopago.ban01CtaBanCod = null;
                }
            },
            error: () => {
                this.cuentasOptionsRow[mediopago.ban01IdTipoPago] = [];
                mediopago.ban01CtaBanCod = null;
            }
        });
    } else {
        this.cuentasOptionsRow[mediopago.ban01IdTipoPago] = [];
        mediopago.ban01CtaBanCod = null;
    }
  }
    
  onRowEditInit(mediopago: MedioPago): void {
      this.editingMedioPago = { ...mediopago };
      this.isEditingAnyRow = true;

      if (!mediopago.ban01AsiConFlagITF) {
          mediopago.ban01AsiConFlagITF = null;
      }

      this.bancoService.GetBancos().subscribe({
          next: (data) => {
              this.bancosOptions = data.map(banco => ({
                  label: banco.ban01Descripcion,
                  value: banco.ban01IdBanco
              }));
          },
          error: () => {
              this.bancosOptions = [];
          }
      });

      const bancoId = mediopago.ban01CtaBanBancoCod || this.bancosOptions[0]?.value;
      this.cuentaBancariaService.GetCuentasBancarias(bancoId).subscribe({
          next: (data) => {
              this.cuentasOptionsRow[mediopago.ban01IdTipoPago] = data.map(cuenta => ({
                  label: cuenta.nombreCuentaBancaria,
                  value: cuenta.nombreCuentaBancaria
              }));
          },
          error: () => {
              this.cuentasOptionsRow[mediopago.ban01IdTipoPago] = [];
          }
      });

      this.monedaOptions = [
          { label: 'Soles', value: 'S' },
          { label: 'Dólares', value: 'D' }
      ];
  }

  onRowEditSave(mediopago: MedioPago): void {
    const updatedMedioPago: MedioPago = {
        ban01Empresa: this.globalService.getCodigoEmpresa(),
        ban01IdTipoPago: mediopago.ban01IdTipoPago,
        ban01Descripcion: mediopago.ban01Descripcion || '',
        ban01AsiConPrefijo: mediopago.ban01AsiConPrefijo || '',
        ban01AsiConCtaBanco: mediopago.ban01AsiConCtaBanco || '',
        ban01AsiConCtaITF: mediopago.ban01AsiConCtaITF || '',
        ban01AsiConDiario: mediopago.ban01AsiConDiario || '',
        ban01Moneda: mediopago.ban01Moneda || '',
        ban01AsiConCtaComiOtrosBancos: mediopago.ban01AsiConCtaComiOtrosBancos || '',
        ban01AsiConFlagITF: mediopago.ban01AsiConFlagITF || '',
        ban01CtaBanBancoCod: mediopago.ban01CtaBanBancoCod || '',
        ban01CtaBanCod: mediopago.ban01CtaBanCod || '',
    };

    this.mediopagoService.ActualizarMedioPago(updatedMedioPago).subscribe({
        next: () => {
            this.editingMedioPago = null;
            this.isEditingAnyRow = false;
            verMensajeInformativo(this.messageService, 'success', 'Éxito', 'Registro actualizado');
        },
        error: () => {
            verMensajeInformativo(this.messageService, 'error', 'Error', 'Error al actualizar');
        }
    });
  }

  onRowEditCancel(mediopago:MedioPago,index: number): void {
    if (this.editingMedioPago) {
      this.mediopagoList[index] = { ...this.editingMedioPago };
      this.editingMedioPago = null;
      this.isEditingAnyRow = false;
      this.cargarMediosPago();
    }
  }

  showAddRow(){
    this.isEditing = true;
    this.isNew = true;
    this.mediopagoForm.reset({
        ban01Empresa: this.globalService.getCodigoEmpresa(),
        ban01CtaBanBancoCod: '',
        ban01CtaBanCod: ''
    });
  }

  onSave() {
    const idTipoPago = this.mediopagoForm.get('ban01IdTipoPago')?.value;

    if (idTipoPago) {
        const formData = this.mediopagoForm.value;

        const newMedioPago: MedioPago = {
            ban01Empresa: this.globalService.getCodigoEmpresa(),
            ban01IdTipoPago: idTipoPago,
            ban01Descripcion: formData.ban01Descripcion || '',
            ban01AsiConPrefijo: formData.ban01AsiConPrefijo || '',
            ban01AsiConCtaBanco: formData.ban01AsiConCtaBanco || '',
            ban01AsiConCtaITF: formData.ban01AsiConCtaITF || '',
            ban01AsiConDiario: formData.ban01AsiConDiario || '',
            ban01Moneda: formData.ban01Moneda || '',
            ban01AsiConCtaComiOtrosBancos: formData.ban01AsiConCtaComiOtrosBancos || '',
            ban01AsiConFlagITF: formData.ban01AsiConFlagITF || '',
            ban01CtaBanBancoCod: formData.ban01CtaBanBancoCod || '',
            ban01CtaBanCod: formData.ban01CtaBanCod || '',
        };

        this.mediopagoService.CrearMedioPago(newMedioPago).subscribe({
            next: () => {
                this.isEditing = false;
                this.isNew = false;
                this.mediopagoForm.reset({
                    ban01Empresa: this.globalService.getCodigoEmpresa(),
                });
                verMensajeInformativo(this.messageService, 'success', 'Éxito', 'Registro guardado');
                this.cargarMediosPago();
            },
            error: (err) => {
                console.error('Error al guardar:', err);
                verMensajeInformativo(this.messageService, 'error', 'Error', 'No se pudo guardar el registro');
            },
        });
    } else {
        verMensajeInformativo(this.messageService, 'error', 'Error', 'El campo Código es obligatorio');
    }
  }

  onCancel() {
    this.isEditing = false;
    this.isNew = false;
    this.mediopagoForm.reset({
        ban01Empresa: this.globalService.getCodigoEmpresa(),
        ban01CtaBanBancoCod: '',
        ban01CtaBanCod: ''
    });
  }


onDelete(mediopago: MedioPago, index: number): void {
    this.confirmationService.confirm({
      message: `¿Está seguro que desea eliminar el medio de pago <b>${mediopago.ban01Descripcion}</b>?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button',
      accept: () => {
        
        if (!mediopago.ban01Empresa || !mediopago.ban01IdTipoPago) {
          console.error('Error: Datos incompletos para eliminar', mediopago);
          verMensajeInformativo(this.messageService, 'error', 'Error',
            'No se puede eliminar: datos incompletos del registro');
          return;
        }

        this.mediopagoService.EliminarMedioPago(mediopago.ban01Empresa, mediopago.ban01IdTipoPago).subscribe({
          next: (response) => {

            const indexToRemove = this.mediopagoList.findIndex(item =>
              item.ban01IdTipoPago === mediopago.ban01IdTipoPago &&
              item.ban01Empresa === mediopago.ban01Empresa
            );

            if (indexToRemove !== -1) {
              this.mediopagoList.splice(indexToRemove, 1);
            }

            verMensajeInformativo(this.messageService, 'success', 'Éxito', 'Registro eliminado');

            
            this.cargarMediosPago();
          },
          error: (err) => {
            console.error('Error al eliminar:', err);
            verMensajeInformativo(this.messageService, 'error', 'Error',
              'No se pudo eliminar el registro. Por favor, intente nuevamente.');
          }
        });
      }
    });
  }

  getBancoLabel(bancoCod: string): string {
    const banco = this.bancosOptions.find(option => option.value === bancoCod);
    return banco ? banco.label : '';
  }

  getCuentaLabel(tipoPago: string, cuentaCod: string): string {
    const cuenta = this.cuentasOptionsRow[tipoPago]?.find(option => option.value === cuentaCod);
    return cuenta ? cuenta.label : ''; 
  }

}
