/**
 * Centralized logging utility for the application
 *
 * In production, these logs can be sent to an error tracking service
 * like Sentry, LogRocket, or similar monitoring tools.
 */

type LogLevel = 'error' | 'warn' | 'info' | 'debug';

interface LogContext {
  [key: string]: unknown;
}

/**
 * Logs an error message
 * In production, this should be sent to an error tracking service
 */
export function logError(message: string, error?: Error | unknown, context?: LogContext): void {
  const isDevelopment = import.meta.env.DEV;

  if (isDevelopment) {
    console.error(`[ERROR] ${message}`, error, context);
  }

  // TODO: In production, send to error tracking service (Sentry, LogRocket, etc.)
  // Example:
  // if (!isDevelopment && typeof window !== 'undefined') {
  //   Sentry.captureException(error || new Error(message), {
  //     extra: context,
  //     tags: { component: context?.component as string }
  //   });
  // }
}

/**
 * Logs a warning message
 */
export function logWarn(message: string, context?: LogContext): void {
  const isDevelopment = import.meta.env.DEV;

  if (isDevelopment) {
    console.warn(`[WARN] ${message}`, context);
  }

  // TODO: Add analytics or monitoring in production if needed
}

/**
 * Logs an info message (development only)
 */
export function logInfo(message: string, context?: LogContext): void {
  if (import.meta.env.DEV) {
    console.info(`[INFO] ${message}`, context);
  }
}

/**
 * Logs a debug message (development only)
 */
export function logDebug(message: string, context?: LogContext): void {
  if (import.meta.env.DEV) {
    console.debug(`[DEBUG] ${message}`, context);
  }
}

/**
 * Generic logger that accepts a log level
 */
export function log(level: LogLevel, message: string, data?: Error | unknown, context?: LogContext): void {
  switch (level) {
    case 'error':
      logError(message, data, context);
      break;
    case 'warn':
      logWarn(message, context);
      break;
    case 'info':
      logInfo(message, context);
      break;
    case 'debug':
      logDebug(message, context);
      break;
  }
}
