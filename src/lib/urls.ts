/** Public links only. Missing business configuration never creates a guessed URL. */
export function publicOrigin(value: string | null): string | null {
  if (value === null) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password || url.port ||
      url.pathname !== "/" || url.search || url.hash || !url.hostname.includes(".") ||
      /^(?:\d+\.){3}\d+$/.test(url.hostname) || /(?:^|\.)(?:localhost|local)$/.test(url.hostname)) throw new Error();
    return url.origin;
  } catch {
    throw new Error("The public storefront URL must be an approved HTTPS domain without credentials, a port, path, query or fragment.");
  }
}

export function publicPageUrl(path: string, origin: string | null): string | null {
  const base = publicOrigin(origin);
  if (!base) return null;
  if (!path.startsWith("/") || path.startsWith("//") || /[\\\r\n]/.test(path)) throw new Error("Invalid public page path.");
  return new URL(path, base).href;
}
