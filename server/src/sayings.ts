export const streakSayings: Record<number, string[]> = {
  3: [
    'Der ist warmgelaufen! 🔥',
    '3 in Folge – Hände weg vom Tisch! 🍺',
    'Da brennt der Becher! 🔥',
  ],
  5: [
    'Unaufhaltsam! Jemand hol ein Handtuch für den Tisch! 🧻',
    '5er Serie – der Gegner braucht jetzt ein Gebet 🙏',
  ],
  7: [
    'Legendär! Das schreibt man sich auf den Grabstein! 🪦',
    'Ist das noch Bier Pong oder schon Zauberei? 🪄',
  ],
};

export const missSayings = [
  'Autsch, das war nix. 🙈',
  'Der Becher lebt noch einen Tag länger.',
  'Nächstes Mal vielleicht, Champion.',
  'Da war wohl zu viel Bier im Spiel schon 🍻',
];

export const hitSayings = [
  'Reingelegt! 🎯',
  'Sauber getroffen! 🍺',
  'Der Becher hatte keine Chance.',
  'Boom! Direkt versenkt.',
];

export const reformSayings = [
  'Die Becher rücken zusammen – Gruppenkuscheln! 🤗',
  'Umformation! Neue Taktik, alte Angst.',
];

export const winSayings = [
  'GEWONNEN! Die Legende ist geboren! 🏆🍺',
  'Sieg! Zeit für die Ehrenrunde! 🎉',
  'Unbezwingbar – zumindest heute Abend! 🏆',
];

export function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
