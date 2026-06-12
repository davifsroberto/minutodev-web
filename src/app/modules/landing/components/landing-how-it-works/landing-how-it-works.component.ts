import { ChangeDetectionStrategy, Component } from '@angular/core';

interface HowItWorksStep {
  readonly step: number;
  readonly title: string;
  readonly description: string;
}

@Component({
  selector: 'app-landing-how-it-works',
  templateUrl: './landing-how-it-works.component.html',
  styleUrl: './landing-how-it-works.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingHowItWorksComponent {
  protected readonly steps: readonly HowItWorksStep[] = [
    {
      step: 1,
      title: 'Coletamos os sinais',
      description:
        'Agregamos automaticamente conteúdos de fontes públicas confiáveis.',
    },
    {
      step: 2,
      title: 'Organizamos o essencial',
      description:
        'Tendências, ferramentas, releases e conteúdos recomendados em um único radar.',
    },
    {
      step: 3,
      title: 'Você se atualiza em minutos',
      description: 'Abra a página, leia o que importa e volte ao trabalho.',
    },
  ];
}
