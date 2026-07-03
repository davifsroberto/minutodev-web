import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { HistoryItem } from '@app/core/history/history.model';
import { HistoryService } from '@app/core/history/history.service';
import { RadarThumbComponent } from '@app/core/radar/components/radar-thumb/radar-thumb.component';

@Component({
  selector: 'app-history-page',
  imports: [RouterLink, RadarThumbComponent],
  templateUrl: './history-page.component.html',
  styleUrl: './history-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistoryPageComponent {
  private readonly historyService = inject(HistoryService);

  protected readonly history = this.historyService.list();

  protected readonly skeleton = [0, 1, 2, 3, 4];

  protected readonly items = computed<HistoryItem[]>(() =>
    this.history.hasValue() ? this.history.value().data : [],
  );

  protected readonly loading = computed(() => this.history.isLoading());

  protected readonly loadError = computed(
    () => !this.loading() && this.history.status() === 'error',
  );

  protected readonly isEmpty = computed(
    () => !this.loading() && !this.loadError() && this.items().length === 0,
  );

  protected retry(): void {
    this.history.reload();
  }

  protected openedLabel(item: HistoryItem): string | null {
    const date = new Date(item.lastOpenedAt);
    if (Number.isNaN(date.getTime())) return null;

    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }
}
