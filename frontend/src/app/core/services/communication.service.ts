import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommunicationService {
  // Mantiene la última notificación emitida (valor inicial vacío)
  private notificationSubject = new BehaviorSubject<string>('');

  // Observable público para que los componentes se suscriban
  readonly notifications$ = this.notificationSubject.asObservable();

  // Enviar una nueva notificación
  sendNotification(message: string): void {
    this.notificationSubject.next(message);
  }

  // (intencionalmente minimalista) Si se necesita acceso síncrono al valor,
  // se puede usar notificationSubject.getValue() desde código confiable.
}
