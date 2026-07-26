/**
 * Derive Accent Palette
 * 
 * Generates a full palette of harmonious shades based on a single base HSL color.
 * Example baseHue: { h: 220, s: 80, l: 50 } (A vibrant blue)
 */

export interface HSL {
  h: number; // 0-360
  s: number; // 0-100
  l: number; // 0-100
}

export interface AccentPalette {
  base: string;     // The primary accent color
  light: string;    // Lighter tint for borders/highlights
  glow: string;     // Saturated tint for drop shadows and glowing elements
  muted: string;    // Desaturated for backgrounds
}

export function hslToString({ h, s, l }: HSL): string {
  return `hsl(${h}, ${s}%, ${l}%)`;
}

export function deriveAccentPalette(baseHue: HSL): AccentPalette {
  return {
    base: hslToString(baseHue),
    light: hslToString({ h: baseHue.h, s: Math.max(0, baseHue.s - 20), l: Math.min(100, baseHue.l + 25) }),
    glow: hslToString({ h: baseHue.h, s: Math.min(100, baseHue.s + 10), l: baseHue.l }),
    muted: hslToString({ h: baseHue.h, s: baseHue.s, l: Math.max(0, baseHue.l - 35) }),
  };
}

export const defaultAccent: HSL = { h: 37, s: 94, l: 50 }; // Amber/Orange
