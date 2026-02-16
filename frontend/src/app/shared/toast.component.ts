import { Component, signal, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastWithId } from './toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div *ngFor="let t of toasts()" class="toast" [ngClass]="t.type" (click)="dismiss(t.id)">
        <div class="toast-content">{{ t.message }}</div>
        <button class="toast-close" aria-label="Cerrar" (click)="dismiss(t.id); $event.stopPropagation()">×</button>
      </div>
    </div>
  `,
  styles: [`
    .toast-container { position: fixed; top: 20px; right: 20px; z-index: 9999; display:flex; flex-direction:column; gap:10px; }
    .toast { display:flex; align-items:center; gap:12px; padding:12px 16px; border-radius:6px; color:#fff; box-shadow:0 6px 18px rgba(0,0,0,0.15); cursor:pointer; opacity:0; transform:translateY(-6px); transition:opacity 0.25s ease, transform 0.25s ease; }
    .toast.success { background:#4caf50; }
    .toast.error { background:#FF0202; color:#000000; }
    .toast.info { background:#2196f3; }
    .toast.warning { background:#ff9800; }
    .toast.show { opacity:1; transform:translateY(0); }
    .toast-close { background:transparent; border:0; color:inherit; font-size:18px; cursor:pointer; }
    .toast-content { flex:1; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToastComponent implements OnDestroy {
  toasts = signal<ToastWithId[]>([]);
  private timeouts = new Map<string, any>();

  constructor(private toastService: ToastService) {
    this.toastService.toasts$.subscribe(list => {
      // cancelar timeouts que ya no existan
      const currentIds = new Set(list.map(t => t.id));
      for (const id of Array.from(this.timeouts.keys())) {
        if (!currentIds.has(id)) {
          clearTimeout(this.timeouts.get(id));
          this.timeouts.delete(id);
        }
      }

      this.toasts.set(list);

      // programar timeouts para nuevos toasts
      for (const t of list) {
        if (t.duration && t.duration > 0 && !this.timeouts.has(t.id)) {
          const to = setTimeout(() => this.dismiss(t.id), t.duration);
          this.timeouts.set(t.id, to);
        }
      }
    });
  }

  dismiss(id: string) {
    this.toastService.dismiss(id);
    if (this.timeouts.has(id)) {
      clearTimeout(this.timeouts.get(id));
      this.timeouts.delete(id);
    }
  }

  ngOnDestroy(): void {
    for (const to of this.timeouts.values()) clearTimeout(to);
    this.timeouts.clear();
  }
}
