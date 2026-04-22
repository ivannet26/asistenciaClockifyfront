import { Pipe, PipeTransform, inject } from '@angular/core';
import { ConfigService } from '../../../demo/service/config.service';
@Pipe({
  name: 'formatDuration',
  standalone: true,
  pure: false
})
export class FormatDurationPipe implements PipeTransform {
  // Inyectamos el servicio directamente en una propiedad de la clase
  private configService = inject(ConfigService);

  transform(value: number | string | any): string {
    if (value === null || value === undefined) return '00:00:00';

    const totalSeconds = Math.floor(Number(value));
    
    // Al haber inyectado ConfigService arriba, TypeScript ya reconocerá durationFormat()
    const format = this.configService.durationFormat(); 

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const hh = hours < 10 ? `0${hours}` : `${hours}`;
    const mm = minutes < 10 ? `0${minutes}` : `${minutes}`;
    const ss = seconds < 10 ? `0${seconds}` : `${seconds}`;

    if (format === 'full') {
      return `${hh}:${mm}:${ss}`;
    } else {
      return `${hours}:${mm}`;
    }
  }
}