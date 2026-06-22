export interface Named { chzzkChannelName?: string }

export function dedupeViewersByName<T extends Named>(viewers: T[]): T[] {
  const map = new Map<string, T>();
  for (const v of viewers) {
    const name = v?.chzzkChannelName?.trim();
    if (!name) continue;
    const key = name.toLowerCase();
    if (!map.has(key)) map.set(key, v);
  }
  return Array.from(map.values());
}

export default dedupeViewersByName;
