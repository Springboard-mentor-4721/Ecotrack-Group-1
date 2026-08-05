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
      modal.style.backgroundColor = '#ffffff';
      modal.style.borderRadius = '12px';
      modal.style.padding = '1.5rem 2rem';
      modal.style.maxWidth = '400px';
      modal.style.width = '90%';
      modal.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)';
      modal.style.animation = 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
      modal.style.fontFamily = "'Inter', sans-serif";

      // Title
      const title = document.createElement('h3');
      title.innerText = 'Confirm Action';
      title.style.margin = '0 0 1rem 0';
      title.style.color = '#0f172a';
      title.style.fontSize = '1.25rem';
      title.style.fontWeight = '600';

      // Message
      const msg = document.createElement('p');
      msg.innerText = message;
      msg.style.margin = '0 0 1.5rem 0';
      msg.style.color = '#475569';
      msg.style.fontSize = '0.95rem';
      msg.style.lineHeight = '1.5';

      // Button container
      const btnContainer = document.createElement('div');
      btnContainer.style.display = 'flex';
      btnContainer.style.justifyContent = 'flex-end';
      btnContainer.style.gap = '0.75rem';

      // Cancel button
      const cancelBtn = document.createElement('button');
      cancelBtn.innerText = 'Cancel';
      cancelBtn.style.padding = '0.5rem 1rem';
      cancelBtn.style.borderRadius = '6px';
      cancelBtn.style.border = '1px solid #cbd5e1';
      cancelBtn.style.backgroundColor = '#ffffff';
      cancelBtn.style.color = '#334155';
      cancelBtn.style.fontWeight = '500';
      cancelBtn.style.cursor = 'pointer';
      cancelBtn.style.transition = 'all 0.2s';
      cancelBtn.onmouseover = () => cancelBtn.style.backgroundColor = '#f1f5f9';
      cancelBtn.onmouseout = () => cancelBtn.style.backgroundColor = '#ffffff';

      // Confirm button
      const confirmBtn = document.createElement('button');
      confirmBtn.innerText = 'Confirm';
      confirmBtn.style.padding = '0.5rem 1rem';
      confirmBtn.style.borderRadius = '6px';
      confirmBtn.style.border = 'none';
      confirmBtn.style.backgroundColor = '#059669';
      confirmBtn.style.color = '#ffffff';
      confirmBtn.style.fontWeight = '500';
      confirmBtn.style.cursor = 'pointer';
      confirmBtn.style.transition = 'all 0.2s';
      confirmBtn.onmouseover = () => confirmBtn.style.backgroundColor = '#047857';
      confirmBtn.onmouseout = () => confirmBtn.style.backgroundColor = '#059669';

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
