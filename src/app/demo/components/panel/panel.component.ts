import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { ChartModule } from 'primeng/chart';
import { CalendarModule } from 'primeng/calendar';
import { OverlayPanelModule, OverlayPanel } from 'primeng/overlaypanel';

@Component({
  selector: 'app-panel',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ButtonModule, DropdownModule, 
    InputTextModule, ChartModule, CalendarModule, OverlayPanelModule
  ],
  templateUrl: './panel.component.html',
  styles: [`
    .card-stats { background: #f8f9fa; padding: 1.2rem; border-radius: 4px; border: 1px solid #dee2e6; text-align: center; }
    .stat-label { display: block; color: #9aa0a6; text-transform: uppercase; font-size: 0.7rem; font-weight: 700; margin-bottom: 0.5rem; }
    .stat-value { color: #3c4043; font-size: 1.8rem; font-weight: 700; }
    .bg-cyan-clock { background-color: #00BCD4 !important; }
    .menu-calendario { width: 180px; border-right: 1px solid #dee2e6; }
    .menu-calendario ul { list-style: none; padding: 0; margin: 0; }
    .menu-calendario li { padding: 10px 15px; cursor: pointer; font-size: 14px; color: #495057; }
    .menu-calendario li:hover { background: #f8f9fa; color: #00BCD4; }
    .menu-calendario li.active { background: #e3f2fd; color: #007ad9; border-left: 3px solid #007ad9;
    
  }
  `]
})
export class PanelComponent implements OnInit {
  @ViewChild('op') op!: OverlayPanel;

  registrosCompletos: any[] = [];
  proyectosConTiempo: any[] = [];
  proyectosParaDistribucion: any[] = [];
  
  tiempoTotalFormateado: string = '00:00:00';
  proyectoPrincipal: string = 'PROYECTO';
  
  rangoFechas: Date[] = [];
  textoRango: string = '';

  dataGrafica: any;      
  opcionesGrafica: any;
  dataBarras: any;       
  opcionesBarras: any;
  hayRegistrosGlobales: boolean = false;
  constructor(private router: Router) {}

  ngOnInit() {
    this.verificarRegistrosGlobales();
    this.configurarOpcionesGraficas();
    this.seleccionarOpcion('estaSemana'); 
  }

  configurarOpcionesGraficas() {
    this.opcionesGrafica = { responsive: true, maintainAspectRatio: false, cutout: '85%', plugins: { legend: { display: false } } };
    this.opcionesBarras = {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { 
        x: { grid: { display: false }, ticks: { color: '#9aa0a6' } }, 
        y: { beginAtZero: true, ticks: { callback: (v: any) => this.formatearSegundos(v) } } 
      }
    };
  }

  seleccionarOpcion(opcion: string) {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    let inicio = new Date(hoy);
    let fin = new Date(hoy);

    switch (opcion) {
      case 'hoy':
        fin.setHours(23, 59, 59, 999);
        break;
      case 'ayer':
        inicio.setDate(hoy.getDate() - 1);
        fin.setDate(hoy.getDate() - 1);
        fin.setHours(23, 59, 59, 999);
        break;
      case 'estaSemana':
        const d = hoy.getDay();
        const diffAlLunes = (d === 0 ? 6 : d - 1);
        inicio.setDate(hoy.getDate() - diffAlLunes);
        fin = new Date(inicio);
        fin.setDate(inicio.getDate() + 6);
        fin.setHours(23, 59, 59, 999);
        break;
    }

    this.rangoFechas = [inicio, fin];
    this.actualizarYFiltrar();
    if (this.op) this.op.hide();
  }

  actualizarYFiltrar() {
    if (this.rangoFechas && this.rangoFechas[0]) {
      const inicio = new Date(this.rangoFechas[0]);
      inicio.setHours(0,0,0,0);
      
      const fin = this.rangoFechas[1] ? new Date(this.rangoFechas[1]) : new Date(inicio);
      fin.setHours(23, 59, 59, 999);
      
      const opciones: any = { day: '2-digit', month: '2-digit', year: 'numeric' };
      this.textoRango = `${inicio.toLocaleDateString('es-ES', opciones)} - ${fin.toLocaleDateString('es-ES', opciones)}`;
      this.cargarTodoDesdeStorage();
    }
  }

  cambiarSemana(dir: number) {
    const nuevaFecha = new Date(this.rangoFechas[0]);
    nuevaFecha.setDate(nuevaFecha.getDate() + (dir * 7));
    
    const fin = new Date(nuevaFecha);
    fin.setDate(nuevaFecha.getDate() + 6);
    fin.setHours(23, 59, 59, 999);
    
    this.rangoFechas = [nuevaFecha, fin];
    this.actualizarYFiltrar();
  }
  verificarRegistrosGlobales() {
    const data = localStorage.getItem('registros');
    const registros = data ? JSON.parse(data) : [];
    this.hayRegistrosGlobales = registros.length > 0;
  }

