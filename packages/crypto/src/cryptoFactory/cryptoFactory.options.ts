export function serviceGetOptions<T extends object>(
  options: T,
): Readonly<T> {
  return Object.freeze({
    ...options,
  });
}
