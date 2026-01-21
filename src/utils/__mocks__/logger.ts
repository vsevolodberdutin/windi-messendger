// Mock logger for tests
export const createLogger = (prefix: string) => ({
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
});

export const measurePerformance = jest.fn((label: string, fn: () => unknown) => {
  return fn();
});

export const formatPerformanceMetric = jest.fn((value: number) => `${value.toFixed(2)}ms`);
