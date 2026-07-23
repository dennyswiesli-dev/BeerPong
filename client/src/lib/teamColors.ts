import type { TeamColor } from '../types';

export const teamPalette: Record<
  TeamColor,
  {
    label: string;
    text: string;
    panelBg: string;
    cupRing: string;
    cupFill: string;
    accentBg: string;
    accentText: string;
    glow: string;
  }
> = {
  blue: {
    label: 'Blau',
    text: 'text-sky-300',
    panelBg: 'bg-gradient-to-b from-[#0b1d4d] to-[#0a1638]',
    cupRing: 'border-sky-400',
    cupFill: 'bg-sky-500/20',
    accentBg: 'bg-sky-500',
    accentText: 'text-sky-950',
    glow: 'shadow-[0_0_18px_rgba(56,189,248,0.55)]',
  },
  red: {
    label: 'Rot',
    text: 'text-red-300',
    panelBg: 'bg-gradient-to-b from-[#4d0b16] to-[#380a10]',
    cupRing: 'border-red-400',
    cupFill: 'bg-red-500/20',
    accentBg: 'bg-red-500',
    accentText: 'text-red-950',
    glow: 'shadow-[0_0_18px_rgba(248,113,113,0.55)]',
  },
};
