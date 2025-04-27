const logSetup = () => {
  const info = (...data: unknown[]): void => {
    if (import.meta.env.DEV) console.info(...data);
  };
  const debug = (...data: unknown[]): void => {
    if (import.meta.env.DEV) console.debug(...data);
  };
  const warn = (...data: unknown[]): void => {
    if (import.meta.env.DEV) console.warn(...data);
  };
  const error = (...data: unknown[]): void => {
    if (import.meta.env.DEV) console.error(...data);
  };
  const log = (...data: unknown[]): void => {
    if (import.meta.env.DEV) console.log(...data);
  };

  return {
    info,
    debug,
    warn,
    error,
    log,
  };
};

export const logger = logSetup();
