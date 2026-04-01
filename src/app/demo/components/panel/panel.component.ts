import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-panel',
    templateUrl: './panel.component.html',
    // ... otros metadatos
})
export class PanelComponent implements OnInit {

    // Datos para las gráficas
    basicData: any;
    basicOptions: any;
    doughnutData: any;
    doughnutOptions: any;

    // Datos para los dropdowns
    proyectos: any[] = [];
    usuarios: any[] = [];
    fechas: any[] = [];

    ngOnInit() {
        // Inicializar datos de gráficas
        this.initCharts();
        
        // Datos de prueba para los dropdowns
        this.proyectos = [{ label: 'gm', value: 'gm' }];
        this.usuarios = [{ label: 'Solo yo', value: 'me' }];
        this.fechas = [{ label: 'Esta semana', value: 'week' }];
    }

    initCharts() {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

        // Configuración Gráfica de Barras
        this.basicData = {
            labels: ['lun., mar. 30', 'mar., mar. 31', 'mié., abr. 1', 'jue., abr. 2', 'vie., abr. 3', 'sáb., abr. 4', 'dom., abr. 5'],
            datasets: [
                {
                    label: 'gm',
                    backgroundColor: '#2196F3', // Azul de Clockify
                    data: [0, 0, 4.10, 0, 0, 0, 0] // Solo datos el miércoles
                }
            ]
        };

        this.basicOptions = {
            plugins: {
                legend: { display: false } // Ocultar leyenda
            },
            scales: {
                x: { ticks: { color: textColorSecondary }, grid: { color: surfaceBorder } },
                y: { ticks: { color: textColorSecondary }, grid: { color: surfaceBorder } }
            }
        };

        // Configuración Gráfica de Dona
        this.doughnutData = {
            labels: ['gm', 'Sin proyecto'],
            datasets: [
                {
                    data: [100, 0],
                    backgroundColor: ['#2196F3', '#E3F2FD']
                }
            ]
        };

        this.doughnutOptions = {
            cutout: '80%', // Hacer el círculo interior más grande (como Clockify)
            plugins: { legend: { display: false } }
        };
    }
}