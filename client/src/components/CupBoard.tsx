import type { Cup, TeamColor } from '../types';
import { teamPalette } from '../lib/teamColors';

interface Props {
  cups: Cup[];
  rows: number[];
  interactive: boolean;
  onCupClick?: (cupId: string) => void;
  teamColor: TeamColor;
}

export function CupBoard({ cups, rows, interactive, onCupClick, teamColor }: Props) {
  const sorted = [...cups].sort((a, b) => a.index - b.index);
  const palette = teamPalette[teamColor];

  let cursor = 0;
  const rowGroups = rows.map((size) => {
    const group = sorted.slice(cursor, cursor + size);
    cursor += size;
    return group;
  });

  return (
    <div className="flex flex-col items-center gap-2 py-4">
      {rowGroups.map((group, ri) => (
        <div key={ri} className="flex gap-2">
          {group.map((cup) => (
            <button
              key={cup.id}
              disabled={!interactive || cup.hit}
              onClick={() => onCupClick?.(cup.id)}
              className={`relative h-9 w-9 sm:h-11 sm:w-11 rounded-full border-2 transition-all ${
                cup.hit
                  ? 'border-white/10 bg-white/5 opacity-30 scale-90'
                  : `${palette.cupRing} ${palette.cupFill} ${palette.glow} ${
                      interactive ? 'hover:scale-110 active:scale-95 cursor-pointer' : ''
                    }`
              }`}
              aria-label="Becher"
            />
          ))}
        </div>
      ))}
      {sorted.every((c) => c.hit) && <p className="text-sm text-purple-200/70">Alle Becher geleert 🎉</p>}
    </div>
  );
}
