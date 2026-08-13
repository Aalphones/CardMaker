import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { Auth } from '../../core/services/auth';
import { NotificationList } from '../../shared/components/notification-list/notification-list';
import { PrintProjectFacade } from '../../store/print-project/print-project.facade';

@Component({
  selector: 'app-shell',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, NotificationList],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Shell {
  protected readonly auth = inject(Auth);
  protected readonly printProject = inject(PrintProjectFacade);

  constructor() {
    this.printProject.ensureLoaded();
  }

  logout(): void {
    this.auth.logout();
  }
}
