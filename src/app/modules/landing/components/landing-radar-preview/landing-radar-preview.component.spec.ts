import { TestBed } from '@angular/core/testing';

import { RadarItem } from '../../models/radar-item.model';
import { LandingRadarPreviewComponent } from './landing-radar-preview.component';

describe('LandingRadarPreviewComponent', () => {
  const items: RadarItem[] = [
    {
      category: 'trend',
      categoryLabel: 'Tendência',
      title: 'Signals chegam ao Angular',
      description: 'O novo modelo de reatividade muda como gerenciamos estado.',
      source: 'angular.dev',
      url: 'https://angular.dev',
    },
    {
      category: 'tool',
      categoryLabel: 'Ferramenta',
      title: 'Bun 1.2 acelera testes',
      description: 'O runtime promete builds e testes mais rápidos.',
      source: 'bun.sh',
      url: 'https://bun.sh',
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingRadarPreviewComponent],
    }).compileComponents();
  });

  it('renders the section heading', async () => {
    const fixture = TestBed.createComponent(LandingRadarPreviewComponent);
    fixture.componentRef.setInput('items', items);
    await fixture.whenStable();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('#radar-title')?.textContent).toContain(
      'O Radar de Hoje',
    );
  });

  it('renders each item title', async () => {
    const fixture = TestBed.createComponent(LandingRadarPreviewComponent);
    fixture.componentRef.setInput('items', items);
    await fixture.whenStable();

    const el = fixture.nativeElement as HTMLElement;
    const titles = Array.from(el.querySelectorAll('.radar-item__title')).map(
      (node) => node.textContent?.trim(),
    );
    expect(titles).toEqual([
      'Signals chegam ao Angular',
      'Bun 1.2 acelera testes',
    ]);
  });

  it('shows the default estimated minutes', async () => {
    const fixture = TestBed.createComponent(LandingRadarPreviewComponent);
    fixture.componentRef.setInput('items', items);
    await fixture.whenStable();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.badge--neutral')?.textContent).toContain(
      'Tempo estimado: 8 minutos',
    );
  });

  it('applies the success badge to trend items only', async () => {
    const fixture = TestBed.createComponent(LandingRadarPreviewComponent);
    fixture.componentRef.setInput('items', items);
    await fixture.whenStable();

    const el = fixture.nativeElement as HTMLElement;
    const itemBadges = el.querySelectorAll('.radar-item .badge');
    expect(itemBadges[0].classList).toContain('badge--success');
    expect(itemBadges[1].classList).toContain('badge--neutral');
  });
});
