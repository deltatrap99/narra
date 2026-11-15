/** Separate deploys share the same product; only brand assets and tokens vary. */
export const isOption5 = import.meta.env.VITE_BRAND_VARIANT === 'option5' || new URLSearchParams(location.search).get('brand') === 'option5';
export const brandVariant = isOption5 ? 'option5' : 'option1';
export function brandAsset(name: string) { const asset = isOption5 && name.startsWith('logo-') ? name.replace('.webp', '.svg') : name; return `/brand/${isOption5 ? 'option5/' : ''}${asset}`; }
export function initializeBrand() {
  document.documentElement.dataset.brand = brandVariant;
  document.querySelector<HTMLLinkElement>('link[rel="icon"]')?.setAttribute('href', brandAsset('icon.png'));
  if (isOption5) document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#5a24c9');
}
