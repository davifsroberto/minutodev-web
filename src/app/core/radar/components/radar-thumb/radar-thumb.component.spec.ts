import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RadarThumbComponent } from './radar-thumb.component';

function createComponent(
  imageUrl: string | null,
  sourceName = 'Example Source',
): ComponentFixture<RadarThumbComponent> {
  const fixture = TestBed.createComponent(RadarThumbComponent);
  fixture.componentRef.setInput('imageUrl', imageUrl);
  fixture.componentRef.setInput('sourceName', sourceName);
  fixture.detectChanges();
  return fixture;
}

const imageOf = (
  fixture: ComponentFixture<RadarThumbComponent>,
): HTMLImageElement =>
  (fixture.nativeElement as HTMLElement).querySelector(
    'img.radar-thumb',
  ) as HTMLImageElement;

describe('RadarThumbComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RadarThumbComponent],
    }).compileComponents();
  });

  it('uses the real image URL when one is provided', () => {
    const fixture = createComponent('https://cdn.test/cover.png');

    expect(imageOf(fixture).getAttribute('src')).toBe(
      'https://cdn.test/cover.png',
    );
  });

  it('falls back to the branded cover when imageUrl is null', () => {
    const fixture = createComponent(null);

    expect(imageOf(fixture).getAttribute('src')).toContain(
      'data:image/svg+xml',
    );
  });

  it('falls back to the branded cover when the real image fails to load', () => {
    const fixture = createComponent('https://cdn.test/broken.png');
    const image = imageOf(fixture);

    image.dispatchEvent(new Event('error'));
    fixture.detectChanges();

    expect(imageOf(fixture).getAttribute('src')).toContain(
      'data:image/svg+xml',
    );
  });

  it('renders a decorative, no-referrer, lazy image', () => {
    const image = imageOf(createComponent('https://cdn.test/cover.png'));

    expect(image.getAttribute('alt')).toBe('');
    expect(image.getAttribute('loading')).toBe('lazy');
    expect(image.getAttribute('referrerpolicy')).toBe('no-referrer');
  });
});
