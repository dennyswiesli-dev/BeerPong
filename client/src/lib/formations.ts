export function triangleRows(total: number): number[] {
  if (total <= 0) return [];
  // Largest full triangle base k (rows k, k-1, ..., 1) that fits within `total`,
  // with any leftover cups added to the back row so the shape always tapers
  // down to a single point instead of bulging in the middle.
  let k = 1;
  while (((k + 1) * (k + 2)) / 2 <= total) k += 1;
  const leftover = total - (k * (k + 1)) / 2;
  const rows: number[] = [];
  for (let row = k; row >= 1; row -= 1) rows.push(row);
  rows[0] += leftover;
  return rows;
}

function lineRows(total: number): number[] {
  return [total];
}

function clusterRows(total: number): number[] {
  const a = Math.ceil(total / 2);
  const b = Math.floor(total / 2);
  return b > 0 ? [a, b] : [a];
}

export interface FormationOption {
  label: string;
  rows: number[];
}

function sameShape(a: number[], b: number[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

export function formationOptions(remaining: number): FormationOption[] {
  const candidates: FormationOption[] = [
    { label: 'Dreieck', rows: triangleRows(remaining) },
    { label: 'Reihe', rows: lineRows(remaining) },
  ];
  if (remaining >= 4) candidates.push({ label: 'Raute', rows: clusterRows(remaining) });

  const seen: number[][] = [];
  return candidates.filter((c) => {
    if (seen.some((s) => sameShape(s, c.rows))) return false;
    seen.push(c.rows);
    return true;
  });
}
