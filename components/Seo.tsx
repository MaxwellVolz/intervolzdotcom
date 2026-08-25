import Head from 'next/head';
import {
  SITE_NAME,
  SITE_TITLE,
  SITE_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  absoluteUrl,
} from '@/lib/site';

type SeoProps = {
  /** Page title without the site suffix. Omit on the homepage. */
  title?: string;
  description?: string;
  /** Site-relative path with trailing slash, e.g. '/developing-slashwork/'. */
  path: string;
  image?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  noindex?: boolean;
  children?: React.ReactNode;
};

export default function Seo({
  title,
  description = SITE_DESCRIPTION,
  path,
  image = DEFAULT_OG_IMAGE,
  type = 'website',
  publishedTime,
  noindex = false,
  children,
}: SeoProps) {
  // Built as one string on purpose: `{title} | {SITE_NAME}` in JSX makes React
  // emit a `<!-- -->` separator inside the <title>.
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_TITLE;
  const url = absoluteUrl(path);
  const ogImage = absoluteUrl(image);

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large" />
      )}

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:alt" content={title || SITE_TITLE} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_US" />
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {children}
    </Head>
  );
}
