/** Vercel supplies these non-secret build markers. Unknown Vercel contexts deny indexing. */
export function isPreviewDeployment(environment = process.env.VERCEL_ENV, platform = process.env.VERCEL): boolean {
  if (process.env.NODE_ENV === "development") return true;
  return environment !== undefined ? environment !== "production" : platform === "1";
}
