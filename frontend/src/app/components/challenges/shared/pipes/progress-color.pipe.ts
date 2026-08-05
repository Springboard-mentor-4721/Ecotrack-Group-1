import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'progressColor',
  standalone: true
})
export class ProgressColorPipe implements PipeTransform {
  transform(progress: number, target: number, evaluationType: string): string {
    if (evaluationType !== 'BUDGET') {
      return 'success';
    }
    const percentage = (progress / target) * 100;
    if (percentage < 60) return 'success';
    if (percentage < 80) return 'warning';
    return 'danger';
  }
}
