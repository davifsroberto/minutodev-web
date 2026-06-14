import { brandedCoverFor } from './branded-cover.util';

describe('brandedCoverFor', () => {
  it('gera um data-URI SVG (sem rede)', () => {
    const cover = brandedCoverFor('OpenAI');

    expect(cover.startsWith('data:image/svg+xml,')).toBe(true);
    expect(decodeURIComponent(cover)).toContain('<svg');
  });

  it('embute o nome da fonte na capa', () => {
    expect(decodeURIComponent(brandedCoverFor('Hacker News'))).toContain(
      'Hacker News',
    );
  });

  it('é determinística para a mesma fonte', () => {
    expect(brandedCoverFor('Dev.to')).toBe(brandedCoverFor('Dev.to'));
  });

  it('gera capas diferentes para fontes diferentes', () => {
    expect(brandedCoverFor('OpenAI')).not.toBe(brandedCoverFor('InfoQ'));
  });

  it('escapa caracteres especiais de XML no nome', () => {
    const decoded = decodeURIComponent(brandedCoverFor('A & B <C>'));

    expect(decoded).toContain('A &amp; B &lt;C&gt;');
    expect(decoded).not.toMatch(/aria-label="A & B <C>"/);
  });

  it('usa um rótulo padrão quando o nome é vazio', () => {
    expect(decodeURIComponent(brandedCoverFor('  '))).toContain('minutoDev');
  });
});
