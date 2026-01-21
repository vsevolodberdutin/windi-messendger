import { renderHook, act } from '@testing-library/react';
import { useResizeObserver } from './useResizeObserver';

describe('useResizeObserver', () => {
  let mockObserve: jest.Mock;
  let mockDisconnect: jest.Mock;
  let mockResizeObserver: jest.Mock;
  let resizeCallback: ResizeObserverCallback;

  beforeEach(() => {
    mockObserve = jest.fn();
    mockDisconnect = jest.fn();

    mockResizeObserver = jest.fn((callback: ResizeObserverCallback) => {
      resizeCallback = callback;
      return {
        observe: mockObserve,
        disconnect: mockDisconnect,
        unobserve: jest.fn()
      };
    });

    global.ResizeObserver = mockResizeObserver as unknown as typeof ResizeObserver;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return initial dimensions of zero', () => {
    const { result } = renderHook(() => useResizeObserver());

    expect(result.current.dimensions).toEqual({ width: 0, height: 0 });
  });

  it('should return a callbackRef function', () => {
    const { result } = renderHook(() => useResizeObserver());

    expect(typeof result.current.callbackRef).toBe('function');
  });

  it('should create ResizeObserver when callbackRef is called with a node', () => {
    const { result } = renderHook(() => useResizeObserver());

    const mockNode = document.createElement('div');

    act(() => {
      result.current.callbackRef(mockNode);
    });

    expect(mockResizeObserver).toHaveBeenCalledTimes(1);
    expect(mockObserve).toHaveBeenCalledWith(mockNode);
  });

  it('should not create ResizeObserver when callbackRef is called with null', () => {
    const { result } = renderHook(() => useResizeObserver());

    act(() => {
      result.current.callbackRef(null);
    });

    expect(mockResizeObserver).not.toHaveBeenCalled();
  });

  it('should update dimensions when resize is observed', () => {
    const { result } = renderHook(() => useResizeObserver());

    const mockNode = document.createElement('div');

    act(() => {
      result.current.callbackRef(mockNode);
    });

    // Simulate resize event
    act(() => {
      resizeCallback([
        {
          contentRect: { width: 500, height: 300 } as DOMRectReadOnly,
          target: mockNode,
          borderBoxSize: [],
          contentBoxSize: [],
          devicePixelContentBoxSize: []
        }
      ], {} as ResizeObserver);
    });

    expect(result.current.dimensions).toEqual({ width: 500, height: 300 });
  });

  it('should disconnect previous observer when new node is attached', () => {
    const { result } = renderHook(() => useResizeObserver());

    const mockNode1 = document.createElement('div');
    const mockNode2 = document.createElement('div');

    act(() => {
      result.current.callbackRef(mockNode1);
    });

    act(() => {
      result.current.callbackRef(mockNode2);
    });

    expect(mockDisconnect).toHaveBeenCalledTimes(1);
    expect(mockResizeObserver).toHaveBeenCalledTimes(2);
  });

  it('should disconnect observer when callbackRef is called with null after a node', () => {
    const { result } = renderHook(() => useResizeObserver());

    const mockNode = document.createElement('div');

    act(() => {
      result.current.callbackRef(mockNode);
    });

    act(() => {
      result.current.callbackRef(null);
    });

    expect(mockDisconnect).toHaveBeenCalledTimes(1);
  });

  it('should handle empty entries array gracefully', () => {
    const { result } = renderHook(() => useResizeObserver());

    const mockNode = document.createElement('div');

    act(() => {
      result.current.callbackRef(mockNode);
    });

    // Simulate resize event with empty entries
    act(() => {
      resizeCallback([], {} as ResizeObserver);
    });

    // Dimensions should remain at initial values
    expect(result.current.dimensions).toEqual({ width: 0, height: 0 });
  });
});
