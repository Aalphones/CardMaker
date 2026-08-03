import { CanDeactivateFn } from '@angular/router';

export interface ComponentWithUnsavedChanges {
  hasUnsavedChanges(): boolean;
}

export const pendingChangesGuard: CanDeactivateFn<ComponentWithUnsavedChanges> = (
  component: ComponentWithUnsavedChanges,
) => {
  if (!component.hasUnsavedChanges()) {
    return true;
  }

  return confirm('Es gibt ungespeicherte Änderungen. Seite trotzdem verlassen?');
};
