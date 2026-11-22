import { Component, inject } from '@angular/core';
import { ToastService } from '../../core/services/toast.service';
@Component({
  selector: 'app-toast-container',
  styleUrl: './toast-container.component.css',
  template: `
    <div class="toast-stack" aria-live="polite">
      @for (toast of toastService.toasts(); track toast.id) {
        <button class="toast {{toast.type}}" (click)="toastService.dismiss(toast.id)">
          {{ toast.message }}
        </button>
      }
    </div>
  `
})
export class ToastContainerComponent { toastService = inject(ToastService); }
