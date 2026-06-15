import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  signal,
} from '@angular/core';

import { brandedCoverFor } from '@app/core/content/branded-cover.util';

/**
 * Thumbnail de conteúdo com fallback: usa a imagem real quando há e ela carrega;
 * senão (nula ou erro de carregamento) cai na capa branded determinística.
 * Espelha o tratamento do hero da página de detalhe (referrerpolicy evita
 * hotlink bloqueado; guardamos a URL quebrada para não travar a próxima).
 */
@Component({
  selector: 'app-radar-thumb',
  templateUrl: './radar-thumb.component.html',
  styleUrl: './radar-thumb.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadarThumbComponent {
  readonly imageUrl = input<string | null>(null);
  readonly sourceName = input<string>('');

  // URL que falhou ao carregar; ao mudar de imagem, voltamos a tentar.
  private readonly brokenUrl = signal<string | null>(null);

  readonly src = computed(() => {
    const url = this.imageUrl();

    return url && url !== this.brokenUrl()
      ? url
      : brandedCoverFor(this.sourceName());
  });

  protected onError(): void {
    this.brokenUrl.set(this.imageUrl());
  }
}
