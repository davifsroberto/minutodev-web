import { ChangeDetectionStrategy, Component } from '@angular/core';

type AudienceIcon = 'code' | 'team' | 'layers' | 'trend';

interface AudienceCard {
  readonly title: string;
  readonly description: string;
  readonly icon: AudienceIcon;
}

@Component({
  selector: 'app-landing-audience',
  templateUrl: './landing-audience.component.html',
  styleUrl: './landing-audience.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingAudienceComponent {
  protected readonly cards: readonly AudienceCard[] = [
    {
      title: 'Desenvolvedores',
      description: 'Mantenha-se atualizado sem garimpar dezenas de fontes.',
      icon: 'code',
    },
    {
      title: 'Tech Leads',
      description: 'Acompanhe tendências para guiar as decisões do time.',
      icon: 'team',
    },
    {
      title: 'Arquitetos de Software',
      description: 'Fique por dentro das ferramentas e releases que importam.',
      icon: 'layers',
    },
    {
      title: 'Profissionais de tecnologia',
      description: 'Entenda para onde a área está indo, em minutos.',
      icon: 'trend',
    },
  ];
}
