import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../../../../../environments/environment';

@Pipe({
  name: 'challengeImage',
  standalone: true
})
export class ChallengeImagePipe implements PipeTransform {
  private fallbacks = [
    'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&q=80',
    'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=600&q=80',
    'https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=600&q=80',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80'
  ];

  transform(url: string | null | undefined, fallbackIndex: number = 0): string {
    // Map challenge ID to consistent fallback if url is missing
    const idNum = url ? (url.charCodeAt(0) % this.fallbacks.length) : (fallbackIndex % this.fallbacks.length);
    if (!url || url.length < 5) {
      return this.fallbacks[idNum];
    }
    if (url.startsWith('http') || url.startsWith('data:')) {
      return url;
    }
    if (url.startsWith('uploads/')) {
      return encodeURI(`${environment.apiUrl.replace(/\/api$/, '')}/${url}`);
    }
    return encodeURI(`${environment.apiUrl.replace(/\/api$/, '')}/uploads/${url}`);
  }
}
