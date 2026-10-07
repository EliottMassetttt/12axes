import { useState, type CSSProperties } from 'react';
import { t } from '../../i18n';
import { resolveIdeologyColor } from '../../utils/ideologyColors';
import type { Axis } from '../../types/quiz';
import { socialLevel, type CompassPosition } from '../../utils/politicalCompass';
import { InfoButton, InfoSheet } from './InfoSheet';

// Cantos pastel da grade (rosa, azul, verde, amarelo), interpolados célula a célula; o centro fica quase branco.
const CORNERS = {
  topLeft: [231, 191, 196],
  topRight: [192, 209, 236],
  bottomLeft: [190, 227, 203],
  bottomRight: [245, 237, 196]
} as const;
// Cores dos polos do eixo `moral` (rosa e marrom em axes.json); estas são só o plano B se o eixo faltar.
const FALLBACK_PROGRESSIVE = '#D23E84';
const FALLBACK_TRADITIONAL = '#74502C';
const WHITE = [255, 255, 255] as const;
// Meio da barra: moderados ficam num cinza neutro, entre o rosa e o marrom.
const NEUTRAL = [123, 127, 134] as const;
const SIZE = 9;
const CENTER = '#F6F7F3';

function mix(a: readonly number[], b: readonly number[], amount: number): number[] {
  return a.map((value, index) => value + (b[index] - value) * amount);
}

/** Rosa → cinza → marrom: `amount` 0 é a ponta progressista, 0,5 o cinza e 1 a ponta tradicionalista. */
function threeStop(start: readonly number[], middle: readonly number[], end: readonly number[], amount: number): number[] {
  return amount < 0.5 ? mix(start, middle, amount * 2) : mix(middle, end, (amount - 0.5) * 2);
}

function hexToRgb(hex: string): number[] {
  const value = hex.replace('#', '');
  const full = value.length === 3 ? value.replace(/./g, '$&$&') : value;
  return [0, 2, 4].map((offset) => parseInt(full.slice(offset, offset + 2), 16));
}

function rgb(color: number[]): string {
  return `rgb(${color.map((value) => Math.round(value)).join(',')})`;
}

const GRID_CELLS: string[] = Array.from({ length: SIZE * SIZE }, (_, index) => {
  const column = index % SIZE;
  const row = Math.floor(index / SIZE);
  if (column === (SIZE - 1) / 2 && row === (SIZE - 1) / 2) return CENTER;
  const u = column / (SIZE - 1);
  const v = row / (SIZE - 1);
  const top = mix(CORNERS.topLeft, CORNERS.topRight, u);
  const bottom = mix(CORNERS.bottomLeft, CORNERS.bottomRight, u);
  return rgb(mix(top, bottom, v));
});

// Mantém o marcador inteiro dentro da grade mesmo nos extremos.
const clamp = (value: number): number => Math.max(4, Math.min(96, value));

function Marker({ left, top, color }: { left: number; top?: number; color?: string }) {
  const style: CSSProperties = { left: `${clamp(left)}%`, top: top === undefined ? '50%' : `${clamp(top)}%` };
  if (color) style.background = color;
  return (
    <span className="e-compass-x" style={style} aria-hidden="true">
      <svg viewBox="0 0 24 24">
        <path d="M6 6l12 12M18 6 6 18" />
      </svg>
    </span>
  );
}

interface PoliticalCompassSectionProps {
  position: CompassPosition;
  /** Categoria da ideologia mais compatível (o "espectro"): dá a palavra e a cor da frase. */
  category: string;
  /** Eixo `moral` (Progressista × Tradicionalista): suas cores nas pontas pintam a barra, o "X" e o grifo. */
  moralAxis?: Axis;
}

