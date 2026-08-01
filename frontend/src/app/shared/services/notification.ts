import { Injectable, signal } from '@angular/core';

export interface NotificationMessage {
  id: number;
  text: string;
  kind: 'error' | 'info' | 'success';
}

@Injectable({
  providedIn: 'root',
})
export class Notification {
  private readonly messageSignal = signal<NotificationMessage[]>([]);
  private nextId = 0;

  readonly messages = this.messageSignal.asReadonly();

  show(text: string, kind: NotificationMessage['kind'] = 'error'): void {
    const message: NotificationMessage = { id: this.nextId++, text, kind };
    this.messageSignal.update((current: NotificationMessage[]) => [...current, message]);
  }

  dismiss(id: number): void {
    this.messageSignal.update((current: NotificationMessage[]) =>
      current.filter((message: NotificationMessage) => message.id !== id),
    );
  }
}
