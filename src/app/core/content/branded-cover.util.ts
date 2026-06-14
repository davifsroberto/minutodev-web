/**
 * Gera uma capa 16:9 determinística (data-URI SVG) a partir do nome da fonte,
 * para quando o conteúdo não tem imagem real. Sem rede e sem URL externa: a cor
 * deriva de um hash do nome, então cada fonte fica visualmente distinta e
 * estável entre renderizações.
 */
export function brandedCoverFor(sourceName: string): string {
  const name = (sourceName || 'minutoDev').trim() || 'minutoDev';
  const hue = hueFromString(name);
  const c1 = `hsl(${hue}, 58%, 16%)`;
  const c2 = `hsl(${(hue + 38) % 360}, 62%, 32%)`;
  const accent = `hsl(${(hue + 18) % 360}, 70%, 70%)`;
  const label = escapeXml(name);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" role="img" aria-label="${label}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${c1}"/>
      <stop offset="1" stop-color="${c2}"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="675" fill="url(#g)"/>
  <rect x="80" y="300" width="64" height="6" rx="3" fill="${accent}"/>
  <text x="80" y="372" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" font-size="64" font-weight="700" fill="#f2f3f7">${label}</text>
  <text x="80" y="430" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" font-size="26" fill="rgba(242,243,247,0.62)" letter-spacing="4">minutoDev</text>
</svg>`;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function hueFromString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }

  return Math.abs(hash) % 360;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
