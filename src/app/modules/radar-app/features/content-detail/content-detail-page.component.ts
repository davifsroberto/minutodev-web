import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { ContentEnrichment } from '@app/core/content/content-enrichment.model';
import { ContentEnrichmentService } from '@app/core/content/content-enrichment.service';

/** Imagem padrão do minutoDev quando o conteúdo não tem imagem (ou ela falha). */
const PLACEHOLDER_IMAGE = '/content-placeholder.svg';

/** Velocidade média de leitura para estimar o tempo do briefing. */
const WORDS_PER_MINUTE = 200;

@Component({
  selector: 'app-content-detail-page',
  imports: [RouterLink],
  templateUrl: './content-detail-page.component.html',
  styleUrl: './content-detail-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContentDetailPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly enrichmentService = inject(ContentEnrichmentService);

  private readonly params = toSignal(this.route.paramMap);
  readonly id = computed(() => this.params()?.get('id') ?? null);

  readonly enrichment = this.enrichmentService.loadById(this.id);

  // URL da imagem que falhou ao carregar; força o placeholder sem travar a
  // próxima imagem (ao trocar de conteúdo, a URL muda e voltamos a tentar).
  private readonly brokenImageUrl = signal<string | null>(null);

  readonly data = computed<ContentEnrichment | undefined>(() =>
    this.enrichment.hasValue() ? this.enrichment.value() : undefined,
  );

  readonly loading = computed(() => this.enrichment.isLoading());

  readonly error = computed(
    () => !this.loading() && this.enrichment.status() === 'error',
  );

  readonly title = computed(() => this.data()?.translatedTitle ?? null);

  readonly keyPoints = computed(() => this.data()?.keyPoints ?? []);

  readonly heroImage = computed(() => {
    const url = this.data()?.imageUrl ?? null;

    return url && url !== this.brokenImageUrl() ? url : PLACEHOLDER_IMAGE;
  });

  readonly readingTimeMinutes = computed(() => {
    const data = this.data();
    if (data === undefined) return 0;

    const text = [
      data.shortSummary,
      data.whyItMatters,
      data.example,
      data.whenToUse,
      data.briefContent,
      ...data.keyPoints,
    ]
      .filter((part): part is string => Boolean(part))
      .join(' ')
      .trim();

    if (!text) return 0;

    const words = text.split(/\s+/).filter(Boolean).length;

    return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
  });

  readonly publishedLabel = computed(() => {
    const value = this.data()?.publishedAt ?? null;
    if (!value) return null;

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;

    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  });

  readonly isEmpty = computed(() => {
    const data = this.data();

    if (data === undefined) return false;

    return (
      !data.shortSummary &&
      !data.briefContent &&
      !data.whyItMatters &&
      !data.example &&
      !data.whenToUse &&
      data.keyPoints.length === 0
    );
  });

  protected onImageError(): void {
    this.brokenImageUrl.set(this.data()?.imageUrl ?? null);
  }

  protected retry(): void {
    this.enrichment.reload();
  }
}
