import { useRef, useState, type CSSProperties, type FocusEvent, type MouseEvent } from 'react';
import type { Book } from '@/lib/bookshelf.ts';
import { trackProductClick } from '@/lib/analytics';

type Props = {
  books: Book[];
  /** Render only the first N books (the homepage shows 12). */
  limit?: number;
  /** The plain list under the shelves. The accessible surface; on by default. */
  showList?: boolean;
};

type Tip = { book: Book; left: number; top: number };

const CARD_WIDTH = 320; // keep in sync with the tooltip's max width below

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function fmtDateFull(iso?: string) {
  if (!iso) return '';
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  if (!y || !m || !d) return iso;
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}

function fmtDateShort(iso?: string) {
  return iso ? iso.slice(5, 10) : '';
}

function ariaLabel(book: Book) {
  return book.author ? `${book.displayTitle} by ${book.author}` : book.displayTitle;
}

// Spines on planks, then the same books as a list. The shelves are the
// picture; the list is the data. The planks are a repeating background on the
// <ul>, sized to one row, so any number of wrapped rows gets a plank without
// knowing in JS where a row ends. That is also why books lean by hash rather
// than "last on each shelf": CSS cannot see the row break either.
export default function Bookshelf({ books, limit, showList = true }: Props) {
  const shown = limit ? books.slice(0, limit) : books;
  const ulRef = useRef<HTMLUListElement>(null);
  const [tip, setTip] = useState<Tip | null>(null);

  if (shown.length === 0) return null;

  const show = (book: Book, el: HTMLElement) => {
    const ul = ulRef.current;
    if (!ul) return;
    const a = el.getBoundingClientRect();
    const u = ul.getBoundingClientRect();
    const card = Math.min(CARD_WIDTH, u.width);
    const centre = a.left - u.left + a.width / 2;
    const left = Math.max(0, Math.min(centre - card / 2, u.width - card));
    // Above the spine where there is room; on the first row that would leave
    // the terminal window, so it sits at the top of the shelf instead and
    // overlaps the books, which is fine for a hover card.
    const top = Math.max(0, a.top - u.top - 8);
    setTip({ book, left, top });
  };

  const onEnter = (book: Book) => (e: MouseEvent<HTMLElement>) => show(book, e.currentTarget);
  const onFocus = (book: Book) => (e: FocusEvent<HTMLElement>) => show(book, e.currentTarget);
  const hide = () => setTip(null);

  const click = (book: Book) => () =>
    trackProductClick({ product: book.displayTitle, zone: '~/bookshelf', url: book.url });

  return (
    <div>
      <ul ref={ulRef} className="bookshelf" onMouseLeave={hide}>
        {shown.map((book) => (
          <li key={book.url}>
            <a
              href={book.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={ariaLabel(book)}
              className={`spine${book.leans ? ' spine--lean' : ''}`}
              style={
                {
                  width: book.width,
                  height: `var(--h${book.heightVariant})`,
                  backgroundColor: book.fill,
                  '--band': book.band,
                } as CSSProperties
              }
              onMouseEnter={onEnter(book)}
              onFocus={onFocus(book)}
              onBlur={hide}
              onClick={click(book)}
            >
              <span className="spine__label">{book.displayTitle}</span>
            </a>
          </li>
        ))}
        <li className="bookshelf__end" aria-hidden="true" />
        {tip && (
          <li
            role="tooltip"
            aria-hidden="true"
            className="bookshelf__tip rounded border border-emerald-500/40 bg-zinc-900 px-2 py-1 text-xs shadow-lg"
            style={{ left: tip.left, top: tip.top }}
          >
            <span className="block text-emerald-300">{tip.book.displayTitle}</span>
            {(tip.book.author || tip.book.added) && (
              <span className="block text-zinc-500">
                {[tip.book.author, fmtDateFull(tip.book.added)].filter(Boolean).join(' · ')}
              </span>
            )}
            {tip.book.note && <span className="block text-zinc-300">{tip.book.note}</span>}
          </li>
        )}
      </ul>

      {showList && (
        <>
          <hr className="my-6 border-zinc-800" />
          <ul className="space-y-2">
            {shown.map((book) => (
              <li key={book.url}>
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <time dateTime={book.added} className="shrink-0 text-zinc-500" title={fmtDateFull(book.added)}>
                    {fmtDateShort(book.added)}
                  </time>
                  <a
                    href={book.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-300 hover:bg-emerald-500/10 hover:text-emerald-200"
                    onClick={click(book)}
                  >
                    {book.displayTitle}
                    <span className="text-zinc-500 ml-1">↗</span>
                  </a>
                  {book.author && <span className="text-zinc-500">by {book.author}</span>}
                  {book.category && (
                    <span className="text-xs" style={{ color: book.band }}>
                      #{book.category}
                    </span>
                  )}
                </div>
                {book.note && <p className="pl-[3.25rem] text-zinc-400">{book.note}</p>}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
