// INTERVOLZ — FIGlet-style block wordmark.
// 6-row tall glyphs rendered with █, plus a ░ drop shadow offset by (1,1).
// Edit GLYPHS below to tweak individual letters; the renderer rebuilds
// the wordmark + shadow at module load.

const GLYPH_HEIGHT = 6;
const LETTER_GAP = 1;

const GLYPHS: Record<string, string[]> = {
  I: [
    '11111',
    '00100',
    '00100',
    '00100',
    '00100',
    '11111',
  ],
  N: [
    '100001',
    '110001',
    '101001',
    '100101',
    '100011',
    '100001',
  ],
  T: [
    '11111',
    '00100',
    '00100',
    '00100',
    '00100',
    '00100',
  ],
  E: [
    '11111',
    '10000',
    '11110',
    '10000',
    '10000',
    '11111',
  ],
  R: [
    '111100',
    '100010',
    '100010',
    '111100',
    '100100',
    '100010',
  ],
  V: [
    '100001',
    '100001',
    '100001',
    '010010',
    '010010',
    '001100',
  ],
  O: [
    '011110',
    '100001',
    '100001',
    '100001',
    '100001',
    '011110',
  ],
  L: [
    '10000',
    '10000',
    '10000',
    '10000',
    '10000',
    '11111',
  ],
  Z: [
    '111111',
    '000010',
    '000100',
    '001000',
    '010000',
    '111111',
  ],
};

function buildLogo(word: string): string {
  const letters = word.split('');
  const widths = letters.map((l) => GLYPHS[l][0].length);
  const totalWidth =
    widths.reduce((a, b) => a + b, 0) + LETTER_GAP * (letters.length - 1);

  const W = totalWidth + 1; // +1 col for shadow
  const H = GLYPH_HEIGHT + 1; // +1 row for shadow
  const grid: string[][] = Array.from({ length: H }, () => Array(W).fill(' '));

  // place block pixels
  let x = 0;
  for (let i = 0; i < letters.length; i++) {
    const glyph = GLYPHS[letters[i]];
    const w = widths[i];
    for (let r = 0; r < GLYPH_HEIGHT; r++) {
      for (let c = 0; c < w; c++) {
        if (glyph[r][c] === '1') grid[r][x + c] = '█';
      }
    }
    x += w + LETTER_GAP;
  }

  // overlay drop shadow at (+1, +1)
  for (let r = H - 1; r >= 0; r--) {
    for (let c = W - 1; c >= 0; c--) {
      if (grid[r][c] === '█') {
        const sr = r + 1;
        const sc = c + 1;
        if (sr < H && sc < W && grid[sr][sc] === ' ') {
          grid[sr][sc] = '░';
        }
      }
    }
  }

  return grid.map((row) => row.join('').replace(/\s+$/, '')).join('\n');
}

export const INTERVOLZ_LOGO = buildLogo('INTERVOLZ');
