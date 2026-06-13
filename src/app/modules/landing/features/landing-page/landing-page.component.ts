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
