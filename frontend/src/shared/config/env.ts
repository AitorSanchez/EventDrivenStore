// src/shared/config/env.ts
export const getEnv = (key: string, defaultValue: string = ''): string => {
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key]!;
  }

  try {
    const metaEnv = (new Function('return import.meta.env'))();
    if (metaEnv && metaEnv[key]) {
      return metaEnv[key];
    }
  } catch {
    // import.meta is not available
  }

  return defaultValue;
};
