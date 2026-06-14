import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
} from '@angular/core';

import { ContentEnrichmentService } from '@app/core/content/content-enrichment.service';
import { RadarBriefing } from '@app/core/radar/radar.model';
import { RadarService } from '@app/core/radar/radar.service';
import { CLOCK } from '@app/core/time/clock';
import { LocalDateUtil } from '@app/core/time/local-date.util';
import {
  RadarTodayItem,
  RadarTodaySection,
  toRadarTodaySections,
} from '../../models/radar-today.model';
import { RadarHighlightCardComponent } from './components/radar-highlight-card/radar-highlight-card.component';
import { RadarTodaySectionComponent } from './components/radar-today-section/radar-today-section.component';

@Component({
  selector: 'app-radar-today-page',
  imports: [RadarTodaySectionComponent, RadarHighlightCardComponent],
  templateUrl: './radar-today-page.component.html',
  styleUrl: './radar-today-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadarTodayPageComponent {
  private readonly radar = inject(RadarService);
  private readonly now = inject(CLOCK);
  private readonly enrichments = inject(ContentEnrichmentService);

  constructor() {
    // Aquece o enrichment do destaque: gera a tradução pt-BR sob demanda (1
    // chamada por destaque, cacheada) para que o topo apareça em pt-BR na
    // próxima carga do radar.
    effect(() => {
      const highlight = this.highlight();
      if (highlight) this.enrichments.warm(highlight.id);
    });
  }

  protected readonly skeletonCards = [0, 1, 2, 3, 4, 5];

  readonly briefing = computed<RadarBriefing | undefined>(() =>
    this.radar.today.hasValue() ? this.radar.today.value() : undefined,
  );

  readonly sections = computed<RadarTodaySection[]>(() => {
    const briefing = this.briefing();
    return briefing ? toRadarTodaySections(briefing) : [];
  });

  /**
   * Destaque do dia: maior score ou, sem score (caso atual), o primeiro item da
   * primeira seção em ordem de exibição. Renderizado fora das listas.
   */
  readonly highlight = computed<RadarTodayItem | null>(
    () => this.sections()[0]?.items[0] ?? null,
  );

  /** Seções sem o item em destaque, para não duplicá-lo na grade. */
  readonly displaySections = computed<RadarTodaySection[]>(() => {
    const highlightId = this.highlight()?.id;
    if (!highlightId) return this.sections();

    return this.sections()
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => item.id !== highlightId),
      }))
      .filter((section) => section.items.length > 0);
  });

  readonly totalCount = computed(() =>
    this.sections().reduce((total, section) => total + section.items.length, 0),
  );

  readonly formattedDate = computed(() => {
    const briefing = this.briefing();
    return briefing ? LocalDateUtil.toDisplayDate(briefing.date) : '';
  });

  readonly isFallback = computed(() => {
    const briefing = this.briefing();
    return (
      briefing !== undefined &&
      briefing.date !== LocalDateUtil.toLocalDateParam(this.now())
    );
  });

  readonly eyebrow = computed(() =>
    this.isFallback() ? 'Último briefing disponível' : 'Radar de Hoje',
  );

  readonly loading = computed(() => this.radar.today.isLoading());

  readonly error = computed(
    () => !this.loading() && this.radar.today.status() === 'error',
  );

  readonly empty = computed(
    () =>
      !this.loading() &&
      !this.error() &&
      this.briefing() !== undefined &&
      !this.sections().length,
  );

  readonly resolved = computed(() => !!this.sections().length);

  protected retry(): void {
    this.radar.today.reload();
  }
}
