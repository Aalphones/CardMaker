import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { Auth } from '../../core/services/auth';
import { NotificationList } from '../../shared/components/notification-list/notification-list';

@Component({
  selector: 'app-shell',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, NotificationList],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Shell {
  protected readonly auth = inject(Auth);

  logout(): void {
    this.auth.logout();
  }
}
