export const isNullOrUndefined = (value: unknown): value is null | undefined => {
  return value === undefined || value === null;
}

export function countArrayElements(arr: any[]): number {
  return arr.reduce((count, item) => count + (Array.isArray(item) ? countArrayElements(item) : 1), 0);
}
