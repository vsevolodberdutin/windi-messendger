import { Component, type ReactNode } from 'react';
import { Button } from './Button';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary component that catches JavaScript errors anywhere in the child component tree
 * Displays a fallback UI instead of crashing the whole app
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Call optional error handler
    this.props.onError?.(error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="flex items-center justify-center min-h-screen w-full
          bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="flex flex-col items-center gap-4 p-8 max-w-md
            rounded-2xl bg-white border border-gray-200
            shadow-2xl shadow-gray-400/30">
            <div className="flex items-center justify-center w-16 h-16
              rounded-full bg-red-100
              shadow-md shadow-red-200/50">
              <span className="text-3xl text-red-600">⚠️</span>
            </div>

            <div className="flex flex-col items-center gap-2 text-center">
              <h2 className="text-2xl font-bold text-gray-900">
                Something went wrong
              </h2>
              <p className="text-gray-600">
                We're sorry, but something unexpected happened. Please try again.
              </p>
            </div>

            {this.state.error && (
              <details className="w-full p-3 mt-2
                rounded-lg bg-gray-50 border border-gray-200
                text-sm text-left">
                <summary className="cursor-pointer font-medium text-gray-700
                  hover:text-gray-900
                  transition-colors">
                  Error Details
                </summary>
                <pre className="mt-2 p-2 overflow-auto
                  rounded bg-gray-100
                  text-xs text-red-600
                  font-mono">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}

            <Button
              onClick={this.handleReset}
              variant="primary"
              size="md"
              className="mt-2 w-full">
              Try Again
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
