import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  message: string;
  type: ToastType;
  duration?: number; // ms, 0 = persistente
}

export interface ToastWithId extends ToastMessage {
  id: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private toastsSubject = new BehaviorSubject<ToastWithId[]>([]);
  public get toasts$(): Observable<ToastWithId[]> {
    return this.toastsSubject.asObservable();
  }

  private nextId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  show(message: string, type: ToastType, duration = 5000): string {
    const id = this.nextId();
    const t: ToastWithId = { id, message, type, duration };
    this.toastsSubject.next([...this.toastsSubject.getValue(), t]);
    return id;
  }

  success(message: string, duration = 4000): string {
    return this.show(message, 'success', duration);
  }

  error(message: string, duration = 8000): string {
    return this.show(message, 'error', duration);
  }

  info(message: string, duration = 3000): string {
    return this.show(message, 'info', duration);
  }

  warning(message: string, duration = 6000): string {
    return this.show(message, 'warning', duration);
  }

  // Dismiss a toast by id
  dismiss(id: string) {
    const list = this.toastsSubject.getValue().filter(t => t.id !== id);
    this.toastsSubject.next(list);
  }

  // Clear all toasts
  clear() {
    this.toastsSubject.next([]);
  }
}
