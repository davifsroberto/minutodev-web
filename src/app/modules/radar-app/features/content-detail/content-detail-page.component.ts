import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  linkedSignal,
  signal,
  untracked,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { AuthService } from '@app/core/auth/auth.service';
import { brandedCoverFor } from '@app/core/content/branded-cover.util';
import { ContentEnrichment } from '@app/core/content/content-enrichment.model';
import { ContentEnrichmentService } from '@app/core/content/content-enrichment.service';
import { HistoryService } from '@app/core/history/history.service';

/** Velocidade média de leitura para estimar o tempo do briefing. */
const WORDS_PER_MINUTE = 200;

/** Situação de leitura do briefing atual para o botão "Marcar como lido". */
type ReadState = 'unknown' | 'unread' | 'read';

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
  private readonly auth = inject(AuthService);
  private readonly history = inject(HistoryService);

  private readonly params = toSignal(this.route.paramMap);
  readonly id = computed(() => this.params()?.get('id') ?? null);

  readonly enrichment = this.enrichmentService.loadById(this.id);

  // Reinicia ao trocar de conteúdo; o retorno do registro de abertura informa
  // se este briefing já foi lido antes (evita reoferecer "Marcar como lido").
  private readonly readState = linkedSignal<string | null, ReadState>({
    source: this.id,
    computation: () => 'unknown',
  });

  protected readonly markingRead = signal(false);
  protected readonly markReadError = signal(false);

  protected readonly isRead = computed(() => this.readState() === 'read');

  /** Botão só aparece com sessão ativa e briefing ainda não lido. */
  protected readonly canMarkRead = computed(
    () => this.auth.isAuthenticated() && this.readState() === 'unread',
  );

  constructor() {
    // 13B.1 — abrir um briefing autenticado registra no histórico. Anônimo não
    // chama nada (comportamento atual preservado). O registro é best-effort e
    // roda fora do tracking para o effect reagir só a id/sessão.
    effect(() => {
      const contentId = this.id();
      if (!contentId || !this.auth.isAuthenticated()) return;

      untracked(() => void this.registerOpen(contentId));
    });
  }

  private async registerOpen(contentId: string): Promise<void> {
    const entry = await this.history.registerOpen(contentId);
    // Ignora respostas de uma navegação anterior (o usuário trocou de briefing).
    if (entry === null || this.id() !== contentId) return;

    this.readState.set(entry.status === 'READ' ? 'read' : 'unread');
  }

  protected async markAsRead(): Promise<void> {
    const contentId = this.id();
    if (!contentId || this.markingRead()) return;

    this.markingRead.set(true);
    this.markReadError.set(false);

    try {
      await this.history.markAsRead(contentId);
      if (this.id() === contentId) this.readState.set('read');
    } catch {
      this.markReadError.set(true);
    } finally {
      this.markingRead.set(false);
    }
  }

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
    const data = this.data();
    if (data === undefined) return '';

    const url = data.imageUrl;

    return url && url !== this.brokenImageUrl()
      ? url
      : brandedCoverFor(data.sourceName);
  });

  readonly readingTimeMinutes = computed(() => {
    const data = this.data();
    if (data === undefined) return 0;

    const text = [
      data.summary30s,
      data.shortSummary,
      data.whyItMatters,
      data.keyInsight,
      data.example,
      data.whenToUse,
      data.briefContent,
      ...data.keyPoints,
      ...data.audienceFor,
      ...data.audienceIgnore,
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
      !data.summary30s &&
      !data.shortSummary &&
      !data.briefContent &&
      !data.whyItMatters &&
      !data.keyInsight &&
      !data.example &&
      !data.whenToUse &&
      data.keyPoints.length === 0 &&
      data.audienceFor.length === 0 &&
      data.audienceIgnore.length === 0
    );
  });

  protected onImageError(): void {
    this.brokenImageUrl.set(this.data()?.imageUrl ?? null);
  }

  protected retry(): void {
    this.enrichment.reload();
  }
}
