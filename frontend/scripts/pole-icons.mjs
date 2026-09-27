// Ícones de polo preenchidos, lidos direto de src/data/filledPoleIcons.ts (a
// mesma fonte do PoleIcon da home/resultado), para as páginas estáticas não
// manterem uma cópia própria.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const source = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../src/data/filledPoleIcons.ts'), 'utf8');
const literal = source.slice(source.indexOf('= {', source.indexOf('FILLED_POLE_ICONS')) + 2, source.lastIndexOf('};') + 1);
const FILLED = new Function(`return (${literal});`)();

const symbolId = (axisId, side) => `pi-${axisId}-${side === 'left' ? 'l' : 'r'}`;

// Sprite com os 24 ícones, inserido uma vez por página; cada uso é um <use>.
export function poleSprite(axes) {
  const symbols = axes
    .flatMap((axis) => ['left', 'right'].map((side) => {
      const icon = FILLED[axis.id]?.[side];
      if (!icon) throw new Error(`pole-icons: ícone ausente para ${axis.id}/${side}`);
      const rule = icon.fillRule ?? 'evenodd';
      const paths = icon.paths.map((d) => `<path d="${d}" fill-rule="${rule}" clip-rule="${rule}"/>`).join('');
      return `<symbol id="${symbolId(axis.id, side)}" viewBox="${icon.viewBox}">${paths}</symbol>`;
    }))
    .join('');
  return `<svg width="0" height="0" style="position:absolute" aria-hidden="true">${symbols}</svg>`;
}

export function poleUse(axisId, side, attrs = '') {
  return `<svg${attrs}><use href="#${symbolId(axisId, side)}"/></svg>`;
}
