import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/** Rohbau — die Liste mit Suche, Filtern und Sortierung entsteht in Phase 5. */
@Component({
  selector: 'app-cards-list',
  imports: [RouterLink],
  templateUrl: './cards-list.html',
  styleUrl: './cards-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardsList {}
