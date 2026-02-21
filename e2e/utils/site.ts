// leading slash would drop the /Finite-Goods prefix
export const basePath = (process.env.PAGES_BASE_PATH ?? '').replace(/^\/+|\/+$/g, '');

export function sitePath(path = '/') {
  const suffix = path.startsWith('/') ? path : `/${path}`;
  return basePath ? `/${basePath}${suffix}` : suffix;
}
