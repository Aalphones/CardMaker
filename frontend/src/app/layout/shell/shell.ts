import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';

import { Auth } from '../../core/services/auth';
import { NotificationList } from '../../shared/components/notification-list/notification-list';
import { PrintProjectFacade } from '../../store/print-project/print-project.facade';

const MORE_PATHS: readonly string[] = ['/assets', '/prompts', '/tokens'];

@Component({
  selector: 'app-shell',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, NotificationList],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown.escape)': 'closeMore()',
  },
})
export class Shell {
  protected readonly auth = inject(Auth);
  protected readonly printProject = inject(PrintProjectFacade);
  private readonly router = inject(Router);

  /** Das „Mehr"-Blatt der Tab-Leiste (nur Smartphone-Breite sichtbar). */
  protected readonly moreOpen = signal(false);

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event: NavigationEnd) => event.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  /** „Mehr" sammelt die Bereiche, die keinen eigenen Tab haben. */
  protected readonly moreActive = computed(() =>
    MORE_PATHS.some((path: string) => this.currentUrl().startsWith(path)),
  );

  constructor() {
    this.printProject.ensureLoaded();

    // Jede abgeschlossene Navigation schließt das Blatt.
    effect(() => {
      this.currentUrl();
      untracked(() => this.moreOpen.set(false));
    });
  }

  logout(): void {
    this.auth.logout();
  }

  protected toggleMore(): void {
    this.moreOpen.update((isOpen: boolean) => !isOpen);
  }

  protected closeMore(): void {
    this.moreOpen.set(false);
  }
}
