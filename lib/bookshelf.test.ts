import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  CATEGORY_FAMILY,
  PALETTE,
  fallbackTitle,
  spineColors,
  spineGeometry,
  sortEntries,
  parseBookshelf,
  toBooks,
} from './bookshelf.ts';

describe('fallbackTitle', () => {
  it('uses hostname and first path segment, dropping www and the query', () => {
    assert.equal(
      fallbackTitle('https://www.example.com/posts/great-article?x=1'),
      'example.com/posts'
    );
  });
  it('is just the hostname for a root url', () => {
    assert.equal(fallbackTitle('https://example.com/'), 'example.com');
  });
});

describe('spineColors', () => {
  it('maps a known category to its family fill and band', () => {
    assert.deepEqual(spineColors('ai'), { fill: '#2a2742', band: '#3a365a' });
  });
  it('falls back to zinc for an unknown category', () => {
    assert.deepEqual(spineColors('no-such-tag'), {
      fill: '#27272a',
      band: '#3f3f46',
    });
  });
  it('falls back to zinc for a prototype property name', () => {
    assert.deepEqual(spineColors('constructor'), {
      fill: '#27272a',
      band: '#3f3f46',
    });
  });
  it('falls back to zinc for no category', () => {
    assert.deepEqual(spineColors(undefined), {
      fill: '#27272a',
      band: '#3f3f46',
    });
  });
  it('maps every category to a palette family', () => {
    for (const fam of Object.values(CATEGORY_FAMILY)) {
      assert.ok(fam in PALETTE, `${fam} missing from PALETTE`);
    }
  });
});

describe('spineGeometry', () => {
  it('clamps a one-character title to the minimum width plus jitter', () => {
    const g = spineGeometry('https://a.example', 'x');
    assert.ok(g.width >= 30 && g.width <= 34, `width ${g.width}`);
    assert.ok([0, 1, 2].includes(g.heightVariant));
  });
  it('clamps a 140-character title to the maximum width plus jitter', () => {
    const g = spineGeometry('https://b.example', 'x'.repeat(140));
    assert.ok(g.width >= 68 && g.width <= 72, `width ${g.width}`);
  });
  it('keeps heightVariant in 0..2 across many urls', () => {
    for (let i = 0; i < 300; i++) {
      const g = spineGeometry(`https://site${i}.example/post-${i * 7}`, 'title');
      assert.ok([0, 1, 2].includes(g.heightVariant), `url ${i}: ${g.heightVariant}`);
    }
  });
  it('is deterministic for the same inputs', () => {
    assert.deepEqual(
      spineGeometry('https://a.example', 'abc'),
      spineGeometry('https://a.example', 'abc')
    );
  });
});

describe('sortEntries', () => {
  it('sorts newest first, keeps file order on ties, undated last', () => {
    const sorted = sortEntries([
      { url: 'a', added: '2026-01-01' },
      { url: 'b' },
      { url: 'c', added: '2026-03-01' },
      { url: 'd', added: '2026-03-01' },
    ]);
    assert.deepEqual(
      sorted.map((e) => e.url),
      ['c', 'd', 'a', 'b']
    );
  });
});

describe('parseBookshelf', () => {
  const hand = `items:\n  - url: https://x.example/p\n    category: ai\n    added: 2026-10-21\n`;
  const decap = `items:\n  - url: https://x.example/p\n    note: ''\n    category: ai\n    added: '2026-10-21'\n    title: ''\n`;
  it('loads a hand-written file with dates as strings', () => {
    assert.deepEqual(parseBookshelf(hand), [
      { url: 'https://x.example/p', category: 'ai', added: '2026-10-21' },
    ]);
  });
  it('loads a Decap-written file identically', () => {
    assert.deepEqual(parseBookshelf(decap), parseBookshelf(hand));
  });
  it('coerces numeric and boolean scalars to strings', () => {
    const [e] = parseBookshelf(
      'items:\n  - url: https://x.example/p\n    title: 1984\n    note: true\n    author: 42\n'
    );
    assert.deepEqual(e, { url: 'https://x.example/p', title: '1984', note: 'true', author: '42' });
    assert.equal(typeof toBooks([e])[0].width, 'number');
  });
  it('returns an empty list for an empty document', () => {
    assert.deepEqual(parseBookshelf(''), []);
  });
  it('returns an empty list for an empty items list', () => {
    assert.deepEqual(parseBookshelf('items: []'), []);
  });
});

describe('toBooks', () => {
  it('never leans the first book, which has nothing to lean on', () => {
    // This url's hash leans on its own; at index 0 it must not.
    const url = 'https://overreacted.io/a-complete-guide-to-useeffect/';
    assert.equal(spineGeometry(url, 'x').leans, true);
    assert.equal(toBooks([{ url }])[0].leans, false);
  });
  it('derives a display title and colours', () => {
    const books = toBooks([{ url: 'https://x.example/p/q', category: 'rust' }]);
    assert.equal(books[0].displayTitle, 'x.example/p');
    assert.equal(books[0].fill, '#3d3020');
  });
});
