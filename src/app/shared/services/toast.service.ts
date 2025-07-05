import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  message: string;
  type: ToastType;
  timeout?: number;
  id?: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  toasts$ = this.toastsSubject.asObservable();
  private counter = 0;

  show(message: string, type: ToastType = 'info', timeout: number = 5000) {
    const id = ++this.counter;
    const toast: Toast = { message, type, timeout, id };
    const toasts = [...this.toastsSubject.value, toast];
    this.toastsSubject.next(toasts);
    setTimeout(() => this.remove(id), timeout);
  }

  showSuccess(message: string, timeout: number = 5000) {
    this.show(message, 'success', timeout);
  }
  showError(message: string, timeout: number = 5000) {
    this.show(message, 'error', timeout);
  }
  showInfo(message: string, timeout: number = 5000) {
    this.show(message, 'info', timeout);
  }

  remove(id: number) {
    const toasts = this.toastsSubject.value.filter(t => t.id !== id);
    this.toastsSubject.next(toasts);
  }

  clear() {
    this.toastsSubject.next([]);
  }
}
