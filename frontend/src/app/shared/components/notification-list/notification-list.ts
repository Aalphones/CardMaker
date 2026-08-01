import { Component, inject } from '@angular/core';

import { Notification } from '../../services/notification';

@Component({
  selector: 'app-notification-list',
  imports: [],
  templateUrl: './notification-list.html',
  styleUrl: './notification-list.scss',
})
export class NotificationList {
  protected readonly notification = inject(Notification);
}
