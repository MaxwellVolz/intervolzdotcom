// Thin wrapper over gtag. Every call site can fire unconditionally: if GA never
// loaded (dev builds, an ad blocker, a page that predates the tag) this no-ops
// instead of throwing.

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

type EventParams = Record<string, string | number | boolean | undefined>;

export function trackEvent(name: string, params: EventParams = {}): void {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function')
    return;
  window.gtag('event', name, params);
}

/**
 * A click on one of the homepage grid tiles. This is the site's whole point:
 * `~/live` exists to move people to the products. GA4 records outbound clicks
 * on its own, but undifferentiated, so nothing there tells Chronomial from
 * ContextClues. `product` does.
 */
export function trackProductClick(opts: {
  product: string;
  zone: string;
  url: string;
}): void {
  trackEvent('product_click', {
    product: opts.product,
    zone: opts.zone,
    destination: opts.url,
    outbound: opts.url.startsWith('http'),
  });
}
