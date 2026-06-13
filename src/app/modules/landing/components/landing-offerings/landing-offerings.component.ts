import { ChangeDetectionStrategy, Component } from '@angular/core';

type OfferingIcon = 'trend' | 'tool' | 'release' | 'project' | 'content';

interface OfferingCard {
  readonly title: string;
  readonly description: string;
  readonly icon: OfferingIcon;
}

@Component({
  selector: 'app-landing-offerings',
  templateUrl: './landing-offerings.component.html',
  styleUrl: './landing-offerings.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingOfferingsComponent {
  protected readonly cards: readonly OfferingCard[] = [
    {
      title: 'Tendências',
      description: 'Tecnologias e assuntos que estão ganhando relevância.',
      icon: 'trend',
    },
    {
      title: 'Ferramentas',
      description: 'Produtos, bibliotecas e recursos em destaque.',
      icon: 'tool',
    },
    {
      title: 'Releases',
      description: 'Atualizações importantes de frameworks e plataformas.',
      icon: 'release',
    },
    {
      title: 'Projetos em destaque',
      description: 'Repositórios e iniciativas que estão chamando atenção.',
      icon: 'project',
    },
    {
      title: 'Conteúdos recomendados',
      description: 'Artigos, guias e referências que valem seu tempo.',
      icon: 'content',
    },
  ];
}