  // 4. NUEVA FUNCIÓN para el botón del Empty State
  irAlRastreador() {
    this.router.navigate(['/menu-layout/rastreador']);
  }

  cargarTodoDesdeStorage() {
    const data = localStorage.getItem('registros');
    if (data) {
      this.registrosCompletos = JSON.parse(data);
      this.procesarTodo();
    }
  }

  procesarTodo() {
    const tiemposPorProyecto: { [key: string]: number } = {};
    const tiemposPorActividad: { [key: string]: { segundos: number, proyecto: string } } = {};
    const tiempoPorDiaSemana = [0, 0, 0, 0, 0, 0, 0];
    let totalSGlobal = 0;

    const inicioFiltro = this.rangoFechas[0];
    const finFiltro = this.rangoFechas[1] || new Date(inicioFiltro.getTime() + 86399999);

    const dSemana = inicioFiltro.getDay();
    const diff = (dSemana === 0 ? 6 : dSemana - 1);
    const lunesGrafico = new Date(inicioFiltro);
    lunesGrafico.setDate(inicioFiltro.getDate() - diff);
    lunesGrafico.setHours(0,0,0,0);

    this.registrosCompletos.forEach(r => {
      if (r.inicio) {
        const fechaReg = new Date(r.inicio);
        
        if (fechaReg >= inicioFiltro && fechaReg <= finFiltro) {
          // PROTECCIÓN CONTRA NULL (Error que te salía antes)
          const proyObj = r.proyecto;
          const proyNombre = (proyObj && typeof proyObj === 'object') ? proyObj.nombre : (proyObj || 'Sin Proyecto');
          
          const desc = r.descripcion || '(Sin descripción)';
          
          let s = 0;
          if (r.duracion?.includes(':')) {
            const p = r.duracion.split(':');
            s = (parseInt(p[0]) * 3600) + (parseInt(p[1]) * 60) + parseInt(p[2]);
          }

          tiemposPorProyecto[proyNombre] = (tiemposPorProyecto[proyNombre] || 0) + s;
          if (!tiemposPorActividad[desc]) tiemposPorActividad[desc] = { segundos: 0, proyecto: proyNombre };
          tiemposPorActividad[desc].segundos += s;

          const soloFecha = r.inicio.split('T')[0];
          const fechaLocal = new Date(soloFecha + 'T00:00:00');
          const dayIdx = fechaLocal.getDay();
          const idx = (dayIdx === 0) ? 6 : dayIdx - 1;
          
          if (idx >= 0 && idx < 7) tiempoPorDiaSemana[idx] += s;
          totalSGlobal += s;
        }
      }
    });

    this.tiempoTotalFormateado = this.formatearSegundos(totalSGlobal);
    const sorted = Object.keys(tiemposPorProyecto).sort((a,b) => tiemposPorProyecto[b] - tiemposPorProyecto[a]);
    this.proyectoPrincipal = sorted[0] || 'PROYECTO';

    this.dataBarras = {
      labels: this.generarLabels(lunesGrafico),
      datasets: [{ 
        data: tiempoPorDiaSemana, 
        backgroundColor: '#00BCD4', 
        borderRadius: 4, 
        barThickness: 50 
      }]
    };

    this.dataGrafica = {
      labels: Object.keys(tiemposPorProyecto),
      datasets: [{ data: Object.values(tiemposPorProyecto), backgroundColor: ['#00BCD4', '#81D4FA', '#E1F5FE', '#B0BEC5'], borderWidth: 0 }]
    };

    this.proyectosParaDistribucion = Object.keys(tiemposPorProyecto).map(n => ({
      nombre: n, 
      tiempoFormateado: this.formatearSegundos(tiemposPorProyecto[n]),
      porcentaje: totalSGlobal > 0 ? (tiemposPorProyecto[n] / totalSGlobal) * 100 : 0
    }));

    this.proyectosConTiempo = Object.keys(tiemposPorActividad).map(d => ({
      nombre: d, proyecto: tiemposPorActividad[d].proyecto, tiempoFormateado: this.formatearSegundos(tiemposPorActividad[d].segundos)
    }));
  }

  generarLabels(lunes: Date): string[] {
    const labels = [];
    const dias = ['lun.', 'mar.', 'mié.', 'jue.', 'vie.', 'sáb.', 'dom.'];
    for (let i = 0; i < 7; i++) {
      const d = new Date(lunes);
      d.setDate(lunes.getDate() + i);
      labels.push(`${dias[i]}, ${d.getDate()}`);
    }
    return labels;
  }

  private formatearSegundos(t: number): string {
    const h = Math.floor(t / 3600).toString().padStart(2, '0');
    const m = Math.floor((t % 3600) / 60).toString().padStart(2, '0');
    const s = (t % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  }
}