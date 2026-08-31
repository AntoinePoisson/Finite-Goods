/**
 * A GitHub Pages project site is served below /<repository>, and the build bakes that prefix
 * into every URL it emits. The specs therefore address the site through this helper rather than
 * through Playwright's baseURL, which would drop the prefix on any path starting with a slash.
 */
export const basePath = (process.env.PAGES_BASE_PATH ?? '').replace(/^\/+|\/+$/g, '');

export function sitePath(path = '/') {
  const suffix = path.startsWith('/') ? path : `/${path}`;
  return basePath ? `/${basePath}${suffix}` : suffix;
}
