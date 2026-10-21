import fs from 'fs';
import path from 'path';
import { parseBookshelf, toBooks, type Book } from './bookshelf.ts';

const FILE = 'content/bookshelf.yml';

// Build-time only (getStaticProps). The prebuild title fetch has already run
// by the time this reads the file, so titles it could fill are present.
export function getBookshelf(): Book[] {
  const file = path.join(process.cwd(), FILE);
  if (!fs.existsSync(file)) return [];
  return toBooks(parseBookshelf(fs.readFileSync(file, 'utf8')));
}
