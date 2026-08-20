import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConfirmationDialogService {
  confirm(message: string): Promise<boolean> {
    return new Promise((resolve) => {
      // Create backdrop overlay
      const overlay = document.createElement('div');
      overlay.style.position = 'fixed';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100vw';
      overlay.style.height = '100vh';
      overlay.style.backgroundColor = 'rgba(15, 23, 42, 0.4)';
      overlay.style.backdropFilter = 'blur(4px)';
      overlay.style.zIndex = '9999';
      overlay.style.display = 'flex';
      overlay.style.alignItems = 'center';
      overlay.style.justifyContent = 'center';
      overlay.style.animation = 'fadeIn 0.2s ease-out';
      
      // Add animation style if not exists
      if (!document.getElementById('confirm-dialog-styles')) {
        const style = document.createElement('style');
        style.id = 'confirm-dialog-styles';
        style.innerHTML = `
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        `;
        document.head.appendChild(style);
      }

      // Create modal container
      const modal = document.createElement('div');
      modal.className = 'bg-white rounded p-4 shadow-lg text-center';
      modal.style.width = '90%';
      modal.style.maxWidth = '400px';
      modal.style.animation = 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
      modal.style.fontFamily = "'Inter', sans-serif";

      // Title
      const title = document.createElement('h3');
      title.innerText = 'Confirm Action';
      title.className = 'm-0 mb-3 text-dark fs-5 fw-bold';

      // Message
      const msg = document.createElement('p');
      msg.innerText = message;
      msg.className = 'm-0 mb-4 text-muted fs-6';

      const btnContainer = document.createElement('div');
      btnContainer.className = 'd-flex justify-content-center gap-3 mt-4';

      // Cancel button
      const cancelBtn = document.createElement('button');
      cancelBtn.innerText = 'Cancel';
      cancelBtn.className = 'btn btn-outline-secondary px-4';

      // Confirm button
      const confirmBtn = document.createElement('button');
      confirmBtn.innerText = 'Confirm';
      confirmBtn.className = 'btn btn-success px-4';

      // Cleanup function
      const cleanup = () => {
        overlay.style.opacity = '0';
        modal.style.transform = 'translateY(20px)';
        modal.style.opacity = '0';
        overlay.style.transition = 'opacity 0.2s ease';
        modal.style.transition = 'all 0.2s ease';
        setTimeout(() => document.body.removeChild(overlay), 200);
      };

      // Events
      cancelBtn.onclick = () => { cleanup(); resolve(false); };
      confirmBtn.onclick = () => { cleanup(); resolve(true); };
      overlay.onclick = (e) => { if (e.target === overlay) { cleanup(); resolve(false); } };

      btnContainer.appendChild(cancelBtn);
      btnContainer.appendChild(confirmBtn);

      modal.appendChild(title);
      modal.appendChild(msg);
      modal.appendChild(btnContainer);
      overlay.appendChild(modal);

      document.body.appendChild(overlay);
    });
  }
}
