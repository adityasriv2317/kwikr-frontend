import { Injectable, signal } from '@angular/core';
export type ToastType = 'success' | 'error' | 'info';
export interface Toast { id: number; type: ToastType; message: string; }
@Injectable({ providedIn: 'root' })
export class ToastService {
  private sequence = 0;
  readonly toasts = signal<Toast[]>([]);
  success(message: string) { this.push('success', message); }
  error(message: string) { this.push('error', message); }
  info(message: string) { this.push('info', message); }
  dismiss(id: number) { this.toasts.update(items => items.filter(item => item.id !== id)); }
  private push(type: ToastType, message: string) {
    const id = ++this.sequence;
    this.toasts.update(items => [...items, { id, type, message }]);
    setTimeout(() => this.dismiss(id), 3500);
  }
}
