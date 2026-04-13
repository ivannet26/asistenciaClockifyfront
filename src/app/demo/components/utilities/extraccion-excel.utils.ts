import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Table } from 'primeng/table';

export class ExtraccionExcel {

    /**
     * Exporta los datos de una p-table respetando filtros activos
     * @param tabla     Referencia a la p-table (#dt)
     * @param mapeo     Función para transformar cada fila (títulos y campos)
     * @param nombreArchivo  Nombre del archivo sin extensión
     * @param nombreHoja     Nombre de la pestaña en el Excel
     */
    static desdeTabla(
        tabla: Table,
        mapeo: (fila: any, index: number) => Record<string, any>,
        nombreArchivo: string = 'reporte',
        nombreHoja: string = 'Datos'
    ): void {
        const datos = tabla.filteredValue ?? tabla.value;

        if (!datos || datos.length === 0) {
            console.warn('ExtraccionExcel: no hay datos para exportar');
            return;
        }

        const datosFormateados = datos.map((fila, index) => mapeo(fila, index));
        ExtraccionExcel.generarArchivo(datosFormateados, nombreArchivo, nombreHoja);
    }

    static desdeArray(
        datos: any[],
        mapeo: (fila: any) => Record<string, any>,
        nombreArchivo: string = 'reporte',
        nombreHoja: string = 'Datos'
    ): void {
        if (!datos || datos.length === 0) {
            console.warn('ExtraccionExcel: no hay datos para exportar');
            return;
        }

        const datosFormateados = datos.map(mapeo);
        ExtraccionExcel.generarArchivo(datosFormateados, nombreArchivo, nombreHoja);
    }

    static variosSheet(
        hojas: {
            datos: any[];
            mapeo: (fila: any) => Record<string, any>;
            nombreHoja: string;
        }[],
        nombreArchivo: string = 'reporte'
    ): void {
        const workbook = XLSX.utils.book_new();

        hojas.forEach(hoja => {
            if (!hoja.datos || hoja.datos.length === 0) return;

            const formateados = hoja.datos.map(hoja.mapeo);
            const worksheet   = XLSX.utils.json_to_sheet(formateados);
            ExtraccionExcel.ajustarColumnas(worksheet, formateados);
            XLSX.utils.book_append_sheet(workbook, worksheet, hoja.nombreHoja);
        });

        const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        saveAs(new Blob([buffer], { type: 'application/octet-stream' }), `${nombreArchivo}.xlsx`);
    }

    private static generarArchivo(
        datos: Record<string, any>[],
        nombreArchivo: string,
        nombreHoja: string
    ): void {
        const worksheet = XLSX.utils.json_to_sheet(datos);
        const workbook  = XLSX.utils.book_new();

        ExtraccionExcel.ajustarColumnas(worksheet, datos);
        XLSX.utils.book_append_sheet(workbook, worksheet, nombreHoja);

        const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        saveAs(new Blob([buffer], { type: 'application/octet-stream' }), `${nombreArchivo}.xlsx`);
    }

    private static ajustarColumnas(ws: XLSX.WorkSheet, filas: any[]): void {
        if (filas.length === 0) return;
        const cols = Object.keys(filas[0]);
        ws['!cols'] = cols.map(col => ({
            wch: Math.max(col.length, ...filas.map(f => String(f[col] ?? '').length)) + 2
        }));
    }
}