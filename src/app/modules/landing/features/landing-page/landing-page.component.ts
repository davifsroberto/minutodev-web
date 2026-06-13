import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { BackToTopComponent } from '../../components/back-to-top/back-to-top.component';
import { LandingAudienceComponent } from '../../components/landing-audience/landing-audience.component';
import { LandingFinalCtaComponent } from '../../components/landing-final-cta/landing-final-cta.component';
import { LandingFooterComponent } from '../../components/landing-footer/landing-footer.component';
import { LandingHeaderComponent } from '../../components/landing-header/landing-header.component';
import { LandingHeroComponent } from '../../components/landing-hero/landing-hero.component';
import { LandingHowItWorksComponent } from '../../components/landing-how-it-works/landing-how-it-works.component';
import { LandingOfferingsComponent } from '../../components/landing-offerings/landing-offerings.component';
import { LandingProblemComponent } from '../../components/landing-problem/landing-problem.component';
import { LandingRadarPreviewComponent } from '../../components/landing-radar-preview/landing-radar-preview.component';
import { WaitlistFormComponent } from '../../components/waitlist-form/waitlist-form.component';
import { RadarItem } from '../../models/radar-item.model';
import { WaitlistStatus } from '../../models/waitlist.model';
import { WaitlistService } from '../../services/waitlist.service';

@Component({
  selector: 'app-landing-page',
  imports: [
    LandingHeaderComponent,
    LandingHeroComponent,
    LandingProblemComponent,
    LandingHowItWorksComponent,
    LandingOfferingsComponent,
    LandingRadarPreviewComponent,
    LandingAudienceComponent,
    LandingFinalCtaComponent,
    WaitlistFormComponent,
    LandingFooterComponent,
    BackToTopComponent,
  ],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingPageComponent {
  private readonly waitlist = inject(WaitlistService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly waitlistStatus = signal<WaitlistStatus>('idle');

  protected readonly radarItems: RadarItem[] = [
    {
      category: 'trend',
      categoryLabel: 'Tendência do dia',
      title: 'Signals consolidam-se como padrão de reatividade',
      description:
        'Frameworks convergem para signals como modelo padrão de estado reativo no front-end.',
      source: 'Blogs de engenharia',
      url: 'https://minutodev.com.br',
    },
    {
      category: 'tool',
      categoryLabel: 'Ferramenta em destaque',
      title: 'Um bundler nativo ganha tração na comunidade',
      description:
        'Builds mais rápidos e configuração mínima atraem times que buscam produtividade.',
      source: 'GitHub Trending',
      url: 'https://minutodev.com.br',
    },
    {
      category: 'release',
      categoryLabel: 'Release relevante',
      title: 'Runtime popular lança versão LTS',
      description:
        'Melhorias de performance e novas APIs estáveis para produção.',
      source: 'Release notes',
      url: 'https://minutodev.com.br',
    },
    {
      category: 'content',
      categoryLabel: 'Conteúdo recomendado',
      title: 'Guia prático de testes em aplicações modernas',
      description:
        'Um passo a passo direto para elevar a confiabilidade sem desacelerar o time.',
      source: 'Newsletter da comunidade',
      url: 'https://minutodev.com.br',
    },
  ];

  protected readonly estimatedMinutes = 8;

  protected onJoin(email: string): void {
    this.waitlistStatus.set('loading');

    this.waitlist
      .join({ email })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.waitlistStatus.set('success'),
        error: () => this.waitlistStatus.set('error'),
      });
  }
}
