import dayjs from 'dayjs';

export function capitalize(str) {
  if (typeof str !== 'string' || !str.length) return str; // Return if not a string or empty
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export const formatTimestamp = (createdAt: Date) => (dayjs(createdAt).isValid() ? dayjs(createdAt).format('DD:MM:YYYY HH:mm:ss') : '');

// src/utils/formatter.ts
export function flattenObject(obj: any, prefix = '', result: any = {}) {
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      flattenObject(obj[key], `${prefix}${key}.`, result);
    } else {
      result[`${prefix}${key}`] = obj[key];
    }
  }
  return result;
}
