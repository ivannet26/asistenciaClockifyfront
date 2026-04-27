import { Pipe, PipeTransform, inject } from '@angular/core';
import { ConfigService } from '../../../demo/service/config.service';

@Pipe({
  name: 'formatDuration',
  standalone: true,
  pure: false // Necesario para reaccionar a cambios en el servicio sin recargar
})
export class FormatDurationPipe implements PipeTransform {
  private configService = inject(ConfigService);

  transform(value: number | string | any): string {
    // Validación básica de nulos o vacíos
    if (value === null || value === undefined || value === '') return '00:00:00';

    const totalSeconds = Math.floor(Number(value));
    
    // Obtenemos el formato actual de la Signal del servicio
    const format = this.configService.durationFormat(); 

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    // Formateo de dos dígitos (01, 02...)
    const hh = hours.toString().padStart(2, '0');
    const mm = minutes.toString().padStart(2, '0');
    const ss = seconds.toString().padStart(2, '0');

    // Lógica de retorno según la configuración
    if (format === 'full') {
      return `${hh}:${mm}:${ss}`; // Ejemplo: 01:05:09
    } else {
      // Formato corto/compacto h:mm sugerido en tu imagen
      return `${hours}:${mm}`;    // Ejemplo: 1:05
    }
  }
}