export const specialRules = [
  'Island Cup: Wird ein einzelner isolierter Becher getroffen, darf sofort neu geworfen werden.',
  'Redemption: Beim letzten Becher bekommt das verlierende Team noch einen Ball pro Spieler.',
  'Reinigung: Der Werfer muss vor jedem Wurf einen Spruch klopfen.',
  'Elbow-Rule: Der Wurfarm darf die Tischkante nicht überschreiten – sonst zählt der Treffer nicht.',
  'Bounce zählt doppelt: Ein Becher, der nach einem Aufsetzer versenkt wird, entfernt zwei Becher.',
  'Linkshänder-Runde: Alle Würfe müssen mit der ungewohnten Hand erfolgen.',
  'Stille Runde: Die Gegner dürfen beim gegnerischen Wurf nicht reden oder ablenken.',
  'Sudden Death: Ab dem letzten Becher pro Team gewinnt der nächste Treffer sofort das Spiel.',
];

export function randomSpecialRule(): string {
  return specialRules[Math.floor(Math.random() * specialRules.length)];
}
