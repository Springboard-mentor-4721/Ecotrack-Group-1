import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConfirmationDialogService {
  confirm(message: string): Promise<boolean> {
    return Promise.resolve(window.confirm(message));
  }
}
