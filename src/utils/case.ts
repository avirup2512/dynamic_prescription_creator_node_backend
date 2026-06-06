export function toSnakeCase(value: string) {
  return value.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

export function mapKeysToSnakeCase<T extends Record<string, any>>(payload: T) {
  return Object.keys(payload).reduce<Record<string, any>>((result, key) => {
    result[toSnakeCase(key)] = payload[key];
    return result;
  }, {});
}