export function PoliticalCompassSection({ position, category, moralAxis }: PoliticalCompassSectionProps) {
  const { right, authoritarian, traditional } = position;
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const spectrum = resolveIdeologyColor(category);
  const social = socialLevel(traditional);
  const progressive = hexToRgb(moralAxis?.leftColor ?? FALLBACK_PROGRESSIVE);
  const traditionalist = hexToRgb(moralAxis?.rightColor ?? FALLBACK_TRADITIONAL);
  // Barra em tom pastel (rosa, cinza, marrom); "X" e grifo na cor cheia da mesma escala.
  const stripCells = Array.from({ length: SIZE }, (_, index) =>
    rgb(
      threeStop(
        mix(progressive, WHITE, 0.72),
        mix(NEUTRAL, WHITE, 0.72),
        mix(traditionalist, WHITE, 0.72),
        index / (SIZE - 1)
      )
    )
  );
  const socialColor = rgb(threeStop(progressive, NEUTRAL, traditionalist, traditional / 100));

  return (
    <section className="e-panel e-compass" id="bussola" data-reveal>
      <InfoButton className="e-axis-info e-card-info" label={t.compassInfo.aria} onClick={() => setIsInfoOpen(true)} />
      <h2>{t.compassTitle}</h2>

      <div className="e-compass-body">
        <div
          className="e-compass-chart"
          role="img"
          aria-label={t.compassAria(Math.round(right), Math.round(authoritarian), Math.round(traditional))}
        >
          <span className="e-compass-lbl is-top">{t.compassAuthoritarian}</span>
          <span className="e-compass-lbl is-left">{t.compassLeft}</span>
          <div className="e-compass-grid">
            {GRID_CELLS.map((color, index) => (
              <span key={index} style={{ background: color }} />
            ))}
            <i className="e-compass-axis is-x" aria-hidden="true" />
            <i className="e-compass-axis is-y" aria-hidden="true" />
            <Marker left={right} top={100 - authoritarian} />
          </div>
          <span className="e-compass-lbl is-right">{t.compassRight}</span>
          <span className="e-compass-lbl is-bottom">{t.compassLibertarian}</span>
        </div>

        <div className="e-compass-read">
          <p className="e-compass-sentence">
            <span className="e-compass-spectrum" style={{ color: spectrum.base }}>
              {t.compassSpectrumLabels[spectrum.key]}
            </span>{' '}
            <span className="e-compass-conn">{t.compassWith}</span>{' '}
            <mark className="e-compass-mark" style={{ background: socialColor }}>
              {t.compassSocialLabels[social]}
            </mark>
            {t.compassSocialValues && (
              <>
                {' '}
                <span className="e-compass-conn">{t.compassSocialValues}</span>
              </>
            )}
          </p>

          <div className="e-compass-bar" aria-hidden="true">
            <div className="e-compass-bar-lbls">
              <span>{t.compassProgressive}</span>
              <span>{t.compassTraditionalist}</span>
            </div>
            <div className="e-compass-strip">
              {stripCells.map((color, index) => (
                <span key={index} style={{ background: color }} />
              ))}
              <Marker left={traditional} color={socialColor} />
            </div>
          </div>
        </div>
      </div>

      {isInfoOpen && (
        <InfoSheet titleId="compass-info-title" onClose={() => setIsInfoOpen(false)}>
          <p className="e-axis-sheet-label">{t.compassTitle}</p>
          <h3 id="compass-info-title">{t.compassInfo.title}</h3>
          <p className="e-axis-sheet-text">{t.compassInfo.intro}</p>
          <ul className="e-compass-how">
            <li>
              <strong>{t.compassInfo.horizontalTitle}</strong>
              <span>{t.compassInfo.horizontal}</span>
            </li>
            <li>
              <strong>{t.compassInfo.verticalTitle}</strong>
              <span>{t.compassInfo.vertical}</span>
            </li>
            <li>
              <strong>{t.compassInfo.barTitle}</strong>
              <span>{t.compassInfo.bar}</span>
            </li>
            <li>
              <strong>{t.compassInfo.ignoredTitle}</strong>
              <span>{t.compassInfo.ignored}</span>
            </li>
          </ul>
          <p className="e-compass-note">{t.compassInfo.note}</p>
        </InfoSheet>
      )}
    </section>
  );
}
