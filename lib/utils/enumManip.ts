/** Generic function to get an array from enum */
export function enumToArray<T extends object>(enumType: T): T[keyof T][] {
  const keys = Object.keys(enumType);
  return keys.slice(0, Math.floor(keys.length / 2)) as T[keyof T][]; // Return the numbers
}
