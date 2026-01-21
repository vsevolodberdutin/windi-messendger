// Mock logger for tests
export const createLogger = () => ({
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
});

export const measurePerformance = jest.fn(( fn: () => unknown) => {
  return fn();
});

export const formatPerformanceMetric = jest.fn((value: number) => `${value.toFixed(2)}ms`);
