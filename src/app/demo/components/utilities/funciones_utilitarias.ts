import { MessageService } from "primeng/api";

export function verMensajeInformativo(messageService: MessageService, tipo: string, titulo: string, detalle: string, tiempo_aparicion: number = 3000) {
    if (titulo === '') {
        titulo = 'Mensaje Informativo'
    }

    return messageService.add({
        severity: tipo,
        summary: titulo,
        detail: detalle,
        life: tiempo_aparicion
    });
}

export function formatDate(date: Date): string {
    const day = (date.getDate() + 1).toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

export function formatDateForFilename(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}${month}${year}`;
}

export function formatDateWithTime(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${day}/${month}/${year}_${hours}:${minutes}:${seconds}`;
}

export interface RespuestaAPIBase<T, I = any> {
    message: string;
    messageException: string | null;
    isSuccess: boolean;
    item: I | null; // Puedes tipar 'item' si conoces su estructura
    data: T; // Puedes tipar esto según la respuesta específica que esperes
    total: number;
    mensajeRetorno: string | null;
    flagRetorno: number;
}
