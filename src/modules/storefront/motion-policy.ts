export type MotionEnvironment = { reducedMotion: boolean; width: number; finePointer: boolean; saveData?: boolean; memory?: number; cores?: number };

export function allowEnhancedMotion(environment: MotionEnvironment): boolean {
  return !environment.reducedMotion && environment.width >= 1024 && environment.finePointer && !environment.saveData &&
    (environment.memory === undefined || environment.memory >= 4) && (environment.cores === undefined || environment.cores >= 4);
}

/** Only same-document anchors may be smoothed. Normal routing stays with Next. */
export function sameDocumentAnchor(href: string, current: string): string | null {
  try {
    const source = new URL(current), target = new URL(href, source);
    if (target.origin !== source.origin || target.pathname !== source.pathname || target.search !== source.search || !target.hash || target.username || target.password) return null;
    const id = decodeURIComponent(target.hash.slice(1));
    return id && !/[\u0000-\u001f\u007f]/.test(id) ? id : null;
  } catch { return null; }
}
