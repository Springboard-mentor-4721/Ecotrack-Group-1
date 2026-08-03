import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  success(message: string): void {
    console.log('SUCCESS:', message);
  }

  error(message: string): void {
    console.error('ERROR:', message);
  }

  info(message: string): void {
    console.info('INFO:', message);
  }
}
