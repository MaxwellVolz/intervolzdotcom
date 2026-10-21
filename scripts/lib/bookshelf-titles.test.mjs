import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  cleanTitle,
  extractTitle,
  fetchTitle,
  fillTitles,
} from './bookshelf-titles.mjs';

describe('cleanTitle', () => {
  it('collapses whitespace and strips a " | Site" suffix matching the host', () => {
    assert.equal(
      cleanTitle('  A  Great\n Post | Example ', 'https://www.example.com/p'),
      'A Great Post'
    );
  });
  it('strips a " - Site" suffix matching the host', () => {
    assert.equal(cleanTitle('A Great Post - Example', 'https://example.com/p'), 'A Great Post');
  });
  it('strips a " · Site" suffix matching the host', () => {
    assert.equal(cleanTitle('A Great Post · Example', 'https://example.com/p'), 'A Great Post');
  });
  it('decodes html entities', () => {
    assert.equal(
      cleanTitle('Rust &amp; Go &#39;quoted&#39;', 'https://x.example'),
      "Rust & Go 'quoted'"
    );
  });
  it('keeps a suffix that does not match the host', () => {
    assert.equal(cleanTitle('A - B', 'https://other.example'), 'A - B');
  });
  it('never strips a title down to nothing', () => {
    assert.equal(cleanTitle('Example', 'https://example.com'), 'Example');
  });
});

describe('extractTitle', () => {
  it('prefers og:title over <title>', () => {
    assert.equal(
      extractTitle(
        '<html><head><meta property="og:title" content="OG Title"><title>Doc Title</title></head></html>',
        'https://x.example'
      ),
      'OG Title'
    );
  });
  it('falls back to <title>', () => {
    assert.equal(extractTitle('<title>Doc Title</title>', 'https://x.example'), 'Doc Title');
  });
  it('accepts content before property in the meta tag', () => {
    assert.equal(
      extractTitle('<meta content="OG Title" property="og:title">', 'https://x.example'),
      'OG Title'
    );
  });
  it('returns empty for a page with no title', () => {
    assert.equal(extractTitle('<html></html>', 'https://x.example'), '');
  });
  it('returns empty for empty html', () => {
    assert.equal(extractTitle('', 'https://x.example'), '');
  });
});

describe('fetchTitle', () => {
  it('returns empty when fetch throws', async () => {
    assert.equal(
      await fetchTitle('https://x.example', {
        fetchImpl: async () => {
          throw new Error('boom');
        },
      }),
      ''
    );
  });
  it('returns empty on a non-ok status', async () => {
    assert.equal(
      await fetchTitle('https://x.example', {
        fetchImpl: async () => new Response('nope', { status: 403 }),
      }),
      ''
    );
  });
  it('returns the cleaned title on success', async () => {
    assert.equal(
      await fetchTitle('https://x.example', {
        fetchImpl: async () => new Response('<title>Hi</title>', { status: 200 }),
      }),
      'Hi'
    );
  });
});

describe('fillTitles', () => {
  it('fills only missing titles and reports counts', async () => {
    const out = await fillTitles(
      [
        { url: 'https://a.example', title: 'Keep' },
        { url: 'https://b.example' },
        { url: 'https://c.example' },
      ],
      {
        fetchImpl: async (u) =>
          new Response(u.includes('b.') ? '<title>B</title>' : 'x', {
            status: u.includes('c.') ? 500 : 200,
          }),
      }
    );
    assert.deepEqual(
      out.items.map((i) => i.title),
      ['Keep', 'B', undefined]
    );
    assert.equal(out.filled, 1);
    assert.equal(out.failed, 1);
  });
});
