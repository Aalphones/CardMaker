import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { PrintProjectFacade } from '../../../store/print-project/print-project.facade';

@Component({
  selector: 'app-print-project-page',
  templateUrl: './print-project-page.html',
  styleUrl: './print-project-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrintProjectPage {
  protected readonly printProject = inject(PrintProjectFacade);

  constructor() {
    this.printProject.ensureLoaded();
  }
}
