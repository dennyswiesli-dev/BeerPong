import type { Cup } from '../types';

function triangleRows(total: number): number[] {
  if (total === 10) return [4, 3, 2, 1];
  if (total === 6) return [3, 2, 1];
  // fallback: greedy triangular rows
  const rows: number[] = [];
  let remaining = total;
  let r = 1;
  while (remaining > 0) {
    const size = Math.min(r, remaining);
    rows.push(size);
    remaining -= size;
    r += 1;
  }
  return rows.reverse();
}

interface Props {
  cups: Cup[];
  interactive: boolean;
  onCupClick?: (cupId: string) => void;
  teamColor: 'red' | 'yellow';
}

export function CupBoard({ cups, interactive, onCupClick, teamColor }: Props) {
  const active = [...cups].filter((c) => !c.hit).sort((a, b) => a.index - b.index);
  const rows = triangleRows(active.length);

  let cursor = 0;
  const rowGroups = rows.map((size) => {
    const group = active.slice(cursor, cursor + size);
    cursor += size;
    return group;
  });

  const cupColor =
    teamColor === 'red'
      ? 'bg-gradient-to-b from-red-400 to-red-600 shadow-red-900/60'
      : 'bg-gradient-to-b from-yellow-300 to-amber-500 shadow-amber-900/60';

  return (
    <div className="flex flex-col items-center gap-2 py-4">
      {rowGroups.map((group, ri) => (
        <div key={ri} className="flex gap-2">
          {group.map((cup) => (
            <button
              key={cup.id}
              disabled={!interactive}
              onClick={() => onCupClick?.(cup.id)}
              className={`relative h-9 w-9 sm:h-11 sm:w-11 rounded-b-xl rounded-t-md shadow-lg transition-transform ${cupColor} ${
                interactive ? 'hover:scale-110 active:scale-95 cursor-pointer ring-2 ring-white/0 hover:ring-white/60' : 'opacity-90'
              }`}
              aria-label="Becher"
            >
              <span className="absolute inset-x-1 top-1 h-1.5 rounded-full bg-white/40" />
            </button>
          ))}
        </div>
      ))}
      {active.length === 0 && <p className="text-sm text-purple-200/70">Alle Becher geleert 🎉</p>}
    </div>
  );
}
