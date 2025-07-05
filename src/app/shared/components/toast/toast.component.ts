import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../services/toast.service';
import { Subscription } from 'rxjs';

interface ToastWithFade extends Toast {
  fading?: boolean;
  timeoutId?: any;
}

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class ToastComponent implements OnInit, OnDestroy {
  toasts: ToastWithFade[] = [];
  private sub!: Subscription;
  private fadeDuration = 1000; // ms

  constructor(private toastService: ToastService) {}

  ngOnInit() {
    this.sub = this.toastService.toasts$.subscribe(toasts => {
      // Add fade property to new toasts
      this.toasts = toasts.map(t => ({ ...t, fading: false }));
      // Set up fade-out for each toast
      this.toasts.forEach(toast => {
        if (!toast['timeoutId'] && toast.timeout) {
          toast['timeoutId'] = setTimeout(() => this.startFade(toast.id), toast.timeout - this.fadeDuration);
        }
      });
    });
  }

  startFade(id?: number) {
    const toast = this.toasts.find(t => t.id === id);
    if (toast) {
      toast.fading = true;
      setTimeout(() => this.remove(id), this.fadeDuration);
    }
  }

  remove(id?: number) {
    if (id) this.toastService.remove(id);
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }
}
