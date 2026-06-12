import { ChangeDetectionStrategy, Component } from '@angular/core';

interface AudienceCard {
  readonly title: string;
  readonly description: string;
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
    },
    {
      title: 'Tech Leads',
      description: 'Acompanhe tendências para guiar as decisões do time.',
    },
    {
      title: 'Arquitetos de Software',
      description: 'Fique por dentro das ferramentas e releases que importam.',
    },
    {
      title: 'Profissionais de tecnologia',
      description: 'Entenda para onde a área está indo, em minutos.',
    },
  ];
}
