import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../../../../../environments/environment';

@Pipe({
  name: 'challengeImage',
  standalone: true
})
export class ChallengeImagePipe implements PipeTransform {
  private fallbacks = [
    'assets/images/challenge-placeholder-1.jpg',
    'assets/images/challenge-placeholder-2.jpg',
    'assets/images/challenge-placeholder-3.jpg'
  ];

  transform(url: string | null | undefined, fallbackIndex: number = 0): string {
    if (!url) {
      return this.fallbacks[fallbackIndex % 3];
    }
    if (url.startsWith('http') || url.startsWith('data:')) {
      return url;
    }
    return `${environment.apiUrl.replace(/\/api$/, '')}/uploads/${url}`;
  }
}
