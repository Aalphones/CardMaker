import { Injectable, inject } from '@angular/core';
import { Actions, ofType } from '@ngrx/effects';
import { firstValueFrom, race } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';

import { Card, CardsActions } from '../../store/cards/cards.actions';
import { CardsFacade } from '../../store/cards/cards.facade';
import { Template, TemplatesActions } from '../../store/templates/templates.actions';
import { TemplatesFacade } from '../../store/templates/templates.facade';
import { buildRenderInput } from './rendering/card-render-input';
import { CardRenderInput } from './rendering/render-input';

const LOAD_FAILED_MESSAGE = 'Die Karte oder ihr Template konnte nicht geladen werden.';

/**
 * Besorgt einer gespeicherten Karte ihren `CardRenderInput`, ohne dass ein Editor offen sein
 * muss — die Kartenliste und später der Druckbogen brauchen genau das (Phase 3).
 */
@Injectable({
  providedIn: 'root',
})
export class CardRenderSource {
  private readonly actions = inject(Actions);
  private readonly cards = inject(CardsFacade);
  private readonly templates = inject(TemplatesFacade);

  async inputForCard(cardId: number): Promise<CardRenderInput> {
    const card = await this.loadCard(cardId);
    const template = await this.loadTemplate(card.templateId);

    return buildRenderInput(card, template);
  }

  private loadCard(cardId: number): Promise<Card> {
    this.cards.loadOne(cardId);

    const success = this.actions.pipe(
      ofType(CardsActions.loadOneSuccess),
      filter(({ card }: { card: Card }) => card.id === cardId),
      map(({ card }: { card: Card }) => card),
      take(1),
    );
    const failure = this.actions.pipe(
      ofType(CardsActions.loadOneFailure),
      map((): Card => {
        throw new Error(LOAD_FAILED_MESSAGE);
      }),
      take(1),
    );

    return firstValueFrom(race(success, failure));
  }

  private loadTemplate(templateId: number): Promise<Template> {
    this.templates.loadOne(templateId);

    const success = this.actions.pipe(
      ofType(TemplatesActions.loadOneSuccess),
      filter(({ template }: { template: Template }) => template.id === templateId),
      map(({ template }: { template: Template }) => template),
      take(1),
    );
    const failure = this.actions.pipe(
      ofType(TemplatesActions.loadOneFailure),
      map((): Template => {
        throw new Error(LOAD_FAILED_MESSAGE);
      }),
      take(1),
    );

    return firstValueFrom(race(success, failure));
  }
}
