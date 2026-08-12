import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  signal,
  viewChildren,
} from '@angular/core';

import { PROMPT_TABS, PromptBlock, PromptTab } from '../prompt-texts';

/** Wie lange der Kopieren-Knopf „Kopiert“ anzeigt, bevor er zurückspringt. */
const COPY_FEEDBACK_MS = 2000;

@Component({
  selector: 'app-prompts-page',
  templateUrl: './prompts-page.html',
  styleUrl: './prompts-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PromptsPage {
  private readonly tabButtons = viewChildren<ElementRef<HTMLButtonElement>>('tabButton');
  private copyFeedbackHandle = 0;

  protected readonly tabs = PROMPT_TABS;
  protected readonly activeTabId = signal<string>(PROMPT_TABS[0]?.id ?? '');
  protected readonly copiedBlockId = signal<string>('');

  protected readonly activeTab = computed<PromptTab | undefined>(() =>
    this.tabs.find((tab: PromptTab) => tab.id === this.activeTabId()),
  );

  protected selectTab(tabId: string): void {
    this.activeTabId.set(tabId);
  }

  /** Pfeiltasten, Pos1 und Ende wandern durch die Reiterreihe — ARIA-Muster für Tabs. */
  protected moveThroughTabs(event: KeyboardEvent, currentIndex: number): void {
    const targetIndex: number = this.nextTabIndex(event.key, currentIndex);

    if (targetIndex < 0) {
      return;
    }

    const targetTab: PromptTab | undefined = this.tabs[targetIndex];

    if (targetTab === undefined) {
      return;
    }

    event.preventDefault();
    this.activeTabId.set(targetTab.id);
    this.tabButtons()[targetIndex]?.nativeElement.focus();
  }

  protected async copyPrompt(block: PromptBlock): Promise<void> {
    await navigator.clipboard.writeText(block.text);
    this.copiedBlockId.set(block.id);

    window.clearTimeout(this.copyFeedbackHandle);
    this.copyFeedbackHandle = window.setTimeout(() => {
      this.copiedBlockId.set('');
    }, COPY_FEEDBACK_MS);
  }

  /** −1 heißt: diese Taste bewegt nichts. */
  private nextTabIndex(key: string, currentIndex: number): number {
    const lastIndex: number = this.tabs.length - 1;

    if (key === 'ArrowRight' || key === 'ArrowDown') {
      if (currentIndex === lastIndex) {
        return 0;
      }

      return currentIndex + 1;
    }

    if (key === 'ArrowLeft' || key === 'ArrowUp') {
      if (currentIndex === 0) {
        return lastIndex;
      }

      return currentIndex - 1;
    }

    if (key === 'Home') {
      return 0;
    }

    if (key === 'End') {
      return lastIndex;
    }

    return -1;
  }
}
